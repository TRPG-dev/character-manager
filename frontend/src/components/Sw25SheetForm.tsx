import { useState, useEffect } from 'react';
import type { Sw25SheetData, Sw25Class, Sw25Skill, Sw25Magic, Sw25Item, Sw25Weapon, Sw25Armor } from '../types/sw25';
import { normalizeSheetData } from '../utils/sw25';
import { 
  SW25_RACES, 
  SW25_CLASSES, 
  SW25_SKILLS, 
  SW25_MAGICS,
  getRaceByName,
  getClassByName,
  getAvailableBirthsByRace,
  getClassesByCategory,
  getSkillsByClass,
  getMagicByClass,
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
    const { abilities, attributes } = currentData;
    const raceData = currentData.race ? getRaceByName(currentData.race) : null;
    const raceModifiers = raceData?.abilityModifiers || { 技: 0, 体: 0, 心: 0 };

    // 基本能力値（技、体、心）に種族修正を加算
    const baseAbilities = {
      技: abilities.技 + raceModifiers.技,
      体: abilities.体 + raceModifiers.体,
      心: abilities.心 + raceModifiers.心,
    };

    // 能力値の計算（技、体、心から派生）
    // 器用度 = 技 + 器用度初期値
    // 敏捷度 = 技 + 敏捷度初期値
    // 筋力 = 体 + 筋力初期値
    // 生命力 = 体 + 生命力初期値
    // 知力 = 心 + 知力初期値
    // 精神力 = 心 + 精神力初期値
    const calculatedAttributes = {
      ...attributes,
      器用度: baseAbilities.技,
      敏捷度: baseAbilities.技,
      筋力: baseAbilities.体,
      生命力: baseAbilities.体,
      知力: baseAbilities.心,
      精神力: baseAbilities.心,
    };

    // HP = 生命力 + 種族・技能修正（簡易版）
    calculatedAttributes.HP = calculatedAttributes.生命力;
    // MP = 精神力 + 種族・技能修正（簡易版）
    calculatedAttributes.MP = calculatedAttributes.精神力;
    // 生命抵抗力 = 生命力
    calculatedAttributes.生命抵抗力 = calculatedAttributes.生命力;
    // 精神抵抗力 = 精神力
    calculatedAttributes.精神抵抗力 = calculatedAttributes.精神力;

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
    const raceData = getRaceByName(race as any);
    const availableBirths = raceData?.availableBirths || [];
    const updated = { 
      ...sheetData, 
      race: race as any,
      // 現在の生まれが利用可能でない場合はクリア
      birth: availableBirths.includes(sheetData.birth as any) ? sheetData.birth : undefined,
    };
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

  // 能力値の更新（初期値の手動入力用、計算値は上書きされる）
  const updateAttribute = (key: keyof typeof sheetData.attributes, value: number) => {
    const newAttributes = { ...sheetData.attributes, [key]: value };
    const updated = { ...sheetData, attributes: newAttributes };
    // 能力値は自動計算されるため、ここでは手動入力値を保持しない
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
  const updateWeapon = (index: number, field: 'name' | 'hit' | 'damage' | 'memo', value: string | number) => {
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
  const updateArmor = (index: number, field: 'name' | 'defense' | 'memo', value: string | number) => {
    const newArmors = [...sheetData.armors];
    newArmors[index] = { ...newArmors[index], [field]: value };
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

  // 冒険者レベルの計算（全技能レベルの合計）
  const totalLevel = sheetData.classes.reduce((sum, cls) => sum + cls.level, 0);

  // 利用可能な生まれのリスト
  const availableBirths = sheetData.race ? getAvailableBirthsByRace(sheetData.race) : [];

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
              onChange={(e) => updateBasicInfo('birth', e.target.value)}
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
          <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>能力値（自動計算）</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                器用度
              </label>
              <input
                type="number"
                value={sheetData.attributes.器用度}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                敏捷度
              </label>
              <input
                type="number"
                value={sheetData.attributes.敏捷度}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                筋力
              </label>
              <input
                type="number"
                value={sheetData.attributes.筋力}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                生命力
              </label>
              <input
                type="number"
                value={sheetData.attributes.生命力}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                知力
              </label>
              <input
                type="number"
                value={sheetData.attributes.知力}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                精神力
              </label>
              <input
                type="number"
                value={sheetData.attributes.精神力}
                readOnly
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f8f9fa' }}
              />
            </div>
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
          </div>
        </div>
      </CollapsibleSection>

      {/* 技能セクション */}
      <CollapsibleSection title="技能" defaultOpen={true}>
        <div style={{ marginBottom: '1rem' }}>
          <strong>冒険者レベル: {totalLevel}</strong>
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
        {sheetData.skills.map((skill, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  戦闘特技名
                </label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  placeholder="戦闘特技名を入力"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
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
        ))}
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
        {sheetData.magics.map((magic, index) => (
          <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px auto', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  魔法・スキル名
                </label>
                <input
                  type="text"
                  value={magic.name}
                  onChange={(e) => updateMagic(index, 'name', e.target.value)}
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
                  onChange={(e) => updateMagic(index, 'system', e.target.value)}
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
                  onChange={(e) => updateMagic(index, 'cost', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => removeMagic(index)}
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
                onChange={(e) => updateMagic(index, 'effect', e.target.value)}
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
                onChange={(e) => updateMagic(index, 'memo', e.target.value)}
                placeholder="備考を入力"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>
          </div>
        ))}
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

      {/* その他セクション */}
      <CollapsibleSection title="その他" defaultOpen={false}>
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

