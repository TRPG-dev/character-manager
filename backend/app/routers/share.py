import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Character
from app.schemas import CharacterResponse

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

    return character


