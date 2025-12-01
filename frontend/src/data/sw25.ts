// ソードワールド2.5用のデータ定義
// 参考: ソードワールド2.5 ルールブック

import type { Sw25Race, Sw25Birth, Sw25Abilities } from '../types/sw25';

// ============================================================================
// 種族データ
// ============================================================================

export interface Sw25RaceData {
  name: Sw25Race;
  availableBirths: Sw25Birth[];
  abilityModifiers: Sw25Abilities; // 能力修正（技、体、心）
  traits: string[]; // 種族特性
  description?: string; // 説明
}

export const SW25_RACES: Sw25RaceData[] = [
  {
    name: '人間',
    availableBirths: ['魔動機師', '魔術師', '軽戦士', '一般人', '傭兵', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: 0, 体: 0, 心: 0 },
    traits: ['汎用性が高い'],
    description: '最も一般的な種族。バランスが取れている。',
  },
  {
    name: 'エルフ',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: 1, 体: -1, 心: 1 },
    traits: ['魔法適性が高い', '長命'],
    description: '魔法に適した種族。知性と技術に優れる。',
  },
  {
    name: 'ドワーフ',
    availableBirths: ['魔動機師', '軽戦士', '一般人', '傭兵', 'その他'],
    abilityModifiers: { 技: 0, 体: 1, 心: -1 },
    traits: ['頑健', '技術に長ける'],
    description: '頑丈な体を持つ種族。物理的な力に優れる。',
  },
  {
    name: 'タビット',
    availableBirths: ['軽戦士', '一般人', '傭兵', 'その他'],
    abilityModifiers: { 技: 1, 体: 0, 心: 0 },
    traits: ['機敏', '小柄'],
    description: '機敏で小柄な種族。技術に優れる。',
  },
  {
    name: 'ルーンフォーク',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: 0, 体: 0, 心: 1 },
    traits: ['魔法適性が高い', '知性に優れる'],
    description: '魔法に適した種族。知性に優れる。',
  },
  {
    name: 'ナイトメア',
    availableBirths: ['魔術師', '軽戦士', '一般人', '傭兵', 'その他'],
    abilityModifiers: { 技: 0, 体: 1, 心: 0 },
    traits: ['暗黒適性', '頑健'],
    description: '暗黒の力を持つ種族。',
  },
  {
    name: 'リカント',
    availableBirths: ['軽戦士', '一般人', '傭兵', 'その他'],
    abilityModifiers: { 技: 0, 体: 1, 心: -1 },
    traits: ['変身能力', '頑健'],
    description: '変身能力を持つ種族。',
  },
  {
    name: 'リルドラケン',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: -1, 体: 0, 心: 1 },
    traits: ['魔法適性が高い', '飛行能力'],
    description: '飛行能力を持つ種族。魔法に適している。',
  },
  {
    name: 'グラスランナー',
    availableBirths: ['軽戦士', '一般人', '傭兵', 'その他'],
    abilityModifiers: { 技: 1, 体: 1, 心: -1 },
    traits: ['機敏', '頑健'],
    description: '機敏で頑健な種族。',
  },
  {
    name: 'メリア',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: 0, 体: -1, 心: 1 },
    traits: ['魔法適性が高い', '知性に優れる'],
    description: '魔法に適した種族。知性に優れる。',
  },
  {
    name: 'ティエンス',
    availableBirths: ['魔動機師', '魔術師', '軽戦士', '一般人', '傭兵', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: 0, 体: 0, 心: 0 },
    traits: ['汎用性が高い', '適応力が高い'],
    description: '適応力が高い種族。',
  },
  {
    name: 'レプラカーン',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: 1, 体: -1, 心: 1 },
    traits: ['魔法適性が高い', '機敏'],
    description: '魔法に適した種族。機敏で知性に優れる。',
  },
  {
    name: 'その他',
    availableBirths: ['魔動機師', '魔術師', '軽戦士', '一般人', '傭兵', '神官', '操霊術士', 'その他'],
    abilityModifiers: { 技: 0, 体: 0, 心: 0 },
    traits: [],
    description: 'その他の種族。',
  },
];

// ============================================================================
// 技能データ
// ============================================================================

export type ClassCategory = '戦士系' | '魔法系' | 'その他';

export interface Sw25ClassData {
  name: string; // 技能名
  category: ClassCategory; // 技能種
  availableSkills?: string[]; // 習得可能戦闘特技
  availableMagics?: string[]; // 習得可能魔法・スキル
  description?: string; // 説明
}

export const SW25_CLASSES: Sw25ClassData[] = [
  // 戦士系
  {
    name: 'ファイター',
    category: '戦士系',
    availableSkills: ['武器習熟', '防具習熟', '頑健', '先制攻撃', '連撃'],
    description: '戦闘に特化した技能。',
  },
  {
    name: 'グラップラー',
    category: '戦士系',
    availableSkills: ['格闘', '組み技', '投げ技', '関節技'],
    description: '格闘に特化した技能。',
  },
  {
    name: 'フェンサー',
    category: '戦士系',
    availableSkills: ['武器習熟', '防具習熟', '先制攻撃', '連撃', '回避'],
    description: '剣術に特化した技能。',
  },
  {
    name: 'シューター',
    category: '戦士系',
    availableSkills: ['武器習熟', '射撃', '精密射撃', '連射'],
    description: '射撃に特化した技能。',
  },
  // 魔法系
  {
    name: 'ソーサラー',
    category: '魔法系',
    availableMagics: ['精霊魔法'],
    description: '精霊魔法を扱う技能。',
  },
  {
    name: 'コンジャラー',
    category: '魔法系',
    availableMagics: ['精霊魔法', '呪歌'],
    description: '精霊魔法と呪歌を扱う技能。',
  },
  {
    name: 'プリースト',
    category: '魔法系',
    availableMagics: ['神聖魔法'],
    description: '神聖魔法を扱う技能。',
  },
  {
    name: 'フェアリーテイマー',
    category: '魔法系',
    availableMagics: ['精霊魔法', '呪歌'],
    description: '精霊魔法と呪歌を扱う技能。',
  },
  {
    name: 'マギテック',
    category: '魔法系',
    availableMagics: ['精霊魔法'],
    description: '精霊魔法と技術を組み合わせる技能。',
  },
  // その他
  {
    name: 'スカウト',
    category: 'その他',
    availableSkills: ['隠密', '探索', '追跡', '回避'],
    description: '探索と隠密に特化した技能。',
  },
  {
    name: 'レンジャー',
    category: 'その他',
    availableSkills: ['武器習熟', '射撃', '探索', '追跡'],
    description: '探索と戦闘を組み合わせた技能。',
  },
  {
    name: 'セージ',
    category: 'その他',
    availableMagics: ['精霊魔法', '神聖魔法'],
    description: '知識と魔法を扱う技能。',
  },
  {
    name: 'エンハンサー',
    category: 'その他',
    availableSkills: ['支援', '強化'],
    availableMagics: ['精霊魔法', '神聖魔法'],
    description: '支援と強化に特化した技能。',
  },
  {
    name: 'バード',
    category: 'その他',
    availableMagics: ['呪歌'],
    description: '呪歌を扱う技能。',
  },
  {
    name: 'ライダー',
    category: 'その他',
    availableSkills: ['騎乗', '武器習熟', '防具習熟'],
    description: '騎乗に特化した技能。',
  },
  {
    name: 'アルケミスト',
    category: 'その他',
    availableSkills: ['調合', '知識'],
    description: '調合と知識に特化した技能。',
  },
];

// ============================================================================
// 戦闘特技データ
// ============================================================================

export type SkillCategory = '選択' | '自動';

export interface Sw25SkillData {
  name: string; // 戦闘特技名
  category: SkillCategory; // 戦闘特技カテゴリ
  requirements?: string; // 習得条件
  effect: string; // 効果説明
  description?: string; // 説明
}

export const SW25_SKILLS: Sw25SkillData[] = [
  {
    name: '武器習熟',
    category: '選択',
    effect: '特定の武器の命中力が+1される。',
  },
  {
    name: '防具習熟',
    category: '選択',
    effect: '特定の防具の防護点が+1される。',
  },
  {
    name: '頑健',
    category: '選択',
    effect: 'HPが+2される。',
  },
  {
    name: '先制攻撃',
    category: '選択',
    effect: '先制判定に+2される。',
  },
  {
    name: '連撃',
    category: '選択',
    requirements: 'ファイターLv3以上',
    effect: '1ターンに2回攻撃できる。',
  },
  {
    name: '格闘',
    category: '選択',
    effect: '格闘攻撃の命中力が+1される。',
  },
  {
    name: '組み技',
    category: '選択',
    requirements: 'グラップラーLv2以上',
    effect: '組み技の成功率が+1される。',
  },
  {
    name: '投げ技',
    category: '選択',
    requirements: 'グラップラーLv2以上',
    effect: '投げ技の成功率が+1される。',
  },
  {
    name: '関節技',
    category: '選択',
    requirements: 'グラップラーLv3以上',
    effect: '関節技の成功率が+1される。',
  },
  {
    name: '射撃',
    category: '選択',
    effect: '射撃攻撃の命中力が+1される。',
  },
  {
    name: '精密射撃',
    category: '選択',
    requirements: 'シューターLv2以上',
    effect: '射撃攻撃の命中力が+2される。',
  },
  {
    name: '連射',
    category: '選択',
    requirements: 'シューターLv3以上',
    effect: '1ターンに2回射撃できる。',
  },
  {
    name: '回避',
    category: '選択',
    effect: '回避判定に+1される。',
  },
  {
    name: '隠密',
    category: '選択',
    effect: '隠密判定に+1される。',
  },
  {
    name: '探索',
    category: '選択',
    effect: '探索判定に+1される。',
  },
  {
    name: '追跡',
    category: '選択',
    effect: '追跡判定に+1される。',
  },
  {
    name: '支援',
    category: '選択',
    effect: '味方への支援判定に+1される。',
  },
  {
    name: '強化',
    category: '選択',
    effect: '強化魔法の効果が+1される。',
  },
  {
    name: '騎乗',
    category: '選択',
    effect: '騎乗判定に+1される。',
  },
  {
    name: '調合',
    category: '選択',
    effect: '調合判定に+1される。',
  },
  {
    name: '知識',
    category: '選択',
    effect: '知識判定に+1される。',
  },
];

// ============================================================================
// 魔法・スキルデータ
// ============================================================================

export type MagicSystem = '精霊魔法' | '神聖魔法' | '呪歌' | '練技' | 'その他';

export interface Sw25MagicData {
  name: string; // 魔法・スキル名
  system: MagicSystem; // 魔法系統
  cost: number; // 消費MP
  effect: string; // 効果説明
  requirements?: string; // 習得条件
  description?: string; // 説明
}

export const SW25_MAGICS: Sw25MagicData[] = [
  // 精霊魔法
  {
    name: 'ファイアボール',
    system: '精霊魔法',
    cost: 2,
    effect: '火の球を放つ。ダメージ2D6。',
  },
  {
    name: 'アイスボルト',
    system: '精霊魔法',
    cost: 2,
    effect: '氷の矢を放つ。ダメージ2D6。',
  },
  {
    name: 'ライトニング',
    system: '精霊魔法',
    cost: 3,
    effect: '雷を放つ。ダメージ3D6。',
  },
  {
    name: 'ヒール',
    system: '精霊魔法',
    cost: 2,
    effect: 'HPを2D6回復する。',
  },
  {
    name: 'キュア',
    system: '精霊魔法',
    cost: 3,
    effect: 'HPを3D6回復する。',
  },
  {
    name: 'プロテクション',
    system: '精霊魔法',
    cost: 2,
    effect: '防護点が+2される。',
  },
  {
    name: 'エンハンス',
    system: '精霊魔法',
    cost: 2,
    effect: '能力値が+2される。',
  },
  // 神聖魔法
  {
    name: 'ヒーリング',
    system: '神聖魔法',
    cost: 2,
    effect: 'HPを2D6回復する。',
  },
  {
    name: 'キュアー',
    system: '神聖魔法',
    cost: 3,
    effect: 'HPを3D6回復する。',
  },
  {
    name: 'バリア',
    system: '神聖魔法',
    cost: 2,
    effect: '防護点が+2される。',
  },
  {
    name: 'ブレス',
    system: '神聖魔法',
    cost: 2,
    effect: '能力値が+2される。',
  },
  {
    name: 'ターンアンデッド',
    system: '神聖魔法',
    cost: 3,
    effect: 'アンデッドを退散させる。',
  },
  // 呪歌
  {
    name: '戦の歌',
    system: '呪歌',
    cost: 2,
    effect: '味方の攻撃力が+2される。',
  },
  {
    name: '守りの歌',
    system: '呪歌',
    cost: 2,
    effect: '味方の防護点が+2される。',
  },
  {
    name: '癒しの歌',
    system: '呪歌',
    cost: 2,
    effect: '味方のHPを2D6回復する。',
  },
  {
    name: '鼓舞の歌',
    system: '呪歌',
    cost: 2,
    effect: '味方の能力値が+2される。',
  },
  // 練技
  {
    name: '気合',
    system: '練技',
    cost: 1,
    effect: '次の攻撃の命中力が+2される。',
  },
  {
    name: '集中',
    system: '練技',
    cost: 1,
    effect: '次の攻撃のダメージが+2される。',
  },
  {
    name: '見切り',
    system: '練技',
    cost: 1,
    effect: '回避判定に+2される。',
  },
];

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * 種族名から種族データを取得
 */
export function getRaceByName(name: Sw25Race): Sw25RaceData | undefined {
  return SW25_RACES.find(race => race.name === name);
}

/**
 * 技能名から技能データを取得
 */
export function getClassByName(name: string): Sw25ClassData | undefined {
  return SW25_CLASSES.find(cls => cls.name === name);
}

/**
 * 技能から習得可能戦闘特技を取得
 */
export function getSkillsByClass(className: string): Sw25SkillData[] {
  const classData = getClassByName(className);
  if (!classData || !classData.availableSkills) {
    return [];
  }
  return SW25_SKILLS.filter(skill => 
    classData.availableSkills!.includes(skill.name)
  );
}

/**
 * 技能から習得可能魔法・スキルを取得
 */
export function getMagicByClass(className: string): Sw25MagicData[] {
  const classData = getClassByName(className);
  if (!classData || !classData.availableMagics) {
    return [];
  }
  return SW25_MAGICS.filter(magic => 
    classData.availableMagics!.includes(magic.system)
  );
}

/**
 * 魔法系統から魔法リストを取得
 */
export function getMagicBySystem(system: MagicSystem): Sw25MagicData[] {
  return SW25_MAGICS.filter(magic => magic.system === system);
}

/**
 * 種族から利用可能な生まれを取得
 */
export function getAvailableBirthsByRace(race: Sw25Race): Sw25Birth[] {
  const raceData = getRaceByName(race);
  return raceData?.availableBirths || [];
}

/**
 * 技能カテゴリから技能リストを取得
 */
export function getClassesByCategory(category: ClassCategory): Sw25ClassData[] {
  return SW25_CLASSES.filter(cls => cls.category === category);
}

