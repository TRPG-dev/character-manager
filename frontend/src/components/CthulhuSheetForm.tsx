import { useState, useEffect } from 'react';
import type { CthulhuSheetData, CthulhuSkill, CthulhuWeapon, CthulhuItem } from '../types/cthulhu';
import { calculateDerivedValues, normalizeSheetData, getJobPointsLimit, getInterestPointsLimit } from '../utils/cthulhu';
import { calculateSkillTotal, calculateTotalJobPoints, calculateTotalInterestPoints } from '../data/cthulhuSkills';
import { useAuth } from '../auth/useAuth';
import { rollDice } from '../services/api';

interface CthulhuSheetFormProps {
  data: CthulhuSheetData;
  onChange: (data: CthulhuSheetData) => void;
}

export const CthulhuSheetForm = ({ data, onChange }: CthulhuSheetFormProps) => {
  const { getAccessToken } = useAuth();
  const [sheetData, setSheetData] = useState<CthulhuSheetData>(normalizeSheetData(data));
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [rollingAllAttributes, setRollingAllAttributes] = useState(false);

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
      if (skill.name === '回避') {
        const baseValue = newAttributes.DEX; // DEX×1
        return { ...skill, baseValue, total: calculateSkillTotal({ ...skill, baseValue }) };
      }
      if (skill.name === '母国語') {
        const baseValue = newAttributes.EDU * 5; // EDU×5
        return { ...skill, baseValue, total: calculateSkillTotal({ ...skill, baseValue }) };
      }
      return skill;
    });
    
    const updated = { ...sheetData, attributes: newAttributes, derived: updatedDerived, skills: updatedSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateDerived = (key: keyof typeof sheetData.derived, value: number | string) => {
    const updated = { ...sheetData, derived: { ...sheetData.derived, [key]: value } };
    setSheetData(updated);
    onChange(updated);
  };

  // 全能力値ロール関数
  const rollAllAttributes = async () => {
    setRollingAllAttributes(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        alert('認証トークンの取得に失敗しました');
        setRollingAllAttributes(false);
        return;
      }

      // 各能力値に応じたダイス式でロール
      const attributeFormulas: Record<keyof typeof sheetData.attributes, string> = {
        STR: '3d6',
        CON: '3d6',
        POW: '3d6',
        DEX: '3d6',
        APP: '3d6',
        INT: '2d6+6',
        EDU: '3d6+3',
        SIZ: '2d6+6',
      };

      const newAttributes = { ...sheetData.attributes };
      
      // すべての能力値を順番にロール
      for (const [key, formula] of Object.entries(attributeFormulas)) {
        try {
          const result = await rollDice(token, formula);
          newAttributes[key as keyof typeof sheetData.attributes] = result.total;
        } catch (error: any) {
          console.error(`Failed to roll ${key}:`, error);
          // エラーが発生した場合はスキップして続行
        }
      }

      // すべての能力値を一度に更新
      const newDerived = calculateDerivedValues(newAttributes);
      const updatedDerived = {
        ...newDerived,
        SAN_current: sheetData.derived.SAN_current,
        HP_current: sheetData.derived.HP_current,
        MP_current: sheetData.derived.MP_current,
      };

      // 動的計算が必要な技能の初期値を更新
      const updatedSkills = sheetData.skills.map(skill => {
        if (skill.name === '回避') {
          const baseValue = newAttributes.DEX;
          return { ...skill, baseValue, total: calculateSkillTotal({ ...skill, baseValue }) };
        }
        if (skill.name === '母国語') {
          const baseValue = newAttributes.EDU * 5;
          return { ...skill, baseValue, total: calculateSkillTotal({ ...skill, baseValue }) };
        }
        return skill;
      });

      const updated = {
        ...sheetData,
        attributes: newAttributes,
        derived: updatedDerived,
        skills: updatedSkills,
      };
      setIsInternalUpdate(true);
      setSheetData(updated);
      onChange(updated);
    } catch (error: any) {
      console.error('Failed to roll all attributes:', error);
      const errorMessage = error.response?.data?.detail || error.message || '能力値のロールに失敗しました';
      alert(`エラー: ${errorMessage}`);
    } finally {
      setRollingAllAttributes(false);
    }
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
  const allSkills = [...sheetData.skills, ...(sheetData.customSkills || [])];
  const totalJobPoints = calculateTotalJobPoints(allSkills);
  const totalInterestPoints = calculateTotalInterestPoints(allSkills);
  const jobPointsLimit = getJobPointsLimit(sheetData.attributes.EDU);
  const interestPointsLimit = getInterestPointsLimit(sheetData.attributes.INT);
  const isJobPointsOverLimit = totalJobPoints > jobPointsLimit;
  const isInterestPointsOverLimit = totalInterestPoints > interestPointsLimit;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={rollAllAttributes}
            disabled={rollingAllAttributes}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: rollingAllAttributes ? '#ccc' : '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: rollingAllAttributes ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
            }}
          >
            {rollingAllAttributes ? 'ロール中...' : '🎲 能力値をロール'}
          </button>
          <h2 style={{ margin: 0, fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', flex: 1 }}>
            能力値
          </h2>
        </div>
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
              HP (最大) ((CON+SIZ)/2)
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

