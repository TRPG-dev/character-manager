from __future__ import annotations

from typing import Dict

from app.models import SystemEnum

from .base import Exporter


_EXPORTERS: Dict[SystemEnum, Exporter] = {}


def register_exporter(system: SystemEnum, exporter: Exporter) -> None:
    _EXPORTERS[system] = exporter


def get_exporter(system: SystemEnum) -> Exporter:
    exporter = _EXPORTERS.get(system)
    if exporter is None:
        raise KeyError(f"exporter not registered for system={system.value}")
    return exporter

