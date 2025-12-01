import { useState, useEffect } from 'react';
import type { Sw25SheetData } from '../types/sw25';
import { normalizeSheetData } from '../utils/sw25';
import { getRaceByName, getClassByName } from '../data/sw25';
import { CollapsibleSection } from './CollapsibleSection';

interface Sw25SheetViewProps {
  data: Sw25SheetData;
  isDesktop?: boolean;
  showLeftColumn?: boolean;
  showRightColumn?: boolean;
  showSkills?: boolean;
}

export const Sw25SheetView = ({ 
  data, 
  isDesktop = false,
  showLeftColumn = false,
  showRightColumn = false,
  showSkills = false,
}: Sw25SheetViewProps) => {
  const sheetData = normalizeSheetData(data);
  const [internalIsDesktop, setInternalIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setInternalIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const useDesktop = isDesktop || internalIsDesktop;
  const useTwoColumn = useDesktop;

  // 冒険者レベルの計算（全技能レベルの合計）
  const totalLevel = sheetData.classes.reduce((sum, cls) => sum + cls.level, 0);

  // 魔法を系統ごとにグループ化
  const magicsBySystem = sheetData.magics.reduce((acc, magic) => {
    const system = magic.system || 'その他';
    if (!acc[system]) {
      acc[system] = [];
    }
    acc[system].push(magic);
    return acc;
  }, {} as Record<string, typeof sheetData.magics>);

  // 特定のセクションのみを表示する場合
  if (showLeftColumn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 基本情報セクション */}
        <CollapsibleSection title="基本情報" defaultOpen={true}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {sheetData.playerName && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>プレイヤー名</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
              </div>
            )}
            {sheetData.characterName && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>キャラクター名</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.characterName}</div>
              </div>
            )}
            {sheetData.race && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>種族</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.race}</div>
              </div>
            )}
            {sheetData.birth && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生まれ</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.birth}</div>
              </div>
            )}
            {sheetData.age !== undefined && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>年齢</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
              </div>
            )}
            {sheetData.gender && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>性別</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
              </div>
            )}
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
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>冒険者レベル</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalLevel}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>技</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.技}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>体</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.体}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>心</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.心}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>器用度</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.器用度}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>敏捷度</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.敏捷度}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>筋力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.筋力}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命力}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>知力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.知力}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神力}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.HP}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.MP}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命抵抗力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命抵抗力}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神抵抗力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神抵抗力}</div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    );
  }

  // 通常表示（すべて表示）
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* レスポンシブ対応: PC画面では2カラム、それ以外は1カラム */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: useTwoColumn ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)',
        gap: '1.5rem',
      }}>
        {/* 左カラム: 基本情報、能力値（PC画面のみ） */}
        {useTwoColumn && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {/* 基本情報セクション */}
            <CollapsibleSection title="基本情報" defaultOpen={true}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {sheetData.playerName && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>プレイヤー名</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
                  </div>
                )}
                {sheetData.characterName && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>キャラクター名</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.characterName}</div>
                  </div>
                )}
                {sheetData.race && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>種族</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.race}</div>
                  </div>
                )}
                {sheetData.birth && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生まれ</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.birth}</div>
                  </div>
                )}
                {sheetData.age !== undefined && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>年齢</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
                  </div>
                )}
                {sheetData.gender && (
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>性別</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
                  </div>
                )}
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
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>冒険者レベル</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalLevel}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>技</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.技}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>体</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.体}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>心</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.心}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>器用度</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.器用度}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>敏捷度</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.敏捷度}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>筋力</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.筋力}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命力</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命力}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>知力</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.知力}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神力</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神力}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.HP}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.MP}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命抵抗力</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命抵抗力}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神抵抗力</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神抵抗力}</div>
                </div>
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* 右カラム: 技能、戦闘特技、魔法・スキル、装備、その他 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* 技能セクション */}
          <CollapsibleSection title="技能" defaultOpen={true}>
            {sheetData.classes.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
                技能が登録されていません
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sheetData.classes.map((cls, index) => {
                  const classData = getClassByName(cls.name);
                  return (
                    <div key={index} style={{ 
                      padding: '0.75rem', 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{cls.name}</div>
                          {classData && (
                            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem' }}>
                              {classData.category}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#007bff' }}>
                          Lv.{cls.level}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>

          {/* 戦闘特技セクション */}
          {sheetData.skills.length > 0 && (
            <CollapsibleSection title="戦闘特技" defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sheetData.skills.map((skill, index) => (
                  <div key={index} style={{ 
                    padding: '0.75rem', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {skill.name}
                    </div>
                    {skill.effect && (
                      <div style={{ fontSize: '0.875rem', color: '#495057', marginBottom: '0.25rem' }}>
                        {skill.effect}
                      </div>
                    )}
                    {skill.memo && (
                      <div style={{ fontSize: '0.875rem', color: '#6c757d', fontStyle: 'italic' }}>
                        {skill.memo}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 魔法・スキルセクション */}
          {sheetData.magics.length > 0 && (
            <CollapsibleSection title="魔法・スキル" defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(magicsBySystem).map(([system, magics]) => (
                  <div key={system}>
                    <h4 style={{ 
                      marginBottom: '0.75rem', 
                      fontSize: '1rem', 
                      fontWeight: 'bold',
                      borderBottom: '1px solid #dee2e6',
                      paddingBottom: '0.25rem',
                    }}>
                      {system}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {magics.map((magic, index) => (
                        <div key={index} style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#f8f9fa', 
                          borderRadius: '4px',
                          border: '1px solid #dee2e6',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                              {magic.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#007bff', fontWeight: 'bold' }}>
                              MP: {magic.cost}
                            </div>
                          </div>
                          {magic.effect && (
                            <div style={{ fontSize: '0.875rem', color: '#495057', marginBottom: '0.25rem' }}>
                              {magic.effect}
                            </div>
                          )}
                          {magic.memo && (
                            <div style={{ fontSize: '0.875rem', color: '#6c757d', fontStyle: 'italic' }}>
                              {magic.memo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 装備セクション */}
          {(sheetData.weapons.length > 0 || sheetData.armors.length > 0 || sheetData.items.length > 0) && (
            <CollapsibleSection title="装備" defaultOpen={false}>
              {/* 武器 */}
              {sheetData.weapons.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    marginBottom: '0.75rem', 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    borderBottom: '1px solid #dee2e6',
                    paddingBottom: '0.25rem',
                  }}>
                    武器
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sheetData.weapons.map((weapon, index) => (
                      <div key={index} style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                      }}>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          {weapon.name}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.875rem' }}>
                          <div>
                            <span style={{ color: '#6c757d' }}>命中力: </span>
                            <span style={{ fontWeight: 'bold' }}>{weapon.hit}</span>
                          </div>
                          <div>
                            <span style={{ color: '#6c757d' }}>ダメージ: </span>
                            <span style={{ fontWeight: 'bold' }}>{weapon.damage}</span>
                          </div>
                        </div>
                        {weapon.memo && (
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', fontStyle: 'italic', marginTop: '0.5rem' }}>
                            {weapon.memo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 防具 */}
              {sheetData.armors.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    marginBottom: '0.75rem', 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    borderBottom: '1px solid #dee2e6',
                    paddingBottom: '0.25rem',
                  }}>
                    防具
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sheetData.armors.map((armor, index) => (
                      <div key={index} style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                      }}>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          {armor.name}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>
                          <span style={{ color: '#6c757d' }}>防護点: </span>
                          <span style={{ fontWeight: 'bold' }}>{armor.defense}</span>
                        </div>
                        {armor.memo && (
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', fontStyle: 'italic', marginTop: '0.5rem' }}>
                            {armor.memo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* アイテム */}
              {sheetData.items.length > 0 && (
                <div>
                  <h4 style={{ 
                    marginBottom: '0.75rem', 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    borderBottom: '1px solid #dee2e6',
                    paddingBottom: '0.25rem',
                  }}>
                    アイテム
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sheetData.items.map((item, index) => (
                      <div key={index} style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            数量: {item.quantity}
                          </div>
                        </div>
                        {item.memo && (
                          <div style={{ fontSize: '0.875rem', color: '#6c757d', fontStyle: 'italic', marginTop: '0.5rem' }}>
                            {item.memo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleSection>
          )}

          {/* その他セクション */}
          {(sheetData.background || sheetData.memo) && (
            <CollapsibleSection title="その他" defaultOpen={false}>
              {sheetData.background && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ 
                    marginBottom: '0.75rem', 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    borderBottom: '1px solid #dee2e6',
                    paddingBottom: '0.25rem',
                  }}>
                    背景・経歴
                  </h4>
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                  }}>
                    {sheetData.background}
                  </div>
                </div>
              )}
              {sheetData.memo && (
                <div>
                  <h4 style={{ 
                    marginBottom: '0.75rem', 
                    fontSize: '1rem', 
                    fontWeight: 'bold',
                    borderBottom: '1px solid #dee2e6',
                    paddingBottom: '0.25rem',
                  }}>
                    メモ
                  </h4>
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                  }}>
                    {sheetData.memo}
                  </div>
                </div>
              )}
            </CollapsibleSection>
          )}
        </div>
      </div>

      {/* モバイル表示: 基本情報と能力値（1カラム表示時） */}
      {!useTwoColumn && (
        <>
          {/* 基本情報セクション */}
          <CollapsibleSection title="基本情報" defaultOpen={true}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {sheetData.playerName && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>プレイヤー名</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
                </div>
              )}
              {sheetData.characterName && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>キャラクター名</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.characterName}</div>
                </div>
              )}
              {sheetData.race && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>種族</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.race}</div>
                </div>
              )}
              {sheetData.birth && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生まれ</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.birth}</div>
                </div>
              )}
              {sheetData.age !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>年齢</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.age}</div>
                </div>
              )}
              {sheetData.gender && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>性別</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
                </div>
              )}
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
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>冒険者レベル</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalLevel}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>技</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.技}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>体</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.体}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>心</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.abilities.心}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>器用度</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.器用度}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>敏捷度</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.敏捷度}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>筋力</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.筋力}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命力</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命力}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>知力</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.知力}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神力</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神力}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.HP}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.MP}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命抵抗力</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命抵抗力}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神抵抗力</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神抵抗力}</div>
              </div>
            </div>
          </CollapsibleSection>
        </>
      )}
    </div>
  );
};

