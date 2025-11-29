// シノビガミ用のユーティリティ関数
import type { ShinobigamiSheetData, ShinobigamiAttributes } from '../types/shinobigami';

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
  const school = data.school || '';
  const secretFlag = data.secret_flag ?? false;
  const background = data.background || '';

  return {
    attributes,
    skills,
    school,
    ninpo,
    secret_flag: secretFlag,
    background,
  };
}

