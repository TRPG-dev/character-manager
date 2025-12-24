from __future__ import annotations

from typing import Any, Dict

from app.models import Character, SystemEnum

from .base import ExportOptions, Exporter


def _to_int(value: Any, default: int = 0) -> int:
    try:
        if value is None:
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


def _get_attr(sheet_data: Dict[str, Any], key: str) -> int:
    attrs = sheet_data.get("attributes") or {}
    return _to_int(attrs.get(key), 0)


def _calc_db_6e(str_siz_sum: int) -> str:
    # damage bonus (same thresholds as frontend)
    if 2 <= str_siz_sum <= 12:
        return "-1D6"
    if 13 <= str_siz_sum <= 16:
        return "-1D4"
    if 17 <= str_siz_sum <= 24:
        return "+0"
    if 25 <= str_siz_sum <= 32:
        return "+1D4"
    if 33 <= str_siz_sum <= 40:
        return "+1D6"
    if 41 <= str_siz_sum <= 56:
        return "+2D6"
    if 57 <= str_siz_sum <= 72:
        return "+3D6"
    if 73 <= str_siz_sum <= 88:
        return "+4D6"
    return "+5D6" if str_siz_sum >= 89 else "+0"


def _calc_db_build_7e(str_siz_sum: int) -> tuple[str, int]:
    if 2 <= str_siz_sum <= 64:
        return ("-2", -2)
    if 65 <= str_siz_sum <= 84:
        return ("-1", -1)
    if 85 <= str_siz_sum <= 124:
        return ("0", 0)
    if 125 <= str_siz_sum <= 164:
        return ("+1D4", 1)
    if 165 <= str_siz_sum <= 204:
        return ("+1D6", 2)
    if 205 <= str_siz_sum <= 284:
        return ("+2D6", 3)
    if 285 <= str_siz_sum <= 364:
        return ("+3D6", 4)
    if 365 <= str_siz_sum <= 444:
        return ("+4D6", 5)
    if 445 <= str_siz_sum <= 524:
        return ("+5D6", 6)
    return ("0", 0)


def _calc_mov_7e(dex: int, str_: int, siz: int) -> int:
    if dex < siz and str_ < siz:
        return 7
    if dex > siz and str_ > siz:
        return 9
    return 8


def _calc_derived(attributes: Dict[str, int], system: SystemEnum) -> Dict[str, Any]:
    con = attributes["CON"]
    siz = attributes["SIZ"]
    pow_ = attributes["POW"]
    int_ = attributes["INT"]
    edu = attributes["EDU"]
    str_ = attributes["STR"]

    if system == SystemEnum.cthulhu7:
        # 7e
        luk = attributes.get("LUK", 0)
        san_max = pow_
        hp_max = (con + siz) // 10
        mp_max = pow_ // 5
        idea = int_
        know = edu
        luck = luk
        db, build = _calc_db_build_7e(str_ + siz)
        mov = _calc_mov_7e(attributes.get("DEX", 0), str_, siz)
        return {
            "SAN_max": san_max,
            "SAN_current": san_max,
            "HP_max": hp_max,
            "HP_current": hp_max,
            "MP_max": mp_max,
            "MP_current": mp_max,
            "IDEA": idea,
            "KNOW": know,
            "LUCK": luck,
            "DB": db,
            "BUILD": build,
            "MOV": mov,
        }

    # 6e
    san_max = pow_ * 5
    hp_max = (con + siz) // 2
    mp_max = pow_
    idea = int_ * 5
    know = edu * 5
    luck = pow_ * 5
    db = _calc_db_6e(str_ + siz)
    return {
        "SAN_max": san_max,
        "SAN_current": san_max,
        "HP_max": hp_max,
        "HP_current": hp_max,
        "MP_max": mp_max,
        "MP_current": mp_max,
        "IDEA": idea,
        "KNOW": know,
        "LUCK": luck,
        "DB": db,
    }


def _normalize_derived(sheet_data: Dict[str, Any], derived_calc: Dict[str, Any]) -> Dict[str, Any]:
    existing = sheet_data.get("derived") or {}
    return {
        **derived_calc,
        **existing,
        # current は既存値を優先（なければ計算値）
        "SAN_current": _to_int(existing.get("SAN_current"), _to_int(derived_calc.get("SAN_current"), 0)),
        "HP_current": _to_int(existing.get("HP_current"), _to_int(derived_calc.get("HP_current"), 0)),
        "MP_current": _to_int(existing.get("MP_current"), _to_int(derived_calc.get("MP_current"), 0)),
        "SAN_max": _to_int(existing.get("SAN_max"), _to_int(derived_calc.get("SAN_max"), 0)),
        "HP_max": _to_int(existing.get("HP_max"), _to_int(derived_calc.get("HP_max"), 0)),
        "MP_max": _to_int(existing.get("MP_max"), _to_int(derived_calc.get("MP_max"), 0)),
    }


def _iter_skills(sheet_data: Dict[str, Any]) -> list[Dict[str, Any]]:
    # Keep display-ish order: default skills -> combat -> custom
    skills: list[Dict[str, Any]] = []
    for key in ("skills", "combatSkills", "customSkills"):
        v = sheet_data.get(key)
        if isinstance(v, list):
            skills.extend([s for s in v if isinstance(s, dict)])
    return skills


def _skill_is_custom(skill: Dict[str, Any]) -> bool:
    return bool(skill.get("isCustom") is True or skill.get("is_custom") is True)


def _skill_name(skill: Dict[str, Any]) -> str:
    n = skill.get("name")
    return str(n) if n is not None else ""


_SPECIALTY_SKILLS = {
    # 6版
    "芸術",
    "製作",
    "操縦",
    "他の言語",
    "母国語",
    # 7版（入力型/選択型）
    "科学",
    "芸術/製作",
    "サバイバル",
    "近接戦闘",
    "射撃",
}


def _skill_display_name(skill: Dict[str, Any]) -> str:
    name = _skill_name(skill)
    if not name:
        return ""
    specialty = skill.get("specialty")
    if specialty is None:
        return name
    s = str(specialty).strip()
    if not s:
        return name
    if name in _SPECIALTY_SKILLS:
        return f"{name}({s})"
    return name


def _skill_base(skill: Dict[str, Any]) -> int:
    return _to_int(skill.get("baseValue", skill.get("base_value", skill.get("value"))), 0)


def _skill_points(skill: Dict[str, Any], key_camel: str, key_snake: str) -> int:
    return _to_int(skill.get(key_camel, skill.get(key_snake)), 0)


def _compute_skill_total(skill: Dict[str, Any], base_value: int) -> int:
    job = _skill_points(skill, "jobPoints", "job_points")
    interest = _skill_points(skill, "interestPoints", "interest_points")
    growth = _to_int(skill.get("growth"), 0)
    other = _to_int(skill.get("other"), 0)
    return base_value + job + interest + growth + other


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
        system = options.system
        # normalize attributes
        attributes = {
            "STR": _get_attr(sheet_data, "STR"),
            "CON": _get_attr(sheet_data, "CON"),
            "POW": _get_attr(sheet_data, "POW"),
            "DEX": _get_attr(sheet_data, "DEX"),
            "APP": _get_attr(sheet_data, "APP"),
            "SIZ": _get_attr(sheet_data, "SIZ"),
            "INT": _get_attr(sheet_data, "INT"),
            "EDU": _get_attr(sheet_data, "EDU"),
            # 7e only (safe default 0)
            "LUK": _get_attr(sheet_data, "LUK"),
        }

        derived_calc = _calc_derived(attributes, system)
        derived = _normalize_derived(sheet_data, derived_calc)

        dice_prefix = "CCB" if options.dice.upper() == "CCB" else "CC"

        # Build command list
        commands: list[str] = []
        commands.append("1d100<={SAN} 【正気度ロール】")

        # Derived “common” rolls (numbers)
        if system == SystemEnum.cthulhu7:
            idea = _to_int(derived.get("IDEA"), attributes["INT"])
            luck = _to_int(derived.get("LUCK"), attributes["LUK"])
            know = _to_int(derived.get("KNOW"), attributes["EDU"])
        else:
            idea = _to_int(derived.get("IDEA"), attributes["INT"] * 5)
            luck = _to_int(derived.get("LUCK"), attributes["POW"] * 5)
            know = _to_int(derived.get("KNOW"), attributes["EDU"] * 5)
        commands.append(f"{dice_prefix}<={idea} 【アイデア】")
        commands.append(f"{dice_prefix}<={luck} 【幸運】")
        commands.append(f"{dice_prefix}<={know} 【知識】")

        # Skills
        scope = options.skill_scope.lower()
        seen: set[str] = set()
        for s in _iter_skills(sheet_data):
            name = _skill_name(s)
            disp = _skill_display_name(s)
            key = disp or name
            if not name or key in seen:
                continue
            seen.add(key)

            is_custom = _skill_is_custom(s)
            base = _skill_base(s)

            # dynamic bases (same as frontend rule)
            if not is_custom:
                if name == "回避":
                    base = attributes["DEX"] // 2 if system == SystemEnum.cthulhu7 else attributes["DEX"]
                elif name == "母国語":
                    base = attributes["EDU"] if system == SystemEnum.cthulhu7 else attributes["EDU"] * 5

            total = _compute_skill_total(s, base)
            if scope == "changed" and total == base:
                continue
            commands.append(f"{dice_prefix}<={total} 【{key}】")

        # Attribute rolls
        if system == SystemEnum.cthulhu7:
            for key in ("STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU", "LUK"):
                commands.append(f"{dice_prefix}<={{{key}}} 【{key}】")
        else:
            for key in ("STR", "CON", "POW", "DEX", "APP", "SIZ", "INT", "EDU"):
                commands.append(f"{dice_prefix}<={{{key}}}*5 【{key} × 5】")

        # Weapons damage (optional; best-effort)
        weapons = sheet_data.get("weapons")
        if isinstance(weapons, list):
            for w in weapons:
                if not isinstance(w, dict):
                    continue
                damage = w.get("damage")
                if not damage:
                    continue
                commands.append(f"{damage} 【ダメージ判定】")

        data: Dict[str, Any] = {
            "name": character.name,
            "initiative": attributes["DEX"],
            "externalUrl": share_url or "",
            "status": [
                {"label": "HP", "value": _to_int(derived.get("HP_current"), 0), "max": _to_int(derived.get("HP_max"), 0)},
                {"label": "MP", "value": _to_int(derived.get("MP_current"), 0), "max": _to_int(derived.get("MP_max"), 0)},
                {"label": "SAN", "value": _to_int(derived.get("SAN_current"), 0), "max": _to_int(derived.get("SAN_max"), 0)},
            ],
            "params": [{"label": k, "value": str(v)} for k, v in attributes.items() if not (system != SystemEnum.cthulhu7 and k == "LUK")],
            "commands": "\n".join(commands) + "\n",
            "owner": None,
        }

        if options.include_icon:
            data["iconUrl"] = icon_url

        return {"kind": "character", "data": data}

