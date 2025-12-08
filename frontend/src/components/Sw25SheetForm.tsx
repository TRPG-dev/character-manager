import { useState, useEffect } from 'react';
import type { Sw25SheetData, Sw25Class, Sw25Skill, Sw25Magic, Sw25Item, Sw25Weapon, Sw25Armor, Sw25Accessory } from '../types/sw25';
import { normalizeSheetData } from '../utils/sw25';
import {
  SW25_SKILLS,
  SW25_LANGUAGES,
  getClassByName,
  getClassesByCategory,
  getAutoLanguages,
  calculateRequiredLanguageCount,
} from '../data/sw25';
import { CollapsibleSection } from './CollapsibleSection';
import {
  Sw25AbilitySection,
  Sw25AttributeTable,
  Sw25DerivedStats,
  Sw25BasicInfoSection,
  Sw25ClassSection,
} from './sw25';

interface Sw25SheetFormProps {
  data: Sw25SheetData;
  onChange: (data: Sw25SheetData) => void;
}

export const Sw25SheetForm = ({ data, onChange }: Sw25SheetFormProps) => {
  const [sheetData, setSheetData] = useState<Sw25SheetData>(normalizeSheetData(data));
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  useEffect(() => {
    if (isInternalUpdate) {
      setIsInternalUpdate(false);
      return;
    }
    const normalized = normalizeSheetData(data);
    // 自動追加される戦闘特技を更新
    normalized.skills = updateAutoSkills(normalized);
    // 自動追加される言語を更新
    normalized.languages = updateAutoLanguages(normalized);
    setSheetData(normalized);
  }, [data]);

  // 能力値ボーナスの計算（能力値/6を切り下げ）
  const calculateAttributeBonus = (value: number): number => {
    return Math.floor(value / 6);
  };

  // 冒険者レベルの計算（各技能の技能レベルの最大値）
  const calculateAdventurerLevel = (classes: Sw25Class[]): number => {
    if (classes.length === 0) return 0;
    return Math.max(...classes.map(cls => cls.level));
  };

  // 修得可能な戦闘特技数の計算（冒険者レベルが奇数の場合に1つずつ増える）
  const calculateMaxSkills = (adventurerLevel: number): number => {
    if (adventurerLevel <= 0) return 0;
    // レベル1で1つ、レベル3で2つ、レベル5で3つ、...
    return Math.floor((adventurerLevel + 1) / 2);
  };

  // 自動追加される戦闘特技を更新
  const updateAutoSkills = (currentData: Sw25SheetData): Sw25Skill[] => {
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
    const magicClasses = currentData.classes.filter(cls => {
      const classData = getClassByName(cls.name);
      return classData?.category === '魔法系';
    });
    const maxMagicLevel = magicClasses.length > 0 ? Math.max(...magicClasses.map(cls => cls.level)) : 0;

    // 既存の戦闘特技から自動追加されたものを除外（ユーザーが手動で追加したものは保持）
    const existingSkills = currentData.skills.filter(skill => {
      const skillData = SW25_SKILLS.find(s => s.name === skill.name);
      return skillData?.category !== '自動';
    });

    // 自動追加される戦闘特技を追加
    const autoSkills: Sw25Skill[] = [];

    // 各技能のレベルに応じて自動追加
    currentData.classes.forEach(cls => {
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
  };

  // 自動追加される言語を更新
  const updateAutoLanguages = (currentData: Sw25SheetData) => {
    const race = currentData.race || '';
    const classes = currentData.classes || [];

    // 自動取得する言語を取得
    const autoLanguages = getAutoLanguages(race, classes);

    // 既存の手動追加された言語を保持
    const existingLanguages = (currentData.languages || []).filter(lang => {
      // 自動言語に含まれていないものは手動追加
      return !autoLanguages.find(auto => auto.name === lang.name);
    });

    // 自動言語を追加
    const mergedLanguages = [
      ...autoLanguages.map(auto => ({ name: auto.name, speak: auto.speak, read: auto.read })),
      ...existingLanguages,
    ];

    return mergedLanguages;
  };

  // 能力値の自動計算
  const calculateAttributes = (currentData: Sw25SheetData) => {
    const { abilities, attributes, attributeInitials, attributeGrowth } = currentData;
    // 対応表の値が既に種族修正を含んでいるため、種族修正を加算しない
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
    const calculatedAttributes = {
      ...attributes,
      器用度: baseAbilities.技 + initials.器用度 + growth.器用度,
      敏捷度: baseAbilities.技 + initials.敏捷度 + growth.敏捷度,
      筋力: baseAbilities.体 + initials.筋力 + growth.筋力,
      生命力: baseAbilities.体 + initials.生命力 + growth.生命力,
      知力: baseAbilities.心 + initials.知力 + growth.知力,
      精神力: baseAbilities.心 + initials.精神力 + growth.精神力,
    };

    // 能力値ボーナスの計算
    const dexterityBonus = calculateAttributeBonus(calculatedAttributes.器用度);
    const agilityBonus = calculateAttributeBonus(calculatedAttributes.敏捷度);
    const strengthBonus = calculateAttributeBonus(calculatedAttributes.筋力);
    const vitalityBonus = calculateAttributeBonus(calculatedAttributes.生命力);
    const intelligenceBonus = calculateAttributeBonus(calculatedAttributes.知力);
    const spiritBonus = calculateAttributeBonus(calculatedAttributes.精神力);

    // 冒険者レベルの取得
    const adventurerLevel = calculateAdventurerLevel(currentData.classes);

    // HP = 冒険者レベル*3 + 生命力
    calculatedAttributes.HP = adventurerLevel * 3 + calculatedAttributes.生命力;

    // MP = 魔法使い系技能レベル合計*3 + 精神力
    const magicClassLevelSum = currentData.classes
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
    const scoutLevel = currentData.classes.find(cls => cls.name === 'スカウト')?.level || 0;
    if (scoutLevel > 0) {
      calculatedAttributes.先制力 = scoutLevel + agilityBonus;
    } else {
      delete calculatedAttributes.先制力;
    }

    // 魔物知識 = セージ技能レベル + 知力ボーナス（セージ技能かライダー技能を取得している場合のみ）
    const sageLevel = currentData.classes.find(cls => cls.name === 'セージ')?.level || 0;
    const riderLevel = currentData.classes.find(cls => cls.name === 'ライダー')?.level || 0;
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
        const skillLevel = currentData.classes.find(cls => cls.name === skillName)?.level || 0;
        if (skillLevel === 0) return null;
        return skillLevel + dexterityBonus;
      })
      .filter((val): val is number => val !== null);

    // 運動（スカウト、レンジャー、ライダー技能レベル + 敏捷度ボーナス）
    calculatedAttributes.運動 = techniqueSkills
      .map(skillName => {
        const skillLevel = currentData.classes.find(cls => cls.name === skillName)?.level || 0;
        if (skillLevel === 0) return null;
        return skillLevel + agilityBonus;
      })
      .filter((val): val is number => val !== null);

    // 観察（スカウト、レンジャー、ライダー技能レベル + 知力ボーナス）
    calculatedAttributes.観察 = techniqueSkills
      .map(skillName => {
        const skillLevel = currentData.classes.find(cls => cls.name === skillName)?.level || 0;
        if (skillLevel === 0) return null;
        return skillLevel + intelligenceBonus;
      })
      .filter((val): val is number => val !== null);

    // 知識（セージ、バード、ライダー、アルケミスト技能レベル + 知力ボーナス）
    const knowledgeSkills = ['セージ', 'バード', 'ライダー', 'アルケミスト'];
    calculatedAttributes.知識 = knowledgeSkills
      .map(skillName => {
        const skillLevel = currentData.classes.find(cls => cls.name === skillName)?.level || 0;
        if (skillLevel === 0) return null;
        return skillLevel + intelligenceBonus;
      })
      .filter((val): val is number => val !== null);

    // 命中力（戦士系技能レベル + 器用度ボーナス）
    const warriorClasses = currentData.classes.filter(cls => {
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
    calculatedAttributes.防護点 = currentData.armors.reduce((sum, armor) => sum + armor.defense, 0);

    return calculatedAttributes;
  };

  // 基本情報の更新
  const updateBasicInfo = (field: keyof Sw25SheetData, value: any) => {
    const updated = { ...sheetData, [field]: value };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };


  // 能力値の更新
  const updateAbility = (key: '技' | '体' | '心', value: number) => {
    const newAbilities = { ...sheetData.abilities, [key]: value };
    const updated = { ...sheetData, abilities: newAbilities };
    const calculatedAttributes = calculateAttributes(updated);
    updated.attributes = calculatedAttributes;
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 能力値初期値の更新
  const updateAttributeInitial = (key: '器用度' | '敏捷度' | '筋力' | '生命力' | '知力' | '精神力', value: number) => {
    const currentInitials = sheetData.attributeInitials || {
      器用度: 0, 敏捷度: 0, 筋力: 0, 生命力: 0, 知力: 0, 精神力: 0,
    };
    const newInitials = { ...currentInitials, [key]: value };
    const updated = { ...sheetData, attributeInitials: newInitials };
    const calculatedAttributes = calculateAttributes(updated);
    updated.attributes = calculatedAttributes;
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 能力値成長値の更新
  const updateAttributeGrowth = (key: '器用度' | '敏捷度' | '筋力' | '生命力' | '知力' | '精神力', value: number) => {
    const currentGrowth = sheetData.attributeGrowth || {
      器用度: 0, 敏捷度: 0, 筋力: 0, 生命力: 0, 知力: 0, 精神力: 0,
    };
    const newGrowth = { ...currentGrowth, [key]: value };
    const updated = { ...sheetData, attributeGrowth: newGrowth };
    const calculatedAttributes = calculateAttributes(updated);
    updated.attributes = calculatedAttributes;
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 技能の追加
  const addClass = () => {
    const newClass: Sw25Class = { name: '', level: 1 };
    const updated = { ...sheetData, classes: [...sheetData.classes, newClass] };
    // 能力値の再計算（冒険者レベルが変化する可能性があるため）
    updated.attributes = calculateAttributes(updated);
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 技能の更新
  const updateClass = (index: number, field: 'name' | 'level', value: string | number) => {
    const newClasses = [...sheetData.classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    const updated = { ...sheetData, classes: newClasses };

    // 能力値の再計算（冒険者レベルが変化する可能性があるため）
    updated.attributes = calculateAttributes(updated);

    // 自動追加される戦闘特技を更新
    updated.skills = updateAutoSkills(updated);

    // 自動追加される言語を更新
    updated.languages = updateAutoLanguages(updated);

    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 技能の削除
  const removeClass = (index: number) => {
    const newClasses = sheetData.classes.filter((_, i) => i !== index);
    const updated = { ...sheetData, classes: newClasses };
    // 能力値の再計算（冒険者レベルが変化する可能性があるため）
    updated.attributes = calculateAttributes(updated);
    // 自動追加される戦闘特技を更新
    updated.skills = updateAutoSkills(updated);
    // 自動追加される言語を更新
    updated.languages = updateAutoLanguages(updated);
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 戦闘特技の追加
  const addSkill = () => {
    const newSkill: Sw25Skill = { name: '', effect: '', memo: '' };
    const updated = { ...sheetData, skills: [...sheetData.skills, newSkill] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 戦闘特技の更新
  const updateSkill = (index: number, field: 'name' | 'effect' | 'memo', value: string) => {
    const newSkills = [...sheetData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    const updated = { ...sheetData, skills: newSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 戦闘特技の削除
  const removeSkill = (index: number) => {
    const newSkills = sheetData.skills.filter((_, i) => i !== index);
    const updated = { ...sheetData, skills: newSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 魔法・スキルの更新
  const updateMagic = (index: number, field: 'name' | 'system' | 'cost' | 'effect' | 'memo', value: string | number) => {
    const newMagics = [...sheetData.magics];
    newMagics[index] = { ...newMagics[index], [field]: value };
    const updated = { ...sheetData, magics: newMagics };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 魔法・スキルの削除
  const removeMagic = (index: number) => {
    const newMagics = sheetData.magics.filter((_, i) => i !== index);
    const updated = { ...sheetData, magics: newMagics };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 武器の追加
  const addWeapon = () => {
    const newWeapon: Sw25Weapon = { name: '', hit: 0, damage: '', memo: '' };
    const updated = { ...sheetData, weapons: [...sheetData.weapons, newWeapon] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 武器の更新
  const updateWeapon = (index: number, field: keyof Sw25Weapon, value: string | number) => {
    const newWeapons = [...sheetData.weapons];
    newWeapons[index] = { ...newWeapons[index], [field]: value };
    const updated = { ...sheetData, weapons: newWeapons };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 武器の削除
  const removeWeapon = (index: number) => {
    const newWeapons = sheetData.weapons.filter((_, i) => i !== index);
    const updated = { ...sheetData, weapons: newWeapons };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 防具の追加
  const addArmor = () => {
    const newArmor: Sw25Armor = { name: '', defense: 0, memo: '' };
    const updated = { ...sheetData, armors: [...sheetData.armors, newArmor] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 防具の更新
  const updateArmor = (index: number, field: keyof Sw25Armor, value: string | number | undefined) => {
    const newArmors = [...sheetData.armors];
    if (value === undefined) {
      const { [field]: _, ...rest } = newArmors[index];
      newArmors[index] = rest as Sw25Armor;
    } else {
      newArmors[index] = { ...newArmors[index], [field]: value };
    }
    const updated = { ...sheetData, armors: newArmors };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 防具の削除
  const removeArmor = (index: number) => {
    const newArmors = sheetData.armors.filter((_, i) => i !== index);
    const updated = { ...sheetData, armors: newArmors };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // アイテムの追加
  const addItem = () => {
    const newItem: Sw25Item = { name: '', quantity: 1, memo: '' };
    const updated = { ...sheetData, items: [...sheetData.items, newItem] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // アイテムの更新
  const updateItem = (index: number, field: 'name' | 'quantity' | 'memo', value: string | number) => {
    const newItems = [...sheetData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    const updated = { ...sheetData, items: newItems };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // アイテムの削除
  const removeItem = (index: number) => {
    const newItems = sheetData.items.filter((_, i) => i !== index);
    const updated = { ...sheetData, items: newItems };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 装飾品の追加
  const addAccessory = () => {
    const newAccessory: Sw25Accessory = { name: '', slot: undefined };
    const updated = { ...sheetData, accessories: [...(sheetData.accessories || []), newAccessory] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 装飾品の更新
  const updateAccessory = (index: number, field: keyof Sw25Accessory, value: string | number | undefined) => {
    const newAccessories = [...(sheetData.accessories || [])];
    if (value === undefined) {
      const { [field]: _, ...rest } = newAccessories[index];
      newAccessories[index] = rest as Sw25Accessory;
    } else {
      newAccessories[index] = { ...newAccessories[index], [field]: value };
    }
    const updated = { ...sheetData, accessories: newAccessories };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 装飾品の削除
  const removeAccessory = (index: number) => {
    const newAccessories = (sheetData.accessories || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, accessories: newAccessories };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 言語の追加
  const addLanguage = () => {
    const newLanguage = { name: '', speak: false, read: false };
    const updated = { ...sheetData, languages: [...(sheetData.languages || []), newLanguage] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 言語の更新
  const updateLanguage = (index: number, field: 'name' | 'speak' | 'read', value: string | boolean) => {
    const newLanguages = [...(sheetData.languages || [])];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    const updated = { ...sheetData, languages: newLanguages };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 言語の削除
  const removeLanguage = (index: number) => {
    const newLanguages = (sheetData.languages || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, languages: newLanguages };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 経験値テーブル
  const getExperienceRequiredForLevel = (level: number, isTableA: boolean): number => {
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
  };

  // 技能の経験値テーブル判定
  const isClassTableA = (className: string): boolean => {
    const tableAClasses = ['ファイター', 'グラップラー', 'ソーサラー', 'コンジャラー', 'プリースト', 'マギテック', 'フェアリーテイマー'];
    return tableAClasses.includes(className);
  };

  // 使用経験点の計算（全技能のレベルに必要な経験点の合計）
  const calculateUsedExperiencePoints = (classes: Sw25Class[]): number => {
    return classes.reduce((sum, cls) => {
      const isTableA = isClassTableA(cls.name);
      return sum + getExperienceRequiredForLevel(cls.level, isTableA);
    }, 0);
  };

  // 冒険者レベルの計算（戦士系、魔法系、その他の最大値）
  const adventurerLevel = calculateAdventurerLevel(sheetData.classes);

  // 使用経験点の計算
  const usedExperiencePoints = calculateUsedExperiencePoints(sheetData.classes);

  // 残り経験点の計算
  const remainingExperiencePoints = (sheetData.initialExperiencePoints || 0) + (sheetData.gainedExperiencePoints || 0) - usedExperiencePoints;

  // 冒険者レベルを更新（能力値も再計算）
  useEffect(() => {
    if (sheetData.adventurerLevel !== adventurerLevel) {
      const updated = { ...sheetData, adventurerLevel };
      // 冒険者レベルが変化した場合、派生値も再計算する
      updated.attributes = calculateAttributes(updated);
      // 自動追加される戦闘特技を更新
      updated.skills = updateAutoSkills(updated);
      setIsInternalUpdate(true);
      setSheetData(updated);
      onChange(updated);
    }
  }, [adventurerLevel]);


  // 使用経験点を更新
  useEffect(() => {
    if (sheetData.experiencePoints !== usedExperiencePoints) {
      const updated = { ...sheetData, experiencePoints: usedExperiencePoints };
      setIsInternalUpdate(true);
      setSheetData(updated);
      onChange(updated);
    }
  }, [usedExperiencePoints]);

  // 技能カテゴリ別のリスト
  const warriorClasses = getClassesByCategory('戦士系');
  const magicClasses = getClassesByCategory('魔法系');
  const otherClasses = getClassesByCategory('その他');

  return (
    <div>
      {/* 能力値セクション */}
      <CollapsibleSection title="能力値" defaultOpen={true}>
        <Sw25AbilitySection
          abilities={sheetData.abilities}
          onUpdate={updateAbility}
        />


        <Sw25AttributeTable
          abilities={sheetData.abilities}
          attributes={sheetData.attributes}
          attributeInitials={sheetData.attributeInitials}
          attributeGrowth={sheetData.attributeGrowth}
          onUpdateInitial={updateAttributeInitial}
          onUpdateGrowth={updateAttributeGrowth}
          calculateAttributeBonus={calculateAttributeBonus}
        />


        <Sw25DerivedStats attributes={sheetData.attributes} />
      </CollapsibleSection>

      {/* 技能セクション */}
      <CollapsibleSection title="技能" defaultOpen={true}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <strong>冒険者レベル: {adventurerLevel}</strong>
          </div>
          <div>
            <label style={{ display: 'inline-block', marginRight: '0.5rem', fontWeight: 'bold' }}>
              初期経験点:
            </label>
            <input
              type="number"
              min="0"
              value={sheetData.initialExperiencePoints ?? 3000}
              readOnly
              style={{ width: '100px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
            />
          </div>
          <div>
            <label style={{ display: 'inline-block', marginRight: '0.5rem', fontWeight: 'bold' }}>
              獲得経験点:
            </label>
            <input
              type="number"
              min="0"
              value={sheetData.gainedExperiencePoints || ''}
              onChange={(e) => updateBasicInfo('gainedExperiencePoints', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '100px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <strong>経験点: {(sheetData.initialExperiencePoints || 3000) + (sheetData.gainedExperiencePoints || 0)}</strong>
          </div>
          <div>
            <strong>使用経験点: {usedExperiencePoints}</strong>
          </div>
          <div>
            <strong>残り経験点: {remainingExperiencePoints}</strong>
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={addClass}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            + 技能を追加
          </button>
        </div>
        {sheetData.classes.map((cls, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  技能名
                </label>
                <select
                  value={cls.name}
                  onChange={(e) => updateClass(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">選択してください</option>
                  {warriorClasses.map(c => (
                    <option key={c.name} value={c.name}>{c.name} (戦士系)</option>
                  ))}
                  {magicClasses.map(c => (
                    <option key={c.name} value={c.name}>{c.name} (魔法系)</option>
                  ))}
                  {otherClasses.map(c => (
                    <option key={c.name} value={c.name}>{c.name} (その他)</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  レベル
                </label>
                <input
                  type="number"
                  min="1"
                  value={cls.level}
                  onChange={(e) => updateClass(index, 'level', parseInt(e.target.value) || 1)}
                  style={{ width: '80px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => removeClass(index)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </CollapsibleSection>

      {/* 戦闘特技セクション */}
      <CollapsibleSection title="戦闘特技" defaultOpen={false}>
        {(() => {
          const adventurerLevel = calculateAdventurerLevel(sheetData.classes);
          const maxSkills = calculateMaxSkills(adventurerLevel);

          // 自動追加された戦闘特技と手動追加された戦闘特技を分ける
          const autoSkills = sheetData.skills.filter(skill => {
            const skillData = SW25_SKILLS.find(s => s.name === skill.name);
            return skillData?.category === '自動';
          });
          const manualSkills = sheetData.skills.filter(skill => {
            const skillData = SW25_SKILLS.find(s => s.name === skill.name);
            return skillData?.category !== '自動';
          });

          // 修得可能数のカウントは手動の戦闘特技数のみ
          const currentSkills = manualSkills.length;
          const canAddSkill = currentSkills < maxSkills;

          return (
            <>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>冒険者レベル: {adventurerLevel}</strong>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>修得可能数: {maxSkills}個</strong>（レベル{adventurerLevel % 2 === 1 ? adventurerLevel : adventurerLevel - 1}で{maxSkills}個）
                </div>
                <div>
                  <strong>現在の戦闘特技数: {currentSkills}個</strong>
                  {autoSkills.length > 0 && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                      （自動: {autoSkills.length}個、手動: {manualSkills.length}個）
                    </span>
                  )}
                </div>
              </div>

              {/* 自動追加された戦闘特技 */}
              {autoSkills.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
                    自動追加された戦闘特技
                  </h4>
                  {autoSkills.map((skill) => {
                    const originalIndex = sheetData.skills.findIndex(s => s === skill);
                    const skillData = SW25_SKILLS.find(s => s.name === skill.name);
                    return (
                      <div key={originalIndex} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>{skill.name}</strong>
                          {skillData && skillData.requirements && (
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                              ({skillData.requirements})
                            </span>
                          )}
                        </div>
                        <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                          {skill.effect}
                        </div>
                        {skill.memo && (
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            備考: {skill.memo}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 手動追加された戦闘特技 */}
              <div style={{ marginBottom: '1rem' }}>
                {canAddSkill && (
                  <button
                    type="button"
                    onClick={addSkill}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '1rem',
                    }}
                  >
                    + 戦闘特技を追加（残り{maxSkills - currentSkills}個）
                  </button>
                )}
                {!canAddSkill && (
                  <div style={{ padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                    修得可能数の上限に達しています。戦闘特技を追加するには冒険者レベルを上げてください。
                  </div>
                )}
              </div>
              {manualSkills.map((skill) => {
                const originalIndex = sheetData.skills.findIndex(s => s === skill);
                const skillData = SW25_SKILLS.find(s => s.name === skill.name);
                return (
                  <div key={originalIndex} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          戦闘特技名
                        </label>
                        <select
                          value={skill.name}
                          onChange={(e) => {
                            const selectedSkill = SW25_SKILLS.find(s => s.name === e.target.value);
                            if (selectedSkill) {
                              const newSkills = [...sheetData.skills];
                              newSkills[originalIndex] = {
                                ...newSkills[originalIndex],
                                name: e.target.value,
                                effect: selectedSkill.effect,
                              };
                              const updated = { ...sheetData, skills: newSkills };
                              setIsInternalUpdate(true);
                              setSheetData(updated);
                              onChange(updated);
                            }
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">選択してください</option>
                          {SW25_SKILLS.filter(s => s.category !== '自動').map(s => (
                            <option key={s.name} value={s.name}>
                              {s.name} {s.requirements ? `(${s.requirements})` : ''}
                            </option>
                          ))}
                        </select>
                        {skillData && skillData.requirements && (
                          <div style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#666' }}>
                            習得条件: {skillData.requirements}
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => removeSkill(originalIndex)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '1.5rem',
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        効果
                      </label>
                      <textarea
                        value={skill.effect}
                        onChange={(e) => updateSkill(originalIndex, 'effect', e.target.value)}
                        placeholder="効果を入力"
                        rows={2}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        備考
                      </label>
                      <input
                        type="text"
                        value={skill.memo || ''}
                        onChange={(e) => updateSkill(originalIndex, 'memo', e.target.value)}
                        placeholder="備考を入力"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}
      </CollapsibleSection>

      {/* 魔法・スキルセクション */}
      <CollapsibleSection title="魔法・スキル" defaultOpen={false}>
        {/* 技能と魔法・スキル系統グループの対応表 */}
        {(() => {
          // ユーザーが取得している技能に対応した魔法・スキル系統グループを取得
          const classToSystemMap: Record<string, string> = {
            'ソーサラー': '真語魔法',
            'コンジャラー': '操霊魔法',
            'プリースト': '神聖魔法',
            'マギテック': '魔導機術',
            'フェアリーテイマー': '妖精魔法',
            'エンハンサー': '練技',
            'バード': '呪歌',
            'ライダー': '練技',
            'アルケミスト': '賦術',
          };

          // 取得している技能から対応する系統グループを取得
          const availableSystems = new Set<string>();
          sheetData.classes.forEach(cls => {
            const system = classToSystemMap[cls.name];
            if (system) {
              availableSystems.add(system);
            }
          });

          // 既存の魔法・スキルで使用されている系統も追加
          sheetData.magics.forEach(magic => {
            if (magic.system) {
              availableSystems.add(magic.system);
            }
          });

          const systems = Array.from(availableSystems).sort();

          return (
            <>
              {systems.map(system => {
                const systemMagics = sheetData.magics.filter(m => m.system === system);
                return (
                  <div key={system} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
                        {system}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const newMagic: Sw25Magic = { name: '', system: system, cost: 0, effect: '', memo: '' };
                          const updated = { ...sheetData, magics: [...sheetData.magics, newMagic] };
                          setIsInternalUpdate(true);
                          setSheetData(updated);
                          onChange(updated);
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        + {system}を追加
                      </button>
                    </div>
                    {systemMagics.map((magic) => {
                      const originalIndex = sheetData.magics.findIndex(m => m === magic);
                      return (
                        <div key={originalIndex} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                魔法・スキル名
                              </label>
                              <input
                                type="text"
                                value={magic.name}
                                onChange={(e) => updateMagic(originalIndex, 'name', e.target.value)}
                                placeholder="魔法・スキル名を入力"
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                系統
                              </label>
                              <input
                                type="text"
                                value={magic.system}
                                disabled
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa', color: '#495057' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                消費MP
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={magic.cost}
                                onChange={(e) => updateMagic(originalIndex, 'cost', parseInt(e.target.value) || 0)}
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => removeMagic(originalIndex)}
                                style={{
                                  padding: '0.5rem 1rem',
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  marginTop: '1.5rem',
                                }}
                              >
                                削除
                              </button>
                            </div>
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                              効果
                            </label>
                            <textarea
                              value={magic.effect}
                              onChange={(e) => updateMagic(originalIndex, 'effect', e.target.value)}
                              placeholder="効果を入力"
                              rows={2}
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                              備考
                            </label>
                            <input
                              type="text"
                              value={magic.memo || ''}
                              onChange={(e) => updateMagic(originalIndex, 'memo', e.target.value)}
                              placeholder="備考を入力"
                              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          );
        })()}
        {/* 系統が未設定の魔法・スキル */}
        {sheetData.magics.filter(m => !m.system || m.system === '').length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
              未分類
            </h4>
            {sheetData.magics
              .map((magic, idx) => ({ magic, idx }))
              .filter(({ magic }) => !magic.system || magic.system === '')
              .map(({ magic, idx: magicIdx }) => (
                <div key={magicIdx} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        魔法・スキル名
                      </label>
                      <input
                        type="text"
                        value={magic.name}
                        onChange={(e) => updateMagic(magicIdx, 'name', e.target.value)}
                        placeholder="魔法・スキル名を入力"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        系統
                      </label>
                      <select
                        value={magic.system}
                        onChange={(e) => updateMagic(magicIdx, 'system', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      >
                        <option value="">選択してください</option>
                        <option value="真語魔法">真語魔法</option>
                        <option value="操霊魔法">操霊魔法</option>
                        <option value="神聖魔法">神聖魔法</option>
                        <option value="妖精魔法">妖精魔法</option>
                        <option value="魔導機術">魔導機術</option>
                        <option value="呪歌">呪歌</option>
                        <option value="練技">練技</option>
                        <option value="賦術">賦術</option>
                        <option value="騎乗">騎乗</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        消費MP
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={magic.cost}
                        onChange={(e) => updateMagic(magicIdx, 'cost', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeMagic(magicIdx)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          marginTop: '1.5rem',
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      効果
                    </label>
                    <textarea
                      value={magic.effect}
                      onChange={(e) => updateMagic(magicIdx, 'effect', e.target.value)}
                      placeholder="効果を入力"
                      rows={2}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      備考
                    </label>
                    <input
                      type="text"
                      value={magic.memo || ''}
                      onChange={(e) => updateMagic(magicIdx, 'memo', e.target.value)}
                      placeholder="備考を入力"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 装備セクション */}
      <CollapsibleSection title="装備" defaultOpen={false}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>武器</h4>
          <button
            type="button"
            onClick={addWeapon}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            + 武器を追加
          </button>
          {sheetData.weapons.map((weapon, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    武器名
                  </label>
                  <input
                    type="text"
                    value={weapon.name}
                    onChange={(e) => updateWeapon(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    命中力
                  </label>
                  <input
                    type="number"
                    value={weapon.hit}
                    onChange={(e) => updateWeapon(index, 'hit', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    ダメージ
                  </label>
                  <input
                    type="text"
                    value={weapon.damage}
                    onChange={(e) => updateWeapon(index, 'damage', e.target.value)}
                    placeholder="例: 2D6+1"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeWeapon(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '1.5rem',
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    価格
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={weapon.price || 0}
                    onChange={(e) => updateWeapon(index, 'price', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    用法
                  </label>
                  <input
                    type="text"
                    value={weapon.usage || ''}
                    onChange={(e) => updateWeapon(index, 'usage', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    必筋
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={weapon.requiredStrength || 0}
                    onChange={(e) => updateWeapon(index, 'requiredStrength', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    威力
                  </label>
                  <input
                    type="text"
                    value={weapon.power || ''}
                    onChange={(e) => updateWeapon(index, 'power', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    C値
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={weapon.criticalValue || 0}
                    onChange={(e) => updateWeapon(index, 'criticalValue', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    追加ダメージ
                  </label>
                  <input
                    type="number"
                    value={weapon.additionalDamage || 0}
                    onChange={(e) => updateWeapon(index, 'additionalDamage', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    参照p
                  </label>
                  <input
                    type="text"
                    value={weapon.referencePage || ''}
                    onChange={(e) => updateWeapon(index, 'referencePage', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  備考
                </label>
                <input
                  type="text"
                  value={weapon.memo || ''}
                  onChange={(e) => updateWeapon(index, 'memo', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>防具</h4>
          <button
            type="button"
            onClick={addArmor}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            + 防具を追加
          </button>
          {sheetData.armors.map((armor, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    防具名
                  </label>
                  <input
                    type="text"
                    value={armor.name}
                    onChange={(e) => updateArmor(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    防護点
                  </label>
                  <input
                    type="number"
                    value={armor.defense}
                    onChange={(e) => updateArmor(index, 'defense', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeArmor(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '1.5rem',
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    価格
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={armor.price || 0}
                    onChange={(e) => updateArmor(index, 'price', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    必筋
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={armor.requiredStrength || 0}
                    onChange={(e) => updateArmor(index, 'requiredStrength', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    回避
                  </label>
                  <input
                    type="number"
                    value={armor.dodge || 0}
                    onChange={(e) => updateArmor(index, 'dodge', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    タイプ
                  </label>
                  <select
                    value={armor.type || ''}
                    onChange={(e) => updateArmor(index, 'type', e.target.value ? (e.target.value as '鎧' | '盾') : undefined)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">選択してください</option>
                    <option value="鎧">鎧</option>
                    <option value="盾">盾</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    参照p
                  </label>
                  <input
                    type="text"
                    value={armor.referencePage || ''}
                    onChange={(e) => updateArmor(index, 'referencePage', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  備考
                </label>
                <input
                  type="text"
                  value={armor.memo || ''}
                  onChange={(e) => updateArmor(index, 'memo', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>装飾品</h4>
          <button
            type="button"
            onClick={addAccessory}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            + 装飾品を追加
          </button>
          {(sheetData.accessories || []).map((accessory, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    装飾品名
                  </label>
                  <input
                    type="text"
                    value={accessory.name}
                    onChange={(e) => updateAccessory(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    装備スロット
                  </label>
                  <select
                    value={accessory.slot || ''}
                    onChange={(e) => updateAccessory(index, 'slot', e.target.value as any || undefined)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">選択してください</option>
                    <option value="頭">頭</option>
                    <option value="耳">耳</option>
                    <option value="顔">顔</option>
                    <option value="首">首</option>
                    <option value="背中">背中</option>
                    <option value="右手">右手</option>
                    <option value="左手">左手</option>
                    <option value="腰">腰</option>
                    <option value="足">足</option>
                    <option value="他">他</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeAccessory(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '1.5rem',
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    価格
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={accessory.price || 0}
                    onChange={(e) => updateAccessory(index, 'price', e.target.value ? parseInt(e.target.value) : 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    参照p
                  </label>
                  <input
                    type="text"
                    value={accessory.referencePage || ''}
                    onChange={(e) => updateAccessory(index, 'referencePage', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  効果
                </label>
                <textarea
                  value={accessory.effect || ''}
                  onChange={(e) => updateAccessory(index, 'effect', e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  備考
                </label>
                <input
                  type="text"
                  value={accessory.memo || ''}
                  onChange={(e) => updateAccessory(index, 'memo', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>所持金</h4>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              所持金（ガメル）
            </label>
            <input
              type="number"
              min="0"
              value={sheetData.money || ''}
              onChange={(e) => updateBasicInfo('money', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '200px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>アイテム</h4>
          <button
            type="button"
            onClick={addItem}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            + アイテムを追加
          </button>
          {sheetData.items.map((item, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    アイテム名
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    数量
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginTop: '1.5rem',
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  備考
                </label>
                <input
                  type="text"
                  value={item.memo || ''}
                  onChange={(e) => updateItem(index, 'memo', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* 言語セクション */}
      <CollapsibleSection title="言語" defaultOpen={false}>
        {(() => {
          const race = sheetData.race || '';
          const classes = sheetData.classes || [];
          const autoLanguages = getAutoLanguages(race, classes);
          const requiredCount = calculateRequiredLanguageCount(classes);

          // 自動言語と手動言語を分ける
          const currentLanguages = sheetData.languages || [];
          const autoLangNames = autoLanguages.map(l => l.name);
          const manualLanguages = currentLanguages.filter(l => !autoLangNames.includes(l.name));

          // 手動言語の話・読の合計数をカウント
          const manualLangCount = manualLanguages.reduce((sum, lang) => {
            return sum + (lang.speak ? 1 : 0) + (lang.read ? 1 : 0);
          }, 0);

          return (
            <>
              {/* セージの言語取得情報 */}
              {requiredCount > 0 && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', border: '1px solid #0084ff' }}>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <strong>セージLv{classes.find(c => c.name === 'セージ')?.level}</strong>:
                    自動取得以外の言語で<strong>話or読を{requiredCount}つ</strong>選択してください
                  </div>
                  <div style={{ fontSize: '0.875rem', color: manualLangCount >= requiredCount ? '#28a745' : '#dc3545' }}>
                    現在の選択数: <strong>{manualLangCount} / {requiredCount}</strong>
                  </div>
                </div>
              )}

              {/* 自動取得言語 */}
              {autoLanguages.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
                    自動取得言語
                  </h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e9ecef' }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>言語名</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>話</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>読</th>
                      </tr>
                    </thead>
                    <tbody>
                      {autoLanguages.map((lang, index) => (
                        <tr key={index}>
                          <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{lang.name}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                            <input type="checkbox" checked={lang.speak} disabled style={{ cursor: 'not-allowed' }} />
                          </td>
                          <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                            <input type="checkbox" checked={lang.read} disabled style={{ cursor: 'not-allowed' }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 手動追加言語 */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
                    追加言語
                  </h4>
                  <button
                    type="button"
                    onClick={addLanguage}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    + 言語を追加
                  </button>
                </div>

                {manualLanguages.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>言語名</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>話</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>読</th>
                        <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '100px' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualLanguages.map((lang) => {
                        const originalIndex = currentLanguages.findIndex(l => l === lang);
                        return (
                          <tr key={originalIndex}>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                              <select
                                value={lang.name}
                                onChange={(e) => updateLanguage(originalIndex, 'name', e.target.value)}
                                style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                              >
                                <option value="">選択してください</option>
                                {SW25_LANGUAGES.filter(langName =>
                                  !autoLangNames.includes(langName) || langName === lang.name
                                ).map(langName => (
                                  <option key={langName} value={langName}>{langName}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={lang.speak}
                                onChange={(e) => updateLanguage(originalIndex, 'speak', e.target.checked)}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                              <input
                                type="checkbox"
                                checked={lang.read}
                                onChange={(e) => updateLanguage(originalIndex, 'read', e.target.checked)}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => removeLanguage(originalIndex)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                }}
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
                    追加した言語はありません
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </CollapsibleSection>

      {/* その他セクション */}
      <CollapsibleSection title="その他" defaultOpen={false}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>経験点・名誉点</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                使用経験点
              </label>
              <input
                type="number"
                min="0"
                value={sheetData.experiencePoints || ''}
                onChange={(e) => updateBasicInfo('experiencePoints', e.target.value ? parseInt(e.target.value) : undefined)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                名誉点
              </label>
              <input
                type="number"
                min="0"
                value={sheetData.honorPoints || ''}
                onChange={(e) => updateBasicInfo('honorPoints', e.target.value ? parseInt(e.target.value) : undefined)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            背景・経歴
          </label>
          <textarea
            value={sheetData.background}
            onChange={(e) => updateBasicInfo('background', e.target.value)}
            rows={6}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            メモ
          </label>
          <textarea
            value={sheetData.memo || ''}
            onChange={(e) => updateBasicInfo('memo', e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
};

