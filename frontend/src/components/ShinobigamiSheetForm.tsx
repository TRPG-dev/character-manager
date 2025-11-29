import { useState, useEffect } from 'react';
import type { ShinobigamiSheetData, ShinobigamiSkill, ShinobigamiNinpo } from '../types/shinobigami';
import { normalizeSheetData } from '../utils/shinobigami';
import { SHINOBI_SCHOOLS, SKILL_TABLE_COLUMNS, SKILL_TABLE_DATA, MAX_SKILLS, getDomainFromSchool, getEmptyColumnIndices } from '../data/shinobigamiSkills';

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
    const updated = { ...sheetData, school };
    setIsInternalUpdate(true);
    setSheetData(updated);
    onChange(updated);
  };

  const addSkill = (skillName: string, domain: string) => {
    // 最大6個まで
    if (sheetData.skills.length >= MAX_SKILLS) {
      alert(`特技は最大${MAX_SKILLS}個まで選択できます。`);
      return;
    }

    // 既に同じ特技が存在する場合は何もしない
    if (sheetData.skills.some(s => s.name === skillName)) {
      return;
    }

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

  const updateSecretFlag = (value: boolean) => {
    const updated = { ...sheetData, secret_flag: value };
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
              特技属性: {selectedDomain}
            </div>
          )}
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
                                  addSkill(skillName, col.domain);
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

            {/* 選択された特技リスト */}
            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
                選択された特技 ({sheetData.skills.length} / {MAX_SKILLS})
              </h3>
              {sheetData.skills.length === 0 ? (
                <p style={{ color: '#6c757d', fontStyle: 'italic' }}>特技が選択されていません。上記のテーブルから選択してください。</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sheetData.skills.map((skill, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <div style={{ flex: 2, fontWeight: 'bold' }}>{skill.name}</div>
                      <div style={{ flex: 1, fontSize: '0.875rem', color: '#6c757d' }}>属性: {skill.domain}</div>
                      <input
                        type="number"
                        value={skill.value}
                        onChange={(e) => updateSkill(index, 'value', parseInt(e.target.value) || 0)}
                        min="0"
                        max="10"
                        style={{ flex: 1, maxWidth: '80px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        placeholder="値"
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
                </div>
              )}
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

      {/* その他セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          その他
        </h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
            <input
              type="checkbox"
              checked={sheetData.secret_flag}
              onChange={(e) => updateSecretFlag(e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem' }}
            />
            秘密フラグ
          </label>
        </div>
        <div>
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
      </section>
    </div>
  );
};
