// シノビガミ用のユーティリティ関数
import type { ShinobigamiSheetData, ShinobigamiAttributes, ShinobigamiNingu, ShinobigamiNinpo } from '../types/shinobigami';

/**
 * シートデータを正規化（不足しているフィールドを追加）
 */
export function normalizeSheetData(data: any): ShinobigamiSheetData {
  const defaultAttributes: ShinobigamiAttributes = {
    器術: 0,
    体術: 0,
    忍術: 0,
    謀術: 0,
    戦術: 0,
    妖術: 0,
  };

  const attributes = { ...defaultAttributes, ...(data.attributes || {}) };
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const defaultNinpo: ShinobigamiNinpo[] = [
    {
      name: '接近戦攻撃',
      type: '攻撃',
      skill: '',
      range: '1',
      cost: '',
      effect: '',
      page: '基78',
    }
  ];
  const ninpo = Array.isArray(data.ninpo) && data.ninpo.length > 0 ? data.ninpo : defaultNinpo;
  const okugi = Array.isArray(data.okugi) ? data.okugi : [];
  const emotions = Array.isArray(data.emotions) ? data.emotions : [];
  const hencho = Array.isArray(data.hencho) ? data.hencho : [];
  const sessionHistory = Array.isArray(data.sessionHistory) ? data.sessionHistory : [];
  
  const defaultNingu: ShinobigamiNingu = {
    heiryomaru: 0,
    jintsumaru: 0,
    tonkofu: 0,
  };
  const ningu = data.ningu ? { ...defaultNingu, ...data.ningu } : defaultNingu;

  const upperSchool = data.upperSchool || data.school || '';
  const lowerSchool = data.lowerSchool || '';
  const backgrounds = Array.isArray(data.backgrounds) ? data.backgrounds : [];
  const skillDomain = data.skillDomain || undefined;
  const personas = Array.isArray(data.personas) ? data.personas : [];

  return {
    playerName: data.playerName || '',
    characterName: data.characterName || '',
    age: data.age ?? undefined,
    gender: data.gender || '',
    attributes,
    hp: data.hp ?? 6,
    hencho,
    emotions,
    school: data.school || upperSchool || '',
    upperSchool,
    lowerSchool,
    rank: data.rank || '',
    ryuugi: data.ryuugi || '',
    surfaceFace: data.surfaceFace || '',
    shinnen: data.shinnen || '',
    koseki: data.koseki ?? 0,
    regulation: data.regulation || '',
    type: data.type || undefined,
    enemy: data.enemy || '',
    skillDomain,
    skills,
    ninpo: ninpo.map((n: ShinobigamiNinpo) => ({ ...n, effect: n.effect || '', cost: n.cost || '' })),
    okugi: okugi.map((o: any) => ({ ...o, page: o.page || '' })),
    ningu,
    background: data.background || '',
    backgrounds,
    personas,
    memo: data.memo || '',
    sessionHistory,
  };
}


