import { useState, useEffect } from 'react';
import type { CthulhuSheetData, CthulhuSkill, CthulhuWeapon, CthulhuItem } from '../types/cthulhu';
import { calculateDerivedValues, normalizeSheetData, getJobPointsLimit, getInterestPointsLimit } from '../utils/cthulhu';
import { calculateSkillTotal, calculateTotalJobPoints, calculateTotalInterestPoints } from '../data/cthulhuSkills';
import {
  CthulhuAttributesSection,
  CthulhuDerivedStatsSection,
  CthulhuWeaponsSection,
} from './cthulhu';

interface CthulhuSheetFormProps {
  data: CthulhuSheetData;
  onChange: (data: CthulhuSheetData) => void;
}

export const CthulhuSheetForm = ({ data, onChange }: CthulhuSheetFormProps) => {
  const [sheetData, setSheetData] = useState<CthulhuSheetData>(normalizeSheetData(data));
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  useEffect(() => {
    // 内部更新の場合はスキップ（無限ループ防止）
    if (isInternalUpdate) {
      setIsInternalUpdate(false);
      return;
    }
    const normalized = normalizeSheetData(data);
    setSheetData(normalized);
  }, [data, isInternalUpdate]);

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

    // 動的計算が必要な技能の初期値を更新
    const updatedSkills = sheetData.skills.map(skill => {
      if (skill.name === '母国語') {
        const baseValue = newAttributes.EDU * 5; // EDU×5
        return { ...skill, baseValue, total: calculateSkillTotal({ ...skill, baseValue }) };
      }
      return skill;
    });

    // 格闘技能の動的計算
    const updatedCombatSkills = (sheetData.combatSkills || []).map(skill => {
      if (skill.name === '回避') {
        const baseValue = newAttributes.DEX; // DEX×1
        return { ...skill, baseValue, total: calculateSkillTotal({ ...skill, baseValue }) };
      }
      return skill;
    });

    const updated = { ...sheetData, attributes: newAttributes, derived: updatedDerived, skills: updatedSkills, combatSkills: updatedCombatSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateDerived = (key: keyof typeof sheetData.derived, value: number | string) => {
    const updated = { ...sheetData, derived: { ...sheetData.derived, [key]: value } };
    setSheetData(updated);
    onChange(updated);
  };

  // 技能関連の関数
  const updateDefaultSkill = (index: number, field: 'jobPoints' | 'interestPoints' | 'growth' | 'other', value: number) => {
    const newSkills = [...sheetData.skills];
    newSkills[index] = {
      ...newSkills[index],
      [field]: value,
    };
    newSkills[index].total = calculateSkillTotal(newSkills[index]);
    const updated = { ...sheetData, skills: newSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateCustomSkill = (index: number, field: 'jobPoints' | 'interestPoints' | 'growth' | 'other', value: number) => {
    const newCustomSkills = [...(sheetData.customSkills || [])];
    newCustomSkills[index] = {
      ...newCustomSkills[index],
      [field]: value,
    };
    newCustomSkills[index].total = calculateSkillTotal(newCustomSkills[index]);
    const updated = { ...sheetData, customSkills: newCustomSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const addCustomSkill = () => {
    const newCustomSkill: CthulhuSkill = {
      name: '',
      baseValue: 0,
      jobPoints: 0,
      interestPoints: 0,
      growth: 0,
      other: 0,
      total: 0,
      isCustom: true,
    };
    const newCustomSkills = [...(sheetData.customSkills || []), newCustomSkill];
    const updated = { ...sheetData, customSkills: newCustomSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateCustomSkillName = (index: number, name: string) => {
    const newCustomSkills = [...(sheetData.customSkills || [])];
    newCustomSkills[index] = {
      ...newCustomSkills[index],
      name,
    };
    const updated = { ...sheetData, customSkills: newCustomSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateCustomSkillBaseValue = (index: number, baseValue: number) => {
    const newCustomSkills = [...(sheetData.customSkills || [])];
    newCustomSkills[index] = {
      ...newCustomSkills[index],
      baseValue,
    };
    newCustomSkills[index].total = calculateSkillTotal(newCustomSkills[index]);
    const updated = { ...sheetData, customSkills: newCustomSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const removeCustomSkill = (index: number) => {
    const newCustomSkills = (sheetData.customSkills || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, customSkills: newCustomSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  // 職業P・興味Pの合計と上限チェック
  const allSkills = [...sheetData.skills, ...(sheetData.combatSkills || []), ...(sheetData.customSkills || [])];
  const totalJobPoints = calculateTotalJobPoints(allSkills);
  const totalInterestPoints = calculateTotalInterestPoints(allSkills);
  const jobPointsLimit = getJobPointsLimit(sheetData.attributes.EDU);
  const interestPointsLimit = getInterestPointsLimit(sheetData.attributes.INT);
  const isJobPointsOverLimit = totalJobPoints > jobPointsLimit;
  const isInterestPointsOverLimit = totalInterestPoints > interestPointsLimit;

  // 格闘技能関連の関数
  const updateCombatSkill = (index: number, field: 'jobPoints' | 'interestPoints' | 'growth' | 'other', value: number) => {
    const newCombatSkills = [...(sheetData.combatSkills || [])];
    const currentSkill = newCombatSkills[index];
    newCombatSkills[index] = {
      ...currentSkill,
      [field]: value,
      isCustom: currentSkill.isCustom === true, // isCustomフラグを保持
    };
    newCombatSkills[index].total = calculateSkillTotal(newCombatSkills[index]);
    const updated = { ...sheetData, combatSkills: newCombatSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const addCombatSkill = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newCombatSkill: CthulhuSkill = {
      name: '',
      baseValue: 0,
      jobPoints: 0,
      interestPoints: 0,
      growth: 0,
      other: 0,
      total: 0,
      isCustom: true,
    };
    const newCombatSkills = [...(sheetData.combatSkills || []), newCombatSkill];
    const updated = { ...sheetData, combatSkills: newCombatSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateCombatSkillName = (index: number, name: string) => {
    const newCombatSkills = [...(sheetData.combatSkills || [])];
    const currentSkill = newCombatSkills[index];
    newCombatSkills[index] = {
      ...currentSkill,
      name,
      isCustom: currentSkill.isCustom === true, // isCustomフラグを保持
    };
    const updated = { ...sheetData, combatSkills: newCombatSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateCombatSkillBaseValue = (index: number, baseValue: number) => {
    const newCombatSkills = [...(sheetData.combatSkills || [])];
    const currentSkill = newCombatSkills[index];
    newCombatSkills[index] = {
      ...currentSkill,
      baseValue,
      isCustom: currentSkill.isCustom === true, // isCustomフラグを保持
    };
    newCombatSkills[index].total = calculateSkillTotal(newCombatSkills[index]);
    const updated = { ...sheetData, combatSkills: newCombatSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const removeCombatSkill = (index: number) => {
    const newCombatSkills = (sheetData.combatSkills || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, combatSkills: newCombatSkills };
    setIsInternalUpdate(true);
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

  // 財産の更新関数
  const updateCash = (value: string) => {
    const updated = { ...sheetData, cash: value };
    setSheetData(updated);
    onChange(updated);
  };

  const updateAssets = (value: string) => {
    const updated = { ...sheetData, assets: value };
    setSheetData(updated);
    onChange(updated);
  };

  // シナリオの更新関数
  const addScenario = () => {
    const newScenarios = [...(sheetData.scenarios || []), { name: '', memo: '' }];
    const updated = { ...sheetData, scenarios: newScenarios };
    setSheetData(updated);
    onChange(updated);
  };

  const updateScenario = (index: number, field: 'name' | 'memo', value: string) => {
    const newScenarios = [...(sheetData.scenarios || [])];
    newScenarios[index] = { ...newScenarios[index], [field]: value };
    const updated = { ...sheetData, scenarios: newScenarios };
    setSheetData(updated);
    onChange(updated);
  };

  const removeScenario = (index: number) => {
    const newScenarios = (sheetData.scenarios || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, scenarios: newScenarios };
    setSheetData(updated);
    onChange(updated);
  };

  // 魔導書・呪文・アーティファクトの更新関数
  const addMythosItem = (type: 'mythosBooks' | 'spells' | 'artifacts') => {
    const newItems = [...(sheetData[type] || []), { name: '', memo: '' }];
    const updated = { ...sheetData, [type]: newItems };
    setSheetData(updated);
    onChange(updated);
  };

  const updateMythosItem = (type: 'mythosBooks' | 'spells' | 'artifacts', index: number, field: 'name' | 'memo', value: string) => {
    const newItems = [...(sheetData[type] || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    const updated = { ...sheetData, [type]: newItems };
    setSheetData(updated);
    onChange(updated);
  };

  const removeMythosItem = (type: 'mythosBooks' | 'spells' | 'artifacts', index: number) => {
    const newItems = (sheetData[type] || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, [type]: newItems };
    setSheetData(updated);
    onChange(updated);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* 能力値セクション */}
      <CthulhuAttributesSection
        attributes={sheetData.attributes}
        onUpdate={updateAttributes}
      />

      {/* 派生値セクション */}
      <CthulhuDerivedStatsSection
        derived={sheetData.derived}
        onUpdate={updateDerived}
      />

      {/* 技能セクション */}
      < section >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            技能
          </h2>
        </div>

        {/* ポイント管理表示 */}
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>職業P使用量</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: isJobPointsOverLimit ? '#dc3545' : '#212529' }}>
                {totalJobPoints} / {jobPointsLimit} (EDU × 20)
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>興味P使用量</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: isInterestPointsOverLimit ? '#dc3545' : '#212529' }}>
                {totalInterestPoints} / {interestPointsLimit} (INT × 10)
              </div>
            </div>
          </div>
          {(isJobPointsOverLimit || isInterestPointsOverLimit) && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404', fontSize: '0.875rem' }}>
              ⚠️ ポイントの上限を超えています。保存前に調整してください。
            </div>
          )}
        </div>

        {/* 技能テーブル */}
        <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>技能名</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>初期値</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>職業P</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>興味P</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>成長</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>その他</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>合計</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {/* デフォルト技能 */}
              {sheetData.skills.map((skill, index) => (
                <tr key={`default-${index}`} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{skill.name}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>{skill.baseValue}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.jobPoints || 0}
                      onChange={(e) => updateDefaultSkill(index, 'jobPoints', parseInt(e.target.value) || 0)}
                      min="0"
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.interestPoints || 0}
                      onChange={(e) => updateDefaultSkill(index, 'interestPoints', parseInt(e.target.value) || 0)}
                      min="0"
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.growth || 0}
                      onChange={(e) => updateDefaultSkill(index, 'growth', parseInt(e.target.value) || 0)}
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.other || 0}
                      onChange={(e) => updateDefaultSkill(index, 'other', parseInt(e.target.value) || 0)}
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                    {skill.total || calculateSkillTotal(skill)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                </tr>
              ))}
              {/* 追加技能 */}
              {(sheetData.customSkills || []).map((skill, index) => (
                <tr key={`custom-${index}`} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: '#fffbf0' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateCustomSkillName(index, e.target.value)}
                      placeholder="技能名"
                      style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.baseValue || 0}
                      onChange={(e) => updateCustomSkillBaseValue(index, parseInt(e.target.value) || 0)}
                      min="0"
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.jobPoints || 0}
                      onChange={(e) => updateCustomSkill(index, 'jobPoints', parseInt(e.target.value) || 0)}
                      min="0"
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.interestPoints || 0}
                      onChange={(e) => updateCustomSkill(index, 'interestPoints', parseInt(e.target.value) || 0)}
                      min="0"
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.growth || 0}
                      onChange={(e) => updateCustomSkill(index, 'growth', parseInt(e.target.value) || 0)}
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      value={skill.other || 0}
                      onChange={(e) => updateCustomSkill(index, 'other', parseInt(e.target.value) || 0)}
                      style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                    {skill.total || calculateSkillTotal(skill)}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => removeCustomSkill(index)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {/* 追加ボタン行 */}
              <tr>
                <td colSpan={8} style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={addCustomSkill}
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section >

      {/* 格闘技能セクション */}
      < section >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            格闘技能
          </h2>
        </div>

        {/* 格闘技能テーブル */}
        <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>技能名</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>初期値</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>職業P</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>興味P</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>成長</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>その他</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>合計</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6', fontWeight: 'bold' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {(sheetData.combatSkills || []).map((skill, index) => {
                // isCustomフラグを確実に判定（明示的にtrueの場合のみカスタム技能とみなす）
                const isCustom = skill.isCustom === true;
                return (
                  <tr key={`combat-${index}`} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: isCustom ? '#fffbf0' : undefined }}>
                    <td style={{ padding: '0.75rem' }}>
                      {isCustom ? (
                        <input
                          type="text"
                          value={skill.name || ''}
                          onChange={(e) => updateCombatSkillName(index, e.target.value)}
                          placeholder="技能名"
                          style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      ) : (
                        <span style={{ fontWeight: 'bold' }}>{skill.name}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {isCustom ? (
                        <input
                          type="number"
                          value={skill.baseValue || 0}
                          onChange={(e) => updateCombatSkillBaseValue(index, parseInt(e.target.value) || 0)}
                          min="0"
                          style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                        />
                      ) : (
                        <span>{skill.baseValue}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={skill.jobPoints || 0}
                        onChange={(e) => updateCombatSkill(index, 'jobPoints', parseInt(e.target.value) || 0)}
                        min="0"
                        style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={skill.interestPoints || 0}
                        onChange={(e) => updateCombatSkill(index, 'interestPoints', parseInt(e.target.value) || 0)}
                        min="0"
                        style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={skill.growth || 0}
                        onChange={(e) => updateCombatSkill(index, 'growth', parseInt(e.target.value) || 0)}
                        style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <input
                        type="number"
                        value={skill.other || 0}
                        onChange={(e) => updateCombatSkill(index, 'other', parseInt(e.target.value) || 0)}
                        style={{ width: '60px', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                      {skill.total || calculateSkillTotal(skill)}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {isCustom ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeCombatSkill(index);
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          削除
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* 追加ボタン行 */}
              <tr>
                <td colSpan={8} style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addCombatSkill(e);
                    }}
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
                    + 格闘技能を追加
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section >

      {/* 武器セクション */}
      < CthulhuWeaponsSection
        weapons={sheetData.weapons || []}
        onAdd={addWeapon}
        onUpdate={updateWeapon}
        onRemove={removeWeapon}
      />

      {/* 所持品セクション */}
      < section >
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
      </section >

      {/* 財産セクション */}
      < section >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          財産
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              現金・財産
            </label>
            <textarea
              value={sheetData.cash || ''}
              onChange={(e) => updateCash(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}
              placeholder="現金・財産を記入してください"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              資産
            </label>
            <textarea
              value={sheetData.assets || ''}
              onChange={(e) => updateAssets(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}
              placeholder="資産を記入してください"
            />
          </div>
        </div>
      </section >

      {/* 通過したシナリオセクション */}
      < section >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            通過したシナリオ
          </h2>
          <button
            type="button"
            onClick={addScenario}
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
            + シナリオを追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(sheetData.scenarios || []).map((scenario, index) => (
            <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>シナリオ #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeScenario(index)}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="シナリオ名"
                  value={scenario.name}
                  onChange={(e) => updateScenario(index, 'name', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <textarea
                  placeholder="メモ"
                  value={scenario.memo}
                  onChange={(e) => updateScenario(index, 'memo', e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
          ))}
          {(sheetData.scenarios || []).length === 0 && (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>通過したシナリオがありません。追加ボタンで追加してください。</p>
          )}
        </div>
      </section >

      {/* 魔導書・呪文・アーティファクトセクション */}
      < section >
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          魔導書・呪文・アーティファクト
        </h2>

        {/* 魔導書 */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>魔導書</h3>
            <button
              type="button"
              onClick={() => addMythosItem('mythosBooks')}
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
              + 魔導書を追加
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(sheetData.mythosBooks || []).map((item, index) => (
              <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem' }}>#{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMythosItem('mythosBooks', index)}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="名称"
                    value={item.name}
                    onChange={(e) => updateMythosItem('mythosBooks', index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <textarea
                    placeholder="メモ"
                    value={item.memo}
                    onChange={(e) => updateMythosItem('mythosBooks', index, 'memo', e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 呪文 */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>呪文</h3>
            <button
              type="button"
              onClick={() => addMythosItem('spells')}
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
              + 呪文を追加
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(sheetData.spells || []).map((item, index) => (
              <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem' }}>#{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMythosItem('spells', index)}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="名称"
                    value={item.name}
                    onChange={(e) => updateMythosItem('spells', index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <textarea
                    placeholder="メモ"
                    value={item.memo}
                    onChange={(e) => updateMythosItem('spells', index, 'memo', e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* アーティファクト */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>アーティファクト</h3>
            <button
              type="button"
              onClick={() => addMythosItem('artifacts')}
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
              + アーティファクトを追加
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(sheetData.artifacts || []).map((item, index) => (
              <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem' }}>#{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMythosItem('artifacts', index)}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="名称"
                    value={item.name}
                    onChange={(e) => updateMythosItem('artifacts', index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <textarea
                    placeholder="メモ"
                    value={item.memo}
                    onChange={(e) => updateMythosItem('artifacts', index, 'memo', e.target.value)}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* 背景・その他セクション */}
      < section >
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
      </section >
    </div >
  );
};

