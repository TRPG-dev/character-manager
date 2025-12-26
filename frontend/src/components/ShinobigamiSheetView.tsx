import { useState } from 'react';
import type { ShinobigamiSheetData, ShinobigamiEmotion } from '../types/shinobigami';
import { normalizeSheetData } from '../utils/shinobigami';
import { Tabs } from './Tabs';
import { SKILL_TABLE_COLUMNS, SKILL_TABLE_DATA, getDomainFromSchool, getEmptyColumnIndices, HENCHO_OPTIONS, EMOTION_OPTIONS } from '../data/shinobigamiSkills';

interface ShinobigamiSheetViewProps {
  data: ShinobigamiSheetData;
  isDesktop?: boolean;
}

export const ShinobigamiSheetView = ({ 
  data, 
  isDesktop = false,
}: ShinobigamiSheetViewProps) => {
  const sheetData = normalizeSheetData(data);
  const selectedDomain = sheetData.school ? getDomainFromSchool(sheetData.school) : null;
  const [emptyLeftIndex, emptyRightIndex] = selectedDomain ? getEmptyColumnIndices(selectedDomain) : [-1, -1];

  // 選択された特技の名前のセットを作成
  const selectedSkillNames = new Set(sheetData.skills.map(s => s.name));

  // ダメージ状態を管理（選択された特技名のセット）
  const [damagedSkills, setDamagedSkills] = useState<Set<string>>(new Set());
  
  // 一時的な感情データを管理（DBに保存されない）
  const [temporaryEmotions, setTemporaryEmotions] = useState<ShinobigamiEmotion[]>([]);
  
  // 生命点スロットのチェック状態を管理（HPが6より大きい場合）
  const [hpSlots, setHpSlots] = useState<Set<number>>(new Set());
  
  // 一時的な変調データを管理（DBに保存されない）
  const [temporaryHencho, setTemporaryHencho] = useState<Set<string>>(new Set());
  
  // 表示用の感情データ（元のデータ + 一時的なデータ）
  const displayEmotions = [...(sheetData.emotions || []), ...temporaryEmotions];
  
  // 表示用の変調データ（元のデータ + 一時的なデータ）
  const baseHencho = new Set(sheetData.hencho || []);
  const displayHencho = new Set([...baseHencho, ...temporaryHencho]);

  const addEmotion = () => {
    setTemporaryEmotions(prev => [...prev, { pcName: '', emotion: '' }]);
  };
  
  const updateEmotion = (index: number, field: keyof ShinobigamiEmotion, value: string) => {
    setTemporaryEmotions(prev => {
      const newEmotions = [...prev];
      newEmotions[index] = { ...newEmotions[index], [field]: value };
      return newEmotions;
    });
  };
  
  const removeEmotion = (index: number) => {
    setTemporaryEmotions(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSkillClick = (skillName: string) => {
    if (!selectedSkillNames.has(skillName)) return;
    
    setDamagedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillName)) {
        newSet.delete(skillName);
      } else {
        newSet.add(skillName);
      }
      return newSet;
    });
  };
  
  const baseHp = sheetData.hp !== undefined ? sheetData.hp : 6;
  const currentHp = Math.max(0, baseHp - damagedSkills.size - hpSlots.size);
  
  const toggleHpSlot = (index: number) => {
    setHpSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  const toggleHencho = (hencho: string) => {
    if (baseHencho.has(hencho)) {
      return;
    }
    setTemporaryHencho(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hencho)) {
        newSet.delete(hencho);
      } else {
        newSet.add(hencho);
      }
      return newSet;
    });
  };
  
  const extraHpSlots = baseHp > 6 ? baseHp - 6 : 0;
  
  const tabItems = [];
  
  if ((sheetData.ninpo || []).length > 0 || (sheetData.okugi || []).length > 0) {
    tabItems.push({
      label: '忍法・奥義',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(sheetData.ninpo || []).length > 0 && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>忍法</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(sheetData.ninpo || []).map((ninpo, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                    padding: '1rem',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <h4 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem', color: '#007bff' }}>
                      {ninpo.name || '(無名の忍法)'}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>タイプ</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.type || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>指定特技</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.skill || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>間合い</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.range || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>コスト</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.cost || '-'}</div>
                      </div>
                      {ninpo.page && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>参照ページ</div>
                          <div style={{ fontWeight: 'bold' }}>{ninpo.page}</div>
                        </div>
                      )}
                    </div>
                    {ninpo.effect && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #ddd' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>効果</div>
                        <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{ninpo.effect}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(sheetData.okugi || []).length > 0 && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>奥義</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(sheetData.okugi || []).map((okugi, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <h4 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem', color: '#007bff' }}>
                      {okugi.name || '(無名の奥義)'}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>指定特技</div>
                        <div style={{ fontWeight: 'bold' }}>{okugi.skill || '-'}</div>
                      </div>
                      {okugi.page && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>参照ページ</div>
                          <div style={{ fontWeight: 'bold' }}>{okugi.page}</div>
                        </div>
                      )}
                      {okugi.effect && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>効果</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.effect}</div>
                        </div>
                      )}
                      {okugi.strength && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>強み</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.strength}</div>
                        </div>
                      )}
                      {okugi.weakness && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>弱み</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.weakness}</div>
                        </div>
                      )}
                      {okugi.memo && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>メモ</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.memo}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    });
  }
  
  if (sheetData.ningu && (sheetData.ningu.heiryomaru > 0 || sheetData.ningu.jintsumaru > 0 || sheetData.ningu.tonkofu > 0) || sheetData.school && sheetData.skills.length > 0 || displayEmotions.length > 0) {
    tabItems.push({
      label: '忍具・特技・感情',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {sheetData.ningu && (sheetData.ningu.heiryomaru > 0 || sheetData.ningu.jintsumaru > 0 || sheetData.ningu.tonkofu > 0) && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>忍具</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>兵糧丸</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>{sheetData.ningu.heiryomaru}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>神通丸</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>{sheetData.ningu.jintsumaru}</div>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>遁甲符</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>{sheetData.ningu.tonkofu}</div>
                </div>
              </div>
            </div>
          )}
          
          {sheetData.school && sheetData.skills.length > 0 && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>特技</h3>
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
                            const isSelected = selectedSkillNames.has(skillName);
                            const isDamaged = damagedSkills.has(skillName);
                            return (
                              <td
                                key={colIndex}
                                onClick={() => handleSkillClick(skillName)}
                                style={{
                                  padding: '0.5rem',
                                  border: '1px solid #ddd',
                                  backgroundColor: isSelected ? (isDamaged ? '#f8d7da' : '#d4edda') : '#fff',
                                  textAlign: 'center',
                                  fontWeight: isSelected ? 'bold' : 'normal',
                                  cursor: isSelected ? 'pointer' : 'default',
                                  position: 'relative',
                                }}
                              >
                                {skillName}
                                {isSelected && !isDamaged && ' ✓'}
                                {isSelected && isDamaged && (
                                  <span style={{ color: '#dc3545', fontSize: '1.2em', marginLeft: '0.25rem' }}>✗</span>
                                )}
                              </td>
                            );
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {sheetData.skills.map((skill, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '2px solid #28a745',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{skill.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>属性: {skill.domain}</div>
                    <div style={{ fontSize: '1.25rem', color: '#007bff', marginTop: '0.25rem', fontWeight: 'bold' }}>値: {skill.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命点（HP）</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentHp <= 2 ? '#dc3545' : currentHp <= 4 ? '#ffc107' : '#28a745' }}>
                      {currentHp} / {baseHp}
                    </div>
                    {extraHpSlots > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命点スロット</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {Array.from({ length: extraHpSlots }, (_, i) => i).map((index) => (
                            <label
                              key={index}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={hpSlots.has(index)}
                                onChange={() => toggleHpSlot(index)}
                                style={{ cursor: 'pointer' }}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>変調</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    {HENCHO_OPTIONS.map((hencho) => {
                      const isChecked = displayHencho.has(hencho);
                      return (
                        <label
                          key={hencho}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleHencho(hencho)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{hencho}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#dc3545', marginTop: '1rem', fontWeight: 'bold', padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                注意：ここで追加・変更した生命点・変調・感情は一時的なもので、データベースに保存されません。ページをリロードすると消えます。
              </div>
            </div>
          )}
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: '1.25rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>感情</h3>
              <button
                onClick={addEmotion}
                style={{
                  padding: '0.375rem 0.75rem',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                + 感情を追加
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(sheetData.emotions || []).map((emotion, index) => (
                <div
                  key={`original-${index}`}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ flex: 1, fontWeight: 'bold' }}>{emotion.pcName || '(PC名未設定)'}</div>
                  <div style={{ flex: 1, fontSize: '0.875rem', color: '#6c757d' }}>
                    感情: {emotion.emotion || '(未設定)'}
                  </div>
                </div>
              ))}
              {temporaryEmotions.map((emotion, index) => (
                <div
                  key={`temp-${index}`}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fff3cd',
                    borderRadius: '4px',
                    border: '1px solid #ffc107',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    value={emotion.pcName}
                    onChange={(e) => updateEmotion(index, 'pcName', e.target.value)}
                    placeholder="PC名"
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      fontSize: '0.875rem',
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
                      fontSize: '0.875rem',
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
                    onClick={() => removeEmotion(index)}
                    style={{
                      padding: '0.375rem 0.75rem',
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
              ))}
              {displayEmotions.length === 0 && (
                <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
                  感情が登録されていません。「+ 感情を追加」ボタンで追加できます。
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    });
  }
  
  if (((sheetData.backgrounds && sheetData.backgrounds.length > 0) || sheetData.background) || sheetData.memo) {
    tabItems.push({
      label: '背景・メモ',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {((sheetData.backgrounds && sheetData.backgrounds.length > 0) || sheetData.background) && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>背景</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(sheetData.backgrounds || []).map((background, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <h4 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem', color: '#007bff' }}>
                      {background.name || '(無名の背景)'}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>種別</div>
                        <div style={{ fontWeight: 'bold' }}>{background.type || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>功績点</div>
                        <div style={{ fontWeight: 'bold' }}>{background.koseki || '-'}</div>
                      </div>
                      {background.page && (
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>参照ページ</div>
                          <div style={{ fontWeight: 'bold' }}>{background.page}</div>
                        </div>
                      )}
                    </div>
                    {background.effect && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #ddd' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>効果</div>
                        <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{background.effect}</div>
                      </div>
                    )}
                  </div>
                ))}
                {(!sheetData.backgrounds || sheetData.backgrounds.length === 0) && sheetData.background && (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                    }}
                  >
                    {sheetData.background}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {sheetData.memo && (
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>メモ</h3>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                }}
              >
                {sheetData.memo}
              </div>
            </div>
          )}
        </div>
      ),
    });
  }
  
  if (tabItems.length === 0) {
    return null;
  }
  
  return <Tabs items={tabItems} defaultActiveIndex={0} />;
};
