from __future__ import annotations

from typing import Any, Dict

from app.models import Character

from .base import ExportOptions, Exporter


class CthulhuExporter(Exporter):
    def generate_cocofolia_clipboard(
        self,
        *,
        character: Character,
        sheet_data: Dict[str, Any],
        options: ExportOptions,
        share_url: str | None,
        icon_url: str | None,
    ) -> Dict[str, Any]:
        raise NotImplementedError("cthulhu exporter is not implemented yet")

