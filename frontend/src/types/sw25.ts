// ソードワールド2.5用の型定義

// 能力（技、体、心）
export interface Sw25Abilities {
  技: number;
  体: number;
  心: number;
}

// 能力値の初期値と成長値
export interface Sw25AttributeInitials {
  器用度: number;
  敏捷度: number;
  筋力: number;
  生命力: number;
  知力: number;
  精神力: number;
}

export interface Sw25AttributeGrowth {
  器用度: number;
  敏捷度: number;
  筋力: number;
  生命力: number;
  知力: number;
  精神力: number;
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
  // 派生値（追加）
  移動力?: number;
  全力移動?: number;
  技巧?: number[];
  運動?: number[];
  観察?: number[];
  知識?: number[];
  魔物知識?: number;
  先制力?: number;
  命中力?: number[];
  追加ダメージ?: number[];
  回避力?: number[];
  防護点?: number;
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
  | '操霊術師'
  | '剣士'
  | '薬師'
  | '戦士'
  | '拳闘士'
  | '学者'
  | '射手'
  | '密偵'
  | '野伏'
  | '商人'
  | '盗人'
  | '趣味人'
  | '妖精使い'
  | '騎手'
  | '魔法使い'
  | '錬金術師'
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
  price?: number; // 価格
  usage?: string; // 用法
  requiredStrength?: number; // 必筋
  hit: number; // 命中力
  power?: string; // 威力
  damage: string; // ダメージ
  criticalValue?: number; // C値
  additionalDamage?: number; // 追加ダメージ
  referencePage?: string; // 参照p
  memo?: string; // 備考
}

// 防具
export interface Sw25Armor {
  name: string; // 防具名
  price?: number; // 価格
  requiredStrength?: number; // 必筋
  dodge?: number; // 回避
  defense: number; // 防護点
  referencePage?: string; // 参照p
  memo?: string; // 備考
  type?: '鎧' | '盾'; // 装備タイプ
}

// 装飾品
export interface Sw25Accessory {
  name: string; // 装飾品名
  price?: number; // 価格
  effect?: string; // 効果
  referencePage?: string; // 参照p
  memo?: string; // 備考
  slot?: '頭' | '耳' | '顔' | '首' | '背中' | '右手' | '左手' | '腰' | '足' | '他'; // 装備スロット
}

// 言語
export interface Sw25Language {
  name: string; // 言語名
  speak: boolean; // 話
  read: boolean; // 読
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
  attributeInitials?: Sw25AttributeInitials; // 能力値初期値
  attributeGrowth?: Sw25AttributeGrowth; // 能力値成長値
  
  // 種族・生まれ
  race?: Sw25Race; // 種族
  birth?: Sw25Birth; // 生まれ
  
  // 技能
  classes: Sw25Class[]; // 技能（クラス）とレベル
  adventurerLevel?: number; // 冒険者レベル
  
  // 経験値
  initialExperiencePoints?: number; // 初期経験点
  gainedExperiencePoints?: number; // 獲得経験点
  experiencePoints?: number; // 経験点
  honorPoints?: number; // 名誉点
  
  // 戦闘特技
  skills: Sw25Skill[]; // 戦闘特技
  
  // 魔法・スキル
  magics: Sw25Magic[]; // 魔法・スキル
  
  // 装備
  weapons: Sw25Weapon[]; // 武器
  armors: Sw25Armor[]; // 防具
  accessories?: Sw25Accessory[]; // 装飾品
  money?: number; // 所持金
  
  // アイテム
  items: Sw25Item[]; // アイテム
  
  // 言語
  languages?: Sw25Language[]; // 言語
  
  // その他
  background: string; // 背景・経歴
  memo?: string; // メモ
}




