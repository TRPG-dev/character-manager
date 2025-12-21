from app.models import SystemEnum

from .registry import register_exporter


def init_exporters() -> None:
    """
    Register exporters for each system.

    Keep imports inside to avoid import cycles at module import time.
    """
    from .cthulhu import CthulhuExporter

    exporter = CthulhuExporter()
    # legacy + versions
    register_exporter(SystemEnum.cthulhu, exporter)
    register_exporter(SystemEnum.cthulhu6, exporter)
    register_exporter(SystemEnum.cthulhu7, exporter)

