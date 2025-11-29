from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.models import SystemEnum


class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: str
    
    class Config:
        from_attributes = True


class CharacterBase(BaseModel):
    system: SystemEnum
    name: str
    tags: List[str] = Field(default_factory=list)
    profile_image_url: Optional[str] = None
    sheet_data: Dict[str, Any] = Field(default_factory=dict)


class CharacterCreate(CharacterBase):
    pass


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    tags: Optional[List[str]] = None
    profile_image_url: Optional[str] = None
    sheet_data: Optional[Dict[str, Any]] = None


class CharacterResponse(CharacterBase):
    id: UUID
    user_id: UUID
    is_public: bool
    share_token: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CharacterListResponse(BaseModel):
    items: List[CharacterResponse]
    total: int
    page: int
    limit: int


class PublishRequest(BaseModel):
    is_public: bool


class PublishResponse(BaseModel):
    is_public: bool
    share_token: Optional[str] = None


class ImageUploadUrlRequest(BaseModel):
    mime_type: str = Field(..., pattern="^(image/png|image/jpeg|image/jpg)$")


class ImageUploadUrlResponse(BaseModel):
    upload_url: str
    public_url: str
    expires_at: datetime

