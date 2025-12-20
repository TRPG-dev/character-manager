import uuid
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from urllib.parse import quote

from google.cloud import storage
from google.api_core.exceptions import NotFound

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Character
from app.schemas import ImageUploadUrlRequest, ImageUploadUrlResponse, ImageUploadResponse
from app.services.gcs import (
    normalize_google_application_credentials_env,
    extract_gcs_bucket_and_object,
    maybe_sign_read_url,
)

router = APIRouter(prefix="/api/characters", tags=["images"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_MIME_TYPES = {"image/png", "image/jpeg", "image/jpg"}

@router.post("/{character_id}/image", response_model=ImageUploadResponse)
async def upload_character_image(
    character_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """画像をバックエンド経由でGCSへアップロード（所有者のみ）

    - ブラウザ→GCS直PUTではなく、APIが受け取ってサービスアカウント権限でアップロードする
    - そのためGCSバケット側のCORS設定は不要
    """
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    if character.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if not file.content_type or file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid mime_type. Allowed types: {', '.join(sorted(ALLOWED_MIME_TYPES))}",
        )

    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GCS_BUCKET_NAME is not set",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size must be <= 5MB")

    file_extension = "jpg" if file.content_type in ["image/jpeg", "image/jpg"] else "png"
    object_name = f"profile-images/{character_id}/{uuid.uuid4()}.{file_extension}"

    try:
        normalize_google_application_credentials_env()
        client = storage.Client()  # ADC / ワークロードに紐づくサービスアカウントを使用
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(object_name)
        blob.upload_from_string(contents, content_type=file.content_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image to GCS: {e}",
        )

    public_url = f"https://storage.googleapis.com/{bucket_name}/{quote(object_name, safe='/')}"

    # キャラクター側にも反映
    character.profile_image_url = public_url
    db.commit()
    db.refresh(character)

    # 返却URLはフロントでそのまま表示されるため、非公開バケットでも表示できるよう署名付きURLに統一
    return ImageUploadResponse(public_url=maybe_sign_read_url(public_url))


@router.delete("/{character_id}/image", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character_image(
    character_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """プロフィール画像を削除（所有者のみ）

    - GCSオブジェクト削除（可能なら）
    - DBの profile_image_url を None に戻す（プレースホルダー復帰）
    - idempotent（画像が無くても成功）
    """
    character = db.query(Character).filter(Character.id == character_id).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    if character.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # まずDB参照を外す（UIはプレースホルダーへ）
    image_url = character.profile_image_url
    character.profile_image_url = None
    db.commit()

    # URLからbucket/objectが取れる場合のみGCS削除を試みる（失敗しても404にはしない）
    if image_url:
        extracted = extract_gcs_bucket_and_object(image_url)
        if extracted:
            bucket_name, object_name = extracted
            try:
                normalize_google_application_credentials_env()
                client = storage.Client()
                bucket = client.bucket(bucket_name)
                blob = bucket.blob(object_name)
                blob.delete()
            except NotFound:
                # 既に削除されている等。idempotentに成功扱い。
                pass
            except Exception:
                # DB更新は成功しているため、ここでは500にしない（運用上はログに出すのが望ましい）
                pass

    return None


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

    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GCS_BUCKET_NAME is not set",
        )

    # 署名付きURL（V4）を生成して、ブラウザから直接GCSへPUTさせる
    # NOTE: ブラウザPUTを許可するため、バケット側のCORS設定が必要
    file_extension = "jpg" if request.mime_type in ["image/jpeg", "image/jpg"] else "png"
    object_name = f"profile-images/{character_id}/{uuid.uuid4()}.{file_extension}"

    expiration_minutes = int(os.getenv("GCS_SIGNED_URL_EXP_MINUTES", "15"))
    expires_delta = timedelta(minutes=expiration_minutes)

    try:
        normalize_google_application_credentials_env()
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(object_name)

        upload_url = blob.generate_signed_url(
            version="v4",
            expiration=expires_delta,
            method="PUT",
            content_type=request.mime_type,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate signed upload URL: {e}",
        )

    # 公開URL（バケットが非公開の場合は、このURLのままでは表示できません）
    public_url = f"https://storage.googleapis.com/{bucket_name}/{quote(object_name, safe='/')}"
    expires_at = datetime.utcnow() + expires_delta

    return ImageUploadUrlResponse(
        upload_url=upload_url,
        public_url=public_url,
        expires_at=expires_at,
    )






