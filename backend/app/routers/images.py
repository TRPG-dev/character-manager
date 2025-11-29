import uuid
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Character
from app.schemas import ImageUploadUrlRequest, ImageUploadUrlResponse

router = APIRouter(prefix="/api/characters", tags=["images"])


@router.post("/{character_id}/image/upload-url", response_model=ImageUploadUrlResponse)
async def generate_image_upload_url(
    character_id: uuid.UUID,
    request: ImageUploadUrlRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """画像アップロード用署名付きURL発行（所有者のみ）"""
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(
            status_code=404,
            detail="Character not found",
        )

    if character.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied",
        )

    # MIMEタイプの検証
    allowed_mime_types = ["image/png", "image/jpeg", "image/jpg"]
    if request.mime_type not in allowed_mime_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mime_type. Allowed types: {', '.join(allowed_mime_types)}",
        )

    # 簡易版: 実際の署名付きURLではなく、アップロード先URLを生成
    # TODO: 実際のオブジェクトストレージ連携を実装する場合はここを修正
    file_extension = "jpg" if request.mime_type in ["image/jpeg", "image/jpg"] else "png"
    file_name = f"{character_id}/{uuid.uuid4()}.{file_extension}"
    
    # 簡易版: 一時的なURLを返す（実際にはオブジェクトストレージの署名付きURLを返す）
    base_url = os.getenv("STORAGE_BASE_URL", "https://storage.example.com")
    upload_url = f"{base_url}/upload/{file_name}"
    public_url = f"{base_url}/public/{file_name}"
    expires_at = datetime.utcnow() + timedelta(hours=1)

    return ImageUploadUrlResponse(
        upload_url=upload_url,
        public_url=public_url,
        expires_at=expires_at,
    )

