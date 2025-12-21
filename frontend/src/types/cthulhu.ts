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
}

export interface CthulhuDerived {
  SAN_current: number;
  SAN_max: number;
  HP_current: number;
  HP_max: number;
  MP_current: number;
  MP_max: number;
  IDEA?: number; // INT×5
  KNOW?: number; // EDU×5
  LUCK?: number; // POW×5
  DB?: string; // ダメージボーナス
}

export interface CthulhuSkill {
  name: string;
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
  value: number;
  damage: string;
  range: string;
  attacks: number;
  ammo: number;
  malfunction: number;
  durability: number;
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
  school?: string; // 学校
  degree?: string; // 学位
  
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
}

