import type { ShinobigamiNinpo } from '../../types/shinobigami';

interface ShinobigamiNinpoSectionProps {
    ninpos: ShinobigamiNinpo[];
    onAdd: () => void;
    onUpdate: (index: number, field: keyof ShinobigamiNinpo, value: string) => void;
    onRemove: (index: number) => void;
    rank?: string;
    maxNinpo?: number;
}

/**
 * シノビガミ忍法管理セクション
 */
export const ShinobigamiNinpoSection = ({ ninpos, onAdd, onUpdate, onRemove, rank, maxNinpo }: ShinobigamiNinpoSectionProps) => {
    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem', margin: 0 }}>
                    忍法
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {rank && maxNinpo !== undefined && (
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                            数: {ninpos.length} / {maxNinpo}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={onAdd}
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
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ninpos.map((ninpo, index) => (
                    <div key={index} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>忍法 #{index + 1}</h3>
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
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
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>忍法名</label>
                                <input
                                    type="text"
                                    value={ninpo.name}
                                    onChange={(e) => onUpdate(index, 'name', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>タイプ</label>
                                <select
                                    value={ninpo.type || ''}
                                    onChange={(e) => onUpdate(index, 'type', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                >
                                    <option value="">選択してください</option>
                                    <option value="攻撃">攻撃</option>
                                    <option value="サポート">サポート</option>
                                    <option value="装備">装備</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>指定特技</label>
                                <input
                                    type="text"
                                    value={ninpo.skill}
                                    onChange={(e) => onUpdate(index, 'skill', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>間合い</label>
                                <input
                                    type="text"
                                    value={ninpo.range}
                                    onChange={(e) => onUpdate(index, 'range', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>コスト</label>
                                <input
                                    type="text"
                                    value={ninpo.cost}
                                    onChange={(e) => onUpdate(index, 'cost', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="コスト（テキスト入力）"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>参照ページ</label>
                                <input
                                    type="text"
                                    value={ninpo.page || ''}
                                    onChange={(e) => onUpdate(index, 'page', e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>効果</label>
                                <textarea
                                    value={ninpo.effect || ''}
                                    onChange={(e) => onUpdate(index, 'effect', e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                {ninpos.length === 0 && (
                    <p style={{ color: '#6c757d', fontStyle: 'italic' }}>忍法がありません。追加ボタンで追加してください。</p>
                )}
            </div>
        </section>
    );
};
