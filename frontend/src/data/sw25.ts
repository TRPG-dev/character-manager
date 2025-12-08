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
    "effect": "〈かばう〉宣言時に、対象を任意に複数指定することができます。同時に〈かばう〉を行う回数を1〜3回で宣言できます。対象が適切な位置にある限り、近接攻撃・遠隔攻撃・それらに準じる攻撃が行われるたび、宣言回数まで〈かばう〉を行います。1ラウンド中、1人のキャラクターを複数回かばっても構いません。",
    "other": ""
},
{
    "name": "かいくぐり",
    "category": "選択",
    "requirements": "なし",
    "effect": "盾を装備している場合、この特技の習得者は1ラウンドの間に敵からの近接攻撃に対する回避力判定に成功した回数をメモし、次の自身の手番で行う最初の近接攻撃で命中力のC値が「−その回数」されます（C値は7以下にはなりません）。複数対象への攻撃でも、命中した中から任意に1体を選んでダメージ判定を行う際にのみこの効果が発動します。2回目以降の近接攻撃では効果はありません。回避力判定時に盾を装備している必要がありますが、攻撃時に盾を装備している必要はありません。",
    "other": ""
},
{
    "name": "回避行動Ⅰ",
    "category": "選択",
    "requirements": "冒険者レベル3以上",
    "effect": "習得者は常に回避力判定に＋1のボーナス修正を得ます。",
    "other": ""
},
{
    "name": "頑強",
    "category": "選択",
    "requirements": "ファイター or グラップラー or フェンサー の技能Lv5以上",
    "effect": "習得者の最大HPが +15 上昇します。",
    "other": ""
},
{
    "name": "ターゲッティング",
    "category": "選択",
    "requirements": "なし",
    "effect": "乱戦エリア内のキャラクターを対象として遠隔攻撃を行ったり、「形状：射撃」の魔法行使や効果の使用を行ったりしても誤射を起こしません。",
    "other": ""
},
{
    "name": "鷹の目",
    "category": "選択",
    "requirements": "〈ターゲッティング〉習得済み",
    "effect": "敵キャラクターや乱戦エリアによる遮蔽であっても、完全に視界を塞がれない程度の遮蔽であれば、その先を視認でき、それら越しに遠隔攻撃や魔法行使が行えます。",
    "other": ""
},
{
    "name": "投げ強化Ⅰ",
    "category": "選択",
    "requirements": "グラップラー技能レベル3以上",
    "effect": "習得者が〈投げ〉を行ったとき、その威力を +10 します。また、移動方法や足の数に制限されずに、部位数が2までのキャラクター全てに対して〈投げ〉を使用できます。2部位のキャラクターに対する攻撃では命中判定を1回だけ行います。攻撃を受けた対象は任意の部位を選んで回避判定を行い、失敗したら〈投げ〉られます。",
    "other": "どちらかの部位でも近接攻撃不可の状態なら〈投げ〉できません。転倒＋ダメージ処理。"
},
{
    "name": "二刀流",
    "category": "選択",
    "requirements": "冒険者レベル5以上",
    "effect": "〈両手利き〉により 1 回の主動作で、それぞれの腕に装備した武器で 1 回ずつ攻撃が可能になります。",
    "other": "ただし、命中力判定に −2 のペナルティ修正を受けます。どちらの腕から攻撃するかは任意。対象を変えず、1回目の結果を確認してから2回目を中止するか選べます。"
},
{
    "name": "武器習熟A/〇〇",
    "category": "選択",
    "requirements": "なし",
    "effect": "習得時に「〇〇」にソードやアックスなどの武器カテゴリを1つ選びます。対応カテゴリの武器で攻撃する場合、ダメージが +1 されます。また、対応カテゴリの Aランク武器を装備可能になります。",
    "other": "別枠を使えば別カテゴリの武器習熟も可能。例：武器習熟A/ソード"
},
{
    "name": "武器習熟S/〇〇",
    "category": "選択",
    "requirements": "冒険者レベル5以上, 同カテゴリの武器習熟A/〇〇",
    "effect": "対応カテゴリの武器で攻撃する場合、ダメージが +2（Aと合計で +3）されます。",
    "other": "その他の条件は武器習熟A/〇〇と同じ。"
},
{
    "name": "踏みつけ",
    "category": "選択",
    "requirements": "グラップラー技能レベル5以上",
    "effect": "習得者が〈投げ〉に成功したとき、その対象に追加で〈キック〉による攻撃を行うことができます。",
    "other": "〈投げ強化〉で複数部位を投げた場合でも、任意の1部位を選んでキック可能。キックへの追加攻撃（追加攻撃による追加）は不可。"
},
{
    "name": "変幻自在Ⅰ",
    "category": "選択",
    "requirements": "グラップラー or フェンサー の技能レベル5以上",
    "effect": "1ラウンドに 2 回の宣言特技の宣言が可能です。1回の攻撃に異なる特技を2つ宣言し、両方を適用することも、複数回攻撃可能な時にそれぞれ1回ずつ宣言することもできます。たとえ同じ特技を2回宣言しても構いません。",
    "other": "宣言特技にリスクを伴うものがある場合、複数宣言でも本来のリスク分すべて累積適用されます。"
},
{
    "name": "防具習熟A/〇〇",
    "category": "選択",
    "requirements": "なし",
    "effect": "習得時に「〇〇」に金属鎧や盾などの防具カテゴリを1つ選びます。対応カテゴリの防具を装備しているとき、防護点が +1 されます。また、対応カテゴリの Aランク防具を装備可能になります。",
    "other": "別枠を使えば別カテゴリの防具習熟も可能。例：防具習熟A/金属鎧"
},
{
    "name": "防具習熟S/〇〇",
    "category": "選択",
    "requirements": "なし",
    "effect": "対応カテゴリの防具を装備しているとき、防護点が +2（Aと合計で +3）されます。",
    "other": ""
},
{
    "name": "魔法拡大の達人〈魔法拡大すべて〉",
    "category": "選択",
    "requirements": "なし",
    "effect": "習得者は〈魔法拡大すべて〉を宣言し、〈魔法拡大/数〉と他の〈魔法拡大/〇〇〉を組み合わせた効果を得るとき、対象ごとにどれをどの拡大率で組み合わせるかを別々に定めることができます。また、そのときのMP消費は対象ごとの宣言に応じて決めた後に足し算されます。",
    "other": "例：1体には拡大を使わず、もう1体には〈魔法拡大/威力確実化〉と3倍の〈魔法拡大/距離〉を組み合わせて同時に行使することが可能。エネルギー・ボルト（消費MP5）の場合のMP消費は (5) + (5 * 2 * 3) = 35 になる。"
},
{
    "name": "両手利き",
    "category": "選択",
    "requirements": "なし",
    "effect": "必要筋力が20以下の用法1H武器をそれぞれの腕に1本ずつ装備し、1回の主動作でそれぞれ1回ずつ攻撃できます。",
    "other": "ただし、命中力判定に −2 のペナルティ修正を受けます。両腕で別技能を用いて攻撃してもよく、1回目と2回目で対象を変えることはできません。1回目の結果確認後、2回目攻撃を中止するか選べます。"
},
{
    "name": "双撃",
    "category": "選択",
    "requirements": "《両手利き》",
    "effect": "《両手利き》により2回の攻撃を行う場合、1回目の結果を確認してから、同じ対象にさらに攻撃するか、別の対象を選んで攻撃するかを選べるようになります。",
    "other": ""
},
{
    "name": "MP軽減/〇〇",
    "category": "選択",
    "requirements": "冒険者レベル5以上",
    "effect": "習得時に「〇〇」に「ソーサラー」「プリースト」などの魔法使い系技能を1つ選択します。対応した技能で魔法を行使する際、消費MPが−1されます（最低1）。《魔法拡大/〇〇》による拡大時は、この軽減を先に適用してから倍加して最終MP消費を計算します。",
    "other": "別枠を使用すれば、異なる技能のMP軽減も習得可能です。"
},
{
    "name": "インファイトⅠ",
    "category": "選択",
    "requirements": "グラップラー技能レベル5以上",
    "effect": "宣言時にキャラクター1体を指定します。対象以外に対して行動を行っている手番では宣言出来ません。対象にグラップラー技能を用いて攻撃を行う場合、命中力判定に+2のボーナスを得ます。また、あらゆる回避力判定に−2のペナルティを受けます。",
    "other": ""
},
{
    "name": "囮攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "近接攻撃を行う時に宣言し、その攻撃1回に有効です。命中力判定が−2されますが、命中時のダメージが+2されます。もし宣言を行った近接攻撃が回避された場合、その敵は10秒(1ラウンド)の間、回避力判定に−1のペナルティ修正を受けます（この効果は最大で−4まで累積）。対象が回避力判定に失敗した場合、累積ペナルティはすべて解除されます。",
    "other": ""
},
{
    "name": "かばうⅠ",
    "category": "選択",
    "requirements": "",
    "effect": "任意のキャラクター1体を指定して発動します（ただし同意しないキャラクターは指定できません）。指定キャラクターが回避力判定によって消滅となる効果の対象になった時、そのキャラクターの代わりに回避判定を行わずにダメージ判定を行います（攻撃の命中やダメージ適用に付随する効果も代わりに受けます）。この効果は対象が狙われた時に自動的に1ラウンドに1回だけ発動します。追加攻撃等による2回目以降の攻撃には効果は発揮されず、また宣言者と対象者が同時に対象となる場合は原則として発揮されません。",
    "other": ""
},
{
    "name": "斬り返しⅠ",
    "category": "選択",
    "requirements": "ファイター技能 or フェンサー技能, 2H近接武器",
    "effect": "「用法：2H」の武器で近接攻撃を行うときに宣言し、その攻撃1回に有効です。宣言した攻撃が回避された場合、直後にもう1回同じ武器で同じ対象に近接攻撃を行えます。",
    "other": ""
},
{
    "name": "牽制攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "近接攻撃または遠隔攻撃を行う時に宣言し、その攻撃1回に有効です。命中力判定に+1のボーナス修正を得ますが、ダメージ決定においてC値が+1されます。クリティカル値が13以上になってしまうと、クリティカルは決して発生しません。複数を同時に攻撃する場合、そのすべてに効果が適用されます。",
    "other": ""
},
{
    "name": "全力攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "近接攻撃を行うときに宣言し、その1回に有効です。攻撃が命中した場合、ダメージが+4されます。複数を攻撃する場合は、命中した中から任意の1体を選択してダメージを与えます（選択はダメージ決定前に行います）。",
    "other": "リスクとして、あらゆる回避力判定に−2のペナルティを受けます。"
},
{
    "name": "挑発攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "近接または遠隔攻撃を行う時に宣言し、その攻撃1回に有効です。命中した対象は、続く10秒(1ラウンド)の間、可能な限り挑発攻撃を使用したキャラクターを攻撃しなければなりません。",
    "other": "この攻撃はダメージが−2されます。対象が知力18以上のキャラクター、または「知能；高い」以上の魔物の場合には効果がありません。また、対象が攻撃できない状況やエリアが異なる場合にも効果はありません。たとえダメージが0になっても、挑発効果は発生します。"
},
{
    "name": "ディフェンススタンス",
    "category": "選択",
    "requirements": "",
    "effect": "その手番に何らかの行為判定を行う前に宣言します。手番開始時に「回避力判定／生命力判定／精神抵抗力判定」のいずれか1つを選び、次の手番開始までその判定に+4のボーナスを得られます。",
    "other": "ただし、選ばなかった他の行為判定（移動・攻撃など）には-4のペナルティ修正を受けます。移動の種別が「通常移動」または「制限移動」の場合のみ宣言可能で、「全力移動」を行ったり、宣言後に全力移動に切り替えたりすることはできません。"
},
{
    "name": "薙ぎ払いⅠ",
    "category": "選択",
    "requirements": "ファイター技能レベル3以上, ファイター技能, 2H近接武器",
    "effect": "近接攻撃を行う時に宣言し、その攻撃1回に有効です。カテゴリ〈格闘〉以外で「用法：2H」の近接武器での攻撃にのみ効果が発揮されます。近接攻撃可能な位置にあるキャラクター3体までを任意に選び、それらすべてに攻撃を行います。命中力判定は一括で1回のみ行います。複数に命中した場合、ダメージは個別に決定されますが、すべて−3の修正が入ります。",
    "other": ""
},
{
    "name": "バイオレンスキャストⅠ",
    "category": "選択",
    "requirements": "",
    "effect": "魔法を行使するときに宣言し、その1回のみ有効です。その魔法が対象にダメージのみを与える魔法である場合、魔法行使の達成値に+2のボーナスを得ます。",
    "other": ""
},
{
    "name": "必殺攻撃Ⅰ",
    "category": "選択",
    "requirements": "",
    "effect": "近接攻撃を行うときに宣言し、その1回のみ有効です。命中した場合、威力表使用時の2dの出目が3〜11の場合、それを+1します（1ゾロ、6ゾロはそのまま）。+1した数値がC値に達した場合、クリティカルとして扱います。",
    "other": "リスクとして、あらゆる回避力判定に−2のペナルティを受けます。複数を攻撃する場合、命中した中から任意の1体を選択してダメージを与えます（選択はダメージ決定前に行います）。"
},
{
    "name": "魔法拡大/威力確実化",
    "category": "選択",
    "requirements": "",
    "effect": "この特技を宣言した手番において、すべての魔法行使に対して、使用・無使用を選択できます。魔法の効果だけで威力表を使用する場合、2dの出目が4以下だったときに1度だけ振り直し、任意の結果を採用できます。",
    "other": ""
},
{
    "name": "魔法拡大/確実化",
    "category": "選択",
    "requirements": "",
    "effect": "この特技を宣言した手番において、すべての魔法行使に対して、使用・無使用を選択できます。使用する場合、本来の2倍のMPを消費し、魔法行使判定を2回行い、任意の結果を採用できます。",
    "other": ""
},
{
    "name": "魔法拡大/数",
    "category": "選択",
    "requirements": "",
    "effect": "この特技を宣言した手番において、すべての魔法行使に対して、使用・無使用を選択できます。使用した場合、魔法の対象数を増やせます。ただし「射程：術者」「射程：接触」の魔法には効果がありません。対象を増やすごとに消費MPが倍加し、行使判定は一括で行われます。",
    "other": ""
},
{
    "name": "魔法拡大/距離",
    "category": "選択",
    "requirements": "",
    "effect": "この特技を宣言した手番において、すべての魔法行使に対して、使用・無使用を選択できます。使用した場合、魔法の射程距離を伸ばせます（ただし「射程：術者」「射程：接触」の魔法は対象外）。射程を2倍、3倍…とするごとに消費MPも2倍、3倍と増加します。",
    "other": ""
},
{
    "name": "魔法拡大/時間",
    "category": "選択",
    "requirements": "",
    "effect": "この特技を宣言した手番において、すべての魔法行使に対して、使用・無使用を選択できます。使用した場合、魔法の効果時間を延長できます（「時間：一瞬」「時間：永続」の魔法は対象外）。時間を2倍、3倍…とするごとに消費MPも2倍、3倍と増加します。",
    "other": ""
},
{
    "name": "魔法拡大/範囲",
    "category": "選択",
    "requirements": "",
    "effect": "この特技を宣言した手番において、すべての魔法行使に対して、使用・無使用を選択できます。使用した場合、魔法の効果範囲（1エリア(半径xx)の空間／1エリア(半径xx)/すべて／1エリア(半径xx)/X のいずれか）で、かつ半径2〜5mの魔法の半径部分を拡大できます（最大で半径6mまで）。対象数増加の効果も得られ、半径+1mごとに最大対象数も+5されます。基本戦闘では最大対象数増加のみが適用されます。",
    "other": ""
},
{
    "name": "魔法拡大/すべて",
    "category": "選択",
    "requirements": "任意の<魔法拡大/〇〇>",
    "effect": "この特技を宣言した手番において、すべての魔法行使に対して、任意の<魔法拡大/〇〇>の効果を得るか選択できます。習得していない拡大も使用可能です。また、複数の拡大を組み合わせることも可能で、それぞれの拡大の係数を乗算して消費MPを計算します。",
    "other": ""
},
{
    "name": "魔法収束",
    "category": "選択",
    "requirements": "",
    "effect": "魔法を行使するときに宣言し、その1回のみ有効です。「対象:1エリア(半径xx/X)」の魔法を「対象:1体」として行使できます。",
    "other": ""
},
{
    "name": "魔法制御",
    "category": "選択",
    "requirements": "<ターゲッティング>、<魔法収束>",
    "effect": "魔法を行使するときに宣言し、その1回のみ有効です。「形状：貫通」または「対象：1エリア(半径xx/X)」の魔法において、範囲内にいる任意のキャラクターをあらかじめ対象から除外することができます。",
    "other": ""
},
{
    "name": "魔力撃",
    "category": "選択",
    "requirements": "",
    "effect": "近接攻撃を行うときに宣言し、その1回のみ有効です。攻撃が命中した場合、ダメージを「+攻撃者の任意の魔力」します。",
    "other": "リスクとして、あらゆる生命抵抗力判定・精神抵抗力判定に−2のペナルティを受けます。複数を同時に攻撃する場合、命中した中から任意の1体を選んでダメージを与えます（対象選択はダメージ決定前に行います）。"
},
{
    "name": "マルチアクション",
    "category": "選択",
    "requirements": "冒険者レベル5以上",
    "effect": "近接攻撃か魔法行使の主動作を行う時に宣言し、その1回に有効です。もし近接攻撃を行った場合、その直後に魔法を行使できます。もし魔法を行使した場合、その直後に近接攻撃を行えます。",
    "other": "キャラクターが1ラウンドに複数の特技宣言を行える能力を持っていても、この追加の魔法行使や近接攻撃にさらに<マルチアクション>を宣言することはできません。また、移動の種別は「制限移動」に限られます。"
},
{
    "name": "鎧貫きⅠ",
    "category": "選択",
    "requirements": "",
    "effect": "近接攻撃を行うときに宣言し、その1回のみ有効です。命中した場合、攻撃対象の防護点を半分（端数切り上げ）として扱いますが、ダメージ決定においてC値が+1されます。",
    "other": "クリティカル値が13以上になってしまうと、クリティカルは決して発生しません。複数を同時に攻撃する場合、命中した中から任意の1体を選んでダメージを与えます（対象選択はダメージ決定前に行います）。"
},
{
    "name": "狙撃",
    "category": "選択",
    "requirements": "なし",
    "effect": "使用時に、射撃攻撃が可能な対象を1体指定します。自身の次の主動作でその対象に対して射撃攻撃を行い、対象の回避力判定の達成値より「3以上」高い達成値で命中した場合、合算ダメージが2倍になります。特技の使用時および射撃実行時ともに、誤射を起こさず対象を攻撃できる状況でなければなりません。また、この特技の効果は、使用後に別の主動作を行った場合失われます（ラウンドを跨いでも問題なし）。複数対象を同時に攻撃できる能力・魔法・矢弾などの効果とは重複できません。それらを使う場合、この特技の効果は発生しません。",
    "other": ""
},
{
    "name": "ワードブレイク",
    "category": "選択",
    "requirements": "なし",
    "effect": "「射程：接触」「対象：魔法や効果1つ」で、持続的に発生している魔法や効果を選択し、解除します。解除できるのは、魔法や特殊な能力によって時間を区切られて10秒（1ラウンド）以上持続して与えられているものに限られます。「時間：永続」の効果、あるいは効果時間が一瞬で、その結果として発生する効果（例：投げによる転倒）、あるいは時間が区切られず連続して発生している効果（例：拘束状態で移動不能など）は、解除対象になりません。ただし、「時間：一瞬/○秒・分（△ラウンド）」の効果は解除可能です。解除には、習得者が魔法行使判定を行い、解除したい効果との達成値を比べ、使用者が上回れば成功となります。なお、もし解除対象の効果が自動成功によるものであった場合、解除側の達成値は +5 のボーナスを得ます。",
    "other": ""
},
  // 自動追加される戦闘特技
  {
    name: 'タフネス',
    category: '自動',
    requirements: 'ファイターLv7以上',
    effect: 'HPが+5される。',
    "other": ""
  },
  {
    name: 'バトルマスター',
    category: '自動',
    requirements: 'ファイターLv13以上 または グラップラーLv13以上',
    effect: '戦闘判定に+2される。',
    "other": ""
  },
  {
    name: '追加攻撃',
    category: '自動',
    requirements: 'グラップラーLv1以上',
    effect: '1ターンに2回攻撃できる。',
    "other": ""
  },
  {
    name: 'カウンター',
    category: '自動',
    requirements: 'グラップラーLv7以上',
    effect: '回避成功時に反撃できる。',
    "other": ""
  },
  {
    name: 'トレジャーハント',
    category: '自動',
    requirements: 'スカウトLv5以上',
    effect: '宝箱発見判定に+2される。',
    "other": ""
  },
  {
    name: 'ファストアクション',
    category: '自動',
    requirements: 'スカウトLv7以上',
    effect: '先制判定に+3される。',
    "other": ""
  },
  {
    name: '影走り',
    category: '自動',
    requirements: 'スカウトLv9以上',
    effect: '移動力が+3される。',
    "other": ""
  },
  {
    name: 'トレジャーマスター',
    category: '自動',
    requirements: 'スカウトLv12以上',
    effect: '宝箱発見判定に+5される。',
    "other": ""
  },
  {
    name: '匠の技',
    category: '自動',
    requirements: 'スカウトLv15以上',
    effect: '全ての判定に+1される。',
    "other": ""
  },
  {
    name: 'サバイバビリティ',
    category: '自動',
    requirements: 'レンジャーLv5以上',
    effect: '生存判定に+2される。',
    "other": ""
  },
  {
    name: '不屈',
    category: '自動',
    requirements: 'レンジャーLv7以上',
    effect: '状態異常への抵抗力が+2される。',
    "other": ""
  },
  {
    name: 'ポーションマスター',
    category: '自動',
    requirements: 'レンジャーLv9以上',
    effect: 'ポーションの効果が+1される。',
    "other": ""
  },
  {
    name: '縮地',
    category: '自動',
    requirements: 'レンジャーLv12以上',
    effect: '移動力が+5される。',
    "other": ""
  },
  {
    name: 'ランアンドガン',
    category: '自動',
    requirements: 'レンジャーLv15以上',
    effect: '移動後でも射撃攻撃が可能。',
    "other": ""
  },
  {
    name: '鋭い目',
    category: '自動',
    requirements: 'セージLv5以上',
    effect: '観察判定に+2される。',
    "other": ""
  },
  {
    name: '弱点看破',
    category: '自動',
    requirements: 'セージLv7以上',
    effect: '弱点攻撃のダメージが+2される。',
    "other": ""
  },
  {
    name: 'マナセーブ',
    category: '自動',
    requirements: 'セージLv9以上',
    effect: 'MP消費が-1される（最低1）。',
    "other": ""
  },
  {
    name: 'マナ耐性',
    category: '自動',
    requirements: 'セージLv12以上',
    effect: 'MPダメージへの抵抗力が+2される。',
    "other": ""
  },
  {
    name: '賢人の知恵',
    category: '自動',
    requirements: 'セージLv15以上',
    effect: '全ての知識判定に+2される。',
    "other": ""
  },
  {
    name: 'ルーンマスター',
    category: '自動',
    requirements: '魔法系技能Lv11以上',
    effect: '魔法の効果が+1される。',
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


