from fastapi import APIRouter, Depends
from app.auth import get_current_user
from app.schemas import UserResponse
from app.models import User

router = APIRouter(prefix="/api", tags=["auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """現在のユーザー情報を取得"""
    return current_user

