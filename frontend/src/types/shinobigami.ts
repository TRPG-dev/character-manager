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
  type: string; // タイプ（攻撃・サポート・装備）
  skill: string; // 指定特技
  range: string; // 間合い
  cost: string; // コスト
  effect?: string; // 効果
  page: string; // 参照ページ
}

export interface ShinobigamiOkugi {
  name: string; // 奥義名
  skill: string; // 指定特技
  effect: string; // 効果
  strength: string; // 強み
  weakness: string; // 弱み
  page?: string; // 参照ページ
  memo: string; // メモ
}

export interface ShinobigamiEmotion {
  pcName: string; // PC名
  emotion: string; // 感情（共感、不信、友情、怒り、愛情、妬み、忠誠、侮蔑、憧憬、劣等感、狂信、殺意）
}

export interface ShinobigamiNingu {
  heiryomaru: number; // 兵糧丸
  jintsumaru: number; // 神通丸
  tonkofu: number; // 遁甲符
}

export interface ShinobigamiSessionHistory {
  usedSkills?: string[]; // 使用した特技
  usedNinpo?: string[]; // 使用した忍法
  memo?: string; // セッションのメモ
}

export interface ShinobigamiBackground {
  name: string; // 名称
  type: "長所" | "短所"; // 種別
  koseki: string; // 功績点
  effect: string; // 効果
  page: string; // 参照ページ
}

export interface ShinobigamiSheetData {
  // 基本情報
  playerName?: string; // プレイヤー名
  characterName?: string; // キャラクター名（PC名）
  age?: number; // 年齢
  gender?: string; // 性別
  
  // 能力値
  attributes: ShinobigamiAttributes;
  hp?: number; // 生命点（最大値6点固定）
  hencho?: string[]; // 変調（故障、マヒ、重症、行方不明、忘却、呪い）
  emotions?: ShinobigamiEmotion[]; // 感情
  
  // 流派・特技
  school?: string; // 流派（後方互換性のため維持）
  upperSchool?: string; // 上位流派
  lowerSchool?: string; // 下位流派
  rank?: string; // 階級（草、下忍、下忍頭、中忍、中忍頭、上忍、上忍頭、頭領）
  ryuugi?: string; // 流儀
  surfaceFace?: string; // 表の顔（職業）
  shinnen?: string; // 信念（凶、律、我、情、忠、和）
  koseki?: number; // 功績点
  regulation?: string; // レギュレーション
  type?: "忍者" | "人間"; // タイプ
  enemy?: string; // 仇敵
  skills: ShinobigamiSkill[];
  
  // 忍法・奥義
  ninpo?: ShinobigamiNinpo[]; // 忍法
  okugi?: ShinobigamiOkugi[]; // 奥義
  
  // 忍具
  ningu?: ShinobigamiNingu;
  
  // その他
  background: string; // 背景（後方互換性のため維持、文字列）
  backgrounds?: ShinobigamiBackground[]; // 背景（新規、配列）
  memo?: string; // メモ
  sessionHistory?: ShinobigamiSessionHistory[]; // セッション履歴
}


