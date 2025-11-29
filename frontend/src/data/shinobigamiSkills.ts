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

// 特技テーブル（簡易版 - 実際のテーブルはより詳細）
// 各属性ごとの特技リスト
export const SHINOBI_SKILLS_BY_DOMAIN: Record<string, string[]> = {
  体術: [
    '白兵', '回避', '運搬', '運動', '近接武器', '騎乗', '水泳', '身体操術', '走', '投擲', '捕縛', '登攀', '跳躍',
  ],
  忍術: [
    '隠形', '生存', '潜伏', '手裏剣術', '手練', '変装', '変身', '歩法', '絡繰術', '火術', '砲術', '縄術', '遁走術',
  ],
  謀術: [
    '医術', '記憶術', '見敵術', '経済力', '言霊術', '交渉', '調査術', '呪術', '読心', '遊芸', '異形化', '憑依術', '兵糧術',
  ],
  戦術: [
    '異形化', '騎乗', '儀式術', '見敵術', '経済力', '言霊術', '交渉', '拷問術', '作戦', '戦場', '知恵', '地理', '毒術',
  ],
  器術: [
    '縄術', '火術', '砲術', '手裏剣術', '手練', '変装', '変身', '歩法', '絡繰術', '騎乗', '水泳', '身体操術', '走',
  ],
  心術: [
    '記憶術', '見敵術', '経済力', '言霊術', '交渉', '調査術', '呪術', '読心', '遊芸', '異形化', '憑依術', '兵糧術', '儀式術',
  ],
  妖術: [
    '異形化', '憑依術', '兵糧術', '儀式術', '見敵術', '経済力', '言霊術', '交渉', '調査術', '呪術', '読心', '遊芸', '記憶術',
  ],
};

// 全特技のリスト（重複を除く）
export const ALL_SHINOBI_SKILLS = Array.from(
  new Set(Object.values(SHINOBI_SKILLS_BY_DOMAIN).flat())
).sort();

/**
 * 流派から特技属性を取得
 */
export function getDomainFromSchool(school: string): string {
  const schoolData = SHINOBI_SCHOOLS.find(s => s.value === school);
  return schoolData?.domain || '体術';
}

/**
 * 属性から特技リストを取得
 */
export function getSkillsByDomain(domain: string): string[] {
  return SHINOBI_SKILLS_BY_DOMAIN[domain] || [];
}

