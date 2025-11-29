// クトゥルフ神話TRPG用のユーティリティ関数
import type { CthulhuAttributes, CthulhuDerived } from '../types/cthulhu';

/**
 * 能力値から派生値を計算
 */
export function calculateDerivedValues(attributes: CthulhuAttributes): CthulhuDerived {
  const { CON, SIZ, POW, INT, EDU, STR } = attributes;

  // SAN
  const SAN_max = POW * 5;
  const SAN_current = SAN_max; // 初期値は最大値と同じ

  // HP
  const HP_max = Math.ceil((CON + SIZ) / 10);
  const HP_current = HP_max; // 初期値は最大値と同じ

  // MP
  const MP_max = Math.ceil(POW / 5);
  const MP_current = MP_max; // 初期値は最大値と同じ

  // アイデア (INT×5)
  const IDEA = INT * 5;

  // 知識 (EDU×5)
  const KNOW = EDU * 5;

  // 幸運 (POW×5)
  const LUCK = POW * 5;

  // 耐久力 ((CON+SIZ)/2)
  const BUILD = Math.floor((CON + SIZ) / 2);

  // ダメージボーナス (STR+SIZの値で計算)
  const strSizSum = STR + SIZ;
  let DB = '+0';
  if (strSizSum >= 2 && strSizSum <= 12) {
    DB = '-1D6';
  } else if (strSizSum >= 13 && strSizSum <= 16) {
    DB = '-1D4';
  } else if (strSizSum >= 17 && strSizSum <= 24) {
    DB = '+0';
  } else if (strSizSum >= 25 && strSizSum <= 32) {
    DB = '+1D4';
  } else if (strSizSum >= 33 && strSizSum <= 40) {
    DB = '+1D6';
  } else if (strSizSum >= 41 && strSizSum <= 56) {
    DB = '+2D6';
  } else if (strSizSum >= 57 && strSizSum <= 72) {
    DB = '+3D6';
  } else if (strSizSum >= 73 && strSizSum <= 88) {
    DB = '+4D6';
  } else if (strSizSum >= 89) {
    DB = '+5D6';
  }

  return {
    SAN_current,
    SAN_max,
    HP_current,
    HP_max,
    MP_current,
    MP_max,
    IDEA,
    KNOW,
    LUCK,
    DB,
    BUILD,
  };
}

/**
 * シートデータを正規化（不足しているフィールドを追加）
 */
export function normalizeSheetData(data: any): any {
  const defaultAttributes = {
    STR: 0,
    CON: 0,
    POW: 0,
    DEX: 0,
    APP: 0,
    INT: 0,
    EDU: 0,
    SIZ: 0,
  };

  const attributes = { ...defaultAttributes, ...(data.attributes || {}) };
  const derived = calculateDerivedValues(attributes);
  
  // 既存の派生値があればマージ（current値は保持）
  const mergedDerived = {
    ...derived,
    ...(data.derived || {}),
    // current値は既存の値があればそれを使う、なければ計算値を使う
    SAN_current: data.derived?.SAN_current ?? derived.SAN_current,
    HP_current: data.derived?.HP_current ?? derived.HP_current,
    MP_current: data.derived?.MP_current ?? derived.MP_current,
  };

  return {
    attributes,
    derived: mergedDerived,
    skills: data.skills || [],
    weapons: data.weapons || [],
    items: data.items || [],
    backstory: data.backstory || '',
    notes: data.notes || '',
  };
}

