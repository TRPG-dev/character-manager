// シノビガミ用のユーティリティ関数
import type { ShinobigamiSheetData, ShinobigamiAttributes, ShinobigamiNingu } from '../types/shinobigami';

/**
 * シートデータを正規化（不足しているフィールドを追加）
 */
export function normalizeSheetData(data: any): ShinobigamiSheetData {
  const defaultAttributes: ShinobigamiAttributes = {
    体術: 0,
    忍術: 0,
    謀術: 0,
    戦術: 0,
    器術: 0,
    心術: 0,
  };

  const attributes = { ...defaultAttributes, ...(data.attributes || {}) };
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const ninpo = Array.isArray(data.ninpo) ? data.ninpo : [];
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

  return {
    playerName: data.playerName || '',
    characterName: data.characterName || '',
    age: data.age ?? undefined,
    gender: data.gender || '',
    attributes,
    hp: data.hp ?? 6,
    hencho,
    emotions,
    school: data.school || '',
    rank: data.rank || '',
    ryuugi: data.ryuugi || '',
    surfaceFace: data.surfaceFace || '',
    shinnen: data.shinnen || '',
    koseki: data.koseki ?? 0,
    skills,
    ninpo,
    okugi,
    ningu,
    background: data.background || '',
    memo: data.memo || '',
    sessionHistory,
  };
}


