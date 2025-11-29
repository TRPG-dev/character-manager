// シノビガミ用の型定義

export interface ShinobigamiAttributes {
  体術: number;
  忍術: number;
  謀術: number;
  戦術: number;
  器術: number;
  心術: number;
}

export interface ShinobigamiSkill {
  name: string;
  value: number;
  domain: string; // 体術、忍術、謀術、戦術、器術、心術のいずれか
}

export interface ShinobigamiNinpo {
  name: string;
  type: string; // タイプ
  skill: string; // 指定特技
  range: string; // 間合い
  cost: string; // コスト
  page: string; // 参照ページ
}

export interface ShinobigamiSheetData {
  attributes: ShinobigamiAttributes;
  skills: ShinobigamiSkill[];
  school?: string; // 流派
  ninpo?: ShinobigamiNinpo[]; // 忍法
  secret_flag: boolean;
  background: string;
}

