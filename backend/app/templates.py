"""
システム別キャラクターシートテンプレート生成
"""
from typing import Dict, Any
from app.models import SystemEnum


def generate_template(system: SystemEnum) -> Dict[str, Any]:
    """システムに応じた初期テンプレートを生成"""
    if system in (SystemEnum.cthulhu, SystemEnum.cthulhu6, SystemEnum.cthulhu7):
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
        "playerName": "",
        "occupation": "",
        "age": None,
        "gender": "",
        "birthplace": "",
        "schoolDegree": "",
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
        "combatSkills": [],
        "customSkills": [],
        "weapons": [],
        "items": [],
        "cash": "",
        "assets": "",
        "backstory": "",
        "notes": "",
        "scenarios": [],
        "mythosBooks": [],
        "spells": [],
        "artifacts": [],
        "encounteredEntities": [],
    }


def generate_shinobigami_template() -> Dict[str, Any]:
    """シノビガミ用テンプレート"""
    return {
        "playerName": "",
        "characterName": "",
        "age": None,
        "gender": "",
        "attributes": {
            "体術": 0,
            "忍術": 0,
            "謀術": 0,
            "戦術": 0,
            "器術": 0,
            "心術": 0,
        },
        "hp": 6,
        "hencho": [],
        "emotions": [],
        "school": "",
        "rank": "",
        "ryuugi": "",
        "surfaceFace": "",
        "shinnen": "",
        "koseki": 0,
        "skills": [],
        "ninpo": [
            {
                "name": "接近戦攻撃",
                "type": "攻撃",
                "skill": "",
                "range": "1",
                "cost": "0",
                "page": "基78",
            }
        ],
        "okugi": [],
        "ningu": {
            "heiryomaru": 0,
            "jintsumaru": 0,
            "tonkofu": 0,
        },
        "background": "",
        "memo": "",
        "sessionHistory": [],
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

