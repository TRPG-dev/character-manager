// シノビガミ特技データ
// 参考: https://w.atwiki.jp/sinobi/pages/73.html

export const SHINOBI_SCHOOLS = [
  { value: '斜歯忍軍', label: '斜歯忍軍', domain: '器術' },
  { value: '鞍馬神流', label: '鞍馬神流', domain: '体術' },
  { value: 'ハグレモノ', label: 'ハグレモノ', domain: '忍術' },
  { value: '比良坂機関', label: '比良坂機関', domain: '謀術' },
  { value: '私立御斎学園', label: '私立御斎学園', domain: '戦術' },
  { value: '隠忍の血統', label: '隠忍の血統', domain: '妖術' },
] as const;

export type SchoolType = typeof SHINOBI_SCHOOLS[number]['value'];

// 特技テーブルの構造
// 列の順序: [数字, 空, 器術, 空, 体術, 空, 忍術, 空, 謀術, 空, 戦術, 空, 妖術, 空, 数字]
export const SKILL_TABLE_COLUMNS = [
  { type: 'number', index: 0 },
  { type: 'empty', index: 1 },
  { type: 'skill', domain: '器術', index: 2 },
  { type: 'empty', index: 3 },
  { type: 'skill', domain: '体術', index: 4 },
  { type: 'empty', index: 5 },
  { type: 'skill', domain: '忍術', index: 6 },
  { type: 'empty', index: 7 },
  { type: 'skill', domain: '謀術', index: 8 },
  { type: 'empty', index: 9 },
  { type: 'skill', domain: '戦術', index: 10 },
  { type: 'empty', index: 11 },
  { type: 'skill', domain: '妖術', index: 12 },
  { type: 'empty', index: 13 },
  { type: 'number', index: 14 },
] as const;

// 特技テーブルのデータ（行ごと）
export const SKILL_TABLE_DATA: Record<number, Record<string, string>> = {
  2: { 器術: '絡繰術', 体術: '騎乗術', 忍術: '生存術', 謀術: '医術', 戦術: '兵糧術', 妖術: '異形化' },
  3: { 器術: '火術', 体術: '砲術', 忍術: '潜伏術', 謀術: '毒術', 戦術: '鳥獣術', 妖術: '召喚術' },
  4: { 器術: '水術', 体術: '手裏剣術', 忍術: '遁走術', 謀術: '罠術', 戦術: '野戦術', 妖術: '死霊術' },
  5: { 器術: '針術', 体術: '手練', 忍術: '盗聴術', 謀術: '調査術', 戦術: '地の利', 妖術: '結界術' },
  6: { 器術: '仕込み', 体術: '身体操術', 忍術: '腹話術', 謀術: '詐術', 戦術: '意気', 妖術: '封術' },
  7: { 器術: '衣装術', 体術: '歩法', 忍術: '隠形術', 謀術: '対人術', 戦術: '用兵術', 妖術: '言霊術' },
  8: { 器術: '縄術', 体術: '走法', 忍術: '変装術', 謀術: '遊芸', 戦術: '記憶術', 妖術: '幻術' },
  9: { 器術: '登術', 体術: '飛術', 忍術: '香術', 謀術: '九ノ一の術', 戦術: '見敵術', 妖術: '瞳術' },
  10: { 器術: '拷問術', 体術: '骨法術', 忍術: '分身の術', 謀術: '傀儡の術', 戦術: '暗号術', 妖術: '千里眼の術' },
  11: { 器術: '壊器術', 体術: '刀術', 忍術: '隠蔽術', 謀術: '流言の術', 戦術: '伝達術', 妖術: '憑依術' },
  12: { 器術: '掘削術', 体術: '怪力', 忍術: '第六感', 謀術: '経済力', 戦術: '人脈', 妖術: '呪術' },
};

// 特技の最大取得数
export const MAX_SKILLS = 6;

/**
 * 流派から特技属性を取得
 */
export function getDomainFromSchool(school: string): string {
  const schoolData = SHINOBI_SCHOOLS.find(s => s.value === school);
  return schoolData?.domain || '体術';
}

/**
 * 選択された属性の列インデックスを取得
 */
export function getSelectedDomainColumnIndex(domain: string): number {
  const column = SKILL_TABLE_COLUMNS.find(col => col.type === 'skill' && col.domain === domain);
  return column?.index ?? 4; // デフォルトは体術
}

/**
 * 選択された属性の両サイドの空列のインデックスを取得
 */
export function getEmptyColumnIndices(domain: string): [number, number] {
  const skillIndex = getSelectedDomainColumnIndex(domain);
  return [skillIndex - 1, skillIndex + 1];
}

// 流派と流儀の対応関係
export const SCHOOL_RYUUGI_MAP: Record<string, string> = {
  '斜歯忍軍': '他の流派の「奥義の内容」を集める',
  '鞍馬神流': 'シノビガミの復活を阻止する',
  'ハグレモノ': '誰にも縛られず、自分の意志で戦った',
  '比良坂機関': '日本の国益を守る',
  '私立御斎学園': '誰かの秘密を探す',
  '隠忍の血統': 'シノビガミ復活に関する情報を入手する',
};

/**
 * 流派から流儀を取得
 */
export function getRyuugiFromSchool(school: string): string {
  return SCHOOL_RYUUGI_MAP[school] || '';
}

// 上位流派と仇敵の対応関係
export const SCHOOL_ENEMY_MAP: Record<string, string> = {
  '斜歯忍軍': '鞍馬神流',
  '鞍馬神流': '隠忍の血統',
  '隠忍の血統': '比良坂機関',
  '比良坂機関': '私立御斎学園',
  '私立御斎学園': 'ハグレモノ',
  'ハグレモノ': '斜歯忍軍',
};

/**
 * 上位流派から仇敵を取得
 */
export function getEnemyFromUpperSchool(upperSchool: string): string {
  return SCHOOL_ENEMY_MAP[upperSchool] || '';
}

// 階級の選択肢
export const RANKS = [
  '草',
  '下忍',
  '下忍頭',
  '中忍',
  '中忍頭',
  '上忍',
  '上忍頭',
  '頭領',
] as const;

// 変調の選択肢
export const HENCHO_OPTIONS = [
  '故障',
  'マヒ',
  '重症',
  '行方不明',
  '忘却',
  '呪い',
] as const;

// 感情の選択肢
export const EMOTION_OPTIONS = [
  '共感',
  '不信',
  '友情',
  '怒り',
  '愛情',
  '妬み',
  '忠誠',
  '侮蔑',
  '憧憬',
  '劣等感',
  '狂信',
  '殺意',
] as const;

// 信念の選択肢
export const SHINNEN_OPTIONS = [
  '凶',
  '律',
  '我',
  '情',
  '忠',
  '和',
] as const;
