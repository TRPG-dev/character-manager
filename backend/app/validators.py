"""
バリデーション関数
"""
from fastapi import HTTPException, status
from typing import Dict, Any, List

from app.models import SystemEnum


def _to_int(value: Any, default: int = 0) -> int:
    try:
        if value is None:
            return default
        return int(value)
    except (TypeError, ValueError):
        return default


def _get_attr(sheet_data: Dict[str, Any], key: str) -> int:
    attrs = sheet_data.get("attributes") or {}
    if not isinstance(attrs, dict):
        return 0
    return _to_int(attrs.get(key), 0)


def _iter_skills(sheet_data: Dict[str, Any]) -> list[Dict[str, Any]]:
    skills: list[Dict[str, Any]] = []
    for key in ("skills", "combatSkills", "customSkills"):
        v = sheet_data.get(key)
        if isinstance(v, list):
            skills.extend([s for s in v if isinstance(s, dict)])
    return skills


def _cthulhu7_job_points_limit(sheet_data: Dict[str, Any]) -> tuple[int, str]:
    edu = _get_attr(sheet_data, "EDU")
    str_ = _get_attr(sheet_data, "STR")
    con = _get_attr(sheet_data, "CON")
    pow_ = _get_attr(sheet_data, "POW")
    dex = _get_attr(sheet_data, "DEX")
    app = _get_attr(sheet_data, "APP")
    siz = _get_attr(sheet_data, "SIZ")
    int_ = _get_attr(sheet_data, "INT")

    rule = sheet_data.get("jobPointsRule") or sheet_data.get("job_points_rule") or "EDU*4"
    rule = str(rule)

    if rule == "manual":
        manual = sheet_data.get("jobPointsManualLimit") or sheet_data.get("job_points_manual_limit")
        limit = max(0, _to_int(manual, 0))
        return limit, "手動入力"

    if rule == "EDU*2+STR*2":
        return edu * 2 + str_ * 2, "EDU*2+STR*2"
    if rule == "EDU*2+CON*2":
        return edu * 2 + con * 2, "EDU*2+CON*2"
    if rule == "EDU*2+POW*2":
        return edu * 2 + pow_ * 2, "EDU*2+POW*2"
    if rule == "EDU*2+DEX*2":
        return edu * 2 + dex * 2, "EDU*2+DEX*2"
    if rule == "EDU*2+APP*2":
        return edu * 2 + app * 2, "EDU*2+APP*2"
    if rule == "EDU*2+SIZ*2":
        return edu * 2 + siz * 2, "EDU*2+SIZ*2"
    if rule == "EDU*2+INT*2":
        return edu * 2 + int_ * 2, "EDU*2+INT*2"

    # default
    return edu * 4, "EDU*4"


def validate_cthulhu_skill_points(sheet_data: Dict[str, Any], system: SystemEnum) -> None:
    """
    クトゥルフ神話TRPGの技能ポイント上限をチェック
    
    Args:
        sheet_data: キャラクターシートデータ
        
    Raises:
        HTTPException: 上限を超えている場合
    """
    if not isinstance(sheet_data, dict):
        return
    
    edu = _get_attr(sheet_data, "EDU")
    int_val = _get_attr(sheet_data, "INT")

    # 上限計算（systemで分岐）
    if system == SystemEnum.cthulhu7:
        job_points_limit, job_label = _cthulhu7_job_points_limit(sheet_data)
        interest_points_limit = int_val * 2
        interest_label = "INT × 2"
    else:
        job_points_limit = edu * 20
        job_label = "EDU × 20"
        interest_points_limit = int_val * 10
        interest_label = "INT × 10"

    # 全技能を取得（default/combat/custom）
    all_skills = _iter_skills(sheet_data)

    # 職業P・興味Pの合計を計算
    total_job_points = 0
    total_interest_points = 0
    
    for skill in all_skills:
        total_job_points += _to_int(skill.get("jobPoints", skill.get("job_points", 0)), 0)
        total_interest_points += _to_int(skill.get("interestPoints", skill.get("interest_points", 0)), 0)
    
    # 上限チェック
    errors = []
    if total_job_points > job_points_limit:
        errors.append(
            f"職業Pの上限を超えています: {total_job_points}/{job_points_limit} ({job_label})"
        )
    if total_interest_points > interest_points_limit:
        errors.append(
            f"興味Pの上限を超えています: {total_interest_points}/{interest_points_limit} ({interest_label})"
        )
    
    if errors:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "error": "skill_points_limit_exceeded",
                "message": "技能ポイントの上限を超えています",
                "details": errors,
            }
        )






