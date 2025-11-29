import re
import random
from typing import List, Tuple, Dict, Any


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


def generate_cthulhu_attributes() -> Dict[str, Any]:
    """
    クトゥルフ神話TRPGの能力値を自動生成
    
    能力値生成ルール:
    - STR, CON, POW, DEX, APP: 3d6 (3-18)
    - SIZ, INT: 2d6+6 (8-18)
    - EDU: 3d6+3 (6-21)
    
    Returns:
        能力値と派生値の辞書
    """
    # 基本能力値（3d6）
    STR = roll_dice_formula("3d6")[1]
    CON = roll_dice_formula("3d6")[1]
    POW = roll_dice_formula("3d6")[1]
    DEX = roll_dice_formula("3d6")[1]
    APP = roll_dice_formula("3d6")[1]
    
    # SIZ, INT (2d6+6)
    SIZ = roll_dice_formula("2d6+6")[1]
    INT = roll_dice_formula("2d6+6")[1]
    
    # EDU (3d6+3)
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
    
    # 派生値を計算
    derived = calculate_cthulhu_derived(attributes)
    
    return {
        "attributes": attributes,
        "derived": derived,
    }


def calculate_cthulhu_derived(attributes: Dict[str, int]) -> Dict[str, Any]:
    """
    クトゥルフの能力値から派生値を計算
    
    Args:
        attributes: 能力値の辞書
    
    Returns:
        派生値の辞書
    """
    CON = attributes.get("CON", 0)
    SIZ = attributes.get("SIZ", 0)
    POW = attributes.get("POW", 0)
    INT = attributes.get("INT", 0)
    EDU = attributes.get("EDU", 0)
    STR = attributes.get("STR", 0)
    
    # SAN
    SAN_max = POW * 5
    SAN_current = SAN_max
    
    # HP (最大) = (CON+SIZ)/2
    HP_max = (CON + SIZ) // 2
    HP_current = HP_max
    
    # MP
    MP_max = POW
    MP_current = MP_max
    
    # アイデア (INT×5)
    IDEA = INT * 5
    
    # 知識 (EDU×5)
    KNOW = EDU * 5
    
    # 幸運 (POW×5)
    LUCK = POW * 5
    
    # ダメージボーナス (STR+SIZの値で計算)
    strSizSum = STR + SIZ
    DB = '+0'
    if 2 <= strSizSum <= 12:
        DB = '-1D6'
    elif 13 <= strSizSum <= 16:
        DB = '-1D4'
    elif 17 <= strSizSum <= 24:
        DB = '+0'
    elif 25 <= strSizSum <= 32:
        DB = '+1D4'
    elif 33 <= strSizSum <= 40:
        DB = '+1D6'
    elif 41 <= strSizSum <= 56:
        DB = '+2D6'
    elif 57 <= strSizSum <= 72:
        DB = '+3D6'
    elif 73 <= strSizSum <= 88:
        DB = '+4D6'
    elif strSizSum >= 89:
        DB = '+5D6'
    
    return {
        "SAN_current": SAN_current,
        "SAN_max": SAN_max,
        "HP_current": HP_current,
        "HP_max": HP_max,
        "MP_current": MP_current,
        "MP_max": MP_max,
        "IDEA": IDEA,
        "KNOW": KNOW,
        "LUCK": LUCK,
        "DB": DB,
    }

