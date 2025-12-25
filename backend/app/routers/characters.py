import uuid
import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import String, cast
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Character, SystemEnum, ActionEnum, AuditLog
from app.schemas import (
    CharacterCreate,
    CharacterUpdate,
    CharacterResponse,
    CharacterListResponse,
    PublishRequest,
    PublishResponse,
    AutoRollAttributesRequest,
    AutoRollAttributesResponse,
)
from app.templates import generate_template
from app.validators import validate_cthulhu_skill_points
from app.services.dice import generate_cthulhu_attributes
from app.services.gcs import maybe_sign_read_url

router = APIRouter(prefix="/api/characters", tags=["characters"])

_CTHULHU_SYSTEMS = {SystemEnum.cthulhu6, SystemEnum.cthulhu7}

def _to_character_response(c: Character) -> CharacterResponse:
    """Character → APIレスポンス（画像URLは署名付きに差し替え）"""
    return CharacterResponse.model_validate(
        {
            "id": c.id,
            "user_id": c.user_id,
            "system": c.system,
            "name": c.name,
            "tags": c.tags,
            "profile_image_url": maybe_sign_read_url(c.profile_image_url),
            "sheet_data": c.sheet_data,
            "is_public": c.is_public,
            "share_token": c.share_token,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        }
    )


def create_audit_log(
    db: Session,
    user_id: uuid.UUID,
    character_id: uuid.UUID,
    action: ActionEnum,
    meta_data: dict = None,
):
    """監査ログを作成"""
    audit_log = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        character_id=character_id,
        action=action,
        meta_data=meta_data or {},
    )
    db.add(audit_log)
    db.commit()


@router.get("", response_model=CharacterListResponse)
async def list_characters(
    query: Optional[str] = Query(None, description="名前で検索"),
    tags: Optional[List[str]] = Query(None, description="タグでフィルタ"),
    system: Optional[SystemEnum] = Query(None, description="システムでフィルタ"),
    sort: str = Query(
        "updated_desc",
        description="並び替え（name_asc|name_desc|created_asc|created_desc|updated_asc|updated_desc|system_asc）",
    ),
    page: int = Query(1, ge=1, description="ページ番号"),
    limit: int = Query(20, ge=1, le=100, description="1ページあたりの件数"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """キャラクター一覧取得・検索（所有者のみ）"""
    offset = (page - 1) * limit

    # 基本クエリ：所有者のキャラクターのみ
    q = db.query(Character).filter(Character.user_id == current_user.id)

    # 名前で検索
    if query:
        q = q.filter(Character.name.ilike(f"%{query}%"))

    # システムでフィルタ
    if system:
        q = q.filter(Character.system == system)

    # タグでフィルタ（PostgreSQLの@>演算子を使用）
    if tags:
        for tag in tags:
            q = q.filter(Character.tags.op('@>')(f'{{{tag}}}'))

    # 並び替え
    # - system_asc は PostgreSQL enum の定義順ではなく文字列として昇順にする
    order_by_map = {
        "name_asc": [Character.name.asc(), Character.updated_at.desc(), Character.id.asc()],
        "name_desc": [Character.name.desc(), Character.updated_at.desc(), Character.id.asc()],
        "created_asc": [Character.created_at.asc(), Character.id.asc()],
        "created_desc": [Character.created_at.desc(), Character.id.asc()],
        "updated_asc": [Character.updated_at.asc(), Character.id.asc()],
        "updated_desc": [Character.updated_at.desc(), Character.id.asc()],
        "system_asc": [cast(Character.system, String).asc(), Character.name.asc(), Character.updated_at.desc(), Character.id.asc()],
    }
    if sort not in order_by_map:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid sort option: {sort}",
        )

    # 総件数を取得
    total = q.count()

    # ページネーション
    characters = q.order_by(*order_by_map[sort]).offset(offset).limit(limit).all()

    # 画像URLは、非公開バケットでも表示できるよう署名付きURLに差し替え（失敗時は元URL）
    items: List[CharacterResponse] = [_to_character_response(c) for c in characters]

    return CharacterListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=CharacterResponse, status_code=status.HTTP_201_CREATED)
async def create_character(
    character_data: CharacterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """キャラクター新規作成"""
    # テンプレートを生成
    template = generate_template(character_data.system)
    
    # sheet_dataが空の場合、テンプレートを使用
    sheet_data = character_data.sheet_data if character_data.sheet_data else template

    # クトゥルフの場合、技能ポイント上限チェック
    if character_data.system in _CTHULHU_SYSTEMS:
        validate_cthulhu_skill_points(sheet_data, character_data.system)

    character = Character(
        id=uuid.uuid4(),
        user_id=current_user.id,
        system=character_data.system,
        name=character_data.name,
        tags=character_data.tags,
        profile_image_url=character_data.profile_image_url,
        sheet_data=sheet_data,
        is_public=False,
    )
    db.add(character)
    db.commit()
    db.refresh(character)

    # 監査ログ
    create_audit_log(db, current_user.id, character.id, ActionEnum.create)

    # APIの画像URL返却形式を統一（署名付きURL）
    return _to_character_response(character)


@router.get("/{character_id}", response_model=CharacterResponse)
async def get_character(
    character_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """キャラクター詳細取得（所有者または公開されている場合）"""
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )

    # 所有者でない、かつ公開されていない場合はアクセス拒否
    if character.user_id != current_user.id and not character.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # 画像URLは、非公開バケットでも表示できるよう署名付きURLに差し替え
    return _to_character_response(character)


@router.put("/{character_id}", response_model=CharacterResponse)
async def update_character(
    character_id: uuid.UUID,
    character_data: CharacterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """キャラクター更新（所有者のみ）"""
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )

    if character.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # 更新可能なフィールドを更新
    if character_data.name is not None:
        character.name = character_data.name
    if character_data.tags is not None:
        character.tags = character_data.tags
    if character_data.profile_image_url is not None:
        character.profile_image_url = character_data.profile_image_url
    if character_data.sheet_data is not None:
        # クトゥルフの場合、技能ポイント上限チェック
        if character.system in _CTHULHU_SYSTEMS:
            validate_cthulhu_skill_points(character_data.sheet_data, character.system)
        character.sheet_data = character_data.sheet_data

    db.commit()
    db.refresh(character)

    # 監査ログ
    create_audit_log(db, current_user.id, character.id, ActionEnum.update)

    # APIの画像URL返却形式を統一（署名付きURL）
    return _to_character_response(character)


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """キャラクター削除（所有者のみ）"""
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )

    if character.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # 監査ログ（削除前に作成）
    create_audit_log(db, current_user.id, character.id, ActionEnum.delete)

    db.delete(character)
    db.commit()

    return None


@router.post("/{character_id}/publish", response_model=PublishResponse)
async def publish_character(
    character_id: uuid.UUID,
    publish_data: PublishRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """キャラクター公開切替（所有者のみ）"""
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )

    if character.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    character.is_public = publish_data.is_public

    if publish_data.is_public:
        # 公開する場合、share_tokenを生成
        if not character.share_token:
            character.share_token = secrets.token_urlsafe(32)
        action = ActionEnum.publish
    else:
        # 非公開にする場合、share_tokenを削除
        character.share_token = None
        action = ActionEnum.unpublish

    db.commit()
    db.refresh(character)

    # 監査ログ
    create_audit_log(db, current_user.id, character.id, action)

    return PublishResponse(
        is_public=character.is_public,
        share_token=character.share_token,
    )


@router.post("/{character_id}/attributes/auto-roll", response_model=AutoRollAttributesResponse)
async def auto_roll_attributes(
    character_id: uuid.UUID,
    request: AutoRollAttributesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """能力値自動生成（クトゥルフのみ対応）"""
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found",
        )

    if character.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # システムチェック（現在はクトゥルフのみ対応）
    if request.system not in _CTHULHU_SYSTEMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"能力値自動生成は現在 {SystemEnum.cthulhu6.value}/{SystemEnum.cthulhu7.value} のみ対応しています",
        )

    # キャラクターのシステムと一致するかチェック
    if character.system != request.system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"キャラクターのシステム ({character.system.value}) とリクエストのシステム ({request.system.value}) が一致しません",
        )

    # 能力値を生成（systemに応じて分岐）
    result = generate_cthulhu_attributes(request.system)

    return AutoRollAttributesResponse(
        attributes=result["attributes"],
        derived=result["derived"],
    )

