// クトゥルフ神話TRPG デフォルト技能リスト（50音順）
// 参考: https://w.atwiki.jp/cthulhu_dan/pages/16.html

import type { CthulhuSkill } from '../types/cthulhu';

const DEFAULT_CTHULHU_SKILLS_RAW: CthulhuSkill[] = [
  // NOTE: 第6版の要求に合わせた技能（50音順）
  { name: '言いくるめ', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '医学', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '運転', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: '応急手当', baseValue: 30, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 30, isCustom: false },
  { name: 'オカルト', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '化学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '鍵開け', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '隠す', baseValue: 15, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 15, isCustom: false },
  { name: '隠れる', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '機械修理', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: '聞き耳', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: 'クトゥルフ神話', baseValue: 0, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 0, isCustom: false },
  { name: '芸術', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '経理', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '考古学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: 'コンピューター', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '忍び歩き', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '写真術', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '重機械操作', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '乗馬', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '信用', baseValue: 15, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 15, isCustom: false },
  { name: '心理学', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '人類学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '水泳', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: '製作', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '精神分析', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '生物学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '説得', baseValue: 15, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 15, isCustom: false },
  { name: '操縦', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '地質学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '跳躍', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: '追跡', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '電気修理', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '電子工学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '天文学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '登攀', baseValue: 40, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 40, isCustom: false },
  { name: '図書館', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: 'ナビゲート', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '値切り', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '博物学', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '物理学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '変装', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '法律', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '他の言語', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '母国語', baseValue: 0, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 0, isCustom: false },
  { name: '目星', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: '薬学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '歴史', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
];


export const DEFAULT_CTHULHU_SKILLS: CthulhuSkill[] = DEFAULT_CTHULHU_SKILLS_RAW;

/**
 * 第7版: デフォルト技能リスト（第6版リストをベースに差分を反映）
 * - 削除/追加/初期値変更は issue #52 の仕様に準拠
 * - specialty が必要な技能は name + specialty で識別する想定
 */
const DEFAULT_CTHULHU7_SKILLS_RAW: CthulhuSkill[] = [
  // 既存（第6版）から保持するもの（※第7版で削除されるものは除外）
  { name: '言いくるめ', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '医学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '運転', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: '応急手当', baseValue: 30, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 30, isCustom: false },
  { name: 'オカルト', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '鍵開け', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '機械修理', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '聞き耳', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: 'クトゥルフ神話', baseValue: 0, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 0, isCustom: false },
  { name: '経理', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '考古学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: 'コンピューター', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '写真術', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '重機械操作', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '乗馬', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '信用', baseValue: 0, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 0, isCustom: false },
  { name: '心理学', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '人類学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '水泳', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: '精神分析', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '生物学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '説得', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '操縦', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '地質学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '跳躍', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: '追跡', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '電気修理', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '電子工学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '天文学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '登攀', baseValue: 40, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 40, isCustom: false },
  { name: '図書館', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: 'ナビゲート', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '変装', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '法律', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '他の言語', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  // 母国語: 初期値は EDU*1（動的計算するため baseValue は 0 で保持）
  { name: '母国語', baseValue: 0, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 0, isCustom: false },
  { name: '目星', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: '歴史', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },

  // 第7版 追加技能
  { name: '威圧', baseValue: 15, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 15, isCustom: false },
  { name: '隠密', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: '科学', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  // 科学(数学) は別行として初期値10で追加（specialtyで識別）
  { name: '科学', specialty: '数学', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '鑑定', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: '芸術/製作', baseValue: 5, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 5, isCustom: false },
  { name: 'サバイバル', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '自然', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '手さばき', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '魅惑', baseValue: 15, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 15, isCustom: false },
];

export const DEFAULT_CTHULHU7_SKILLS: CthulhuSkill[] = DEFAULT_CTHULHU7_SKILLS_RAW;

// 格闘技能リスト（50音順）
const COMBAT_SKILLS_RAW: CthulhuSkill[] = [
  { name: '回避', baseValue: 0, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 0, isCustom: false },
  { name: 'キック', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: 'こぶし/パンチ', baseValue: 50, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 50, isCustom: false },
  { name: '組み付き', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: '頭突き', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: '投擲', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: 'マーシャルアーツ', baseValue: 1, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 1, isCustom: false },
  { name: '拳銃', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: 'サブマシンガン', baseValue: 15, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 15, isCustom: false },
  { name: 'ショットガン', baseValue: 30, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 30, isCustom: false },
  { name: 'マシンガン', baseValue: 10, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 10, isCustom: false },
  { name: 'ライフル', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
];

export const COMBAT_SKILLS: CthulhuSkill[] = COMBAT_SKILLS_RAW
  // NOTE: 表示順はこの配列の記述順に従う（ソートしない）
  .slice();

/**
 * 第7版: 格闘技能リスト
 * - 近接戦闘/射撃は選択型（specialty選択で初期値が変わる）
 */
export const CTHULHU7_MELEE_OPTIONS: Array<{ value: string; baseValue: number }> = [
  { value: '斧', baseValue: 15 },
  { value: '格闘', baseValue: 25 },
  { value: '絞殺ひも', baseValue: 15 },
  { value: 'チェーンソー', baseValue: 10 },
  { value: '刀剣', baseValue: 20 },
  { value: 'フレイル', baseValue: 10 },
  { value: 'むち', baseValue: 5 },
  { value: '槍', baseValue: 20 },
];

export const CTHULHU7_RANGED_OPTIONS: Array<{ value: string; baseValue: number }> = [
  { value: '火炎放射器', baseValue: 10 },
  { value: '拳銃', baseValue: 20 },
  { value: 'サブマシンガン', baseValue: 15 },
  { value: '重火器', baseValue: 10 },
  { value: 'マシンガン', baseValue: 10 },
  { value: '弓', baseValue: 15 },
  { value: 'ライフル/ショットガン', baseValue: 25 },
];

export const COMBAT_SKILLS_CTHULHU7: CthulhuSkill[] = [
  { name: '回避', baseValue: 0, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 0, isCustom: false },
  { name: '投擲', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
  { name: '近接戦闘', specialty: '格闘', baseValue: 25, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 25, isCustom: false },
  { name: '射撃', specialty: '拳銃', baseValue: 20, jobPoints: 0, interestPoints: 0, growth: 0, other: 0, total: 20, isCustom: false },
];

/**
 * 技能の合計値を計算
 */
export function calculateSkillTotal(skill: CthulhuSkill): number {
  return (skill.baseValue || 0) +
         (skill.jobPoints || 0) +
         (skill.interestPoints || 0) +
         (skill.growth || 0) +
         (skill.other || 0);
}

/**
 * 職業Pの合計を計算
 */
export function calculateTotalJobPoints(skills: CthulhuSkill[]): number {
  return skills.reduce((sum, skill) => sum + (skill.jobPoints || 0), 0);
}

/**
 * 興味Pの合計を計算
 */
export function calculateTotalInterestPoints(skills: CthulhuSkill[]): number {
  return skills.reduce((sum, skill) => sum + (skill.interestPoints || 0), 0);
}

