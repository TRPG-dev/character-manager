import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class SystemEnum(str, enum.Enum):
    cthulhu = "cthulhu"
    shinobigami = "shinobigami"
    sw25 = "sw25"
    satasupe = "satasupe"


class ActionEnum(str, enum.Enum):
    create = "create"
    update = "update"
    publish = "publish"
    unpublish = "unpublish"
    delete = "delete"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auth_provider = Column(String, nullable=False, default="auth0")
    email = Column(String, unique=True, nullable=False, index=True)
    display_name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    characters = relationship("Character", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")


class Character(Base):
    __tablename__ = "characters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    system = Column(Enum(SystemEnum), nullable=False, index=True)
    name = Column(String, nullable=False)
    profile_image_url = Column(String, nullable=True)
    tags = Column(ARRAY(Text), nullable=False, default=list)
    is_public = Column(Boolean, default=False, nullable=False)
    share_token = Column(String, unique=True, nullable=True, index=True)
    sheet_data = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="characters")
    audit_logs = relationship("AuditLog", back_populates="character")

    # Indexes are defined in migration


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    character_id = Column(UUID(as_uuid=True), ForeignKey("characters.id", ondelete="SET NULL"), nullable=True)
    action = Column(Enum(ActionEnum), nullable=False)
    meta_data = Column(JSONB, nullable=True, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
    character = relationship("Character", back_populates="audit_logs")
