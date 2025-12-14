// ソードワールド2.5用のユーティリティ関数
import type { Sw25SheetData, Sw25Abilities, Sw25Attributes, Sw25Class, Sw25Skill, Sw25Magic, Sw25Item, Sw25Weapon, Sw25Armor } from '../types/sw25';
import { getClassByName, getAutoLanguages, SW25_SKILLS } from '../data/sw25';

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

// ============================================================================
// 計算関数
// ============================================================================

/**
 * 能力値ボーナスの計算（能力値/6を切り下げ）
 */
export function calculateAttributeBonus(value: number): number {
  return Math.floor(value / 6);
}

/**
 * 冒険者レベルの計算（各技能の技能レベルの最大値）
 */
export function calculateAdventurerLevel(classes: Sw25Class[]): number {
  if (classes.length === 0) return 0;
  return Math.max(...classes.map(cls => cls.level));
}

/**
 * 修得可能な戦闘特技数の計算（冒険者レベルが奇数の場合に1つずつ増える）
 * レベル1で1つ、レベル3で2つ、レベル5で3つ、...
 */
export function calculateMaxSkills(adventurerLevel: number): number {
  if (adventurerLevel <= 0) return 0;
  return Math.floor((adventurerLevel + 1) / 2);
}

/**
 * 能力値の自動計算
 * HP、MP、抵抗力、移動力、各種技能判定値などを計算する
 * @param data キャラクターシートデータ
 * @returns 計算された能力値
 */
export function calculateAttributes(data: Sw25SheetData): Sw25Attributes {
  const { abilities, attributes, attributeInitials, attributeGrowth } = data;
  
  // 基本能力値（技、体、心）
  const baseAbilities = {
    技: abilities.技,
    体: abilities.体,
    心: abilities.心,
  };

  // 初期値と成長値の取得（デフォルトは0）
  const initials = attributeInitials || {
    器用度: 0, 敏捷度: 0, 筋力: 0, 生命力: 0, 知力: 0, 精神力: 0,
  };
  const growth = attributeGrowth || {
    器用度: 0, 敏捷度: 0, 筋力: 0, 生命力: 0, 知力: 0, 精神力: 0,
  };

  // 能力値の計算（技、体、心 + 初期値 + 成長値）
  const calculatedAttributes: Sw25Attributes = {
    ...attributes,
    器用度: baseAbilities.技 + initials.器用度 + growth.器用度,
    敏捷度: baseAbilities.技 + initials.敏捷度 + growth.敏捷度,
    筋力: baseAbilities.体 + initials.筋力 + growth.筋力,
    生命力: baseAbilities.体 + initials.生命力 + growth.生命力,
    知力: baseAbilities.心 + initials.知力 + growth.知力,
    精神力: baseAbilities.心 + initials.精神力 + growth.精神力,
    HP: 0,
    MP: 0,
    生命抵抗力: 0,
    精神抵抗力: 0,
  };

  // 能力値ボーナスの計算
  const dexterityBonus = calculateAttributeBonus(calculatedAttributes.器用度);
  const agilityBonus = calculateAttributeBonus(calculatedAttributes.敏捷度);
  const strengthBonus = calculateAttributeBonus(calculatedAttributes.筋力);
  const vitalityBonus = calculateAttributeBonus(calculatedAttributes.生命力);
  const intelligenceBonus = calculateAttributeBonus(calculatedAttributes.知力);
  const spiritBonus = calculateAttributeBonus(calculatedAttributes.精神力);

  // 冒険者レベルの取得
  const adventurerLevel = calculateAdventurerLevel(data.classes);

  // HP = 冒険者レベル*3 + 生命力
  calculatedAttributes.HP = adventurerLevel * 3 + calculatedAttributes.生命力;

  // MP = 魔法使い系技能レベル合計*3 + 精神力
  const magicClassLevelSum = data.classes
    .filter(cls => {
      const classData = getClassByName(cls.name);
      return classData?.category === '魔法系';
    })
    .reduce((sum, cls) => sum + cls.level, 0);
  calculatedAttributes.MP = magicClassLevelSum * 3 + calculatedAttributes.精神力;

  // 生命抵抗力 = 冒険者レベル + 生命力ボーナス
  calculatedAttributes.生命抵抗力 = adventurerLevel + vitalityBonus;

  // 精神抵抗力 = 冒険者レベル + 精神力ボーナス
  calculatedAttributes.精神抵抗力 = adventurerLevel + spiritBonus;

  // 移動力 = 敏捷度
  calculatedAttributes.移動力 = calculatedAttributes.敏捷度;

  // 全力移動 = 敏捷度*3
  calculatedAttributes.全力移動 = calculatedAttributes.敏捷度 * 3;

  // 先制力 = スカウト技能レベル + 敏捷度ボーナス（スカウト技能を取得している場合のみ）
  const scoutLevel = data.classes.find(cls => cls.name === 'スカウト')?.level || 0;
  if (scoutLevel > 0) {
    calculatedAttributes.先制力 = scoutLevel + agilityBonus;
  } else {
    delete calculatedAttributes.先制力;
  }

  // 魔物知識 = セージ技能レベル + 知力ボーナス（セージ技能かライダー技能を取得している場合のみ）
  const sageLevel = data.classes.find(cls => cls.name === 'セージ')?.level || 0;
  const riderLevel = data.classes.find(cls => cls.name === 'ライダー')?.level || 0;
  if (sageLevel > 0 || riderLevel > 0) {
    // セージ技能がある場合はセージ技能レベルを使用、ない場合はライダー技能レベルを使用
    const monsterKnowledgeLevel = sageLevel > 0 ? sageLevel : riderLevel;
    calculatedAttributes.魔物知識 = monsterKnowledgeLevel + intelligenceBonus;
  } else {
    delete calculatedAttributes.魔物知識;
  }

  // 技巧（スカウト、レンジャー、ライダー技能レベル + 器用度ボーナス）
  const techniqueSkills = ['スカウト', 'レンジャー', 'ライダー'];
  calculatedAttributes.技巧 = techniqueSkills
    .map(skillName => {
      const skillLevel = data.classes.find(cls => cls.name === skillName)?.level || 0;
      if (skillLevel === 0) return null;
      return skillLevel + dexterityBonus;
    })
    .filter((val): val is number => val !== null);

  // 運動（スカウト、レンジャー、ライダー技能レベル + 敏捷度ボーナス）
  calculatedAttributes.運動 = techniqueSkills
    .map(skillName => {
      const skillLevel = data.classes.find(cls => cls.name === skillName)?.level || 0;
      if (skillLevel === 0) return null;
      return skillLevel + agilityBonus;
    })
    .filter((val): val is number => val !== null);

  // 観察（スカウト、レンジャー、ライダー技能レベル + 知力ボーナス）
  calculatedAttributes.観察 = techniqueSkills
    .map(skillName => {
      const skillLevel = data.classes.find(cls => cls.name === skillName)?.level || 0;
      if (skillLevel === 0) return null;
      return skillLevel + intelligenceBonus;
    })
    .filter((val): val is number => val !== null);

  // 知識（セージ、バード、ライダー、アルケミスト技能レベル + 知力ボーナス）
  const knowledgeSkills = ['セージ', 'バード', 'ライダー', 'アルケミスト'];
  calculatedAttributes.知識 = knowledgeSkills
    .map(skillName => {
      const skillLevel = data.classes.find(cls => cls.name === skillName)?.level || 0;
      if (skillLevel === 0) return null;
      return skillLevel + intelligenceBonus;
    })
    .filter((val): val is number => val !== null);

  // 命中力（戦士系技能レベル + 器用度ボーナス）
  const warriorClasses = data.classes.filter(cls => {
    const classData = getClassByName(cls.name);
    return classData?.category === '戦士系';
  });
  calculatedAttributes.命中力 = warriorClasses.map(cls => {
    return cls.level + dexterityBonus;
  });

  // 追加ダメージ（戦士系技能レベル + 筋力ボーナス）
  calculatedAttributes.追加ダメージ = warriorClasses.map(cls => {
    return cls.level + strengthBonus;
  });

  // 回避力（戦士系技能レベル + 敏捷度ボーナス）
  calculatedAttributes.回避力 = warriorClasses.map(cls => {
    return cls.level + agilityBonus;
  });

  // 防護点 = 装備している防具の防護点の合計
  calculatedAttributes.防護点 = data.armors.reduce((sum, armor) => sum + armor.defense, 0);

  return calculatedAttributes;
}

// ============================================================================
// 経験点計算関数
// ============================================================================

/**
 * レベルごとの必要経験値を計算
 * @param level 技能レベル
 * @param isTableA 経験値テーブルAを使用するか（テーブルBはfalse）
 * @returns レベル1から指定レベルまでの累計経験値
 */
export function getExperienceRequiredForLevel(level: number, isTableA: boolean): number {
  if (level === 0) return 0;

  const tableA = [
    1000, 1000, 1500, 1500, 2000, 2500, 3000, 4000, 5000, 6000,
    7500, 9000, 10500, 12000, 13500
  ];

  const tableB = [
    500, 1000, 1000, 1500, 1500, 2000, 2500, 3000, 4000, 5000,
    6000, 7500, 9000, 10500, 12000
  ];

  const table = isTableA ? tableA : tableB;
  if (level <= table.length) {
    return table.slice(0, level).reduce((sum, exp) => sum + exp, 0);
  }
  return 0;
}

/**
 * 技能の経験値テーブル判定（テーブルA or テーブルB）
 * @param className 技能名
 * @returns テーブルAを使用する場合true
 */
export function isClassTableA(className: string): boolean {
  const tableAClasses = [
    'ファイター', 'グラップラー', 'ソーサラー', 'コンジャラー',
    'プリースト', 'マギテック', 'フェアリーテイマー'
  ];
  return tableAClasses.includes(className);
}

/**
 * 使用経験点の計算（全技能のレベルに必要な経験点の合計）
 * @param classes 技能リスト
 * @returns 使用経験点の合計
 */
export function calculateUsedExperiencePoints(classes: Sw25Class[]): number {
  return classes.reduce((sum, cls) => {
    const isTableA = isClassTableA(cls.name);
    return sum + getExperienceRequiredForLevel(cls.level, isTableA);
  }, 0);
}

// ============================================================================
// 自動更新関数
// ============================================================================

/**
 * 自動追加される戦闘特技を更新
 * 技能レベルに応じて自動的に習得する戦闘特技を追加し、
 * ユーザーが手動で追加した戦闘特技と統合する
 * @param data キャラクターシートデータ
 * @returns 更新された戦闘特技リスト
 */
export function updateAutoSkills(data: Sw25SheetData): Sw25Skill[] {
  // 自動追加される戦闘特技の対応表
  const autoSkillMap: Record<string, Array<{ level: number; skillName: string }>> = {
    'ファイター': [
      { level: 7, skillName: 'タフネス' },
      { level: 13, skillName: 'バトルマスター' },
    ],
    'グラップラー': [
      { level: 1, skillName: '追加攻撃' },
      { level: 7, skillName: 'カウンター' },
      { level: 13, skillName: 'バトルマスター' },
    ],
    'スカウト': [
      { level: 5, skillName: 'トレジャーハント' },
      { level: 7, skillName: 'ファストアクション' },
      { level: 9, skillName: '影走り' },
      { level: 12, skillName: 'トレジャーマスター' },
      { level: 15, skillName: '匠の技' },
    ],
    'レンジャー': [
      { level: 5, skillName: 'サバイバビリティ' },
      { level: 7, skillName: '不屈' },
      { level: 9, skillName: 'ポーションマスター' },
      { level: 12, skillName: '縮地' },
      { level: 15, skillName: 'ランアンドガン' },
    ],
    'セージ': [
      { level: 5, skillName: '鋭い目' },
      { level: 7, skillName: '弱点看破' },
      { level: 9, skillName: 'マナセーブ' },
      { level: 12, skillName: 'マナ耐性' },
      { level: 15, skillName: '賢人の知恵' },
    ],
  };

  // 魔法系技能のルーンマスター（レベル11以上）
  const magicClasses = data.classes.filter(cls => {
    const classData = getClassByName(cls.name);
    return classData?.category === '魔法系';
  });
  const maxMagicLevel = magicClasses.length > 0 ? Math.max(...magicClasses.map(cls => cls.level)) : 0;

  // 既存の戦闘特技から自動追加されたものを除外（ユーザーが手動で追加したものは保持）
  const existingSkills = data.skills.filter(skill => {
    const skillData = SW25_SKILLS.find(s => s.name === skill.name);
    return skillData?.category !== '自動';
  });

  // 自動追加される戦闘特技を追加
  const autoSkills: Sw25Skill[] = [];

  // 各技能のレベルに応じて自動追加
  data.classes.forEach(cls => {
    const autoSkillsForClass = autoSkillMap[cls.name] || [];
    autoSkillsForClass.forEach(({ level, skillName }) => {
      if (cls.level >= level) {
        const skillData = SW25_SKILLS.find(s => s.name === skillName);
        if (skillData) {
          autoSkills.push({
            name: skillName,
            effect: skillData.effect,
            memo: '',
          });
        }
      }
    });
  });

  // 魔法系技能のルーンマスター
  if (maxMagicLevel >= 11) {
    const skillData = SW25_SKILLS.find(s => s.name === 'ルーンマスター');
    if (skillData) {
      autoSkills.push({
        name: 'ルーンマスター',
        effect: skillData.effect,
        memo: '',
      });
    }
  }

  // 重複を除去（同じ戦闘特技が複数の技能で追加される可能性があるため）
  const uniqueAutoSkills = autoSkills.filter((skill, index, self) =>
    index === self.findIndex(s => s.name === skill.name)
  );

  return [...existingSkills, ...uniqueAutoSkills];
}

/**
 * 自動追加される言語を更新
 * 種族・技能に応じて自動的に習得する言語を追加し、
 * ユーザーが手動で追加した言語と統合する
 * @param data キャラクターシートデータ
 * @returns 更新された言語リスト
 */
export function updateAutoLanguages(data: Sw25SheetData) {
  const race = data.race || '';
  const classes = data.classes || [];

  // 自動取得する言語を取得
  const autoLanguages = getAutoLanguages(race, classes);

  // 既存の手動追加された言語を保持
  const existingLanguages = (data.languages || []).filter(lang => {
    // 自動言語に含まれていないものは手動追加
    return !autoLanguages.find(auto => auto.name === lang.name);
  });

  // 自動言語を追加
  const mergedLanguages = [
    ...autoLanguages.map(auto => ({ name: auto.name, speak: auto.speak, read: auto.read })),
    ...existingLanguages,
  ];

  return mergedLanguages;
}

