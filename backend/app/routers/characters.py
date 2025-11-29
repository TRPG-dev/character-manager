import uuid
import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
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
)
from app.templates import generate_template
from app.validators import validate_cthulhu_skill_points

router = APIRouter(prefix="/api/characters", tags=["characters"])


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

    # タグでフィルタ（配列の重複チェック）
    if tags:
        for tag in tags:
            q = q.filter(Character.tags.contains([tag]))

    # 総件数を取得
    total = q.count()

    # ページネーション
    characters = q.order_by(Character.updated_at.desc()).offset(offset).limit(limit).all()

    return CharacterListResponse(
        items=characters,
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
    if character_data.system == SystemEnum.cthulhu:
        validate_cthulhu_skill_points(sheet_data)

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

    return character


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

    return character


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
        if character.system == SystemEnum.cthulhu:
            validate_cthulhu_skill_points(character_data.sheet_data)
        character.sheet_data = character_data.sheet_data

    db.commit()
    db.refresh(character)

    # 監査ログ
    create_audit_log(db, current_user.id, character.id, ActionEnum.update)

    return character


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

