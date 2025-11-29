import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData } from '../utils/cthulhu';

interface CthulhuSheetViewProps {
  data: CthulhuSheetData;
}

export const CthulhuSheetView = ({ data }: CthulhuSheetViewProps) => {
  const sheetData = normalizeSheetData(data);

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
      {/* 基本情報セクション */}
      {(sheetData.playerName || sheetData.occupation || sheetData.age || sheetData.gender || sheetData.birthplace) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            基本情報
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {sheetData.playerName && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>プレイヤー名</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.playerName}</div>
              </div>
            )}
            {sheetData.occupation && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>職業</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.occupation}</div>
              </div>
            )}
            {sheetData.age && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>年齢</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.age}</div>
              </div>
            )}
            {sheetData.gender && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>性別</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.gender}</div>
              </div>
            )}
            {sheetData.birthplace && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>出身地</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.birthplace}</div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 能力値セクション */}
      <section>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
          能力値
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {(Object.keys(sheetData.attributes) as Array<keyof typeof sheetData.attributes>).map((key) => (
            <div key={key}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                {attributeLabels[key]}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {sheetData.attributes[key]}
              </div>
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
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (現在)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.SAN_current}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>SAN (最大)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.SAN_max}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (現在)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.HP_current}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP (最大) ((CON+SIZ)/2)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.HP_max}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (現在)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.MP_current}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP (最大) (POW×1)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.MP_max}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>アイデア (INT×5)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.IDEA || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>知識 (EDU×5)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.KNOW || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>幸運 (POW×5)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.LUCK || 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>ダメージボーナス</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
              {sheetData.derived.DB || '+0'}
            </div>
          </div>
        </div>
      </section>

      {/* 技能セクション */}
      {((sheetData.skills && sheetData.skills.length > 0) || (sheetData.customSkills && sheetData.customSkills.length > 0)) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            技能
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {/* デフォルト技能 */}
            {sheetData.skills.map((skill, index) => (
              <div
                key={`default-${index}`}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{skill.name}</div>
                <div style={{ fontSize: '1.25rem', color: '#007bff' }}>{skill.total || skill.baseValue || 0}</div>
              </div>
            ))}
            {/* 追加技能 */}
            {(sheetData.customSkills || []).map((skill, index) => (
              <div
                key={`custom-${index}`}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#fffbf0',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{skill.name || '(無名)'}</div>
                <div style={{ fontSize: '1.25rem', color: '#007bff' }}>{skill.total || skill.baseValue || 0}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 格闘技能セクション */}
      {(sheetData.combatSkills && sheetData.combatSkills.length > 0) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            格闘技能
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {sheetData.combatSkills.map((skill, index) => (
              <div
                key={`combat-${index}`}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f0f8ff',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{skill.name}</div>
                <div style={{ fontSize: '1.25rem', color: '#007bff' }}>{skill.total || skill.baseValue || 0}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 武器セクション */}
      {(sheetData.weapons || []).length > 0 && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            武器
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sheetData.weapons.map((weapon, index) => (
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
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
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>耐久力</div>
                    <div style={{ fontWeight: 'bold' }}>{weapon.durability}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 所持品セクション */}
      {(sheetData.items || []).length > 0 && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            所持品
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sheetData.items.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 'bold', minWidth: '150px' }}>
                    {item.name || '(無名のアイテム)'}
                  </div>
                  <div style={{ color: '#6c757d', minWidth: '60px' }}>×{item.quantity}</div>
                  {item.detail && (
                    <div style={{ flex: 1, color: '#495057' }}>{item.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 財産セクション */}
      {(sheetData.cash || sheetData.assets) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            財産
          </h2>
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
        </section>
      )}

      {/* 通過したシナリオセクション */}
      {(sheetData.scenarios && sheetData.scenarios.length > 0) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            通過したシナリオ
          </h2>
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
        </section>
      )}

      {/* 魔導書・呪文・アーティファクトセクション */}
      {((sheetData.mythosBooks && sheetData.mythosBooks.length > 0) ||
        (sheetData.spells && sheetData.spells.length > 0) ||
        (sheetData.artifacts && sheetData.artifacts.length > 0)) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            魔導書・呪文・アーティファクト
          </h2>
          
          {/* 魔導書 */}
          {(sheetData.mythosBooks && sheetData.mythosBooks.length > 0) && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>魔導書</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
        </section>
      )}

      {/* 背景・その他セクション */}
      {(sheetData.backstory || sheetData.notes) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            背景・その他
          </h2>
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
        </section>
      )}
    </div>
  );
};

