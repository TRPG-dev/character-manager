import { useState, useEffect } from 'react';
import type { ShinobigamiSheetData, ShinobigamiSkill, ShinobigamiNinpo, ShinobigamiOkugi, ShinobigamiEmotion } from '../types/shinobigami';
import { normalizeSheetData } from '../utils/shinobigami';
import { 
  SHINOBI_SCHOOLS, 
  SKILL_TABLE_COLUMNS, 
  SKILL_TABLE_DATA, 
  MAX_SKILLS, 
  getDomainFromSchool, 
  getEmptyColumnIndices,
  getRyuugiFromSchool,
  RANKS,
  HENCHO_OPTIONS,
  EMOTION_OPTIONS,
  SHINNEN_OPTIONS,
} from '../data/shinobigamiSkills';

interface ShinobigamiSheetFormProps {
  data: ShinobigamiSheetData;
  onChange: (data: ShinobigamiSheetData) => void;
}

export const ShinobigamiSheetForm = ({ data, onChange }: ShinobigamiSheetFormProps) => {
  const [sheetData, setSheetData] = useState<ShinobigamiSheetData>(normalizeSheetData(data));
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  useEffect(() => {
    if (isInternalUpdate) {
      setIsInternalUpdate(false);
      return;
    }
    const normalized = normalizeSheetData(data);
    setSheetData(normalized);
  }, [data, isInternalUpdate]);

  const updateSchool = (school: string) => {
    const ryuugi = school ? getRyuugiFromSchool(school) : '';
    const updated = { ...sheetData, school, ryuugi };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const toggleSkill = (skillName: string, domain: string) => {
    // 既に選択されている場合は削除（キャンセル機能）
    const existingIndex = sheetData.skills.findIndex(s => s.name === skillName);
    if (existingIndex >= 0) {
      const newSkills = sheetData.skills.filter((_, i) => i !== existingIndex);
      const updated = { ...sheetData, skills: newSkills };
      setIsInternalUpdate(true);
      setSheetData(updated);
      onChange(updated);
      return;
    }

    // 最大6個まで
    if (sheetData.skills.length >= MAX_SKILLS) {
      alert(`特技は最大${MAX_SKILLS}個まで選択できます。`);
      return;
    }

    // 新規追加
    const newSkills = [...sheetData.skills, { name: skillName, value: 0, domain }];
    const updated = { ...sheetData, skills: newSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateSkill = (index: number, field: 'name' | 'value' | 'domain', value: string | number) => {
    const newSkills = [...sheetData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    const updated = { ...sheetData, skills: newSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const removeSkill = (index: number) => {
    const newSkills = sheetData.skills.filter((_, i) => i !== index);
    const updated = { ...sheetData, skills: newSkills };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const addNinpo = () => {
    const newNinpo: ShinobigamiNinpo = {
      name: '',
      type: '',
      skill: '',
      range: '',
      cost: '',
      page: '',
    };
    const updated = { ...sheetData, ninpo: [...(sheetData.ninpo || []), newNinpo] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateNinpo = (index: number, field: keyof ShinobigamiNinpo, value: string) => {
    const newNinpo = [...(sheetData.ninpo || [])];
    newNinpo[index] = { ...newNinpo[index], [field]: value };
    const updated = { ...sheetData, ninpo: newNinpo };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const removeNinpo = (index: number) => {
    const newNinpo = (sheetData.ninpo || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, ninpo: newNinpo };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateBackground = (value: string) => {
    const updated = { ...sheetData, background: value };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const addOkugi = () => {
    const newOkugi: ShinobigamiOkugi = {
      name: '',
      skill: '',
      effect: '',
      strength: '',
      weakness: '',
      memo: '',
    };
    const updated = { ...sheetData, okugi: [...(sheetData.okugi || []), newOkugi] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateOkugi = (index: number, field: keyof ShinobigamiOkugi, value: string) => {
    const newOkugi = [...(sheetData.okugi || [])];
    newOkugi[index] = { ...newOkugi[index], [field]: value };
    const updated = { ...sheetData, okugi: newOkugi };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const removeOkugi = (index: number) => {
    const newOkugi = (sheetData.okugi || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, okugi: newOkugi };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const addEmotion = () => {
    const newEmotion: ShinobigamiEmotion = {
      pcName: '',
      emotion: '',
    };
    const updated = { ...sheetData, emotions: [...(sheetData.emotions || []), newEmotion] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateEmotion = (index: number, field: keyof ShinobigamiEmotion, value: string) => {
    const newEmotions = [...(sheetData.emotions || [])];
    newEmotions[index] = { ...newEmotions[index], [field]: value };
    const updated = { ...sheetData, emotions: newEmotions };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const removeEmotion = (index: number) => {
    const newEmotions = (sheetData.emotions || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, emotions: newEmotions };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const toggleHencho = (hencho: string) => {
    const current = sheetData.hencho || [];
    const index = current.indexOf(hencho);
    const newHencho = index >= 0 
      ? current.filter((h) => h !== hencho)
      : [...current, hencho];
    const updated = { ...sheetData, hencho: newHencho };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const selectedDomain = sheetData.school ? getDomainFromSchool(sheetData.school) : null;
  const [emptyLeftIndex, emptyRightIndex] = selectedDomain ? getEmptyColumnIndices(selectedDomain) : [-1, -1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 流派セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          流派
        </h2>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            流派を選択
          </label>
          <select
            value={sheetData.school || ''}
            onChange={(e) => updateSchool(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.5rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <option value="">選択してください</option>
            {SHINOBI_SCHOOLS.map((school) => (
              <option key={school.value} value={school.value}>
                {school.label} ({school.domain})
              </option>
            ))}
          </select>
          {sheetData.school && selectedDomain && (
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              <div>特技属性: {selectedDomain}</div>
              {sheetData.ryuugi && (
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>流儀</label>
                  <textarea
                    value={sheetData.ryuugi}
                    onChange={(e) => {
                      const updated = { ...sheetData, ryuugi: e.target.value };
                      setIsInternalUpdate(true);
                      setSheetData(updated);
                      onChange(updated);
                    }}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      fontSize: '1rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              階級
            </label>
            <select
              value={sheetData.rank || ''}
              onChange={(e) => {
                const updated = { ...sheetData, rank: e.target.value };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="">選択してください</option>
              {RANKS.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              表の顔（職業）
            </label>
            <input
              type="text"
              value={sheetData.surfaceFace || ''}
              onChange={(e) => {
                const updated = { ...sheetData, surfaceFace: e.target.value };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
              placeholder="表の顔"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              信念
            </label>
            <select
              value={sheetData.shinnen || ''}
              onChange={(e) => {
                const updated = { ...sheetData, shinnen: e.target.value };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="">選択してください</option>
              {SHINNEN_OPTIONS.map((shinnen) => (
                <option key={shinnen} value={shinnen}>
                  {shinnen}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              功績点
            </label>
            <input
              type="number"
              value={sheetData.koseki ?? 0}
              onChange={(e) => {
                const updated = { ...sheetData, koseki: parseInt(e.target.value) || 0 };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              min="0"
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
              placeholder="功績点"
            />
          </div>
        </div>
      </section>

      {/* 能力値セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          能力値
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              生命点（HP）最大値: 6
            </label>
            <input
              type="number"
              value={sheetData.hp ?? 6}
              onChange={(e) => {
                const hp = Math.min(6, Math.max(0, parseInt(e.target.value) || 0));
                const updated = { ...sheetData, hp };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              min="0"
              max="6"
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            変調
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {HENCHO_OPTIONS.map((hencho) => {
              const isSelected = (sheetData.hencho || []).includes(hencho);
              return (
                <label
                  key={hencho}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
                    borderRadius: '4px',
                    backgroundColor: isSelected ? '#e7f3ff' : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleHencho(hencho)}
                    style={{ width: '1.25rem', height: '1.25rem' }}
                  />
                  {hencho}
                </label>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>感情</label>
            <button
              type="button"
              onClick={addEmotion}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              + 感情を追加
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(sheetData.emotions || []).map((emotion, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <input
                  type="text"
                  value={emotion.pcName}
                  onChange={(e) => updateEmotion(index, 'pcName', e.target.value)}
                  placeholder="PC名"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
                <select
                  value={emotion.emotion}
                  onChange={(e) => updateEmotion(index, 'emotion', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <option value="">感情を選択</option>
                  {EMOTION_OPTIONS.map((emo) => (
                    <option key={emo} value={emo}>
                      {emo}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeEmotion(index)}
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
            {(sheetData.emotions || []).length === 0 && (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>感情が設定されていません。</p>
            )}
          </div>
        </div>
      </section>

      {/* 特技セクション */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            特技
          </h2>
          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
            選択数: {sheetData.skills.length} / {MAX_SKILLS}
          </div>
        </div>

        {!sheetData.school ? (
          <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
            流派を選択すると特技テーブルが表示されます。
          </div>
        ) : (
          <>
            {/* 特技テーブル */}
            <div style={{ marginBottom: '1rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '800px' }}>
                <thead>
                  <tr>
                    {SKILL_TABLE_COLUMNS.map((col, colIndex) => {
                      if (col.type === 'number') {
                        return (
                          <th
                            key={colIndex}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #ddd',
                              backgroundColor: '#f8f9fa',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              minWidth: '40px',
                            }}
                          />
                        );
                      } else if (col.type === 'empty') {
                        const isBlacked = selectedDomain && (colIndex === emptyLeftIndex || colIndex === emptyRightIndex);
                        return (
                          <th
                            key={colIndex}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #ddd',
                              backgroundColor: isBlacked ? '#000' : '#f8f9fa',
                              minWidth: '20px',
                            }}
                          />
                        );
                      } else {
                        return (
                          <th
                            key={colIndex}
                            style={{
                              padding: '0.5rem',
                              border: '1px solid #ddd',
                              backgroundColor: '#f8f9fa',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              minWidth: '100px',
                            }}
                          >
                            {col.domain}
                          </th>
                        );
                      }
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((rowValue) => (
                    <tr key={rowValue}>
                      {SKILL_TABLE_COLUMNS.map((col, colIndex) => {
                        if (col.type === 'number') {
                          return (
                            <td
                              key={colIndex}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                backgroundColor: '#f8f9fa',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}
                            >
                              {rowValue}
                            </td>
                          );
                        } else if (col.type === 'empty') {
                          const isBlacked = selectedDomain && (colIndex === emptyLeftIndex || colIndex === emptyRightIndex);
                          return (
                            <td
                              key={colIndex}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                backgroundColor: isBlacked ? '#000' : '#fff',
                                minWidth: '20px',
                              }}
                            />
                          );
                        } else {
                          const skillName = SKILL_TABLE_DATA[rowValue]?.[col.domain] || '';
                          const isSelected = sheetData.skills.some(s => s.name === skillName);
                          const isDisabled = sheetData.skills.length >= MAX_SKILLS && !isSelected;
                          return (
                            <td
                              key={colIndex}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                backgroundColor: isSelected ? '#d4edda' : '#fff',
                                textAlign: 'center',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                opacity: isDisabled ? 0.5 : 1,
                              }}
                              onClick={() => {
                                if (!isDisabled && skillName) {
                                  toggleSkill(skillName, col.domain);
                                }
                              }}
                              title={isDisabled ? `特技は最大${MAX_SKILLS}個まで選択できます` : skillName}
                            >
                              {skillName}
                              {isSelected && ' ✓'}
                            </td>
                          );
                        }
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 選択された特技の数表示のみ（テーブル上で可視化されるため表示削除） */}
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e7f3ff', borderRadius: '4px', textAlign: 'center' }}>
              選択された特技: {sheetData.skills.length} / {MAX_SKILLS}（テーブル上の✓マークで確認できます）
            </div>
          </>
        )}
      </section>

      {/* 忍法セクション */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            忍法
          </h2>
          <button
            type="button"
            onClick={addNinpo}
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
            + 忍法を追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(sheetData.ninpo || []).map((ninpo, index) => (
            <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>忍法 #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeNinpo(index)}
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
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>忍法名</label>
                  <input
                    type="text"
                    value={ninpo.name}
                    onChange={(e) => updateNinpo(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>タイプ</label>
                  <input
                    type="text"
                    value={ninpo.type}
                    onChange={(e) => updateNinpo(index, 'type', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>指定特技</label>
                  <input
                    type="text"
                    value={ninpo.skill}
                    onChange={(e) => updateNinpo(index, 'skill', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>間合い</label>
                  <input
                    type="text"
                    value={ninpo.range}
                    onChange={(e) => updateNinpo(index, 'range', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>コスト</label>
                  <input
                    type="text"
                    value={ninpo.cost}
                    onChange={(e) => updateNinpo(index, 'cost', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>参照ページ</label>
                  <input
                    type="text"
                    value={ninpo.page}
                    onChange={(e) => updateNinpo(index, 'page', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          ))}
          {(sheetData.ninpo || []).length === 0 && (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>忍法がありません。追加ボタンで追加してください。</p>
          )}
        </div>
      </section>

      {/* 奥義セクション */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            奥義
          </h2>
          <button
            type="button"
            onClick={addOkugi}
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
            + 奥義を追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(sheetData.okugi || []).map((okugi, index) => (
            <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>奥義 #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeOkugi(index)}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>奥義名</label>
                  <input
                    type="text"
                    value={okugi.name}
                    onChange={(e) => updateOkugi(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>指定特技</label>
                  <input
                    type="text"
                    value={okugi.skill}
                    onChange={(e) => updateOkugi(index, 'skill', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>効果</label>
                  <textarea
                    value={okugi.effect}
                    onChange={(e) => updateOkugi(index, 'effect', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>強み</label>
                  <textarea
                    value={okugi.strength}
                    onChange={(e) => updateOkugi(index, 'strength', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>弱み</label>
                  <textarea
                    value={okugi.weakness}
                    onChange={(e) => updateOkugi(index, 'weakness', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>メモ</label>
                  <textarea
                    value={okugi.memo}
                    onChange={(e) => updateOkugi(index, 'memo', e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          ))}
          {(sheetData.okugi || []).length === 0 && (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>奥義がありません。追加ボタンで追加してください。</p>
          )}
        </div>
      </section>

      {/* 忍具セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          忍具
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              兵糧丸
            </label>
            <input
              type="number"
              value={sheetData.ningu?.heiryomaru ?? 0}
              onChange={(e) => {
                const updated = {
                  ...sheetData,
                  ningu: { ...sheetData.ningu, heiryomaru: parseInt(e.target.value) || 0 },
                };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              min="0"
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              神通丸
            </label>
            <input
              type="number"
              value={sheetData.ningu?.jintsumaru ?? 0}
              onChange={(e) => {
                const updated = {
                  ...sheetData,
                  ningu: { ...sheetData.ningu, jintsumaru: parseInt(e.target.value) || 0 },
                };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              min="0"
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              遁甲符
            </label>
            <input
              type="number"
              value={sheetData.ningu?.tonkofu ?? 0}
              onChange={(e) => {
                const updated = {
                  ...sheetData,
                  ningu: { ...sheetData.ningu, tonkofu: parseInt(e.target.value) || 0 },
                };
                setIsInternalUpdate(true);
                setSheetData(updated);
                onChange(updated);
              }}
              min="0"
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>
      </section>

      {/* その他セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          その他
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            背景
          </label>
          <textarea
            value={sheetData.background}
            onChange={(e) => updateBackground(e.target.value)}
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
            メモ
          </label>
          <textarea
            value={sheetData.memo || ''}
            onChange={(e) => {
              const updated = { ...sheetData, memo: e.target.value };
              setIsInternalUpdate(true);
              setSheetData(updated);
              onChange(updated);
            }}
            rows={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: 'inherit',
            }}
            placeholder="メモを記入してください"
          />
        </div>
      </section>
    </div>
  );
};
