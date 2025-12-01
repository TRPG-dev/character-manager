// ソードワールド2.5用のユーティリティ関数
import type { Sw25SheetData, Sw25Abilities, Sw25Attributes, Sw25Class, Sw25Skill, Sw25Magic, Sw25Item, Sw25Weapon, Sw25Armor } from '../types/sw25';

/**
 * シートデータを正規化（不足しているフィールドを追加）
 */
export function normalizeSheetData(data: any): Sw25SheetData {
  // デフォルトの能力値
  const defaultAbilities: Sw25Abilities = {
    技: 0,
    体: 0,
    心: 0,
  };

  // デフォルトの能力値
  const defaultAttributes: Sw25Attributes = {
    器用度: 0,
    敏捷度: 0,
    筋力: 0,
    生命力: 0,
    知力: 0,
    精神力: 0,
    HP: 0,
    MP: 0,
    生命抵抗力: 0,
    精神抵抗力: 0,
  };

  // 既存データとマージ
  const abilities = { ...defaultAbilities, ...(data.abilities || {}) };
  const attributes = { ...defaultAttributes, ...(data.attributes || {}) };

  // 配列データの正規化
  const classes: Sw25Class[] = Array.isArray(data.classes)
    ? data.classes.map((c: any) => ({
        name: c.name || '',
        level: typeof c.level === 'number' ? c.level : 0,
      }))
    : [];

  const skills: Sw25Skill[] = Array.isArray(data.skills)
    ? data.skills.map((s: any) => ({
        name: s.name || '',
        effect: s.effect || '',
        memo: s.memo || '',
      }))
    : [];

  const magics: Sw25Magic[] = Array.isArray(data.magics)
    ? data.magics.map((m: any) => ({
        name: m.name || '',
        system: m.system || '',
        cost: typeof m.cost === 'number' ? m.cost : 0,
        effect: m.effect || '',
        memo: m.memo || '',
      }))
    : [];

  const weapons: Sw25Weapon[] = Array.isArray(data.weapons)
    ? data.weapons.map((w: any) => ({
        name: w.name || '',
        hit: typeof w.hit === 'number' ? w.hit : 0,
        damage: w.damage || '',
        memo: w.memo || '',
      }))
    : [];

  const armors: Sw25Armor[] = Array.isArray(data.armors)
    ? data.armors.map((a: any) => ({
        name: a.name || '',
        defense: typeof a.defense === 'number' ? a.defense : 0,
        memo: a.memo || '',
      }))
    : [];

  const items: Sw25Item[] = Array.isArray(data.items)
    ? data.items.map((i: any) => ({
        name: i.name || '',
        quantity: typeof i.quantity === 'number' ? i.quantity : 0,
        memo: i.memo || '',
      }))
    : [];

  return {
    playerName: data.playerName || '',
    characterName: data.characterName || '',
    age: data.age ?? undefined,
    gender: data.gender || '',
    abilities,
    attributes,
    race: data.race || undefined,
    birth: data.birth || undefined,
    classes,
    skills,
    magics,
    weapons,
    armors,
    items,
    background: data.background || '',
    memo: data.memo || '',
  };
}

