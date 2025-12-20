from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any
import enum
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


class ImageUploadResponse(BaseModel):
    public_url: str


class DiceRollRequest(BaseModel):
    formula: str = Field(..., description="ダイス式（例: 3d6）")


class DiceRollResponse(BaseModel):
    rolls: List[int] = Field(..., description="各ダイスの結果")
    total: int = Field(..., description="合計値")


class AutoRollAttributesRequest(BaseModel):
    system: SystemEnum = Field(..., description="システム（現在はcthulhuのみ対応）")


class AutoRollAttributesResponse(BaseModel):
    attributes: Dict[str, int] = Field(..., description="能力値")
    derived: Dict[str, Any] = Field(..., description="派生値")


class ExportSkillScope(str, enum.Enum):
    changed = "changed"
    all = "all"


class ExportDiceStyle(str, enum.Enum):
    CCB = "CCB"
    CC = "CC"


class CocofoliaExportMeta(BaseModel):
    system: SystemEnum
    skill_scope: ExportSkillScope
    dice: ExportDiceStyle
    include_icon: bool = True


class CocofoliaExportResponse(BaseModel):
    clipboard: Dict[str, Any]
    clipboardText: str
    meta: CocofoliaExportMeta

