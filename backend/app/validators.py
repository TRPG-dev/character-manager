"""
バリデーション関数
"""
from fastapi import HTTPException, status
from typing import Dict, Any, List


def validate_cthulhu_skill_points(sheet_data: Dict[str, Any]) -> None:
    """
    クトゥルフ神話TRPGの技能ポイント上限をチェック
    
    Args:
        sheet_data: キャラクターシートデータ
        
    Raises:
        HTTPException: 上限を超えている場合
    """
    if not isinstance(sheet_data, dict):
        return
    
    attributes = sheet_data.get('attributes', {})
    skills = sheet_data.get('skills', [])
    custom_skills = sheet_data.get('customSkills', [])
    
    if not isinstance(attributes, dict) or not isinstance(skills, list):
        return
    
    edu = attributes.get('EDU', 0)
    int_val = attributes.get('INT', 0)
    
    # 上限計算
    job_points_limit = edu * 20
    interest_points_limit = int_val * 10
    
    # 全技能を取得
    all_skills = list(skills)
    if isinstance(custom_skills, list):
        all_skills.extend(custom_skills)
    
    # 職業P・興味Pの合計を計算
    total_job_points = 0
    total_interest_points = 0
    
    for skill in all_skills:
        if isinstance(skill, dict):
            total_job_points += skill.get('jobPoints', skill.get('job_points', 0)) or 0
            total_interest_points += skill.get('interestPoints', skill.get('interest_points', 0)) or 0
    
    # 上限チェック
    errors = []
    if total_job_points > job_points_limit:
        errors.append(
            f"職業Pの上限を超えています: {total_job_points}/{job_points_limit} (EDU × 20)"
        )
    if total_interest_points > interest_points_limit:
        errors.append(
            f"興味Pの上限を超えています: {total_interest_points}/{interest_points_limit} (INT × 10)"
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






