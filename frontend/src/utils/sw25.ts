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

  // 能力値初期値と成長値の正規化
  const attributeInitials = data.attributeInitials || {
    器用度: 0, 敏捷度: 0, 筋力: 0, 生命力: 0, 知力: 0, 精神力: 0,
  };
  const attributeGrowth = data.attributeGrowth || {
    器用度: 0, 敏捷度: 0, 筋力: 0, 生命力: 0, 知力: 0, 精神力: 0,
  };

  // 装飾品の正規化
  const accessories = Array.isArray(data.accessories)
    ? data.accessories.map((a: any) => ({
        name: a.name || '',
        price: typeof a.price === 'number' ? a.price : undefined,
        effect: a.effect || '',
        referencePage: a.referencePage || '',
        memo: a.memo || '',
        slot: a.slot || undefined,
      }))
    : [];

  // 言語の正規化
  const languages = Array.isArray(data.languages)
    ? data.languages.map((l: any) => ({
        name: l.name || '',
        speak: typeof l.speak === 'boolean' ? l.speak : false,
        read: typeof l.read === 'boolean' ? l.read : false,
      }))
    : [];

  return {
    playerName: data.playerName || '',
    characterName: data.characterName || '',
    age: data.age ?? undefined,
    gender: data.gender || '',
    abilities,
    attributes,
    attributeInitials,
    attributeGrowth,
    race: data.race || undefined,
    birth: data.birth || undefined,
    classes,
    adventurerLevel: typeof data.adventurerLevel === 'number' ? data.adventurerLevel : undefined,
    initialExperiencePoints: typeof data.initialExperiencePoints === 'number' ? data.initialExperiencePoints : 3000,
    gainedExperiencePoints: typeof data.gainedExperiencePoints === 'number' ? data.gainedExperiencePoints : undefined,
    experiencePoints: typeof data.experiencePoints === 'number' ? data.experiencePoints : undefined,
    honorPoints: typeof data.honorPoints === 'number' ? data.honorPoints : undefined,
    skills,
    magics,
    weapons,
    armors,
    accessories,
    money: typeof data.money === 'number' ? data.money : undefined,
    items,
    languages,
    background: data.background || '',
    memo: data.memo || '',
  };
}

/**
 * ダイスロールを実行（例: "2d", "1d+3", "2d+6"）
 */
export function rollDice(formula: string): number {
  // フォーマット: "XdY+Z" または "XdY" または "Xd"
  const match = formula.match(/^(\d+)d(?:\+(\d+))?$/i);
  
  if (!match) {
    throw new Error(`Invalid dice formula: ${formula}`);
  }
  
  const numDice = parseInt(match[1]);
  const modifier = match[2] ? parseInt(match[2]) : 0;
  
  let total = modifier;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * 6) + 1; // 1d6を振る
  }
  
  return total;
}

/**
 * 種族に基づいて能力値初期値をダイスロールで決定
 */
export function rollAttributeInitialsByRace(race: string): {
  器用度: number;
  敏捷度: number;
  筋力: number;
  生命力: number;
  知力: number;
  精神力: number;
} {
  // デフォルトは人間と同じ（2d）
  const defaultFormula = { 
    器用度: '2d', 敏捷度: '2d', 筋力: '2d', 
    生命力: '2d', 知力: '2d', 精神力: '2d' 
  };
  
  const raceFormulas: Record<string, typeof defaultFormula> = {
    '人間': { 器用度: '2d', 敏捷度: '2d', 筋力: '2d', 生命力: '2d', 知力: '2d', 精神力: '2d' },
    'エルフ': { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '2d', 知力: '2d', 精神力: '2d' },
    'ドワーフ': { 器用度: '2d+6', 敏捷度: '1d', 筋力: '2d', 生命力: '2d', 知力: '1d', 精神力: '2d+6' },
    'タビット': { 器用度: '1d', 敏捷度: '1d', 筋力: '1d', 生命力: '2d', 知力: '2d+6', 精神力: '2d' },
    'ルーンフォーク': { 器用度: '2d', 敏捷度: '1d', 筋力: '2d', 生命力: '2d', 知力: '2d', 精神力: '1d' },
    'ナイトメア': { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '1d', 知力: '2d', 精神力: '2d' },
    'リカント': { 器用度: '1d', 敏捷度: '1d+3', 筋力: '2d', 生命力: '2d', 知力: '1d+6', 精神力: '1d' },
    'リルドラケン': { 器用度: '1d', 敏捷度: '2d', 筋力: '2d', 生命力: '2d+6', 知力: '1d', 精神力: '2d' },
    'グラスランナー': { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '2d+6', 知力: '1d', 精神力: '2d+6' },
    'メリア': { 器用度: '1d', 敏捷度: '1d', 筋力: '1d', 生命力: '2d+6', 知力: '1d', 精神力: '1d' },
    'ティエンス': { 器用度: '2d', 敏捷度: '2d', 筋力: '1d', 生命力: '1d+3', 知力: '2d', 精神力: '2d+3' },
    'レプラカーン': { 器用度: '2d', 敏捷度: '1d', 筋力: '2d', 生命力: '2d', 知力: '2d', 精神力: '2d' },
  };
  
  const formula = raceFormulas[race] || defaultFormula;
  
  return {
    器用度: rollDice(formula.器用度),
    敏捷度: rollDice(formula.敏捷度),
    筋力: rollDice(formula.筋力),
    生命力: rollDice(formula.生命力),
    知力: rollDice(formula.知力),
    精神力: rollDice(formula.精神力),
  };
}

