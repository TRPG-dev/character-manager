import { useState } from 'react';
import type { ShinobigamiSheetData, ShinobigamiEmotion } from '../types/shinobigami';
import { normalizeSheetData } from '../utils/shinobigami';
import { CollapsibleSection } from './CollapsibleSection';
import { SKILL_TABLE_COLUMNS, SKILL_TABLE_DATA, getDomainFromSchool, getEmptyColumnIndices, HENCHO_OPTIONS, EMOTION_OPTIONS } from '../data/shinobigamiSkills';

interface ShinobigamiSheetViewProps {
  data: ShinobigamiSheetData;
  isDesktop?: boolean;
  showLeftColumn?: boolean;
  showRightColumn?: boolean;
  showSkills?: boolean;
}

export const ShinobigamiSheetView = ({ 
  data, 
  isDesktop = false,
  showLeftColumn = false,
  showRightColumn = false,
  showSkills = false,
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
  
  // 表示用の感情データ（元のデータ + 一時的なデータ）
  const displayEmotions = [...(sheetData.emotions || []), ...temporaryEmotions];

  // PC画面（1024px以上）で2カラムレイアウト、それ以外は1カラム
  const useTwoColumn = isDesktop;
  
  // 感情を追加する関数
  const addEmotion = () => {
    setTemporaryEmotions(prev => [...prev, { pcName: '', emotion: '' }]);
  };
  
  // 感情を更新する関数
  const updateEmotion = (index: number, field: keyof ShinobigamiEmotion, value: string) => {
    setTemporaryEmotions(prev => {
      const newEmotions = [...prev];
      newEmotions[index] = { ...newEmotions[index], [field]: value };
      return newEmotions;
    });
  };
  
  // 感情を削除する関数
  const removeEmotion = (index: number) => {
    setTemporaryEmotions(prev => prev.filter((_, i) => i !== index));
  };
  
  // 特技のクリックハンドラ（ダメージ状態の切り替え）
  const handleSkillClick = (skillName: string) => {
    if (!selectedSkillNames.has(skillName)) return; // 選択されていない特技はクリック不可
    
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
  
  // 生命点の計算（初期HP - ダメージ数）
  const baseHp = sheetData.hp !== undefined ? sheetData.hp : 6;
  const currentHp = Math.max(0, baseHp - damagedSkills.size);
  
  // 特定のセクションのみを表示する場合
  if (showLeftColumn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 流派セクション */}
        {(sheetData.school || sheetData.rank || sheetData.ryuugi || sheetData.surfaceFace || sheetData.shinnen || sheetData.koseki !== undefined) && (
          <section style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>
              流派
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {sheetData.school && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流派</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.school}</div>
                </div>
              )}
              {sheetData.rank && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>階級</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.rank}</div>
                </div>
              )}
              {sheetData.surfaceFace && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>表の顔</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.surfaceFace}</div>
                </div>
              )}
              {sheetData.shinnen && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>信念</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.shinnen}</div>
                </div>
              )}
              {sheetData.koseki !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>功績点</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.koseki}</div>
                </div>
              )}
              {sheetData.ryuugi && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流儀</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{sheetData.ryuugi}</div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    );
  }
  
  if (showRightColumn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 忍法セクション */}
        {(sheetData.ninpo || []).length > 0 && (
          <CollapsibleSection title="忍法" defaultOpen={true}>
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
                  <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem', color: '#007bff' }}>
                    {ninpo.name || '(無名の忍法)'}
                  </h3>
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
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 奥義セクション */}
        {(sheetData.okugi || []).length > 0 && (
          <CollapsibleSection title="奥義" defaultOpen={true}>
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
                  <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem', color: '#007bff' }}>
                    {okugi.name || '(無名の奥義)'}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>指定特技</div>
                      <div style={{ fontWeight: 'bold' }}>{okugi.skill || '-'}</div>
                    </div>
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
          </CollapsibleSection>
        )}

        {/* 忍具セクション */}
        {sheetData.ningu && (sheetData.ningu.heiryomaru > 0 || sheetData.ningu.jintsumaru > 0 || sheetData.ningu.tonkofu > 0) && (
          <CollapsibleSection title="忍具" defaultOpen={true}>
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
          </CollapsibleSection>
        )}

        {/* 背景セクション */}
        {sheetData.background && (
          <CollapsibleSection title="背景" defaultOpen={false}>
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
          </CollapsibleSection>
        )}

        {/* メモセクション */}
        {sheetData.memo && (
          <CollapsibleSection title="メモ" defaultOpen={false}>
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
          </CollapsibleSection>
        )}
      </div>
    );
  }
  
  if (showSkills) {
    return (
      <>
        {/* 特技セクション（2カラムの下に表示） */}
        {sheetData.school && sheetData.skills.length > 0 && (
          <section style={{
            padding: '1.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>
              特技
            </h2>
            
            {/* 生命点（HP）と変調 */}
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #dee2e6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* 左側: 生命点 */}
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命点（HP）</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentHp <= 2 ? '#dc3545' : currentHp <= 4 ? '#ffc107' : '#28a745' }}>
                  {currentHp} / 6
                </div>
              </div>
              {/* 右側: 変調 */}
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>変調</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  {HENCHO_OPTIONS.map((hencho) => {
                    const isChecked = (sheetData.hencho || []).includes(hencho);
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
                          readOnly
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{hencho}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* 感情の欄 */}
            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #dee2e6' }}>
              <div style={{ fontSize: '0.875rem', color: '#dc3545', marginBottom: '0.5rem', fontWeight: 'bold', padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                ⚠️ 注意: ここで追加した感情は一時的なもので、データベースに保存されません。ページをリロードすると消えます。
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: 'bold' }}>感情</div>
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
                {/* 元の感情データ（読み取り専用） */}
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
                {/* 一時的な感情データ（編集可能） */}
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
                {/* 感情が一つもない場合のメッセージ */}
                {displayEmotions.length === 0 && (
                  <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
                    感情が登録されていません。「+ 感情を追加」ボタンで追加できます。
                  </div>
                )}
              </div>
            </div>
            
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
          </section>
        )}
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {useTwoColumn ? (
        <>
          {/* 2カラムレイアウト（PC画面のみ） */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            alignItems: 'start',
          }}>
            {/* 左カラム: 流派情報、能力値 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 流派セクション */}
              {(sheetData.school || sheetData.rank || sheetData.ryuugi || sheetData.surfaceFace || sheetData.shinnen || sheetData.koseki !== undefined) && (
                <section style={{
                  padding: '1.5rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>
                    流派
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {sheetData.school && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流派</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.school}</div>
                      </div>
                    )}
                    {sheetData.rank && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>階級</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.rank}</div>
                      </div>
                    )}
                    {sheetData.surfaceFace && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>表の顔</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.surfaceFace}</div>
                      </div>
                    )}
                    {sheetData.shinnen && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>信念</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.shinnen}</div>
                      </div>
                    )}
                    {sheetData.koseki !== undefined && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>功績点</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.koseki}</div>
                      </div>
                    )}
                    {sheetData.ryuugi && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流儀</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{sheetData.ryuugi}</div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* 右カラム: 忍法、奥義、忍具、背景、メモ（折りたたみ可能） */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* 忍法セクション */}
              {(sheetData.ninpo || []).length > 0 && (
                <CollapsibleSection title="忍法" defaultOpen={true}>
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
                        <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem', color: '#007bff' }}>
                          {ninpo.name || '(無名の忍法)'}
                        </h3>
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
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* 奥義セクション */}
              {(sheetData.okugi || []).length > 0 && (
                <CollapsibleSection title="奥義" defaultOpen={true}>
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
                        <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem', color: '#007bff' }}>
                          {okugi.name || '(無名の奥義)'}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>指定特技</div>
                            <div style={{ fontWeight: 'bold' }}>{okugi.skill || '-'}</div>
                          </div>
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
                </CollapsibleSection>
              )}

              {/* 忍具セクション */}
              {sheetData.ningu && (sheetData.ningu.heiryomaru > 0 || sheetData.ningu.jintsumaru > 0 || sheetData.ningu.tonkofu > 0) && (
                <CollapsibleSection title="忍具" defaultOpen={true}>
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
                </CollapsibleSection>
              )}

              {/* 背景セクション */}
              {sheetData.background && (
                <CollapsibleSection title="背景" defaultOpen={false}>
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
                </CollapsibleSection>
              )}

              {/* メモセクション */}
              {sheetData.memo && (
                <CollapsibleSection title="メモ" defaultOpen={false}>
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
                </CollapsibleSection>
              )}
            </div>
          </div>

          {/* 特技セクション（2カラムの下に表示） */}
          {sheetData.school && sheetData.skills.length > 0 && (
            <section style={{
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}>
              <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>
                特技
              </h2>
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
                            const isSelected = selectedSkillNames.has(skillName);
                            return (
                              <td
                                key={colIndex}
                                style={{
                                  padding: '0.5rem',
                                  border: '1px solid #ddd',
                                  backgroundColor: isSelected ? '#d4edda' : '#fff',
                                  textAlign: 'center',
                                  fontWeight: isSelected ? 'bold' : 'normal',
                                }}
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
              {/* 選択された特技の詳細 */}
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
            </section>
          )}
        </>
      ) : (
        <>
          {/* 1カラムレイアウト（タブレット・スマートフォン） */}
          {/* 流派セクション */}
          {(sheetData.school || sheetData.rank || sheetData.ryuugi || sheetData.surfaceFace || sheetData.shinnen || sheetData.koseki !== undefined) && (
            <section>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
                流派
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {sheetData.school && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流派</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.school}</div>
                  </div>
                )}
                {sheetData.rank && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>階級</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.rank}</div>
                  </div>
                )}
                {sheetData.surfaceFace && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>表の顔</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.surfaceFace}</div>
                  </div>
                )}
                {sheetData.shinnen && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>信念</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.shinnen}</div>
                  </div>
                )}
                {sheetData.koseki !== undefined && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>功績点</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.koseki}</div>
                  </div>
                )}
                {sheetData.ryuugi && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流儀</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold', whiteSpace: 'pre-wrap' }}>{sheetData.ryuugi}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 特技セクション */}
          {sheetData.school && sheetData.skills.length > 0 && (
            <section>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
                  特技
                </h2>
                
                {/* 生命点（HP）と変調 */}
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* 左側: 生命点 */}
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命点（HP）</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: currentHp <= 2 ? '#dc3545' : currentHp <= 4 ? '#ffc107' : '#28a745' }}>
                      {currentHp} / 6
                    </div>
                  </div>
                  {/* 右側: 変調 */}
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>変調</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      {HENCHO_OPTIONS.map((hencho) => {
                        const isChecked = (sheetData.hencho || []).includes(hencho);
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
                              readOnly
                              style={{ cursor: 'pointer' }}
                            />
                            <span>{hencho}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* 感情の欄 */}
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                  <div style={{ fontSize: '0.875rem', color: '#dc3545', marginBottom: '0.5rem', fontWeight: 'bold', padding: '0.5rem', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                    ⚠️ 注意: ここで追加した感情は一時的なもので、データベースに保存されません。ページをリロードすると消えます。
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: 'bold' }}>感情</div>
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
                    {/* 元の感情データ（読み取り専用） */}
                    {(sheetData.emotions || []).map((emotion, index) => (
                      <div
                        key={`original-${index}`}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: '#fff',
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
                    {/* 一時的な感情データ（編集可能） */}
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
                    {/* 感情が一つもない場合のメッセージ */}
                    {displayEmotions.length === 0 && (
                      <div style={{ padding: '0.75rem', textAlign: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
                        感情が登録されていません。「+ 感情を追加」ボタンで追加できます。
                      </div>
                    )}
                  </div>
                </div>
                
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
              </section>
            )}

          {/* 忍法セクション */}
          {(sheetData.ninpo || []).length > 0 && (
            <section>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
                忍法
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(sheetData.ninpo || []).map((ninpo, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem' }}>
                      {ninpo.name || '(無名の忍法)'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>タイプ</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.type || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>指定特技</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.skill || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>間合い</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.range || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>コスト</div>
                        <div style={{ fontWeight: 'bold' }}>{ninpo.cost || '-'}</div>
                      </div>
                      {ninpo.page && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>参照ページ</div>
                          <div style={{ fontWeight: 'bold' }}>{ninpo.page}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 奥義セクション */}
          {(sheetData.okugi || []).length > 0 && (
            <section>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
                奥義
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(sheetData.okugi || []).map((okugi, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem' }}>
                      {okugi.name || '(無名の奥義)'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>指定特技</div>
                        <div style={{ fontWeight: 'bold' }}>{okugi.skill || '-'}</div>
                      </div>
                      {okugi.effect && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>効果</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.effect}</div>
                        </div>
                      )}
                      {okugi.strength && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>強み</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.strength}</div>
                        </div>
                      )}
                      {okugi.weakness && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>弱み</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.weakness}</div>
                        </div>
                      )}
                      {okugi.memo && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>メモ</div>
                          <div style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{okugi.memo}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 忍具セクション */}
          {sheetData.ningu && (sheetData.ningu.heiryomaru > 0 || sheetData.ningu.jintsumaru > 0 || sheetData.ningu.tonkofu > 0) && (
            <section>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
                忍具
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>兵糧丸</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.ningu.heiryomaru}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>神通丸</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.ningu.jintsumaru}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>遁甲符</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.ningu.tonkofu}</div>
                </div>
              </div>
            </section>
          )}

          {/* その他セクション */}
          {(sheetData.background || sheetData.memo) && (
            <section>
              <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
                その他
              </h2>
              {sheetData.background && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>背景</h3>
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                    }}
                  >
                    {sheetData.background}
                  </div>
                </div>
              )}
              {sheetData.memo && (
                <div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>メモ</h3>
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f8f9fa',
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
            </section>
          )}
        </>
      )}
    </div>
  );
};

