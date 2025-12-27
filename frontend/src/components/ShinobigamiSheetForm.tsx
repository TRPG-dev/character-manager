import { useState, useEffect } from 'react';
import type { ShinobigamiSheetData, ShinobigamiNinpo, ShinobigamiOkugi, ShinobigamiEmotion, ShinobigamiBackground, ShinobigamiPersona } from '../types/shinobigami';
import { normalizeSheetData } from '../utils/shinobigami';
import {
  SKILL_TABLE_COLUMNS,
  SKILL_TABLE_DATA,
  MAX_SKILLS_BY_RANK,
  MAX_NINPO_BY_RANK,
  MAX_OKUGI_BY_RANK,
  getDomainFromSchool,
  getEmptyColumnIndices,
  getRyuugiFromSchool,
  RANKS,
  HENCHO_OPTIONS,
  EMOTION_OPTIONS,
  SHINNEN_OPTIONS,
} from '../data/shinobigamiSkills';
import { ShinobigamiNinpoSection } from './shinobigami';

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
    const isKoryu = school === '古流流派';
    const ryuugi = isKoryu ? '' : (school ? getRyuugiFromSchool(school) : '');
    const skillDomain = isKoryu ? (sheetData.skillDomain || '') : undefined;
    const updated = { ...sheetData, school, upperSchool: school, ryuugi, skillDomain: isKoryu ? skillDomain : undefined };
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

    // 新規追加（制限なし）
    const newSkills = [...sheetData.skills, { name: skillName, value: 0, domain }];
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
      effect: '',
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

  const addOkugi = () => {
    const newOkugi: ShinobigamiOkugi = {
      name: '',
      skill: '',
      effect: '',
      strength: '',
      weakness: '',
      page: '',
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

  const addBackground = () => {
    const newBackground = {
      name: '',
      type: '長所' as const,
      koseki: '',
      effect: '',
      page: '',
    };
    const updated = { ...sheetData, backgrounds: [...(sheetData.backgrounds || []), newBackground] };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updateBackground = (index: number, field: keyof ShinobigamiBackground, value: string) => {
    const newBackgrounds = [...(sheetData.backgrounds || [])];
    newBackgrounds[index] = { ...newBackgrounds[index], [field]: value };
    const updated = { ...sheetData, backgrounds: newBackgrounds };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const removeBackground = (index: number) => {
    const newBackgrounds = (sheetData.backgrounds || []).filter((_, i) => i !== index);
    const updated = { ...sheetData, backgrounds: newBackgrounds };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const updatePersona = (index: number, field: keyof ShinobigamiPersona, value: string) => {
    const newPersonas = [...(sheetData.personas || [])];
    newPersonas[index] = { ...newPersonas[index], [field]: value };
    const updated = { ...sheetData, personas: newPersonas };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const isJinjin = sheetData.type === '人間';
  const isKoryu = (sheetData.upperSchool || sheetData.school) === '古流流派';
  const selectedDomain = isKoryu ? sheetData.skillDomain : (sheetData.upperSchool || sheetData.school ? getDomainFromSchool(sheetData.upperSchool || sheetData.school || '') : null);
  const [emptyLeftIndex, emptyRightIndex] = selectedDomain ? getEmptyColumnIndices(selectedDomain) : [-1, -1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 流派情報セクション */}
      {!isJinjin && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            流派情報
          </h2>
          {(sheetData.upperSchool || sheetData.school) && selectedDomain && (
            <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
              <div>特技分野: {selectedDomain}</div>
              {!isKoryu && sheetData.ryuugi && (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
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
      )}

      {/* 能力値セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          能力値
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              生命点（HP）
            </label>
            <input
              type="number"
              value={sheetData.hp ?? 6}
              onChange={(e) => {
                const hp = Math.max(0, parseInt(e.target.value) || 0);
                const updated = { ...sheetData, hp };
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
            選択数: {sheetData.skills.length} / {sheetData.rank ? (MAX_SKILLS_BY_RANK[sheetData.rank] ?? '-') : '-'}
          </div>
        </div>

        {isJinjin ? (
          <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
            一般人を選択した場合、特技分野を選択すると特技テーブルが表示されます。
          </div>
        ) : !(sheetData.upperSchool || sheetData.school) ? (
          <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
            上位流派を選択すると特技テーブルが表示されます。
          </div>
        ) : !selectedDomain ? (
          <div style={{ padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '4px', color: '#856404' }}>
            古流流派を選択した場合、特技分野を選択すると特技テーブルが表示されます。
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
                          return (
                            <td
                              key={colIndex}
                              style={{
                                padding: '0.5rem',
                                border: '1px solid #ddd',
                                backgroundColor: isSelected ? '#d4edda' : '#fff',
                                textAlign: 'center',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                if (skillName) {
                                  toggleSkill(skillName, col.domain);
                                }
                              }}
                              title={skillName}
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
              選択された特技: {sheetData.skills.length} / {sheetData.rank ? (MAX_SKILLS_BY_RANK[sheetData.rank] ?? '-') : '-'}（テーブル上の✓マークで確認できます）
            </div>
          </>
        )}
      </section>

      {/* 忍法セクション */}
      {!isJinjin && (
        <ShinobigamiNinpoSection
          ninpos={sheetData.ninpo || []}
          onAdd={addNinpo}
          onUpdate={updateNinpo}
          onRemove={removeNinpo}
          rank={sheetData.rank}
          maxNinpo={sheetData.rank ? (MAX_NINPO_BY_RANK[sheetData.rank] ?? undefined) : undefined}
        />
      )}

      {/* 奥義セクション */}
      {!isJinjin && (
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            奥義
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {sheetData.rank && MAX_OKUGI_BY_RANK[sheetData.rank] !== undefined && (
              <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                数: {(sheetData.okugi || []).length} / {MAX_OKUGI_BY_RANK[sheetData.rank]}
              </div>
            )}
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
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>参照ページ</label>
                  <input
                    type="text"
                    value={okugi.page || ''}
                    onChange={(e) => updateOkugi(index, 'page', e.target.value)}
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
      )}

      {/* ペルソナセクション */}
      {isJinjin && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            ペルソナ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(sheetData.personas || []).map((persona, index) => (
              <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', marginBottom: '0.5rem' }}>ペルソナ #{index + 1}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>偽装</label>
                    <input
                      type="text"
                      value={persona.disguise}
                      onChange={(e) => updatePersona(index, 'disguise', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>真実名</label>
                    <input
                      type="text"
                      value={persona.trueName}
                      onChange={(e) => updatePersona(index, 'trueName', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>設定</label>
                    <textarea
                      value={persona.setting}
                      onChange={(e) => updatePersona(index, 'setting', e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>効果</label>
                    <textarea
                      value={persona.effect}
                      onChange={(e) => updatePersona(index, 'effect', e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>参照ページ</label>
                    <input
                      type="text"
                      value={persona.page}
                      onChange={(e) => updatePersona(index, 'page', e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
                  ningu: {
                    heiryomaru: parseInt(e.target.value) || 0,
                    jintsumaru: sheetData.ningu?.jintsumaru ?? 0,
                    tonkofu: sheetData.ningu?.tonkofu ?? 0,
                  },
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
                  ningu: {
                    heiryomaru: sheetData.ningu?.heiryomaru ?? 0,
                    jintsumaru: parseInt(e.target.value) || 0,
                    tonkofu: sheetData.ningu?.tonkofu ?? 0,
                  },
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
                  ningu: {
                    heiryomaru: sheetData.ningu?.heiryomaru ?? 0,
                    jintsumaru: sheetData.ningu?.jintsumaru ?? 0,
                    tonkofu: parseInt(e.target.value) || 0,
                  },
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

      {/* 背景セクション */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
            背景
          </h2>
          <button
            type="button"
            onClick={addBackground}
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
            + 背景を追加
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(sheetData.backgrounds || []).map((background, index) => (
            <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>背景 #{index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeBackground(index)}
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
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>名称</label>
                  <input
                    type="text"
                    value={background.name}
                    onChange={(e) => updateBackground(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>種別</label>
                  <select
                    value={background.type}
                    onChange={(e) => updateBackground(index, 'type', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="長所">長所</option>
                    <option value="短所">短所</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>功績点</label>
                  <input
                    type="text"
                    value={background.koseki}
                    onChange={(e) => updateBackground(index, 'koseki', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>参照ページ</label>
                  <input
                    type="text"
                    value={background.page}
                    onChange={(e) => updateBackground(index, 'page', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>効果</label>
                  <textarea
                    value={background.effect}
                    onChange={(e) => updateBackground(index, 'effect', e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>
          ))}
          {(sheetData.backgrounds || []).length === 0 && (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>背景がありません。追加ボタンで追加してください。</p>
          )}
        </div>
      </section>

      {/* その他セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          その他
        </h2>
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
