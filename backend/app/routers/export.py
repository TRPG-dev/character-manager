import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Character, SystemEnum, User
from app.schemas import CocofoliaExportResponse, ExportDiceStyle, ExportSkillScope
from app.services.export import init_exporters
from app.services.export.base import ExportOptions
from app.services.export.registry import get_exporter
from app.services.gcs import maybe_sign_read_url


router = APIRouter(prefix="/api/characters", tags=["export"])

# Ensure exporters are registered once at import time
init_exporters()


@router.get(
    "/{character_id}/export/cocofolia",
    response_model=CocofoliaExportResponse,
)
async def export_cocofolia(
    request: Request,
    character_id: uuid.UUID,
    system: SystemEnum = Query(..., description="システム（現在はcthulhuのみ対応）"),
    skill_scope: ExportSkillScope = Query(ExportSkillScope.changed, description="技能の出力範囲"),
    dice: ExportDiceStyle = Query(ExportDiceStyle.CCB, description="ダイスコマンド形式"),
    include_icon: bool = Query(True, description="iconUrl を含めるか"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    character = db.query(Character).filter(Character.id == character_id).first()
    if not character:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character not found")

    if character.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if character.system != system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"キャラクターのシステム ({character.system.value}) とリクエストのシステム ({system.value}) が一致しません",
        )

    options = ExportOptions(
        system=system,
        skill_scope=skill_scope.value,
        dice=dice.value,
        include_icon=include_icon,
    )

    share_url: str | None = None
    if character.is_public and character.share_token:
        base = str(request.base_url).rstrip("/")
        share_url = f"{base}/share/{character.share_token}"

    icon_url: str | None = None
    if include_icon and character.profile_image_url:
        icon_url = maybe_sign_read_url(character.profile_image_url)

    exporter = get_exporter(system)
    clipboard = exporter.generate_cocofolia_clipboard(
        character=character,
        sheet_data=character.sheet_data or {},
        options=options,
        share_url=share_url,
        icon_url=icon_url,
    )

    clipboard_text = json.dumps(clipboard, ensure_ascii=False, separators=(",", ":"))

    return CocofoliaExportResponse(
        clipboard=clipboard,
        clipboardText=clipboard_text,
        meta={
            "system": system,
            "skill_scope": skill_scope,
            "dice": dice,
            "include_icon": include_icon,
        },
    )

