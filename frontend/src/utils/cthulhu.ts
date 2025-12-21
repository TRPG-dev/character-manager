// クトゥルフ神話TRPG用のユーティリティ関数
import type { CthulhuAttributes, CthulhuDerived, CthulhuSheetData, CthulhuSkill } from '../types/cthulhu';
import { DEFAULT_CTHULHU_SKILLS, COMBAT_SKILLS, calculateSkillTotal } from '../data/cthulhuSkills';

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
export function generateCthulhuAttributes(): { attributes: CthulhuAttributes; derived: CthulhuDerived } {
  // 基本能力値（3d6）
  const STR = rollDice(3, 6);
  const CON = rollDice(3, 6);
  const POW = rollDice(3, 6);
  const DEX = rollDice(3, 6);
  const APP = rollDice(3, 6);
  
  // SIZ, INT (2d6+6)
  const SIZ = rollDice(2, 6, 6);
  const INT = rollDice(2, 6, 6);
  
  // EDU (3d6+3)
  const EDU = rollDice(3, 6, 3);
  
  const attributes: CthulhuAttributes = {
    STR,
    CON,
    POW,
    DEX,
    APP,
    INT,
    EDU,
    SIZ,
  };
  
  // 派生値を計算
  const derived = calculateDerivedValues(attributes);
  
  return { attributes, derived };
}

/**
 * 能力値から派生値を計算
 */
export function calculateDerivedValues(attributes: CthulhuAttributes): CthulhuDerived {
  const { CON, SIZ, POW, INT, EDU, STR } = attributes;

  // SAN
  const SAN_max = POW * 5;
  const SAN_current = SAN_max; // 初期値は最大値と同じ

  // HP (最大) = (CON+SIZ)/2
  const HP_max = Math.floor((CON + SIZ) / 2);
  const HP_current = HP_max; // 初期値は最大値と同じ

  // MP
  const MP_max = POW; // POW×1
  const MP_current = MP_max; // 初期値は最大値と同じ

  // アイデア (INT×5)
  const IDEA = INT * 5;

  // 知識 (EDU×5)
  const KNOW = EDU * 5;

  // 幸運 (POW×5)
  const LUCK = POW * 5;

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
  };
}

/**
 * シートデータを正規化（不足しているフィールドを追加）
 */
export function normalizeSheetData(data: any): CthulhuSheetData {
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

  // 技能データの正規化
  let defaultSkills: CthulhuSkill[] = [];
  let combatSkills: CthulhuSkill[] = [];
  let customSkills: CthulhuSkill[] = [];

  // 動的に計算される技能の初期値を設定
  const getDynamicBaseValue = (skillName: string): number => {
    if (skillName === '回避') {
      return attributes.DEX; // DEX×1
    }
    if (skillName === '母国語') {
      return attributes.EDU * 5; // EDU×5
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
    school: data.school ?? '',
    degree: data.degree ?? '',
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

