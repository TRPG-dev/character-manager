import { useState, useEffect } from 'react';
import type { Sw25SheetData, Sw25Class, Sw25Skill, Sw25Magic, Sw25Item, Sw25Weapon, Sw25Armor, Sw25Accessory } from '../types/sw25';
import { 
  normalizeSheetData,
  calculateAdventurerLevel,
  calculateAttributeBonus,
  calculateAttributes,
  calculateUsedExperiencePoints,
  updateAutoSkills,
  updateAutoLanguages,
} from '../utils/sw25';
import {
  getClassesByCategory,
} from '../data/sw25';
import { CollapsibleSection } from './CollapsibleSection';
import {
  Sw25AbilitySection,
  Sw25AttributeTable,
  Sw25DerivedStats,
  Sw25SkillsSection,
  Sw25MagicSection,
  Sw25EquipmentSection,
  Sw25LanguagesSection,
  Sw25OtherInfoSection,
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

  // 魔法・スキルの追加
  const addMagic = (system: string) => {
    const newMagic: Sw25Magic = { name: '', system: system, cost: 0, effect: '', memo: '' };
    const updated = { ...sheetData, magics: [...sheetData.magics, newMagic] };
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
        <Sw25SkillsSection
          skills={sheetData.skills}
          classes={sheetData.classes}
          onAddSkill={addSkill}
          onUpdateSkill={updateSkill}
          onRemoveSkill={removeSkill}
        />
      </CollapsibleSection>

      {/* 魔法・スキルセクション */}
      <CollapsibleSection title="魔法・スキル" defaultOpen={false}>
        <Sw25MagicSection
          magics={sheetData.magics}
          classes={sheetData.classes}
          onAddMagic={addMagic}
          onUpdateMagic={updateMagic}
          onRemoveMagic={removeMagic}
        />
      </CollapsibleSection>

      {/* 装備セクション */}
      <CollapsibleSection title="装備" defaultOpen={false}>
        <Sw25EquipmentSection
          weapons={sheetData.weapons}
          armors={sheetData.armors}
          accessories={sheetData.accessories || []}
          items={sheetData.items}
          money={sheetData.money}
          onAddWeapon={addWeapon}
          onUpdateWeapon={updateWeapon}
          onRemoveWeapon={removeWeapon}
          onAddArmor={addArmor}
          onUpdateArmor={updateArmor}
          onRemoveArmor={removeArmor}
          onAddAccessory={addAccessory}
          onUpdateAccessory={updateAccessory}
          onRemoveAccessory={removeAccessory}
          onAddItem={addItem}
          onUpdateItem={updateItem}
          onRemoveItem={removeItem}
          onUpdateMoney={(value) => updateBasicInfo('money', value)}
        />
      </CollapsibleSection>

      {/* 言語セクション */}

      {/* 言語セクション */}
      <CollapsibleSection title="言語" defaultOpen={false}>
        <Sw25LanguagesSection
          languages={sheetData.languages || []}
          race={sheetData.race || ''}
          classes={sheetData.classes}
          onAddLanguage={addLanguage}
          onUpdateLanguage={updateLanguage}
          onRemoveLanguage={removeLanguage}
        />
      </CollapsibleSection>

      {/* その他セクション */}
      <CollapsibleSection title="その他" defaultOpen={false}>
        <Sw25OtherInfoSection
          experiencePoints={sheetData.experiencePoints}
          honorPoints={sheetData.honorPoints}
          background={sheetData.background}
          memo={sheetData.memo}
          onUpdate={updateBasicInfo}
        />
      </CollapsibleSection>
    </div>
  );
};

