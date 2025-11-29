"""
システム別キャラクターシートテンプレート生成
"""
from typing import Dict, Any
from app.models import SystemEnum


def generate_template(system: SystemEnum) -> Dict[str, Any]:
    """システムに応じた初期テンプレートを生成"""
    if system == SystemEnum.cthulhu:
        return generate_cthulhu_template()
    elif system == SystemEnum.shinobigami:
        return generate_shinobigami_template()
    elif system == SystemEnum.sw25:
        return generate_sw25_template()
    elif system == SystemEnum.satasupe:
        return generate_satasupe_template()
    else:
        return {}


def generate_cthulhu_template() -> Dict[str, Any]:
    """クトゥルフ神話TRPG用テンプレート"""
    return {
        "attributes": {
            "STR": 0,
            "CON": 0,
            "POW": 0,
            "DEX": 0,
            "APP": 0,
            "SIZ": 0,
            "INT": 0,
            "EDU": 0,
        },
        "derived": {
            "SAN_current": 0,
            "SAN_max": 0,
            "HP_current": 0,
            "HP_max": 0,
            "MP_current": 0,
            "MP_max": 0,
        },
        "skills": [],
        "backstory": "",
    }


def generate_shinobigami_template() -> Dict[str, Any]:
    """シノビガミ用テンプレート"""
    return {
        "attributes": {
            "体術": 0,
            "忍術": 0,
            "謀術": 0,
            "戦術": 0,
            "器術": 0,
            "心術": 0,
        },
        "skills": [],
        "secret_flag": False,
        "background": "",
    }


def generate_sw25_template() -> Dict[str, Any]:
    """ソードワールド2.5用テンプレート"""
    return {
        "race": "",
        "class": "",
        "attributes": {},
        "skills": [],
        "items": [],
        "background": "",
    }


def generate_satasupe_template() -> Dict[str, Any]:
    """サタスペ用テンプレート"""
    return {
        "attributes": {},
        "skills": [],
        "items": [],
        "background": "",
    }

