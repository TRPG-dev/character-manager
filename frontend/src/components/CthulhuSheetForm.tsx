import { useState, useEffect } from 'react';
import type { CthulhuSheetData, CthulhuSkill, CthulhuWeapon, CthulhuItem } from '../types/cthulhu';
import { calculateDerivedValues, normalizeSheetData } from '../utils/cthulhu';

interface CthulhuSheetFormProps {
  data: CthulhuSheetData;
  onChange: (data: CthulhuSheetData) => void;
}

export const CthulhuSheetForm = ({ data, onChange }: CthulhuSheetFormProps) => {
  const [sheetData, setSheetData] = useState<CthulhuSheetData>(normalizeSheetData(data));

  useEffect(() => {
    const normalized = normalizeSheetData(data);
    setSheetData(normalized);
  }, [data]);

  const updateAttributes = (key: keyof typeof sheetData.attributes, value: number) => {
    const newAttributes = { ...sheetData.attributes, [key]: value };
    const newDerived = calculateDerivedValues(newAttributes);
    // current値は既存の値を保持
    const updatedDerived = {
      ...newDerived,
      SAN_current: sheetData.derived.SAN_current,
      HP_current: sheetData.derived.HP_current,
      MP_current: sheetData.derived.MP_current,
    };
    const updated = { ...sheetData, attributes: newAttributes, derived: updatedDerived };
    setSheetData(updated);
    onChange(updated);
  };

  const updateDerived = (key: keyof typeof sheetData.derived, value: number | string) => {
    const updated = { ...sheetData, derived: { ...sheetData.derived, [key]: value } };
    setSheetData(updated);
    onChange(updated);
  };

  const addSkill = () => {
    const newSkills = [...sheetData.skills, { name: '', value: 0 }];
    const updated = { ...sheetData, skills: newSkills };
    setSheetData(updated);
    onChange(updated);
  };

  const updateSkill = (index: number, field: keyof CthulhuSkill, value: string | number) => {
    const newSkills = [...sheetData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    const updated = { ...sheetData, skills: newSkills };
    setSheetData(updated);
    onChange(updated);
  };

  const removeSkill = (index: number) => {
    const newSkills = sheetData.skills.filter((_, i) => i !== index);
    const updated = { ...sheetData, skills: newSkills };
    setSheetData(updated);
    onChange(updated);
  };

  const addWeapon = () => {
    const newWeapons = [...(sheetData.weapons || []), {
      name: '',
      value: 0,
      damage: '',
      range: '',
      attacks: 1,
      ammo: 0,
      malfunction: 0,
      durability: 0,
    }];
    const updated = { ...sheetData, weapons: newWeapons };
    setSheetData(updated);
    onChange(updated);
  };

  const updateWeapon = (index: number, field: keyof CthulhuWeapon, value: string | number) => {
    const newWeapons = [...(sheetData.weapons || [])];
    newWeapons[index] = { ...newWeapons[index], [field]: value };
    const updated = { ...sheetData, weapons: newWeapons };
    setSheetData(updated);
    onChange(updated);
  };

  const removeWeapon = (index: number) => {
    const newWeapons = (sheetData.weapons || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, weapons: newWeapons };
    setSheetData(updated);
    onChange(updated);
  };

  const addItem = () => {
    const newItems = [...(sheetData.items || []), { name: '', quantity: 1, detail: '' }];
    const updated = { ...sheetData, items: newItems };
    setSheetData(updated);
    onChange(updated);
  };

  const updateItem = (index: number, field: keyof CthulhuItem, value: string | number) => {
    const newItems = [...(sheetData.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    const updated = { ...sheetData, items: newItems };
    setSheetData(updated);
    onChange(updated);
  };

  const removeItem = (index: number) => {
    const newItems = (sheetData.items || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, items: newItems };
    setSheetData(updated);
    onChange(updated);
  };

  const updateBackstory = (value: string) => {
    const updated = { ...sheetData, backstory: value };
    setSheetData(updated);
    onChange(updated);
  };

  const updateNotes = (value: string) => {
    const updated = { ...sheetData, notes: value };
    setSheetData(updated);
    onChange(updated);
  };

  const attributeLabels: Record<keyof typeof sheetData.attributes, string> = {
    STR: 'STR (筋力)',
    CON: 'CON (体力)',
    POW: 'POW (精神力)',
    DEX: 'DEX (敏捷性)',
    APP: 'APP (外見)',
    INT: 'INT (知性)',
    EDU: 'EDU (教育)',
    SIZ: 'SIZ (体格)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 能力値セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          能力値
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {(Object.keys(sheetData.attributes) as Array<keyof typeof sheetData.attributes>).map((key) => (
            <div key={key}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                {attributeLabels[key]}
              </label>
              <input
                type="number"
                value={sheetData.attributes[key]}
                onChange={(e) => updateAttributes(key, parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 派生値セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          派生値
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              SAN (現在)
            </label>
            <input
              type="number"
              value={sheetData.derived.SAN_current}
              onChange={(e) => updateDerived('SAN_current', parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              SAN (最大)
            </label>
            <input
              type="number"
              value={sheetData.derived.SAN_max}
              onChange={(e) => updateDerived('SAN_max', parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
              readOnly
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              HP (現在)
            </label>
            <input
              type="number"
              value={sheetData.derived.HP_current}
              onChange={(e) => updateDerived('HP_current', parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              HP (最大)
            </label>
            <input
              type="number"
              value={sheetData.derived.HP_max}
              onChange={(e) => updateDerived('HP_max', parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
              readOnly
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              MP (現在)
            </label>
            <input
              type="number"
              value={sheetData.derived.MP_current}
              onChange={(e) => updateDerived('MP_current', parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              MP (最大)
            </label>
            <input
              type="number"
              value={sheetData.derived.MP_max}
              onChange={(e) => updateDerived('MP_max', parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
              readOnly
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              アイデア (INT×5)
            </label>
            <input
              type="number"
              value={sheetData.derived.IDEA || 0}
              readOnly
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              知識 (EDU×5)
            </label>
            <input
              type="number"
              value={sheetData.derived.KNOW || 0}
              readOnly
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              幸運 (POW×5)
            </label>
            <input
              type="number"
              value={sheetData.derived.LUCK || 0}
              readOnly
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              耐久力 ((CON+SIZ)/2)
            </label>
            <input
              type="number"
              value={sheetData.derived.BUILD || 0}
              readOnly
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
              ダメージボーナス
            </label>
            <input
              type="text"
              value={sheetData.derived.DB || '+0'}
              readOnly
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
            />
          </div>
        </div>
      </section>

      {/* 技能セクション */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            技能
          </h2>
          <button
            type="button"
            onClick={addSkill}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            + 技能を追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
          {sheetData.skills.map((skill, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="技能名"
                value={skill.name}
                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                style={{ flex: 2, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="値"
                value={skill.value}
                onChange={(e) => updateSkill(index, 'value', parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                削除
              </button>
            </div>
          ))}
          {sheetData.skills.length === 0 && (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>技能がありません。追加ボタンで追加してください。</p>
          )}
        </div>
      </section>

      {/* 武器セクション */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            武器
          </h2>
          <button
            type="button"
            onClick={addWeapon}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            + 武器を追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(sheetData.weapons || []).map((weapon, index) => (
            <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>武器 #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeWeapon(index)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  削除
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>武器名</label>
                  <input
                    type="text"
                    value={weapon.name}
                    onChange={(e) => updateWeapon(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>技能値</label>
                  <input
                    type="number"
                    value={weapon.value}
                    onChange={(e) => updateWeapon(index, 'value', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>ダメージ</label>
                  <input
                    type="text"
                    value={weapon.damage}
                    onChange={(e) => updateWeapon(index, 'damage', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>射程</label>
                  <input
                    type="text"
                    value={weapon.range}
                    onChange={(e) => updateWeapon(index, 'range', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>攻撃回数</label>
                  <input
                    type="number"
                    value={weapon.attacks}
                    onChange={(e) => updateWeapon(index, 'attacks', parseInt(e.target.value) || 1)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>装弾数</label>
                  <input
                    type="number"
                    value={weapon.ammo}
                    onChange={(e) => updateWeapon(index, 'ammo', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>故障</label>
                  <input
                    type="number"
                    value={weapon.malfunction}
                    onChange={(e) => updateWeapon(index, 'malfunction', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>耐久力</label>
                  <input
                    type="number"
                    value={weapon.durability}
                    onChange={(e) => updateWeapon(index, 'durability', parseInt(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          ))}
          {(sheetData.weapons || []).length === 0 && (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>武器がありません。追加ボタンで追加してください。</p>
          )}
        </div>
      </section>

      {/* 所持品セクション */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            所持品
          </h2>
          <button
            type="button"
            onClick={addItem}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            + 所持品を追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {(sheetData.items || []).map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="アイテム名"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                style={{ flex: 2, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="number"
                placeholder="個数"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                min="1"
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="詳細"
                value={item.detail}
                onChange={(e) => updateItem(index, 'detail', e.target.value)}
                style={{ flex: 3, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                削除
              </button>
            </div>
          ))}
          {(sheetData.items || []).length === 0 && (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>所持品がありません。追加ボタンで追加してください。</p>
          )}
        </div>
      </section>

      {/* 背景・その他セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          背景・その他
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            背景
          </label>
          <textarea
            value={sheetData.backstory}
            onChange={(e) => updateBackstory(e.target.value)}
            rows={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
            placeholder="キャラクターの背景を記入してください"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            その他のメモ
          </label>
          <textarea
            value={sheetData.notes || ''}
            onChange={(e) => updateNotes(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
            placeholder="その他のメモを記入してください"
          />
        </div>
      </section>
    </div>
  );
};

