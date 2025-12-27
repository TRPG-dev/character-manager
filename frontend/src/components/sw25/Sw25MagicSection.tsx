import type { Sw25Magic, Sw25Class } from '../../types/sw25';

interface Sw25MagicSectionProps {
  magics: Sw25Magic[];
  classes: Sw25Class[];
  onAddMagic: (system: string) => void;
  onUpdateMagic: (index: number, field: keyof Sw25Magic, value: any) => void;
  onRemoveMagic: (index: number) => void;
}

export const Sw25MagicSection = ({
  magics,
  classes,
  onAddMagic,
  onUpdateMagic,
  onRemoveMagic,
}: Sw25MagicSectionProps) => {
  // 技能と魔法・スキル系統グループの対応表
  const classToSystemMap: Record<string, string> = {
    'ソーサラー': '真語魔法',
    'コンジャラー': '操霊魔法',
    'プリースト': '神聖魔法',
    'マギテック': '魔導機術',
    'フェアリーテイマー': '妖精魔法',
    'エンハンサー': '練技',
    'バード': '呪歌',
    'ライダー': '騎乗',
    'アルケミスト': '賦術',
  };

  // 取得している技能から対応する系統グループを取得
  const availableSystems = new Set<string>();
  classes.forEach(cls => {
    const system = classToSystemMap[cls.name];
    if (system) {
      availableSystems.add(system);
    }
  });

  // 既存の魔法・スキルで使用されている系統も追加
  magics.forEach(magic => {
    if (magic.system) {
      availableSystems.add(magic.system);
    }
  });

  const systems = Array.from(availableSystems).sort();

  // 系統が未設定の魔法・スキル
  const unclassifiedMagics = magics.filter(m => !m.system || m.system === '');

  return (
    <>
      {systems.map(system => {
        const systemMagics = magics.filter(m => m.system === system);
        return (
          <div key={system} style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
                {system}
              </h4>
              <button
                type="button"
                onClick={() => onAddMagic(system)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                + {system}を追加
              </button>
            </div>
            <div>
              {systemMagics.map((magic) => {
                const originalIndex = magics.findIndex(m => m === magic);
                return (
                  <div key={originalIndex} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          魔法・スキル名
                        </label>
                        <input
                          type="text"
                          value={magic.name}
                          onChange={(e) => onUpdateMagic(originalIndex, 'name', e.target.value)}
                          placeholder="魔法・スキル名を入力"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          消費MP
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={magic.cost}
                          onChange={(e) => onUpdateMagic(originalIndex, 'cost', parseInt(e.target.value) || 0)}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                          参照ページ
                        </label>
                        <input
                          type="text"
                          value={magic.referencePage || ''}
                          onChange={(e) => onUpdateMagic(originalIndex, 'referencePage', e.target.value)}
                          placeholder="参照p"
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => onRemoveMagic(originalIndex)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginTop: '1.5rem',
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        効果
                      </label>
                      <textarea
                        value={magic.effect}
                        onChange={(e) => onUpdateMagic(originalIndex, 'effect', e.target.value)}
                        placeholder="効果を入力"
                        rows={2}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        備考
                      </label>
                      <input
                        type="text"
                        value={magic.memo || ''}
                        onChange={(e) => onUpdateMagic(originalIndex, 'memo', e.target.value)}
                        placeholder="備考を入力"
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 系統が未設定の魔法・スキル */}
      {unclassifiedMagics.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
            未分類
          </h4>
          {unclassifiedMagics.map((magic) => {
            const magicIdx = magics.findIndex(m => m === magic);
            return (
              <div key={magicIdx} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 150px auto', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      魔法・スキル名
                    </label>
                    <input
                      type="text"
                      value={magic.name}
                      onChange={(e) => onUpdateMagic(magicIdx, 'name', e.target.value)}
                      placeholder="魔法・スキル名を入力"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      消費MP
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={magic.cost}
                      onChange={(e) => onUpdateMagic(magicIdx, 'cost', parseInt(e.target.value) || 0)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      参照ページ
                    </label>
                    <input
                      type="text"
                      value={magic.referencePage || ''}
                      onChange={(e) => onUpdateMagic(magicIdx, 'referencePage', e.target.value)}
                      placeholder="参照p"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => onRemoveMagic(magicIdx)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '1.5rem',
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    効果
                  </label>
                  <textarea
                    value={magic.effect}
                    onChange={(e) => onUpdateMagic(magicIdx, 'effect', e.target.value)}
                    placeholder="効果を入力"
                    rows={2}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    備考
                  </label>
                  <input
                    type="text"
                    value={magic.memo || ''}
                    onChange={(e) => onUpdateMagic(magicIdx, 'memo', e.target.value)}
                    placeholder="備考を入力"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};



