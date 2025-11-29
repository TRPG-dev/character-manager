import re
import random
from typing import List, Tuple


def parse_dice_formula(formula: str) -> Tuple[int, int]:
    """
    ダイス式をパースして、ダイスの個数と面数を返す
    
    Args:
        formula: ダイス式（例: "3d6", "1d20"）
    
    Returns:
        (ダイスの個数, ダイスの面数)
    
    Raises:
        ValueError: 無効なダイス式の場合
    """
    # 正規表現でXdY形式をマッチ
    pattern = r'^(\d+)d(\d+)$'
    match = re.match(pattern, formula.lower())
    
    if not match:
        raise ValueError(f"無効なダイス式です: {formula}. 形式は 'XdY' (例: 3d6) です。")
    
    count = int(match.group(1))
    sides = int(match.group(2))
    
    # バリデーション
    if count < 1 or count > 1000:
        raise ValueError(f"ダイスの個数は1から1000の範囲で指定してください。現在の値: {count}")
    
    if sides < 2 or sides > 1000:
        raise ValueError(f"ダイスの面数は2から1000の範囲で指定してください。現在の値: {sides}")
    
    return count, sides


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
    ダイス式からダイスを振る
    
    Args:
        formula: ダイス式（例: "3d6"）
    
    Returns:
        (各ダイスの結果のリスト, 合計値)
    
    Raises:
        ValueError: 無効なダイス式の場合
    """
    count, sides = parse_dice_formula(formula)
    rolls = roll_dice(count, sides)
    total = sum(rolls)
    return rolls, total

