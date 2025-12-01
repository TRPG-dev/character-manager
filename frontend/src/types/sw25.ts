// ソードワールド2.5用の型定義

// 能力（技、体、心）
export interface Sw25Abilities {
  技: number;
  体: number;
  心: number;
}

// 能力値
export interface Sw25Attributes {
  器用度: number;
  敏捷度: number;
  筋力: number;
  生命力: number;
  知力: number;
  精神力: number;
  HP: number;
  MP: number;
  生命抵抗力: number;
  精神抵抗力: number;
}

// 種族
export type Sw25Race =
  | '人間'
  | 'エルフ'
  | 'ドワーフ'
  | 'タビット'
  | 'ルーンフォーク'
  | 'ナイトメア'
  | 'リカント'
  | 'リルドラケン'
  | 'グラスランナー'
  | 'メリア'
  | 'ティエンス'
  | 'レプラカーン'
  | 'その他';

// 生まれ
export type Sw25Birth =
  | '魔動機師'
  | '魔術師'
  | '軽戦士'
  | '一般人'
  | '傭兵'
  | '神官'
  | '操霊術士'
  | 'その他';

// 技能（クラス）
export interface Sw25Class {
  name: string; // ファイター、プリースト、セージ、レンジャーなど
  level: number; // レベル
}

// 戦闘特技
export interface Sw25Skill {
  name: string; // 戦闘特技名
  effect: string; // 効果
  memo?: string; // 備考
}

// 魔法・スキル
export interface Sw25Magic {
  name: string; // 魔法・スキル名
  system: string; // 系統（ファイアボール、ヒールなど）
  cost: number; // 消費MP
  effect: string; // 効果
  memo?: string; // 備考
}

// アイテム
export interface Sw25Item {
  name: string; // アイテム名
  quantity: number; // 数量
  memo?: string; // 備考
}

// 武器
export interface Sw25Weapon {
  name: string; // 武器名
  hit: number; // 命中力
  damage: string; // ダメージ
  memo?: string; // 備考
}

// 防具
export interface Sw25Armor {
  name: string; // 防具名
  defense: number; // 防護点
  memo?: string; // 備考
}

// シートデータ全体
export interface Sw25SheetData {
  // 基本情報
  playerName?: string; // プレイヤー名
  characterName?: string; // キャラクター名
  age?: number; // 年齢
  gender?: string; // 性別
  
  // 能力・能力値
  abilities: Sw25Abilities; // 能力（技、体、心）
  attributes: Sw25Attributes; // 能力値
  
  // 種族・生まれ
  race?: Sw25Race; // 種族
  birth?: Sw25Birth; // 生まれ
  
  // 技能
  classes: Sw25Class[]; // 技能（クラス）とレベル
  
  // 戦闘特技
  skills: Sw25Skill[]; // 戦闘特技
  
  // 魔法・スキル
  magics: Sw25Magic[]; // 魔法・スキル
  
  // 装備
  weapons: Sw25Weapon[]; // 武器
  armors: Sw25Armor[]; // 防具
  
  // アイテム
  items: Sw25Item[]; // アイテム
  
  // その他
  background: string; // 背景・経歴
  memo?: string; // メモ
}

