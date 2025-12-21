import type { CthulhuWeapon } from '../../types/cthulhu';

interface CthulhuWeaponsSectionProps {
    weapons: CthulhuWeapon[];
    onAdd: () => void;
    onUpdate: (index: number, field: keyof CthulhuWeapon, value: string | number) => void;
    onRemove: (index: number) => void;
}

/**
 * クトゥルフ武器管理セクション
 */
export const CthulhuWeaponsSection = ({ weapons, onAdd, onUpdate, onRemove }: CthulhuWeaponsSectionProps) => {
    return (
        <div className="section">
            <h4 className="section-title">武器</h4>

            {weapons.map((weapon, index) => (
                <div key={index} className="card mb-md">
                    <div
                        className="mb-md"
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            alignItems: 'flex-end',
                        }}
                    >
                        <div style={{ flex: '2 1 260px', minWidth: 220 }}>
                            <label className="block mb-sm font-bold">武器名</label>
                            <input
                                type="text"
                                value={weapon.name}
                                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                                className="input"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 110px', minWidth: 90 }}>
                            <label className="block mb-sm font-bold">技能値</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={weapon.value || 0}
                                onChange={(e) => onUpdate(index, 'value', parseInt(e.target.value) || 0)}
                                className="input"
                                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 150px', minWidth: 120 }}>
                            <label className="block mb-sm font-bold">ダメージ</label>
                            <input
                                type="text"
                                value={weapon.damage || ''}
                                onChange={(e) => onUpdate(index, 'damage', e.target.value)}
                                className="input"
                                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 120px', minWidth: 100 }}>
                            <label className="block mb-sm font-bold">射程</label>
                            <input
                                type="text"
                                value={weapon.range || ''}
                                onChange={(e) => onUpdate(index, 'range', e.target.value)}
                                className="input"
                                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 90px', minWidth: 80 }}>
                            <label className="block mb-sm font-bold">攻撃回数</label>
                            <input
                                type="number"
                                min="0"
                                value={weapon.attacks ?? 0}
                                onChange={(e) => onUpdate(index, 'attacks', parseInt(e.target.value) || 0)}
                                className="input"
                                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 90px', minWidth: 80 }}>
                            <label className="block mb-sm font-bold">装弾数</label>
                            <input
                                type="text"
                                value={weapon.ammo || ''}
                                onChange={(e) => onUpdate(index, 'ammo', e.target.value)}
                                className="input"
                                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 110px', minWidth: 90 }}>
                            <label className="block mb-sm font-bold">故障ナンバー</label>
                            <input
                                type="text"
                                value={weapon.malfunction || ''}
                                onChange={(e) => onUpdate(index, 'malfunction', e.target.value)}
                                className="input"
                                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                        <div style={{ flex: '1 1 90px', minWidth: 80 }}>
                            <label className="block mb-sm font-bold">耐久力</label>
                            <input
                                type="number"
                                min="0"
                                value={weapon.durability ?? 0}
                                onChange={(e) => onUpdate(index, 'durability', parseInt(e.target.value) || 0)}
                                className="input"
                                style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.875rem' }}
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="btn btn-danger btn-sm"
                    >
                        削除
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={onAdd}
                className="btn btn-primary"
            >
                + 武器を追加
            </button>
        </div>
    );
};
