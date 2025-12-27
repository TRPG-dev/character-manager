// ソードワールド2.5用のデータ定義
// 参考: ソードワールド2.5 ルールブック

import type { Sw25Race, Sw25Birth, Sw25Abilities } from '../types/sw25';

// ============================================================================
// 種族・生まれ対応表
// ============================================================================

export interface RaceBirthMapping {
  race: Sw25Race;
  birth: Sw25Birth;
  baseAbilities: Sw25Abilities; // 基本能力値（技、体、心）
}

// 種族・生まれの対応表（issue 34の対応表に基づく）
export const RACE_BIRTH_MAPPING: RaceBirthMapping[] = [
  // 人間
  { race: '人間', birth: '魔動機師', baseAbilities: { 技: 8, 体: 4, 心: 9 } },
  { race: '人間', birth: '魔術師', baseAbilities: { 技: 6, 体: 5, 心: 10 } },
  { race: '人間', birth: '軽戦士', baseAbilities: { 技: 10, 体: 7, 心: 4 } },
  { race: '人間', birth: '一般人', baseAbilities: { 技: 7, 体: 7, 心: 7 } },
  { race: '人間', birth: '傭兵', baseAbilities: { 技: 7, 体: 10, 心: 4 } },
  { race: '人間', birth: '神官', baseAbilities: { 技: 4, 体: 8, 心: 9 } },
  { race: '人間', birth: '操霊術師', baseAbilities: { 技: 7, 体: 4, 心: 10 } },
  // エルフ
  { race: 'エルフ', birth: '剣士', baseAbilities: { 技: 12, 体: 5, 心: 9 } },
  { race: 'エルフ', birth: '薬師', baseAbilities: { 技: 10, 体: 5, 心: 11 } },
  { race: 'エルフ', birth: '神官', baseAbilities: { 技: 9, 体: 5, 心: 12 } },
  { race: 'エルフ', birth: '操霊術師', baseAbilities: { 技: 9, 体: 4, 心: 13 } },
  { race: 'エルフ', birth: '魔術師', baseAbilities: { 技: 10, 体: 3, 心: 13 } },
  { race: 'エルフ', birth: '射手', baseAbilities: { 技: 13, 体: 5, 心: 8 } },
  // ドワーフ
  { race: 'ドワーフ', birth: '射手', baseAbilities: { 技: 6, 体: 8, 心: 6 } },
  { race: 'ドワーフ', birth: '戦士', baseAbilities: { 技: 4, 体: 11, 心: 5 } },
  { race: 'ドワーフ', birth: '拳闘士', baseAbilities: { 技: 5, 体: 10, 心: 5 } },
  { race: 'ドワーフ', birth: '神官', baseAbilities: { 技: 4, 体: 7, 心: 9 } },
  { race: 'ドワーフ', birth: '魔動機師', baseAbilities: { 技: 6, 体: 7, 心: 7 } },
  // タビット
  { race: 'タビット', birth: '操霊術師', baseAbilities: { 技: 6, 体: 6, 心: 10 } },
  { race: 'タビット', birth: '魔術師', baseAbilities: { 技: 5, 体: 7, 心: 10 } },
  { race: 'タビット', birth: '学者', baseAbilities: { 技: 5, 体: 8, 心: 9 } },
  { race: 'タビット', birth: '魔動機師', baseAbilities: { 技: 8, 体: 5, 心: 9 } },
  // ルーンフォーク
  { race: 'ルーンフォーク', birth: '学者', baseAbilities: { 技: 8, 体: 10, 心: 8 } },
  { race: 'ルーンフォーク', birth: '射手', baseAbilities: { 技: 12, 体: 8, 心: 6 } },
  { race: 'ルーンフォーク', birth: '戦士', baseAbilities: { 技: 9, 体: 12, 心: 5 } },
  { race: 'ルーンフォーク', birth: '魔動機師', baseAbilities: { 技: 12, 体: 8, 心: 6 } },
  { race: 'ルーンフォーク', birth: '魔術師', baseAbilities: { 技: 9, 体: 8, 心: 9 } },
  // ナイトメア
  { race: 'ナイトメア', birth: '魔術師', baseAbilities: { 技: 5, 体: 13, 心: 12 } },
  { race: 'ナイトメア', birth: '傭兵', baseAbilities: { 技: 7, 体: 15, 心: 8 } },
  { race: 'ナイトメア', birth: '軽戦士', baseAbilities: { 技: 11, 体: 13, 心: 6 } },
  { race: 'ナイトメア', birth: '神官', baseAbilities: { 技: 6, 体: 14, 心: 10 } },
  { race: 'ナイトメア', birth: '魔動機師', baseAbilities: { 技: 9, 体: 9, 心: 12 } },
  // リカント
  { race: 'リカント', birth: '密偵', baseAbilities: { 技: 13, 体: 5, 心: 7 } },
  { race: 'リカント', birth: '戦士', baseAbilities: { 技: 10, 体: 9, 心: 6 } },
  { race: 'リカント', birth: '拳闘士', baseAbilities: { 技: 11, 体: 7, 心: 7 } },
  { race: 'リカント', birth: '軽戦士', baseAbilities: { 技: 12, 体: 6, 心: 7 } },
  { race: 'リカント', birth: '野伏', baseAbilities: { 技: 9, 体: 8, 心: 8 } },
  // リルドラケン
  { race: 'リルドラケン', birth: '野伏', baseAbilities: { 技: 6, 体: 12, 心: 7 } },
  { race: 'リルドラケン', birth: '拳闘士', baseAbilities: { 技: 6, 体: 13, 心: 6 } },
  { race: 'リルドラケン', birth: '戦士', baseAbilities: { 技: 5, 体: 14, 心: 6 } },
  { race: 'リルドラケン', birth: '商人', baseAbilities: { 技: 5, 体: 11, 心: 9 } },
  { race: 'リルドラケン', birth: '神官', baseAbilities: { 技: 4, 体: 13, 心: 8 } },
  // グラスランナー
  { race: 'グラスランナー', birth: '盗人', baseAbilities: { 技: 13, 体: 0, 心: 12 } },
  { race: 'グラスランナー', birth: '軽戦士', baseAbilities: { 技: 14, 体: 1, 心: 10 } },
  { race: 'グラスランナー', birth: '野伏', baseAbilities: { 技: 12, 体: 1, 心: 12 } },
  { race: 'グラスランナー', birth: '射手', baseAbilities: { 技: 14, 体: 0, 心: 11 } },
  { race: 'グラスランナー', birth: '趣味人', baseAbilities: { 技: 12, 体: 0, 心: 13 } },
  // メリア
  { race: 'メリア', birth: '野伏', baseAbilities: { 技: 9, 体: 8, 心: 12 } },
  { race: 'メリア', birth: '神官', baseAbilities: { 技: 8, 体: 8, 心: 13 } },
  { race: 'メリア', birth: '妖精使い', baseAbilities: { 技: 8, 体: 7, 心: 14 } },
  { race: 'メリア', birth: '魔術師', baseAbilities: { 技: 8, 体: 6, 心: 15 } },
  { race: 'メリア', birth: '操霊術師', baseAbilities: { 技: 7, 体: 6, 心: 16 } },
  // ティエンス
  { race: 'ティエンス', birth: '騎手', baseAbilities: { 技: 10, 体: 11, 心: 7 } },
  { race: 'ティエンス', birth: '拳闘士', baseAbilities: { 技: 9, 体: 13, 心: 6 } },
  { race: 'ティエンス', birth: '戦士', baseAbilities: { 技: 8, 体: 12, 心: 8 } },
  { race: 'ティエンス', birth: '神官', baseAbilities: { 技: 7, 体: 12, 心: 9 } },
  { race: 'ティエンス', birth: '魔法使い', baseAbilities: { 技: 6, 体: 12, 心: 10 } },
  // レプラカーン
  { race: 'レプラカーン', birth: '軽戦士', baseAbilities: { 技: 13, 体: 5, 心: 5 } },
  { race: 'レプラカーン', birth: '射手', baseAbilities: { 技: 12, 体: 6, 心: 5 } },
  { race: 'レプラカーン', birth: '密偵', baseAbilities: { 技: 14, 体: 4, 心: 5 } },
  { race: 'レプラカーン', birth: '妖精使い', baseAbilities: { 技: 11, 体: 4, 心: 8 } },
  { race: 'レプラカーン', birth: '錬金術師', baseAbilities: { 技: 11, 体: 5, 心: 7 } },
];

/**
 * 種族と生まれから基本能力値を取得
 */
export function getBaseAbilitiesByRaceBirth(race: Sw25Race, birth: Sw25Birth): Sw25Abilities | null {
  const mapping = RACE_BIRTH_MAPPING.find(m => m.race === race && m.birth === birth);
  return mapping ? mapping.baseAbilities : null;
}

/**
 * 種族から利用可能な生まれのリストを取得（対応表に基づく）
 */
export function getAvailableBirthsByRaceFromMapping(race: Sw25Race): Sw25Birth[] {
  const births = RACE_BIRTH_MAPPING.filter(m => m.race === race).map(m => m.birth);
  // 重複を除去
  return [...new Set(births)];
}

// ============================================================================
// 種族データ
// ============================================================================

export interface Sw25RaceData {
  name: Sw25Race;
  availableBirths: Sw25Birth[];
  traits: string[]; // 種族特性
  description?: string; // 説明
}

export const SW25_RACES: Sw25RaceData[] = [
  {
    name: '人間',
    availableBirths: ['魔動機師', '魔術師', '軽戦士', '一般人', '傭兵', '神官', '操霊術師', 'その他'],
    traits: ['汎用性が高い'],
    description: '最も一般的な種族。バランスが取れている。',
  },
  {
    name: 'エルフ',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術師', 'その他'],
    traits: ['魔法適性が高い', '長命'],
    description: '魔法に適した種族。知性と技術に優れる。',
  },
  {
    name: 'ドワーフ',
    availableBirths: ['魔動機師', '軽戦士', '一般人', '傭兵', 'その他'],
    traits: ['頑健', '技術に長ける'],
    description: '頑丈な体を持つ種族。物理的な力に優れる。',
  },
  {
    name: 'タビット',
    availableBirths: ['軽戦士', '一般人', '傭兵', 'その他'],
    traits: ['機敏', '小柄'],
    description: '機敏で小柄な種族。技術に優れる。',
  },
  {
    name: 'ルーンフォーク',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術師', 'その他'],
    traits: ['魔法適性が高い', '知性に優れる'],
    description: '魔法に適した種族。知性に優れる。',
  },
  {
    name: 'ナイトメア',
    availableBirths: ['魔術師', '軽戦士', '一般人', '傭兵', 'その他'],
    traits: ['暗黒適性', '頑健'],
    description: '暗黒の力を持つ種族。',
  },
  {
    name: 'リカント',
    availableBirths: ['軽戦士', '一般人', '傭兵', 'その他'],
    traits: ['変身能力', '頑健'],
    description: '変身能力を持つ種族。',
  },
  {
    name: 'リルドラケン',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術師', 'その他'],
    traits: ['魔法適性が高い', '飛行能力'],
    description: '飛行能力を持つ種族。魔法に適している。',
  },
  {
    name: 'グラスランナー',
    availableBirths: ['軽戦士', '一般人', '傭兵', 'その他'],
    traits: ['機敏', '頑健'],
    description: '機敏で頑健な種族。',
  },
  {
    name: 'メリア',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術師', 'その他'],
    traits: ['魔法適性が高い', '知性に優れる'],
    description: '魔法に適した種族。知性に優れる。',
  },
  {
    name: 'ティエンス',
    availableBirths: ['魔動機師', '魔術師', '軽戦士', '一般人', '傭兵', '神官', '操霊術師', 'その他'],
    traits: ['汎用性が高い', '適応力が高い'],
    description: '適応力が高い種族。',
  },
  {
    name: 'レプラカーン',
    availableBirths: ['魔術師', '軽戦士', '一般人', '神官', '操霊術師', 'その他'],
    traits: ['魔法適性が高い', '機敏'],
    description: '魔法に適した種族。機敏で知性に優れる。',
  },
  {
    name: 'その他',
    availableBirths: ['魔動機師', '魔術師', '軽戦士', '一般人', '傭兵', '神官', '操霊術師', 'その他'],
    traits: [],
    description: 'その他の種族。',
  },
];

// ============================================================================
// 種族ごとの能力値初期値ダイスロール定義
// ============================================================================

export interface RaceAttributeDice {
  race: Sw25Race;
  diceFormula: {
    器用度: string;
    敏捷度: string;
    筋力: string;
    生命力: string;
    知力: string;
    精神力: string;
  };
}

export const RACE_ATTRIBUTE_DICE: RaceAttributeDice[] = [
  { race: '人間', diceFormula: { 器用度: '2d', 敏捷度: '2d', 筋力: '2d', 生命力: '2d', 知力: '2d', 精神力: '2d' } },
  { race: 'エルフ', diceFormula: { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '2d', 知力: '2d', 精神力: '2d' } },
  { race: 'ドワーフ', diceFormula: { 器用度: '2d+6', 敏捷度: '1d', 筋力: '2d', 生命力: '2d', 知力: '1d', 精神力: '2d+6' } },
  { race: 'タビット', diceFormula: { 器用度: '1d', 敏捷度: '1d', 筋力: '1d', 生命力: '2d', 知力: '2d+6', 精神力: '2d' } },
  { race: 'ルーンフォーク', diceFormula: { 器用度: '2d', 敏捷度: '1d', 筋力: '2d', 生命力: '2d', 知力: '2d', 精神力: '1d' } },
  { race: 'ナイトメア', diceFormula: { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '1d', 知力: '2d', 精神力: '2d' } },
  { race: 'リカント', diceFormula: { 器用度: '1d', 敏捷度: '1d+3', 筋力: '2d', 生命力: '2d', 知力: '1d+6', 精神力: '1d' } },
  { race: 'リルドラケン', diceFormula: { 器用度: '1d', 敏捷度: '2d', 筋力: '2d', 生命力: '2d+6', 知力: '1d', 精神力: '2d' } },
  { race: 'グラスランナー', diceFormula: { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '2d+6', 知力: '1d', 精神力: '2d+6' } },
  { race: 'メリア', diceFormula: { 器用度: '1d', 敏捷度: '1d', 筋力: '1d', 生命力: '2d+6', 知力: '1d', 精神力: '1d' } },
  { race: 'ティエンス', diceFormula: { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '1d+3', 知力: '2d', 精神力: '2d+3' } },
  { race: 'レプラカーン', diceFormula: { 器用度: '2d', 敏捷度: '1d', 筋力: '2d', 生命力: '2d', 知力: '2d', 精神力: '2d' } },
];

/**
 * 種族から能力値初期値のダイスロール定義を取得
 */
export function getAttributeDiceByRace(race: Sw25Race): RaceAttributeDice | undefined {
  return RACE_ATTRIBUTE_DICE.find(r => r.race === race);
}

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
    description: '武器を振るって戦う技能。',
  },
  {
    name: 'グラップラー',
    category: '戦士系',
    description: '格闘武器で戦う技能。',
  },
  {
    name: 'フェンサー',
    category: '戦士系',
    description: '軽い武器と防具で戦う技能。',
  },
  {
    name: 'シューター',
    category: '戦士系',
    description: '遠隔攻撃を行える技能。',
  },
  // 魔法系
  {
    name: 'ソーサラー',
    category: '魔法系',
    description: '真語魔法を扱う技能。',
  },
  {
    name: 'コンジャラー',
    category: '魔法系',
    description: '操霊魔法を扱う技能。',
  },
  {
    name: 'プリースト',
    category: '魔法系',
    description: '神聖魔法を扱う技能。',
  },
  {
    name: 'フェアリーテイマー',
    category: '魔法系',
    description: '妖精魔法を扱う技能。',
  },
  {
    name: 'マギテック',
    category: '魔法系',
    description: '魔導機術を扱う技能。',
  },
  // その他
  {
    name: 'スカウト',
    category: 'その他',
    description: '偵察や調査に役立つ技能。',
  },
  {
    name: 'レンジャー',
    category: 'その他',
    description: '自然環境で偵察や調査に役立つ技能。',
  },
  {
    name: 'セージ',
    category: 'その他',
    description: '知識全般で役立つ技能。',
  },
  {
    name: 'エンハンサー',
    category: 'その他',
    description: 'マナを用いて肉体を強化する技能。',
  },
  {
    name: 'バード',
    category: 'その他',
    description: '呪歌を扱う技能。',
  },
  {
    name: 'ライダー',
    category: 'その他',
    description: '騎乗に特化した技能。',
  },
  {
    name: 'アルケミスト',
    category: 'その他',
    description: '賦術を扱う技能。',
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
  other?: string; // その他
}

export const SW25_SKILLS: Sw25SkillData[] = [
  {
    "name": "ガーディアンⅠ",
    "category": "選択",
    "requirements": "冒険者レベル5以上、〈かばう〉習得済み",
    "effect": "",
    "other": ""
},
{
    "name": "かいくぐり",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "回避行動Ⅰ",
    "category": "選択",
    "requirements": "冒険者レベル3以上",
    "effect": "",
    "other": ""
},
{
    "name": "頑強",
    "category": "選択",
    "requirements": "ファイター or グラップラー or フェンサー の技能Lv5以上",
    "effect": "",
    "other": ""
},
{
    "name": "ターゲッティング",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "鷹の目",
    "category": "選択",
    "requirements": "〈ターゲッティング〉習得済み",
    "effect": "",
    "other": ""
},
{
    "name": "投げ強化Ⅰ",
    "category": "選択",
    "requirements": "グラップラー技能レベル3以上",
    "effect": "",
    "other": ""
},
{
    "name": "二刀流",
    "category": "選択",
    "requirements": "冒険者レベル5以上",
    "effect": "",
    "other": ""
},
{
    "name": "武器習熟A/〇〇",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "武器習熟S/〇〇",
    "category": "選択",
    "requirements": "冒険者レベル5以上, 同カテゴリの武器習熟A/〇〇",
    "effect": "",
    "other": ""
},
{
    "name": "踏みつけ",
    "category": "選択",
    "requirements": "グラップラー技能レベル5以上",
    "effect": "",
    "other": ""
},
{
    "name": "変幻自在Ⅰ",
    "category": "選択",
    "requirements": "グラップラー or フェンサー の技能レベル5以上",
    "effect": "",
    "other": ""
},
{
    "name": "防具習熟A/〇〇",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "防具習熟S/〇〇",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "魔法拡大の達人〈魔法拡大すべて〉",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "両手利き",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "双撃",
    "category": "選択",
    "requirements": "《両手利き》",
    "effect": "",
    "other": ""
},
{
    "name": "MP軽減/〇〇",
    "category": "選択",
    "requirements": "冒険者レベル5以上",
    "effect": "",
    "other": ""
},
{
    "name": "インファイトⅠ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
{
    "name": "囮攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
{
    "name": "かばうⅠ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
{
    "name": "斬り返しⅠ",
    "category": "選択",
    "requirements": "ファイター技能 or フェンサー技能, 2H近接武器",
    "effect": "",
    "other": ""
},
{
    "name": "牽制攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "全力攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "挑発攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "ディフェンススタンス",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "薙ぎ払いⅠ",
    "category": "選択",
    "requirements": "ファイター技能レベル3以上, ファイター技能, 2H近接武器",
    "effect": "",
    "other": ""
},
  {
    "name": "バイオレンスキャストⅠ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "必殺攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法拡大/威力確実化",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法拡大/確実化",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法拡大/数",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法拡大/距離",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法拡大/時間",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法拡大/範囲",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法拡大/すべて",
    "category": "選択",
    "requirements": "任意の<魔法拡大/〇〇>",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法収束",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "魔法制御",
    "category": "選択",
    "requirements": "<ターゲッティング>、<魔法収束>",
    "effect": "",
    "other": ""
},
  {
    "name": "魔力撃",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
  {
    "name": "マルチアクション",
    "category": "選択",
    "requirements": "冒険者レベル5以上",
    "effect": "",
    "other": ""
},
  {
    "name": "鎧貫きⅠ",
    "category": "選択",
    "requirements": "",
    "effect": "",
    "other": ""
},
{
    "name": "狙撃",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
{
    "name": "ワードブレイク",
    "category": "選択",
    "requirements": "なし",
    "effect": "",
    "other": ""
},
  // 自動追加される戦闘特技
  {
    name: 'タフネス',
    category: '自動',
    requirements: 'ファイターLv7以上',
    effect: '',
    "other": ""
  },
  {
    name: 'バトルマスター',
    category: '自動',
    requirements: 'ファイターLv13以上 または グラップラーLv13以上',
    effect: '',
    "other": ""
  },
  {
    name: '追加攻撃',
    category: '自動',
    requirements: 'グラップラーLv1以上',
    effect: '',
    "other": ""
  },
  {
    name: 'カウンター',
    category: '自動',
    requirements: 'グラップラーLv7以上',
    effect: '',
    "other": ""
  },
  {
    name: 'トレジャーハント',
    category: '自動',
    requirements: 'スカウトLv5以上',
    effect: '',
    "other": ""
  },
  {
    name: 'ファストアクション',
    category: '自動',
    requirements: 'スカウトLv7以上',
    effect: '',
    "other": ""
  },
  {
    name: '影走り',
    category: '自動',
    requirements: 'スカウトLv9以上',
    effect: '',
    "other": ""
  },
  {
    name: 'トレジャーマスター',
    category: '自動',
    requirements: 'スカウトLv12以上',
    effect: '',
    "other": ""
  },
  {
    name: '匠の技',
    category: '自動',
    requirements: 'スカウトLv15以上',
    effect: '',
    "other": ""
  },
  {
    name: 'サバイバビリティ',
    category: '自動',
    requirements: 'レンジャーLv5以上',
    effect: '',
    "other": ""
  },
  {
    name: '不屈',
    category: '自動',
    requirements: 'レンジャーLv7以上',
    effect: '',
    "other": ""
  },
  {
    name: 'ポーションマスター',
    category: '自動',
    requirements: 'レンジャーLv9以上',
    effect: '',
    "other": ""
  },
  {
    name: '縮地',
    category: '自動',
    requirements: 'レンジャーLv12以上',
    effect: '',
    "other": ""
  },
  {
    name: 'ランアンドガン',
    category: '自動',
    requirements: 'レンジャーLv15以上',
    effect: '',
    "other": ""
  },
  {
    name: '鋭い目',
    category: '自動',
    requirements: 'セージLv5以上',
    effect: '',
    "other": ""
  },
  {
    name: '弱点看破',
    category: '自動',
    requirements: 'セージLv7以上',
    effect: '',
    "other": ""
  },
  {
    name: 'マナセーブ',
    category: '自動',
    requirements: 'セージLv9以上',
    effect: '',
    "other": ""
  },
  {
    name: 'マナ耐性',
    category: '自動',
    requirements: 'セージLv12以上',
    effect: '',
    "other": ""
  },
  {
    name: '賢人の知恵',
    category: '自動',
    requirements: 'セージLv15以上',
    effect: '',
    "other": ""
  },
  {
    name: 'ルーンマスター',
    category: '自動',
    requirements: '魔法系技能Lv11以上',
    effect: '',
    "other": ""
  },
];

// ============================================================================
// 魔法・スキルデータ
// ============================================================================

export type MagicSystem = '真語魔法' | '操霊魔法' | '神聖魔法' | '妖精魔法' | '魔導機術' | '練技' | '呪歌' | '騎乗' | '賦術' ;

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
    system: '真語魔法',
    cost: 2,
    effect: '火の球を放つ。ダメージ2D6。',
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

// ============================================================================
// 言語データ
// ============================================================================

/**
 * 言語一覧
 */
export const SW25_LANGUAGES = [
  '交易共通語',
  '地方語',
  'エルフ語',
  'ドワーフ語',
  'グラスランナー語',
  'シャドウ語',
  'ミアキス語',
  'ソレイユ語',
  'リカント語',
  '神紀文明語',
  '魔動機文明語',
  '魔法文明語',
  '妖精語',
  '魔神語',
  'ドラゴン語',
  '汎用蛮族語',
  '巨人語',
  'ドレイク語',
  'バルカン語',
  'ライカンスロープ語',
  'バジリスク語',
  'リザードマン語',
  'ケンタウロス語',
  '妖魔語',
] as const;

/**
 * 種族ごとの自動取得言語
 */
export const RACE_LANGUAGES: Record<string, Array<{ name: string; speak: boolean; read: boolean }>> = {
  '人間': [{ name: '地方語', speak: true, read: true }],
  'エルフ': [{ name: 'エルフ語', speak: true, read: true }],
  'ドワーフ': [{ name: 'ドワーフ語', speak: true, read: true }],
  'タビット': [{ name: '神紀文明語', speak: false, read: true }],
  'ルーンフォーク': [{ name: '魔動機文明語', speak: true, read: true }],
  'リカント': [{ name: 'リカント語', speak: true, read: true }],
};

/**
 * 技能ごとの自動取得言語
 */
export const CLASS_LANGUAGES: Record<string, Array<{ name: string; speak: boolean; read: boolean }>> = {
  'ソーサラー': [{ name: '魔法文明語', speak: true, read: true }],
  'コンジャラー': [{ name: '魔法文明語', speak: true, read: true }],
  'マギテック': [{ name: '魔動機文明語', speak: true, read: true }],
};

/**
 * 種族と技能から自動取得する言語を取得
 */
export function getAutoLanguages(race: string, classes: Array<{ name: string; level: number }>) {
  const languages: Array<{ name: string; speak: boolean; read: boolean; auto: boolean }> = [];
  
  // 交易共通語は全員が話・読を取得
  languages.push({ name: '交易共通語', speak: true, read: true, auto: true });
  
  // 種族による自動取得
  const raceLangs = RACE_LANGUAGES[race] || [];
  raceLangs.forEach(lang => {
    languages.push({ ...lang, auto: true });
  });
  
  // 技能による自動取得
  classes.forEach(cls => {
    const classLangs = CLASS_LANGUAGES[cls.name] || [];
    classLangs.forEach(lang => {
      // 既に追加されていない場合のみ追加
      if (!languages.find(l => l.name === lang.name)) {
        languages.push({ ...lang, auto: true });
      }
    });
  });
  
  return languages;
}

/**
 * セージのレベルによる必要言語取得数を計算
 */
export function calculateRequiredLanguageCount(classes: Array<{ name: string; level: number }>) {
  const sageClass = classes.find(cls => cls.name === 'セージ');
  if (!sageClass) {
    return 0;
  }
  
  return sageClass.level;
}


