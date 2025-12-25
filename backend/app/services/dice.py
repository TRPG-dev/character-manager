import re
import random
from typing import List, Tuple, Dict, Any

from app.models import SystemEnum


def parse_dice_formula(formula: str) -> Tuple[int, int, int]:
    """
    ダイス式をパースして、ダイスの個数、面数、修正値を返す
    
    Args:
        formula: ダイス式（例: "3d6", "2d6+6", "3d6+3"）
    
    Returns:
        (ダイスの個数, ダイスの面数, 修正値)
    
    Raises:
        ValueError: 無効なダイス式の場合
    """
    # 正規表現でXdY形式またはXdY+Z形式をマッチ
    pattern = r'^(\d+)d(\d+)([+-]\d+)?$'
    match = re.match(pattern, formula.lower())
    
    if not match:
        raise ValueError(f"無効なダイス式です: {formula}. 形式は 'XdY' または 'XdY+Z' (例: 3d6, 2d6+6) です。")
    
    count = int(match.group(1))
    sides = int(match.group(2))
    modifier = int(match.group(3)) if match.group(3) else 0
    
    # バリデーション
    if count < 1 or count > 1000:
        raise ValueError(f"ダイスの個数は1から1000の範囲で指定してください。現在の値: {count}")
    
    if sides < 2 or sides > 1000:
        raise ValueError(f"ダイスの面数は2から1000の範囲で指定してください。現在の値: {sides}")
    
    return count, sides, modifier


def roll_dice(count: int, sides: int) -> List[int]:
    """
    ダイスを振る
    
    Args:
        count: ダイスの個数
        sides: ダイスの面数
    
    Returns:
        各ダイスの結果のリスト
    """
    return [random.randint(1, sides) for _ in range(count)]


def roll_dice_formula(formula: str) -> Tuple[List[int], int]:
    """
    ダイス式からダイスを振る（修正値付きにも対応）
    
    Args:
        formula: ダイス式（例: "3d6", "2d6+6", "3d6+3"）
    
    Returns:
        (各ダイスの結果のリスト, 合計値（修正値込み）)
    
    Raises:
        ValueError: 無効なダイス式の場合
    """
    count, sides, modifier = parse_dice_formula(formula)
    rolls = roll_dice(count, sides)
    total = sum(rolls) + modifier
    return rolls, total


def roll_dice_with_modifier(formula: str) -> int:
    """
    修正値付きダイス式を振る（例: "2d6+6", "3d6+3"）
    
    Args:
        formula: ダイス式（例: "2d6+6", "3d6+3"）
    
    Returns:
        合計値（修正値込み）
    
    Raises:
        ValueError: 無効なダイス式の場合
    """
    # 修正値付きのパターンをマッチ
    pattern = r'^(\d+)d(\d+)([+-]\d+)?$'
    match = re.match(pattern, formula.lower())
    
    if not match:
        raise ValueError(f"無効なダイス式です: {formula}. 形式は 'XdY' または 'XdY+Z' (例: 3d6, 2d6+6) です。")
    
    count = int(match.group(1))
    sides = int(match.group(2))
    modifier = int(match.group(3)) if match.group(3) else 0
    
    # バリデーション
    if count < 1 or count > 1000:
        raise ValueError(f"ダイスの個数は1から1000の範囲で指定してください。現在の値: {count}")
    
    if sides < 2 or sides > 1000:
        raise ValueError(f"ダイスの面数は2から1000の範囲で指定してください。現在の値: {sides}")
    
    rolls = roll_dice(count, sides)
    total = sum(rolls) + modifier
    return total


def generate_cthulhu_attributes(system: SystemEnum = SystemEnum.cthulhu6) -> Dict[str, Any]:
    """
    クトゥルフ神話TRPGの能力値を自動生成
    
    能力値生成ルール:
    - STR, CON, POW, DEX, APP: 3d6 (3-18)
    - SIZ, INT: 2d6+6 (8-18)
    - EDU: 3d6+3 (6-21)
    
    Returns:
        能力値と派生値の辞書
    """
    # NOTE:
    # - cthulhu6: 第6版のルール
    # - cthulhu7: 第7版のルール（倍率5 + LUK追加）
    if system == SystemEnum.cthulhu7:
        # 7版: 3d6*5（STR/CON/POW/DEX/APP） (2d6+6)*5（SIZ/INT/EDU） + LUK=3d6*5
        STR = roll_dice_formula("3d6")[1] * 5
        CON = roll_dice_formula("3d6")[1] * 5
        POW = roll_dice_formula("3d6")[1] * 5
        DEX = roll_dice_formula("3d6")[1] * 5
        APP = roll_dice_formula("3d6")[1] * 5

        SIZ = roll_dice_formula("2d6+6")[1] * 5
        INT = roll_dice_formula("2d6+6")[1] * 5
        EDU = roll_dice_formula("2d6+6")[1] * 5

        LUK = roll_dice_formula("3d6")[1] * 5

        attributes = {
            "STR": STR,
            "CON": CON,
            "POW": POW,
            "DEX": DEX,
            "APP": APP,
            "INT": INT,
            "EDU": EDU,
            "SIZ": SIZ,
            "LUK": LUK,
        }
        derived = calculate_cthulhu_derived(attributes, system=system)
        return {"attributes": attributes, "derived": derived}

    # 6版（旧/第6版）
    STR = roll_dice_formula("3d6")[1]
    CON = roll_dice_formula("3d6")[1]
    POW = roll_dice_formula("3d6")[1]
    DEX = roll_dice_formula("3d6")[1]
    APP = roll_dice_formula("3d6")[1]

    SIZ = roll_dice_formula("2d6+6")[1]
    INT = roll_dice_formula("2d6+6")[1]
    EDU = roll_dice_formula("3d6+3")[1]

    attributes = {
        "STR": STR,
        "CON": CON,
        "POW": POW,
        "DEX": DEX,
        "APP": APP,
        "INT": INT,
        "EDU": EDU,
        "SIZ": SIZ,
    }

    derived = calculate_cthulhu_derived(attributes, system=system)
    return {"attributes": attributes, "derived": derived}


def _calc_db_build_7e(str_siz_sum: int) -> tuple[str, int]:
    # 7版: STR+SIZ → DB/BUILD
    # | 2~64  | -2    | -2 |
    # | 65~84 | -1    | -1 |
    # | 85~124| 0     | 0  |
    # | 125~164| +1D4 | 1  |
    # | 165~204| +1D6 | 2  |
    # | 205~284| +2D6 | 3  |
    # | 285~364| +3D6 | 4  |
    # | 365~444| +4D6 | 5  |
    # | 445~524| +5D6 | 6  |
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
    # 7版: MOV
    # - DEXとSTRの両方がSIZより小さい：7
    # - DEXかSTRのどちらかがSIZ以上ある、もしくは3つの能力値がすべて等しい：8
    # - DEXとSTRの両方がSIZより大きい：9
    if dex < siz and str_ < siz:
        return 7
    if dex > siz and str_ > siz:
        return 9
    return 8


def calculate_cthulhu_derived(attributes: Dict[str, int], system: SystemEnum = SystemEnum.cthulhu6) -> Dict[str, Any]:
    """
    クトゥルフの能力値から派生値を計算
    
    Args:
        attributes: 能力値の辞書
    
    Returns:
        派生値の辞書
    """
    CON = int(attributes.get("CON", 0) or 0)
    SIZ = int(attributes.get("SIZ", 0) or 0)
    POW = int(attributes.get("POW", 0) or 0)
    INT = int(attributes.get("INT", 0) or 0)
    EDU = int(attributes.get("EDU", 0) or 0)
    STR = int(attributes.get("STR", 0) or 0)
    DEX = int(attributes.get("DEX", 0) or 0)

    if system == SystemEnum.cthulhu7:
        # 7版
        san_max = POW
        hp_max = (CON + SIZ) // 10
        mp_max = POW // 5

        idea = INT
        know = EDU

        luck = int(attributes.get("LUK", 0) or 0)

        s = STR + SIZ
        db, build = _calc_db_build_7e(s)
        mov = _calc_mov_7e(DEX, STR, SIZ)

        return {
            "SAN_current": san_max,
            "SAN_max": san_max,
            "HP_current": hp_max,
            "HP_max": hp_max,
            "MP_current": mp_max,
            "MP_max": mp_max,
            "IDEA": idea,
            "KNOW": know,
            "LUCK": luck,
            "DB": db,
            "BUILD": build,
            "MOV": mov,
        }

    # 6版（旧/第6版）
    san_max = POW * 5
    hp_max = (CON + SIZ) // 2
    mp_max = POW
    idea = INT * 5
    know = EDU * 5
    luck = POW * 5

    s = STR + SIZ
    db = "+0"
    if 2 <= s <= 12:
        db = "-1D6"
    elif 13 <= s <= 16:
        db = "-1D4"
    elif 17 <= s <= 24:
        db = "+0"
    elif 25 <= s <= 32:
        db = "+1D4"
    elif 33 <= s <= 40:
        db = "+1D6"
    elif 41 <= s <= 56:
        db = "+2D6"
    elif 57 <= s <= 72:
        db = "+3D6"
    elif 73 <= s <= 88:
        db = "+4D6"
    elif s >= 89:
        db = "+5D6"

    return {
        "SAN_current": san_max,
        "SAN_max": san_max,
        "HP_current": hp_max,
        "HP_max": hp_max,
        "MP_current": mp_max,
        "MP_max": mp_max,
        "IDEA": idea,
        "KNOW": know,
        "LUCK": luck,
        "DB": db,
    }

