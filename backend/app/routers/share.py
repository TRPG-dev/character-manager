import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Character
from app.schemas import CharacterResponse
from app.services.gcs import maybe_sign_read_url

router = APIRouter(prefix="/api/share", tags=["share"])


@router.get("/{token}", response_model=CharacterResponse)
async def get_shared_character(
    token: str,
    db: Session = Depends(get_db),
):
    """公開閲覧用キャラクター取得（認証不要）"""
    character = (
        db.query(Character)
        .filter(Character.share_token == token)
        .filter(Character.is_public == True)
        .first()
    )

    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found or not public",
        )

    # 公開閲覧でも画像は表示できるよう、GCS URL は署名付きURLに差し替え
    return CharacterResponse.model_validate(
        {
            "id": character.id,
            "user_id": character.user_id,
            "system": character.system,
            "name": character.name,
            "tags": character.tags,
            "profile_image_url": maybe_sign_read_url(character.profile_image_url),
            "sheet_data": character.sheet_data,
            "is_public": character.is_public,
            "share_token": character.share_token,
            "created_at": character.created_at,
            "updated_at": character.updated_at,
        }
    )






