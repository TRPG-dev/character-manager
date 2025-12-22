// クトゥルフ神話TRPG用のユーティリティ関数
import type { CthulhuAttributes, CthulhuDerived, CthulhuSheetData, CthulhuSkill } from '../types/cthulhu';
import { DEFAULT_CTHULHU_SKILLS, COMBAT_SKILLS, calculateSkillTotal } from '../data/cthulhuSkills';

export type CthulhuSystem = 'cthulhu' | 'cthulhu6' | 'cthulhu7';
export type Cthulhu7JobPointsRule =
  | 'EDU*4'
  | 'EDU*2+STR*2'
  | 'EDU*2+CON*2'
  | 'EDU*2+POW*2'
  | 'EDU*2+DEX*2'
  | 'EDU*2+APP*2'
  | 'EDU*2+SIZ*2'
  | 'EDU*2+INT*2'
  | 'manual';

export const CTHULHU7_JOB_POINTS_RULE_LABEL: Record<Cthulhu7JobPointsRule, string> = {
  'EDU*4': 'EDU*4',
  'EDU*2+STR*2': 'EDU*2+STR*2',
  'EDU*2+CON*2': 'EDU*2+CON*2',
  'EDU*2+POW*2': 'EDU*2+POW*2',
  'EDU*2+DEX*2': 'EDU*2+DEX*2',
  'EDU*2+APP*2': 'EDU*2+APP*2',
  'EDU*2+SIZ*2': 'EDU*2+SIZ*2',
  'EDU*2+INT*2': 'EDU*2+INT*2',
  manual: '手動入力',
};

/**
 * サイコロを振る（フロントエンド用）
 */
function rollDice(count: number, sides: number, modifier: number = 0): number {
  let total = modifier;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

/**
 * クトゥルフ神話TRPGの能力値を自動生成（フロントエンド用）
 */
export function generateCthulhuAttributes(system: CthulhuSystem = 'cthulhu6'): { attributes: CthulhuAttributes; derived: CthulhuDerived } {
  if (system === 'cthulhu7') {
    // 7版: 3d6*5（STR/CON/POW/DEX/APP） (2d6+6)*5（SIZ/INT/EDU） + LUK=3d6*5
    const STR = rollDice(3, 6) * 5;
    const CON = rollDice(3, 6) * 5;
    const POW = rollDice(3, 6) * 5;
    const DEX = rollDice(3, 6) * 5;
    const APP = rollDice(3, 6) * 5;
    const SIZ = rollDice(2, 6, 6) * 5;
    const INT = rollDice(2, 6, 6) * 5;
    const EDU = rollDice(2, 6, 6) * 5;
    const LUK = rollDice(3, 6) * 5;

    const attributes: CthulhuAttributes = { STR, CON, POW, DEX, APP, INT, EDU, SIZ, LUK };
    const derived = calculateDerivedValues(attributes, system);
    return { attributes, derived };
  }

  // 6版（旧/第6版）
  const STR = rollDice(3, 6);
  const CON = rollDice(3, 6);
  const POW = rollDice(3, 6);
  const DEX = rollDice(3, 6);
  const APP = rollDice(3, 6);
  const SIZ = rollDice(2, 6, 6);
  const INT = rollDice(2, 6, 6);
  const EDU = rollDice(3, 6, 3);

  const attributes: CthulhuAttributes = { STR, CON, POW, DEX, APP, INT, EDU, SIZ };
  const derived = calculateDerivedValues(attributes, system);
  return { attributes, derived };
}

/**
 * 能力値から派生値を計算
 */
function calcDbBuild7e(strSizSum: number): { DB: string; BUILD: number } {
  if (strSizSum >= 2 && strSizSum <= 64) return { DB: '-2', BUILD: -2 };
  if (strSizSum >= 65 && strSizSum <= 84) return { DB: '-1', BUILD: -1 };
  if (strSizSum >= 85 && strSizSum <= 124) return { DB: '0', BUILD: 0 };
  if (strSizSum >= 125 && strSizSum <= 164) return { DB: '+1D4', BUILD: 1 };
  if (strSizSum >= 165 && strSizSum <= 204) return { DB: '+1D6', BUILD: 2 };
  if (strSizSum >= 205 && strSizSum <= 284) return { DB: '+2D6', BUILD: 3 };
  if (strSizSum >= 285 && strSizSum <= 364) return { DB: '+3D6', BUILD: 4 };
  if (strSizSum >= 365 && strSizSum <= 444) return { DB: '+4D6', BUILD: 5 };
  if (strSizSum >= 445 && strSizSum <= 524) return { DB: '+5D6', BUILD: 6 };
  return { DB: '0', BUILD: 0 };
}

function calcMov7e(dex: number, str: number, siz: number): number {
  if (dex < siz && str < siz) return 7;
  if (dex > siz && str > siz) return 9;
  return 8;
}

export function calculateDerivedValues(attributes: CthulhuAttributes, system: CthulhuSystem = 'cthulhu6'): CthulhuDerived {
  const { CON, SIZ, POW, INT, EDU, STR, DEX } = attributes;

  if (system === 'cthulhu7') {
    const SAN_max = POW;
    const SAN_current = SAN_max;
    const HP_max = Math.floor((CON + SIZ) / 10);
    const HP_current = HP_max;
    const MP_max = Math.floor(POW / 5);
    const MP_current = MP_max;
    const IDEA = INT;
    const KNOW = EDU;
    const LUCK = attributes.LUK ?? 0;
    const strSizSum = STR + SIZ;
    const { DB, BUILD } = calcDbBuild7e(strSizSum);
    const MOV = calcMov7e(DEX, STR, SIZ);
    return { SAN_current, SAN_max, HP_current, HP_max, MP_current, MP_max, IDEA, KNOW, LUCK, DB, BUILD, MOV };
  }

  // 6版（旧/第6版）
  const SAN_max = POW * 5;
  const SAN_current = SAN_max;
  const HP_max = Math.floor((CON + SIZ) / 2);
  const HP_current = HP_max;
  const MP_max = POW;
  const MP_current = MP_max;
  const IDEA = INT * 5;
  const KNOW = EDU * 5;
  const LUCK = POW * 5;

  const strSizSum = STR + SIZ;
  let DB = '+0';
  if (strSizSum >= 2 && strSizSum <= 12) DB = '-1D6';
  else if (strSizSum >= 13 && strSizSum <= 16) DB = '-1D4';
  else if (strSizSum >= 17 && strSizSum <= 24) DB = '+0';
  else if (strSizSum >= 25 && strSizSum <= 32) DB = '+1D4';
  else if (strSizSum >= 33 && strSizSum <= 40) DB = '+1D6';
  else if (strSizSum >= 41 && strSizSum <= 56) DB = '+2D6';
  else if (strSizSum >= 57 && strSizSum <= 72) DB = '+3D6';
  else if (strSizSum >= 73 && strSizSum <= 88) DB = '+4D6';
  else if (strSizSum >= 89) DB = '+5D6';

  return { SAN_current, SAN_max, HP_current, HP_max, MP_current, MP_max, IDEA, KNOW, LUCK, DB };
}

/**
 * シートデータを正規化（不足しているフィールドを追加）
 */
export function normalizeSheetData(data: any, system: CthulhuSystem = 'cthulhu6'): CthulhuSheetData {
  const defaultAttributes = {
    STR: 0,
    CON: 0,
    POW: 0,
    DEX: 0,
    APP: 0,
    INT: 0,
    EDU: 0,
    SIZ: 0,
    LUK: 0,
  };

  const attributes = { ...defaultAttributes, ...(data.attributes || {}) };
  const derived = calculateDerivedValues(attributes, system);
  
  // 既存の派生値があればマージ（current値は保持）
  const mergedDerived = {
    ...derived,
    ...(data.derived || {}),
    // current値は既存の値があればそれを使う、なければ計算値を使う
    SAN_current: data.derived?.SAN_current ?? derived.SAN_current,
    HP_current: data.derived?.HP_current ?? derived.HP_current,
    MP_current: data.derived?.MP_current ?? derived.MP_current,
    // 第7版: 編集可能項目は既存値を優先（なければ計算値）
    LUCK: data.derived?.LUCK ?? derived.LUCK,
    MOV: data.derived?.MOV ?? derived.MOV,
  };

  // 技能データの正規化
  let defaultSkills: CthulhuSkill[] = [];
  let combatSkills: CthulhuSkill[] = [];
  let customSkills: CthulhuSkill[] = [];

  // 動的に計算される技能の初期値を設定
  const getDynamicBaseValue = (skillName: string): number => {
    if (skillName === '回避') {
      return system === 'cthulhu7' ? Math.floor(attributes.DEX / 2) : attributes.DEX; // 7版: DEX÷2 / 6版: DEX×1
    }
    if (skillName === '母国語') {
      return system === 'cthulhu7' ? attributes.EDU : attributes.EDU * 5; // 7版: EDU×1 / 6版: EDU×5
    }
    return 0;
  };

  // combatSkillsが既に存在する場合はそれを使用
  if (data.combatSkills && Array.isArray(data.combatSkills)) {
    const combatSkillNames = new Set(COMBAT_SKILLS.map(s => s.name));
    combatSkills = data.combatSkills.map((s: any) => {
      // isCustomフラグを保持、またはデフォルトリストに含まれていない場合はカスタム技能
      const isCustom = s.isCustom === true || !combatSkillNames.has(s.name);
      const skill: CthulhuSkill = {
        name: s.name,
        specialty: s.specialty ?? '',
        baseValue: s.baseValue ?? s.base_value ?? 0,
        jobPoints: s.jobPoints ?? s.job_points ?? 0,
        interestPoints: s.interestPoints ?? s.interest_points ?? 0,
        growth: s.growth ?? 0,
        other: s.other ?? 0,
        isCustom: isCustom,
      };
      // 動的計算が必要な技能の初期値を更新（カスタム技能でない場合のみ）
      if (!isCustom) {
        const dynamicBaseValue = getDynamicBaseValue(skill.name);
        if (dynamicBaseValue > 0) {
          skill.baseValue = dynamicBaseValue;
        }
      }
      skill.total = calculateSkillTotal(skill);
      return skill;
    });
  } else {
    // 新規作成時はデフォルトの格闘技能を設定
    combatSkills = COMBAT_SKILLS.map(skill => {
      const dynamicBaseValue = getDynamicBaseValue(skill.name);
      const baseValue = dynamicBaseValue > 0 ? dynamicBaseValue : skill.baseValue;
      return {
        ...skill,
        baseValue,
        isCustom: false, // デフォルト技能は明示的にfalse
        total: calculateSkillTotal({ ...skill, baseValue }),
      };
    });
  }

  // customSkillsが既に存在する場合はそれを使用
  if (data.customSkills && Array.isArray(data.customSkills)) {
    customSkills = data.customSkills.map((s: any) => {
      const skill: CthulhuSkill = {
        name: s.name,
        specialty: s.specialty ?? '',
        baseValue: s.baseValue ?? s.base_value ?? 0,
        jobPoints: s.jobPoints ?? s.job_points ?? 0,
        interestPoints: s.interestPoints ?? s.interest_points ?? 0,
        growth: s.growth ?? 0,
        other: s.other ?? 0,
        isCustom: true,
      };
      skill.total = calculateSkillTotal(skill);
      return skill;
    });
  }

  if (data.skills && Array.isArray(data.skills)) {
    // 既存データからデフォルト技能と追加技能を分離
    const combatSkillNames = new Set(COMBAT_SKILLS.map(s => s.name));
    
    // デフォルト技能をマージ（格闘技能を除外）
    defaultSkills = DEFAULT_CTHULHU_SKILLS.map(defaultSkill => {
      // 動的計算が必要な技能の初期値を更新
      const dynamicBaseValue = getDynamicBaseValue(defaultSkill.name);
      const baseValue = dynamicBaseValue > 0 ? dynamicBaseValue : defaultSkill.baseValue;
      
      const existing = data.skills.find((s: any) => s.name === defaultSkill.name);
      if (existing) {
        // 既存データから値を取得
        const skill: CthulhuSkill = {
          ...defaultSkill,
          specialty: existing.specialty ?? '',
          baseValue, // 動的計算値を使用
          jobPoints: existing.jobPoints ?? existing.job_points ?? 0,
          interestPoints: existing.interestPoints ?? existing.interest_points ?? 0,
          growth: existing.growth ?? 0,
          other: existing.other ?? 0,
        };
        skill.total = calculateSkillTotal(skill);
        return skill;
      }
      const skill = { ...defaultSkill, baseValue, total: calculateSkillTotal({ ...defaultSkill, baseValue }) };
      return skill;
    });

    // 追加技能を抽出（customSkillsが存在しない場合のみ）
    if (!data.customSkills || !Array.isArray(data.customSkills)) {
      customSkills = data.skills
        .filter((s: any) => {
          const isDefault = DEFAULT_CTHULHU_SKILLS.some(ds => ds.name === s.name);
          const isCombat = combatSkillNames.has(s.name);
          return !isDefault && !isCombat;
        })
        .map((s: any) => {
          const skill: CthulhuSkill = {
            name: s.name,
            specialty: s.specialty ?? '',
            baseValue: s.baseValue ?? s.base_value ?? s.value ?? 0,
            jobPoints: s.jobPoints ?? s.job_points ?? 0,
            interestPoints: s.interestPoints ?? s.interest_points ?? 0,
            growth: s.growth ?? 0,
            other: s.other ?? 0,
            isCustom: true,
          };
          skill.total = calculateSkillTotal(skill);
          return skill;
        });
    }
  } else {
    // 新規作成時はデフォルト技能のみ
    defaultSkills = DEFAULT_CTHULHU_SKILLS.map(skill => {
      const dynamicBaseValue = getDynamicBaseValue(skill.name);
      const baseValue = dynamicBaseValue > 0 ? dynamicBaseValue : skill.baseValue;
      return {
        ...skill,
        baseValue,
        total: calculateSkillTotal({ ...skill, baseValue }),
      };
    });
  }

  return {
    playerName: data.playerName ?? '',
    occupation: data.occupation ?? '',
    age: data.age ?? undefined,
    gender: data.gender ?? '',
    birthplace: data.birthplace ?? '',
    schoolDegree: data.schoolDegree ?? '',
    jobPointsRule: data.jobPointsRule ?? (system === 'cthulhu7' ? 'EDU*4' : undefined),
    jobPointsManualLimit: data.jobPointsManualLimit ?? undefined,
    attributes,
    derived: mergedDerived,
    skills: defaultSkills,
    combatSkills,
    customSkills,
    weapons: data.weapons || [],
    items: data.items || [],
    cash: data.cash ?? '',
    assets: data.assets ?? '',
    backstory: data.backstory || '',
    notes: data.notes || '',
    scenarios: data.scenarios || [],
    mythosBooks: data.mythosBooks || [],
    spells: data.spells || [],
    artifacts: data.artifacts || [],
    encounteredEntities: data.encounteredEntities || [],
  };
}

/**
 * 職業Pの上限を計算
 */
export function getJobPointsLimit(edu: number): number {
  return edu * 20;
}

/**
 * 興味Pの上限を計算
 */
export function getInterestPointsLimit(int: number): number {
  return int * 10;
}

function toSafeInt(v: unknown, fallback: number = 0): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function getCthulhuJobPointsLimit(params: {
  system: CthulhuSystem;
  attributes: CthulhuAttributes;
  jobPointsRule?: unknown;
  jobPointsManualLimit?: unknown;
}): { limit: number; label: string; rule?: Cthulhu7JobPointsRule } {
  const { system, attributes } = params;

  if (system !== 'cthulhu7') {
    const edu = toSafeInt(attributes.EDU, 0);
    return { limit: edu * 20, label: 'EDU × 20' };
  }

  const edu = toSafeInt(attributes.EDU, 0);
  const str = toSafeInt(attributes.STR, 0);
  const con = toSafeInt(attributes.CON, 0);
  const pow = toSafeInt(attributes.POW, 0);
  const dex = toSafeInt(attributes.DEX, 0);
  const app = toSafeInt(attributes.APP, 0);
  const siz = toSafeInt(attributes.SIZ, 0);
  const int_ = toSafeInt(attributes.INT, 0);

  const rawRule = String(params.jobPointsRule ?? 'EDU*4');
  const rule: Cthulhu7JobPointsRule = ([
    'EDU*4',
    'EDU*2+STR*2',
    'EDU*2+CON*2',
    'EDU*2+POW*2',
    'EDU*2+DEX*2',
    'EDU*2+APP*2',
    'EDU*2+SIZ*2',
    'EDU*2+INT*2',
    'manual',
  ] as const).includes(rawRule as any)
    ? (rawRule as Cthulhu7JobPointsRule)
    : 'EDU*4';

  if (rule === 'manual') {
    const manual = Math.max(0, toSafeInt(params.jobPointsManualLimit, 0));
    return { limit: manual, label: '手動入力', rule };
  }

  let limit = edu * 4;
  if (rule === 'EDU*2+STR*2') limit = edu * 2 + str * 2;
  if (rule === 'EDU*2+CON*2') limit = edu * 2 + con * 2;
  if (rule === 'EDU*2+POW*2') limit = edu * 2 + pow * 2;
  if (rule === 'EDU*2+DEX*2') limit = edu * 2 + dex * 2;
  if (rule === 'EDU*2+APP*2') limit = edu * 2 + app * 2;
  if (rule === 'EDU*2+SIZ*2') limit = edu * 2 + siz * 2;
  if (rule === 'EDU*2+INT*2') limit = edu * 2 + int_ * 2;

  return { limit, label: CTHULHU7_JOB_POINTS_RULE_LABEL[rule], rule };
}

export function getCthulhuInterestPointsLimit(system: CthulhuSystem, intValue: number): { limit: number; label: string } {
  const int_ = toSafeInt(intValue, 0);
  if (system === 'cthulhu7') {
    return { limit: int_ * 2, label: 'INT × 2' };
  }
  return { limit: int_ * 10, label: 'INT × 10' };
}

