import type { Sw25SheetData } from '../types/sw25';
import { normalizeSheetData } from '../utils/sw25';
import { getClassByName } from '../data/sw25';
import { Tabs } from './Tabs';

interface Sw25SheetViewProps {
  data: Sw25SheetData;
  isDesktop?: boolean;
  showLeftColumn?: boolean;
}

export const Sw25SheetView = ({ 
  data, 
  isDesktop = false,
  showLeftColumn = false,
}: Sw25SheetViewProps) => {
  const sheetData = normalizeSheetData(data);

  const totalLevel = sheetData.classes.reduce((sum, cls) => sum + cls.level, 0);

  const magicsBySystem = sheetData.magics.reduce((acc, magic) => {
    const system = magic.system || 'その他';
    if (!acc[system]) {
      acc[system] = [];
    }
    acc[system].push(magic);
    return acc;
  }, {} as Record<string, typeof sheetData.magics>);

  const getClassDerivedValues = (className: string, level: number) => {
    const classData = getClassByName(className);
    const derived: { label: string; value: string | number }[] = [];
    
    if (!classData) return derived;

    if (classData.category === '戦士系') {
      const dexBonus = Math.floor((sheetData.attributes.器用度 || 0) / 6);
      const hitPower = level + dexBonus;
      derived.push({ label: '命中力', value: hitPower });

      const agiBonus = Math.floor((sheetData.attributes.敏捷度 || 0) / 6);
      const evasion = level + agiBonus;
      derived.push({ label: '回避力', value: evasion });

      const strBonus = Math.floor((sheetData.attributes.筋力 || 0) / 6);
      derived.push({ label: '追加ダメージ', value: strBonus });
    }

    if (classData.category === '魔法系') {
      const intBonus = Math.floor((sheetData.attributes.知力 || 0) / 6);
      const spiBonus = Math.floor((sheetData.attributes.精神力 || 0) / 6);
      
      if (['ソーサラー', 'コンジャラー', 'マギテック'].includes(className)) {
        const magicPower = level + intBonus;
        derived.push({ label: '魔力', value: magicPower });
      } else if (['プリースト', 'フェアリーテイマー'].includes(className)) {
        const magicPower = level + spiBonus;
        derived.push({ label: '魔力', value: magicPower });
      }
    }

    if (classData.category === 'その他') {
      if (['スカウト', 'レンジャー'].includes(className)) {
        const dexBonus = Math.floor((sheetData.attributes.器用度 || 0) / 6);
        const intBonus = Math.floor((sheetData.attributes.知力 || 0) / 6);
        
        derived.push({ label: '技巧', value: level + dexBonus });
        derived.push({ label: '観察', value: level + intBonus });
      }
      
      if (className === 'セージ') {
        const intBonus = Math.floor((sheetData.attributes.知力 || 0) / 6);
        derived.push({ label: '知識', value: level + intBonus });
        derived.push({ label: '魔物知識', value: level + intBonus });
      }
    }

    return derived;
  };

  if (showLeftColumn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            能力値
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>冒険者レベル</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>{totalLevel}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>{sheetData.attributes.HP}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>{sheetData.attributes.MP}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
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
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命抵抗力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命抵抗力}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神抵抗力</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神抵抗力}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const attributesContent = (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>冒険者レベル</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalLevel}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>HP</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sheetData.attributes.HP}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>MP</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sheetData.attributes.MP}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
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
          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命抵抗力</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.生命抵抗力}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>精神抵抗力</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.attributes.精神抵抗力}</div>
        </div>
      </div>
    </div>
  );

  const classesContent = sheetData.classes.length === 0 ? (
    <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
      技能が登録されていません
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {sheetData.classes.map((cls, index) => {
        const classData = getClassByName(cls.name);
        const derivedValues = getClassDerivedValues(cls.name, cls.level);
        return (
          <div key={index} style={{ 
            padding: '1rem', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            border: '1px solid #dee2e6',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
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
            
            {derivedValues.length > 0 && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                gap: '0.5rem',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #dee2e6',
              }}>
                {derivedValues.map((derived, idx) => (
                  <div key={idx} style={{ 
                    padding: '0.5rem',
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                      {derived.label}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#495057' }}>
                      {derived.value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const skillsAndMagicsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {sheetData.skills.length > 0 && (
        <div>
          <h4 style={{ 
            marginBottom: '0.75rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '0.25rem',
          }}>
            戦闘特技
          </h4>
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
        </div>
      )}

      {sheetData.magics.length > 0 && (
        <div>
          <h4 style={{ 
            marginBottom: '0.75rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '0.25rem',
          }}>
            魔法・スキル
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(magicsBySystem).map(([system, magics]) => (
              <div key={system}>
                <h5 style={{ 
                  marginBottom: '0.75rem', 
                  fontSize: '0.875rem', 
                  fontWeight: 'bold',
                  borderBottom: '1px solid #dee2e6',
                  paddingBottom: '0.25rem',
                }}>
                  {system}
                </h5>
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
        </div>
      )}

      {sheetData.skills.length === 0 && sheetData.magics.length === 0 && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
          戦闘特技・魔法・スキルが登録されていません
        </div>
      )}
    </div>
  );

  const equipmentContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {sheetData.weapons.length > 0 && (
        <div>
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

      {sheetData.armors.length > 0 && (
        <div>
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

      {sheetData.accessories && sheetData.accessories.length > 0 && (
        <div>
          <h4 style={{ 
            marginBottom: '0.75rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '0.25rem',
          }}>
            装飾品
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sheetData.accessories.map((accessory, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                border: '1px solid #dee2e6',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {accessory.name}
                  </div>
                  {accessory.slot && (
                    <div style={{ fontSize: '0.75rem', color: '#6c757d', backgroundColor: '#e9ecef', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                      {accessory.slot}
                    </div>
                  )}
                </div>
                {accessory.effect && (
                  <div style={{ fontSize: '0.875rem', color: '#495057', marginBottom: '0.25rem' }}>
                    {accessory.effect}
                  </div>
                )}
                {accessory.memo && (
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', fontStyle: 'italic' }}>
                    {accessory.memo}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sheetData.money !== undefined && (
        <div>
          <h4 style={{ 
            marginBottom: '0.75rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '0.25rem',
          }}>
            所持金
          </h4>
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px',
            border: '1px solid #dee2e6',
          }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
              {sheetData.money.toLocaleString()} ガメル
            </div>
          </div>
        </div>
      )}

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

      {sheetData.weapons.length === 0 && sheetData.armors.length === 0 && 
       (!sheetData.accessories || sheetData.accessories.length === 0) && 
       sheetData.money === undefined && sheetData.items.length === 0 && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
          装備が登録されていません
        </div>
      )}
    </div>
  );

  const languagesAndOtherContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {sheetData.languages && sheetData.languages.length > 0 && (
        <div>
          <h4 style={{ 
            marginBottom: '0.75rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '0.25rem',
          }}>
            言語
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sheetData.languages.map((language, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {language.name}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {language.speak && (
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}>
                      話
                    </span>
                  )}
                  {language.read && (
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}>
                      読
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(sheetData.background || sheetData.memo) && (
        <div>
          <h4 style={{ 
            marginBottom: '0.75rem', 
            fontSize: '1rem', 
            fontWeight: 'bold',
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '0.25rem',
          }}>
            その他
          </h4>
          {sheetData.background && (
            <div style={{ marginBottom: '1rem' }}>
              <h5 style={{ 
                marginBottom: '0.75rem', 
                fontSize: '0.875rem', 
                fontWeight: 'bold',
                borderBottom: '1px solid #dee2e6',
                paddingBottom: '0.25rem',
              }}>
                背景・経歴
              </h5>
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
              <h5 style={{ 
                marginBottom: '0.75rem', 
                fontSize: '0.875rem', 
                fontWeight: 'bold',
                borderBottom: '1px solid #dee2e6',
                paddingBottom: '0.25rem',
              }}>
                メモ
              </h5>
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
        </div>
      )}

      {(!sheetData.languages || sheetData.languages.length === 0) && !sheetData.background && !sheetData.memo && (
        <div style={{ padding: '1rem', textAlign: 'center', color: '#6c757d' }}>
          言語・その他が登録されていません
        </div>
      )}
    </div>
  );

  return (
    <Tabs
      items={[
        { label: '能力値', content: attributesContent },
        { label: '技能', content: classesContent },
        { label: '戦闘特技・魔法・スキル', content: skillsAndMagicsContent },
        { label: '装備', content: equipmentContent },
        { label: '言語・その他', content: languagesAndOtherContent },
      ]}
      defaultActiveIndex={0}
    />
  );
};
