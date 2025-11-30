from fastapi import APIRouter, HTTPException, status
from app.schemas import DiceRollRequest, DiceRollResponse
from app.services.dice import roll_dice_formula

router = APIRouter(prefix="/api/dice", tags=["dice"])


@router.post("/roll", response_model=DiceRollResponse)
async def roll_dice(request: DiceRollRequest):
    """
    汎用ダイスロール
    
    Args:
        request: ダイス式を含むリクエスト
    
    Returns:
        ダイスロール結果（各ダイスの目と合計値）
    
    Raises:
        HTTPException: 無効なダイス式の場合
    """
    try:
        rolls, total = roll_dice_formula(request.formula)
        return DiceRollResponse(rolls=rolls, total=total)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ダイスロール中にエラーが発生しました: {str(e)}"
        )


