import { useState, useEffect } from 'react';
import type { Sw25SheetData, Sw25Class, Sw25Skill, Sw25Magic, Sw25Item, Sw25Weapon, Sw25Armor, Sw25Accessory } from '../types/sw25';
import { normalizeSheetData } from '../utils/sw25';
import { 
  SW25_RACES, 
  SW25_SKILLS, 
  SW25_MAGICS,
  getRaceByName,
  getClassByName,
  getAvailableBirthsByRaceFromMapping,
  getClassesByCategory,
  getBaseAbilitiesByRaceBirth,
} from '../data/sw25';
import { CollapsibleSection } from './CollapsibleSection';

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
    setSheetData(normalized);
  }, [data, isInternalUpdate]);

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

    // HP = 生命力 + 種族・技能修正（簡易版）
    calculatedAttributes.HP = calculatedAttributes.生命力;
    // MP = 精神力 + 種族・技能修正（簡易版）
    calculatedAttributes.MP = calculatedAttributes.精神力;
    // 生命抵抗力 = 生命力
    calculatedAttributes.生命抵抗力 = calculatedAttributes.生命力;
    // 精神抵抗力 = 精神力
    calculatedAttributes.精神抵抗力 = calculatedAttributes.精神力;

    // 派生値の計算
    // 移動力 = 敏捷度
    calculatedAttributes.移動力 = calculatedAttributes.敏捷度;
    // 全力移動 = 敏捷度 × 2
    calculatedAttributes.全力移動 = calculatedAttributes.敏捷度 * 2;
    // 先制力 = 敏捷度
    calculatedAttributes.先制力 = calculatedAttributes.敏捷度;
    // 魔物知識 = 知力
    calculatedAttributes.魔物知識 = calculatedAttributes.知力;
    // 防護点 = 装備している防具の防護点の合計（簡易版、後で改善）
    calculatedAttributes.防護点 = sheetData.armors.reduce((sum, armor) => sum + armor.defense, 0);

    return calculatedAttributes;
  };

  // 基本情報の更新
  const updateBasicInfo = (field: keyof Sw25SheetData, value: any) => {
    const updated = { ...sheetData, [field]: value };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 種族変更時の処理
  const updateRace = (race: string) => {
    // 対応表から利用可能な生まれを取得
    const availableBirths = getAvailableBirthsByRaceFromMapping(race as any);
    const updated = { 
      ...sheetData, 
      race: race as any,
      // 現在の生まれが利用可能でない場合はクリア
      birth: availableBirths.includes(sheetData.birth as any) ? sheetData.birth : undefined,
    };
    // 生まれが選択されている場合は基本能力値を自動設定
    if (updated.birth) {
      const baseAbilities = getBaseAbilitiesByRaceBirth(race as any, updated.birth as any);
      if (baseAbilities) {
        updated.abilities = baseAbilities;
      }
    }
    // 能力値の再計算
    updated.attributes = calculateAttributes(updated);
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 生まれ変更時の処理
  const updateBirth = (birth: string) => {
    if (!sheetData.race) {
      // 種族が選択されていない場合は通常の更新のみ
      updateBasicInfo('birth', birth);
      return;
    }
    
    const updated = { 
      ...sheetData, 
      birth: birth as any,
    };
    
    // 対応表から基本能力値を取得して自動設定
    if (birth) {
      const baseAbilities = getBaseAbilitiesByRaceBirth(sheetData.race, birth as any);
      if (baseAbilities) {
        updated.abilities = baseAbilities;
      }
    }
    
    // 能力値の再計算
    updated.attributes = calculateAttributes(updated);
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
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 技能の更新
  const updateClass = (index: number, field: 'name' | 'level', value: string | number) => {
    const newClasses = [...sheetData.classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    const updated = { ...sheetData, classes: newClasses };
    
    // 技能が変更された場合、自動的に戦闘特技を追加
    if (field === 'name' && value) {
      const classData = getClassByName(value as string);
      if (classData && classData.availableSkills) {
        // 既存の戦闘特技名を取得
        const existingSkillNames = updated.skills.map(s => s.name);
        // 新しい戦闘特技を追加（既に存在しないもののみ）
        const newSkills = classData.availableSkills
          .filter((skillName: string) => !existingSkillNames.includes(skillName))
          .map((skillName: string) => {
            const skillData = SW25_SKILLS.find(s => s.name === skillName);
            return {
              name: skillName,
              effect: skillData?.effect || '',
              memo: '',
            };
          });
        updated.skills = [...updated.skills, ...newSkills];
      }
    }
    
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 技能の削除
  const removeClass = (index: number) => {
    const newClasses = sheetData.classes.filter((_, i) => i !== index);
    const updated = { ...sheetData, classes: newClasses };
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

  // 魔法・スキルの追加
  const addMagic = () => {
    const newMagic: Sw25Magic = { name: '', system: '', cost: 0, effect: '', memo: '' };
    const updated = { ...sheetData, magics: [...sheetData.magics, newMagic] };
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

  // 冒険者レベルの計算（全技能レベルの合計）
  const totalLevel = sheetData.classes.reduce((sum, cls) => sum + cls.level, 0);
  
  // 冒険者レベルを更新
  useEffect(() => {
    if (sheetData.adventurerLevel !== totalLevel) {
      const updated = { ...sheetData, adventurerLevel: totalLevel };
      setIsInternalUpdate(true);
      setSheetData(updated);
      onChange(updated);
    }
  }, [totalLevel]);

  // 利用可能な生まれのリスト（対応表から取得）
  const availableBirths = sheetData.race ? getAvailableBirthsByRaceFromMapping(sheetData.race) : [];

  // 技能カテゴリ別のリスト
  const warriorClasses = getClassesByCategory('戦士系');
  const magicClasses = getClassesByCategory('魔法系');
  const otherClasses = getClassesByCategory('その他');

  return (
    <div>
      {/* 基本情報セクション */}
      <CollapsibleSection title="基本情報" defaultOpen={true}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              プレイヤー名
            </label>
            <input
              type="text"
              value={sheetData.playerName || ''}
              onChange={(e) => updateBasicInfo('playerName', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              キャラクター名
            </label>
            <input
              type="text"
              value={sheetData.characterName || ''}
              onChange={(e) => updateBasicInfo('characterName', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              種族
            </label>
            <select
              value={sheetData.race || ''}
              onChange={(e) => updateRace(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">選択してください</option>
              {SW25_RACES.map(race => (
                <option key={race.name} value={race.name}>{race.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              生まれ
            </label>
            <select
              value={sheetData.birth || ''}
              onChange={(e) => updateBirth(e.target.value)}
              disabled={!sheetData.race}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value="">選択してください</option>
              {availableBirths.map(birth => (
                <option key={birth} value={birth}>{birth}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              年齢
            </label>
            <input
              type="number"
              value={sheetData.age || ''}
              onChange={(e) => updateBasicInfo('age', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              性別
            </label>
            <input
              type="text"
              value={sheetData.gender || ''}
              onChange={(e) => updateBasicInfo('gender', e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
        {sheetData.race && getRaceByName(sheetData.race) && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>種族特性:</strong> {getRaceByName(sheetData.race)?.traits.join(', ')}
            {getRaceByName(sheetData.race)?.description && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                {getRaceByName(sheetData.race)?.description}
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* 能力値セクション */}
      <CollapsibleSection title="能力値" defaultOpen={true}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>基本能力（技、体、心）</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                技
              </label>
              <input
                type="number"
                value={sheetData.abilities.技}
                onChange={(e) => updateAbility('技', parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                体
              </label>
              <input
                type="number"
                value={sheetData.abilities.体}
                onChange={(e) => updateAbility('体', parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                心
              </label>
              <input
                type="number"
                value={sheetData.abilities.心}
                onChange={(e) => updateAbility('心', parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>能力値</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>能力値</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>基本能力</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>初期値</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>成長値</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>合計</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: '器用度' as const, base: '技' as const },
                  { key: '敏捷度' as const, base: '技' as const },
                  { key: '筋力' as const, base: '体' as const },
                  { key: '生命力' as const, base: '体' as const },
                  { key: '知力' as const, base: '心' as const },
                  { key: '精神力' as const, base: '心' as const },
                ].map(({ key, base }) => {
                  // 対応表の値が既に種族修正を含んでいるため、種族修正を加算しない
                  const baseValue = sheetData.abilities[base];
                  const initial = (sheetData.attributeInitials?.[key] || 0);
                  const growth = (sheetData.attributeGrowth?.[key] || 0);
                  const total = sheetData.attributes[key];
                  return (
                    <tr key={key}>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', fontWeight: 'bold' }}>{key}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
                        {baseValue}
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={initial}
                          onChange={(e) => updateAttributeInitial(key, parseInt(e.target.value) || 0)}
                          style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                        <input
                          type="number"
                          value={growth}
                          onChange={(e) => updateAttributeGrowth(key, parseInt(e.target.value) || 0)}
                          style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                        {total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>派生値</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                HP
              </label>
              <input
                type="number"
                value={sheetData.attributes.HP}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                MP
              </label>
              <input
                type="number"
                value={sheetData.attributes.MP}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                生命抵抗力
              </label>
              <input
                type="number"
                value={sheetData.attributes.生命抵抗力}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                精神抵抗力
              </label>
              <input
                type="number"
                value={sheetData.attributes.精神抵抗力}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            {sheetData.attributes.移動力 !== undefined && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  移動力
                </label>
                <input
                  type="number"
                  value={sheetData.attributes.移動力}
                  readOnly
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                />
              </div>
            )}
            {sheetData.attributes.全力移動 !== undefined && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  全力移動
                </label>
                <input
                  type="number"
                  value={sheetData.attributes.全力移動}
                  readOnly
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                />
              </div>
            )}
            {sheetData.attributes.先制力 !== undefined && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  先制力
                </label>
                <input
                  type="number"
                  value={sheetData.attributes.先制力}
                  readOnly
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                />
              </div>
            )}
            {sheetData.attributes.魔物知識 !== undefined && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  魔物知識
                </label>
                <input
                  type="number"
                  value={sheetData.attributes.魔物知識}
                  readOnly
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                />
              </div>
            )}
            {sheetData.attributes.防護点 !== undefined && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  防護点
                </label>
                <input
                  type="number"
                  value={sheetData.attributes.防護点}
                  readOnly
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* 技能セクション */}
      <CollapsibleSection title="技能" defaultOpen={true}>
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <strong>冒険者レベル: {totalLevel}</strong>
          </div>
          <div>
            <label style={{ display: 'inline-block', marginRight: '0.5rem', fontWeight: 'bold' }}>
              初期経験点:
            </label>
            <input
              type="number"
              min="0"
              value={sheetData.initialExperiencePoints || ''}
              onChange={(e) => updateBasicInfo('initialExperiencePoints', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '100px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
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
            <strong>経験点: {(sheetData.initialExperiencePoints || 0) + (sheetData.gainedExperiencePoints || 0) - (sheetData.experiencePoints || 0)}</strong>
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
        <div style={{ marginBottom: '1rem' }}>
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
            + 戦闘特技を追加
          </button>
        </div>
        {sheetData.skills.map((skill, index) => {
          const skillData = SW25_SKILLS.find(s => s.name === skill.name);
          return (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
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
                        updateSkill(index, 'name', e.target.value);
                        updateSkill(index, 'effect', selectedSkill.effect);
                      }
                    }}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">選択してください</option>
                    {SW25_SKILLS.map(s => (
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
                    onClick={() => removeSkill(index)}
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
                  onChange={(e) => updateSkill(index, 'effect', e.target.value)}
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
                  onChange={(e) => updateSkill(index, 'memo', e.target.value)}
                  placeholder="備考を入力"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>
          );
        })}
      </CollapsibleSection>

      {/* 魔法・スキルセクション */}
      <CollapsibleSection title="魔法・スキル" defaultOpen={false}>
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={addMagic}
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
            + 魔法・スキルを追加
          </button>
        </div>
        {['精霊魔法', '神聖魔法', '呪歌', '練技', 'その他'].map(system => {
          const systemMagics = sheetData.magics.filter(m => m.system === system);
          if (systemMagics.length === 0) return null;
          return (
            <div key={system} style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
                {system}
              </h4>
              {systemMagics.map((magic) => {
                const originalIndex = sheetData.magics.findIndex(m => m === magic);
                return (
                  <div key={originalIndex} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          魔法・スキル名
                        </label>
                        <select
                          value={magic.name}
                          onChange={(e) => {
                            const selectedMagic = SW25_MAGICS.find(m => m.name === e.target.value);
                            if (selectedMagic) {
                              updateMagic(originalIndex, 'name', e.target.value);
                              updateMagic(originalIndex, 'system', selectedMagic.system);
                              updateMagic(originalIndex, 'cost', selectedMagic.cost);
                              updateMagic(originalIndex, 'effect', selectedMagic.effect);
                            } else {
                              updateMagic(originalIndex, 'name', e.target.value);
                            }
                          }}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">選択してください</option>
                          {SW25_MAGICS.filter(m => m.system === system).map(m => (
                            <option key={m.name} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={magic.name}
                          onChange={(e) => updateMagic(originalIndex, 'name', e.target.value)}
                          placeholder="または手動入力"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          系統
                        </label>
                        <select
                          value={magic.system}
                          onChange={(e) => updateMagic(originalIndex, 'system', e.target.value)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        >
                          <option value="">選択してください</option>
                          <option value="精霊魔法">精霊魔法</option>
                          <option value="神聖魔法">神聖魔法</option>
                          <option value="呪歌">呪歌</option>
                          <option value="練技">練技</option>
                          <option value="その他">その他</option>
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
                        <option value="精霊魔法">精霊魔法</option>
                        <option value="神聖魔法">神聖魔法</option>
                        <option value="呪歌">呪歌</option>
                        <option value="練技">練技</option>
                        <option value="その他">その他</option>
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
        <div style={{ marginBottom: '1rem' }}>
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
              marginBottom: '1rem',
            }}
          >
            + 言語を追加
          </button>
        </div>
        {(sheetData.languages || []).map((language, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  言語名
                </label>
                <input
                  type="text"
                  value={language.name}
                  onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={language.speak}
                    onChange={(e) => updateLanguage(index, 'speak', e.target.checked)}
                  />
                  <span>話</span>
                </label>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={language.read}
                    onChange={(e) => updateLanguage(index, 'read', e.target.checked)}
                  />
                  <span>読</span>
                </label>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
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

