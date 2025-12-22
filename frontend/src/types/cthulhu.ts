// クトゥルフ神話TRPG用の型定義

export interface CthulhuAttributes {
  STR: number;
  CON: number;
  POW: number;
  DEX: number;
  APP: number;
  INT: number;
  EDU: number;
  SIZ: number;
  // 第7版のみ
  LUK?: number;
}

export interface CthulhuDerived {
  SAN_current: number;
  SAN_max: number;
  HP_current: number;
  HP_max: number;
  MP_current: number;
  MP_max: number;
  IDEA?: number; // 第6版: INT×5 / 第7版: INT×1
  KNOW?: number; // 第6版: EDU×5 / 第7版: EDU×1
  LUCK?: number; // 第6版: POW×5 / 第7版: LUK×1（修正可能）
  DB?: string; // ダメージボーナス
  // 第7版のみ
  BUILD?: number;
  MOV?: number;
}

export interface CthulhuSkill {
  name: string;
  specialty?: string; // 技能の補足（例: 芸術(絵画)、他の言語(英語)）
  baseValue: number; // 初期値
  jobPoints?: number; // 職業P
  interestPoints?: number; // 興味P
  growth?: number; // 成長
  other?: number; // その他
  total?: number; // 合計値（計算値）
  isCustom?: boolean; // 追加技能かどうか
}

export interface CthulhuWeapon {
  name: string;
  value: string;
  damage: string;
  range: string;
  attacks: string;
  ammo: number;
  malfunction: number;
  durability?: string; // 第6版（7版は欄を非表示）
}

export interface CthulhuItem {
  name: string;
  quantity: number;
  detail: string;
}

export interface CthulhuScenario {
  name: string;
  memo: string;
}

export interface CthulhuMythosItem {
  name: string;
  memo: string;
}

export interface CthulhuSheetData {
  // 基本情報
  playerName?: string; // プレイヤー名
  occupation?: string; // 職業
  age?: number; // 年齢
  gender?: string; // 性別
  birthplace?: string; // 出身地
  schoolDegree?: string; // 学校・学位（第6版）
  
  attributes: CthulhuAttributes;
  derived: CthulhuDerived;
  skills: CthulhuSkill[];
  combatSkills?: CthulhuSkill[]; // 格闘技能
  customSkills?: CthulhuSkill[]; // 追加技能
  weapons?: CthulhuWeapon[];
  items?: CthulhuItem[];
  
  // 財産
  cash?: string; // 現金・財産
  assets?: string; // 資産
  
  backstory: string;
  notes?: string;
  
  // その他
  scenarios?: CthulhuScenario[]; // 通過したシナリオ
  mythosBooks?: CthulhuMythosItem[]; // 魔導書
  spells?: CthulhuMythosItem[]; // 呪文
  artifacts?: CthulhuMythosItem[]; // アーティファクト
  encounteredEntities?: CthulhuMythosItem[]; // 遭遇した超自然の存在
}

