import { useState, useEffect } from 'react';
import type { CthulhuSheetData, CthulhuSkill } from '../types/cthulhu';
import { normalizeSheetData, type CthulhuSystem } from '../utils/cthulhu';
import { CollapsibleSection } from './CollapsibleSection';

interface CthulhuSheetViewProps {
  data: CthulhuSheetData;
  system?: CthulhuSystem;
  showOnlyAttributes?: boolean;
  showOnlySkills?: boolean;
  showOnlySkillsAndItems?: boolean;
  showOnlyOther?: boolean;
}

export const CthulhuSheetView = ({ data, system = 'cthulhu6', showOnlyAttributes, showOnlySkills, showOnlySkillsAndItems, showOnlyOther }: CthulhuSheetViewProps) => {
  const sheetData = normalizeSheetData(data, system);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const attributeLabels: Record<keyof typeof sheetData.attributes, string> = {
    STR: 'STR (筋力)',
    CON: 'CON (体力)',
    POW: 'POW (精神力)',
    DEX: 'DEX (敏捷性)',
    APP: 'APP (外見)',
    INT: 'INT (知性)',
    EDU: 'EDU (教育)',
    SIZ: 'SIZ (体格)',
    LUK: 'LUK (幸運)',
  };

  // 初期値と変わっていない技能をフィルタリング
  const filterUnchangedSkills = (skills: CthulhuSkill[]): CthulhuSkill[] => {
    return skills.filter(skill => {
      const total = skill.total ?? skill.baseValue ?? 0;
      const baseValue = skill.baseValue ?? 0;
      return total !== baseValue;
    });
  };

  const formatSkillName = (skill: CthulhuSkill): string => {
    const suffix = (skill.specialty || '').trim();
    return suffix ? `${skill.name}(${suffix})` : skill.name;
  };

  const filteredSkills = filterUnchangedSkills(sheetData.skills);
  const filteredCombatSkills = sheetData.combatSkills 
    ? filterUnchangedSkills(sheetData.combatSkills)
    : [];

  // 能力値・派生値のみ表示
  if (showOnlyAttributes) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* 能力値セクション */}
        <CollapsibleSection title="能力値" defaultOpen={true}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              {(Object.keys(sheetData.attributes) as Array<keyof typeof sheetData.attributes>).map((key) => (
                <div key={key}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                    {attributeLabels[key]}
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.attributes[key]}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* 派生値セクション */}
          <CollapsibleSection title="派生値" defaultOpen={true}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (現在)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.SAN_current}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (最大)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.SAN_max}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (現在)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.HP_current}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (最大)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.HP_max}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (現在)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.MP_current}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (最大)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.MP_max}
                </div>
              </div>
              {sheetData.derived.IDEA !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>アイデア</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.IDEA}
                  </div>
                </div>
              )}
              {sheetData.derived.KNOW !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>知識</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.KNOW}
                  </div>
                </div>
              )}
              {sheetData.derived.LUCK !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>幸運</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.LUCK}
                  </div>
                </div>
              )}
              {sheetData.derived.DB && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>ダメージボーナス</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.DB}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>
      );
    }

  // 技能・格闘技能のみ表示
  if (showOnlySkills) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* 技能セクション */}
        {(filteredSkills.length > 0 || (sheetData.customSkills && sheetData.customSkills.length > 0)) && (
          <CollapsibleSection title="技能" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {/* デフォルト技能（初期値と変わっているもののみ） */}
                {filteredSkills.map((skill, index) => (
                  <div key={`default-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
                {/* 追加技能 */}
                {(sheetData.customSkills || []).map((skill, index) => (
                  <div key={`custom-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{skill.name ? formatSkillName(skill) : '(無名)'}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 格闘技能セクション */}
          {filteredCombatSkills.length > 0 && (
            <CollapsibleSection title="格闘技能" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {filteredCombatSkills.map((skill, index) => (
                  <div key={`combat-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      );
    }

  // 技能・格闘技能・武器・所持品を表示
  if (showOnlySkillsAndItems) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {/* 技能セクション */}
        {(filteredSkills.length > 0 || (sheetData.customSkills && sheetData.customSkills.length > 0)) && (
          <CollapsibleSection title="技能" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {/* デフォルト技能（初期値と変わっているもののみ） */}
                {filteredSkills.map((skill, index) => (
                  <div key={`default-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
                {/* 追加技能 */}
                {(sheetData.customSkills || []).map((skill, index) => (
                  <div key={`custom-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{skill.name ? formatSkillName(skill) : '(無名)'}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 格闘技能セクション */}
          {filteredCombatSkills.length > 0 && (
            <CollapsibleSection title="格闘技能" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {filteredCombatSkills.map((skill, index) => (
                  <div key={`combat-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 武器セクション */}
          {(sheetData.weapons || []).length > 0 && (
            <CollapsibleSection title="武器" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1rem' 
              }}>
                {(sheetData.weapons || []).map((weapon, index) => (
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
                      {weapon.name || '(無名の武器)'}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>技能値</div>
                        <div style={{ fontWeight: 'bold' }}>{weapon.value}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>ダメージ</div>
                        <div style={{ fontWeight: 'bold' }}>{weapon.damage || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>射程</div>
                        <div style={{ fontWeight: 'bold' }}>{weapon.range || '-'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>攻撃回数</div>
                        <div style={{ fontWeight: 'bold' }}>{weapon.attacks}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>装弾数</div>
                        <div style={{ fontWeight: 'bold' }}>{weapon.ammo}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>故障</div>
                        <div style={{ fontWeight: 'bold' }}>{weapon.malfunction}</div>
                      </div>
                      {system !== 'cthulhu7' && (
                        <div>
                          <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>耐久力</div>
                          <div style={{ fontWeight: 'bold' }}>{weapon.durability}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 所持品セクション */}
          {(sheetData.items || []).length > 0 && (
            <CollapsibleSection title="所持品" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '0.75rem' 
              }}>
                {(sheetData.items || []).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {item.name || '(無名のアイテム)'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      数量: ×{item.quantity}
                    </div>
                    {item.detail && (
                      <div style={{ fontSize: '0.875rem', color: '#495057', marginTop: '0.5rem' }}>
                        {item.detail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      );
    }

  // その他のセクションのみ表示（武器・所持品を除く）
  if (showOnlyOther) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 財産セクション */}
        {(sheetData.cash || sheetData.assets) && (
          <CollapsibleSection title="財産" defaultOpen={false}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {sheetData.cash && (
                <div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>現金・財産</h3>
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
                    {sheetData.cash}
                  </div>
                </div>
              )}
              {sheetData.assets && (
                <div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>資産</h3>
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
                    {sheetData.assets}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* 通過したシナリオセクション */}
        {(sheetData.scenarios && sheetData.scenarios.length > 0) && (
          <CollapsibleSection title="通過したシナリオ" defaultOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sheetData.scenarios.map((scenario, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                    {scenario.name || '(無名のシナリオ)'}
                  </h3>
                  {scenario.memo && (
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        fontSize: '0.875rem',
                      }}
                    >
                      {scenario.memo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 第7版: バックストーリー（項目化 + キー・コネクション） */}
        {system === 'cthulhu7' && (
          <CollapsibleSection title="バックストーリー" defaultOpen={false}>
            {(() => {
              const fields: Array<{ key: string; label: string }> = [
                { key: 'appearance', label: '容姿の描写' },
                { key: 'traits', label: '特徴' },
                { key: 'beliefs', label: 'イデオロギー/信念' },
                { key: 'injuries', label: '負傷、傷跡' },
                { key: 'importantPeople', label: '重要な人々' },
                { key: 'phobiasManias', label: '恐怖症、マニア' },
                { key: 'meaningfulPlaces', label: '意味のある場所' },
                { key: 'treasuredPossessions', label: '秘蔵の品' },
              ];
              const entries = fields
                .map((f) => ({
                  ...f,
                  memo: (sheetData.backstory7 as any)?.[f.key]?.memo || '',
                  isKey: !!(sheetData.backstory7 as any)?.[f.key]?.isKey,
                }))
                .filter((f) => f.memo || f.isKey);

              const mythosSections = [
                { title: '魔導書', items: sheetData.mythosBooks || [] },
                { title: '呪文', items: sheetData.spells || [] },
                { title: 'アーティファクト', items: sheetData.artifacts || [] },
                { title: '遭遇した超自然の存在', items: sheetData.encounteredEntities || [] },
              ].filter((s) => (s.items || []).length > 0);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {entries.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {entries.map((e) => (
                        <div key={e.key} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                            {e.isKey ? `${e.label}🗝` : e.label}
                          </h3>
                          {e.memo && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                              {e.memo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {mythosSections.length > 0 && (
                    <div>
                      {mythosSections.map((sec) => (
                        <div key={sec.title} style={{ marginTop: '1rem' }}>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>{sec.title}</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {sec.items.map((it: any, idx: number) => (
                              <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                  {(it?.name || '(無名)') + (it?.isKey ? '🗝' : '')}
                                </h4>
                                {it?.memo && (
                                  <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                    {it.memo}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sheetData.notes && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>その他のメモ</h3>
                      <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {sheetData.notes}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CollapsibleSection>
        )}

        {/* 第6版: 既存セクション */}
        {system !== 'cthulhu7' && (
          <>
            {/* 魔導書・呪文・アーティファクト・遭遇した超自然の存在セクション */}
            {((sheetData.mythosBooks && sheetData.mythosBooks.length > 0) ||
              (sheetData.spells && sheetData.spells.length > 0) ||
              (sheetData.artifacts && sheetData.artifacts.length > 0) ||
              (sheetData.encounteredEntities && sheetData.encounteredEntities.length > 0)) && (
              <CollapsibleSection title="魔導書・呪文・アーティファクト・遭遇した超自然の存在" defaultOpen={false}>
                {/* 魔導書 */}
                {(sheetData.mythosBooks && sheetData.mythosBooks.length > 0) && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>魔導書</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {sheetData.mythosBooks.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '1rem',
                            backgroundColor: '#f8f9fa',
                          }}
                        >
                          <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                            {item.name || '(無名の魔導書)'}
                          </h4>
                          {item.memo && (
                            <div
                              style={{
                                padding: '0.75rem',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.6',
                                fontSize: '0.875rem',
                              }}
                            >
                              {item.memo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 呪文 */}
                {(sheetData.spells && sheetData.spells.length > 0) && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>呪文</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {sheetData.spells.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '1rem',
                            backgroundColor: '#f8f9fa',
                          }}
                        >
                          <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                            {item.name || '(無名の呪文)'}
                          </h4>
                          {item.memo && (
                            <div
                              style={{
                                padding: '0.75rem',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.6',
                                fontSize: '0.875rem',
                              }}
                            >
                              {item.memo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* アーティファクト */}
                {(sheetData.artifacts && sheetData.artifacts.length > 0) && (
                  <div>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>アーティファクト</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {sheetData.artifacts.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '1rem',
                            backgroundColor: '#f8f9fa',
                          }}
                        >
                          <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                            {item.name || '(無名のアーティファクト)'}
                          </h4>
                          {item.memo && (
                            <div
                              style={{
                                padding: '0.75rem',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.6',
                                fontSize: '0.875rem',
                              }}
                            >
                              {item.memo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 遭遇した超自然の存在 */}
                {(sheetData.encounteredEntities && sheetData.encounteredEntities.length > 0) && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>遭遇した超自然の存在</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {sheetData.encounteredEntities.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '1rem',
                            backgroundColor: '#f8f9fa',
                          }}
                        >
                          <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                            {item.name || '(無名の存在)'}
                          </h4>
                          {item.memo && (
                            <div
                              style={{
                                padding: '0.75rem',
                                backgroundColor: '#fff',
                                borderRadius: '4px',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.6',
                                fontSize: '0.875rem',
                              }}
                            >
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

            {/* 背景・その他セクション */}
            {(sheetData.backstory || sheetData.notes) && (
              <CollapsibleSection title="背景・その他" defaultOpen={false}>
                {sheetData.backstory && (
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
                      {sheetData.backstory}
                    </div>
                  </div>
                )}
                {sheetData.notes && (
                  <div>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>その他のメモ</h3>
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
                      {sheetData.notes}
                    </div>
                  </div>
                )}
              </CollapsibleSection>
            )}
          </>
        )}
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
        gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)',
        gap: '1.5rem',
      }}>
        {/* 左カラム: 能力値、派生値（PC画面のみ） */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* 能力値セクション */}
          <CollapsibleSection title="能力値" defaultOpen={true}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              {(Object.keys(sheetData.attributes) as Array<keyof typeof sheetData.attributes>).map((key) => (
                <div key={key}>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                    {attributeLabels[key]}
                  </div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.attributes[key]}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* 派生値セクション */}
          <CollapsibleSection title="派生値" defaultOpen={true}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '1rem' 
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (現在)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.SAN_current}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (最大)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.SAN_max}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (現在)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.HP_current}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (最大)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.HP_max}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (現在)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.MP_current}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (最大)</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                  {sheetData.derived.MP_max}
                </div>
              </div>
              {sheetData.derived.IDEA !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>アイデア</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.IDEA}
                  </div>
                </div>
              )}
              {sheetData.derived.KNOW !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>知識</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.KNOW}
                  </div>
                </div>
              )}
              {sheetData.derived.LUCK !== undefined && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>幸運</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.LUCK}
                  </div>
                </div>
              )}
              {sheetData.derived.DB && (
                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>ダメージボーナス</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                    {sheetData.derived.DB}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* 右カラム: 技能、格闘技能（PC画面のみ） */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          {/* 技能セクション */}
          {(filteredSkills.length > 0 || (sheetData.customSkills && sheetData.customSkills.length > 0)) && (
            <CollapsibleSection title="技能" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {/* デフォルト技能（初期値と変わっているもののみ） */}
                {filteredSkills.map((skill, index) => (
                  <div key={`default-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
                {/* 追加技能 */}
                {(sheetData.customSkills || []).map((skill, index) => (
                  <div key={`custom-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{skill.name ? formatSkillName(skill) : '(無名)'}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* 格闘技能セクション */}
          {filteredCombatSkills.length > 0 && (
            <CollapsibleSection title="格闘技能" defaultOpen={false}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {filteredCombatSkills.map((skill, index) => (
                  <div key={`combat-${index}`}>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{formatSkillName(skill)}</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
                      {skill.total ?? skill.baseValue ?? 0}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      </div>

      {/* 全幅セクション: 武器、所持品、その他 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 武器セクション */}
        {(sheetData.weapons || []).length > 0 && (
          <CollapsibleSection title="武器" defaultOpen={false}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1rem' 
            }}>
              {(sheetData.weapons || []).map((weapon, index) => (
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
                    {weapon.name || '(無名の武器)'}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>技能値</div>
                      <div style={{ fontWeight: 'bold' }}>{weapon.value}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>ダメージ</div>
                      <div style={{ fontWeight: 'bold' }}>{weapon.damage || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>射程</div>
                      <div style={{ fontWeight: 'bold' }}>{weapon.range || '-'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>攻撃回数</div>
                      <div style={{ fontWeight: 'bold' }}>{weapon.attacks}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>装弾数</div>
                      <div style={{ fontWeight: 'bold' }}>{weapon.ammo}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>故障</div>
                      <div style={{ fontWeight: 'bold' }}>{weapon.malfunction}</div>
                    </div>
                    {system !== 'cthulhu7' && (
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>耐久力</div>
                        <div style={{ fontWeight: 'bold' }}>{weapon.durability}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 所持品セクション */}
        {(sheetData.items || []).length > 0 && (
          <CollapsibleSection title="所持品" defaultOpen={false}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '0.75rem' 
            }}>
              {(sheetData.items || []).map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    {item.name || '(無名のアイテム)'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                    数量: ×{item.quantity}
                  </div>
                  {item.detail && (
                    <div style={{ fontSize: '0.875rem', color: '#495057', marginTop: '0.5rem' }}>
                      {item.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 財産セクション */}
        {(sheetData.cash || sheetData.assets) && (
          <CollapsibleSection title="財産" defaultOpen={false}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {sheetData.cash && (
                <div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>現金・財産</h3>
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
                    {sheetData.cash}
                  </div>
                </div>
              )}
              {sheetData.assets && (
                <div>
                  <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>資産</h3>
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
                    {sheetData.assets}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* 通過したシナリオセクション */}
        {(sheetData.scenarios && sheetData.scenarios.length > 0) && (
          <CollapsibleSection title="通過したシナリオ" defaultOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sheetData.scenarios.map((scenario, index) => (
                <div
                  key={index}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                    {scenario.name || '(無名のシナリオ)'}
                  </h3>
                  {scenario.memo && (
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        fontSize: '0.875rem',
                      }}
                    >
                      {scenario.memo}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* 第7版: バックストーリー（項目化 + キー・コネクション） */}
        {system === 'cthulhu7' && (
          <CollapsibleSection title="バックストーリー" defaultOpen={false}>
            {(() => {
              const fields: Array<{ key: string; label: string }> = [
                { key: 'appearance', label: '容姿の描写' },
                { key: 'traits', label: '特徴' },
                { key: 'beliefs', label: 'イデオロギー/信念' },
                { key: 'injuries', label: '負傷、傷跡' },
                { key: 'importantPeople', label: '重要な人々' },
                { key: 'phobiasManias', label: '恐怖症、マニア' },
                { key: 'meaningfulPlaces', label: '意味のある場所' },
                { key: 'treasuredPossessions', label: '秘蔵の品' },
              ];
              const entries = fields
                .map((f) => ({
                  ...f,
                  memo: (sheetData.backstory7 as any)?.[f.key]?.memo || '',
                  isKey: !!(sheetData.backstory7 as any)?.[f.key]?.isKey,
                }))
                .filter((f) => f.memo || f.isKey);

              const mythosSections = [
                { title: '魔導書', items: sheetData.mythosBooks || [] },
                { title: '呪文', items: sheetData.spells || [] },
                { title: 'アーティファクト', items: sheetData.artifacts || [] },
                { title: '遭遇した超自然の存在', items: sheetData.encounteredEntities || [] },
              ].filter((s) => (s.items || []).length > 0);

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {entries.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                      {entries.map((e) => (
                        <div key={e.key} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
                          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                            {e.isKey ? `${e.label}🗝` : e.label}
                          </h3>
                          {e.memo && (
                            <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                              {e.memo}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {mythosSections.length > 0 && (
                    <div>
                      {mythosSections.map((sec) => (
                        <div key={sec.title} style={{ marginTop: '1rem' }}>
                          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>{sec.title}</h3>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                            {sec.items.map((it: any, idx: number) => (
                              <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
                                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                                  {(it?.name || '(無名)') + (it?.isKey ? '🗝' : '')}
                                </h4>
                                {it?.memo && (
                                  <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.875rem' }}>
                                    {it.memo}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sheetData.notes && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>その他のメモ</h3>
                      <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {sheetData.notes}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CollapsibleSection>
        )}

        {/* 魔導書・呪文・アーティファクト・遭遇した超自然の存在セクション */}
        {system !== 'cthulhu7' && ((sheetData.mythosBooks && sheetData.mythosBooks.length > 0) ||
          (sheetData.spells && sheetData.spells.length > 0) ||
          (sheetData.artifacts && sheetData.artifacts.length > 0) ||
          (sheetData.encounteredEntities && sheetData.encounteredEntities.length > 0)) && (
          <CollapsibleSection title="魔導書・呪文・アーティファクト・遭遇した超自然の存在" defaultOpen={false}>
            {/* 魔導書 */}
            {(sheetData.mythosBooks && sheetData.mythosBooks.length > 0) && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>魔導書</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {sheetData.mythosBooks.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                        {item.name || '(無名の魔導書)'}
                      </h4>
                      {item.memo && (
                        <div
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            fontSize: '0.875rem',
                          }}
                        >
                          {item.memo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 呪文 */}
            {(sheetData.spells && sheetData.spells.length > 0) && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>呪文</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {sheetData.spells.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                        {item.name || '(無名の呪文)'}
                      </h4>
                      {item.memo && (
                        <div
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            fontSize: '0.875rem',
                          }}
                        >
                          {item.memo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* アーティファクト */}
            {(sheetData.artifacts && sheetData.artifacts.length > 0) && (
              <div>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>アーティファクト</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {sheetData.artifacts.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                        {item.name || '(無名のアーティファクト)'}
                      </h4>
                      {item.memo && (
                        <div
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            fontSize: '0.875rem',
                          }}
                        >
                          {item.memo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 遭遇した超自然の存在 */}
            {(sheetData.encounteredEntities && sheetData.encounteredEntities.length > 0) && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>遭遇した超自然の存在</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {sheetData.encounteredEntities.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '1rem',
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                        {item.name || '(無名の存在)'}
                      </h4>
                      {item.memo && (
                        <div
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            fontSize: '0.875rem',
                          }}
                        >
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

        {/* 背景・その他セクション */}
        {system !== 'cthulhu7' && (sheetData.backstory || sheetData.notes) && (
          <CollapsibleSection title="背景・その他" defaultOpen={false}>
            {sheetData.backstory && (
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
                  {sheetData.backstory}
                </div>
              </div>
            )}
            {sheetData.notes && (
              <div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>その他のメモ</h3>
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
                  {sheetData.notes}
                </div>
              </div>
            )}
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
};
