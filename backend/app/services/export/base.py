from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict

from app.models import Character, SystemEnum


@dataclass(frozen=True)
class ExportOptions:
    system: SystemEnum
    skill_scope: str  # "changed" | "all"
    dice: str  # "CCB" | "CC"
    include_icon: bool = True


class Exporter(ABC):
    @abstractmethod
    def generate_cocofolia_clipboard(
        self,
        *,
        character: Character,
        sheet_data: Dict[str, Any],
        options: ExportOptions,
        share_url: str | None,
        icon_url: str | None,
    ) -> Dict[str, Any]:
        """
        Returns Cocofolia clipboard data object (NOT stringified yet).
        Shape:
        { "kind": "character", "data": { ... } }
        """
        raise NotImplementedError()

