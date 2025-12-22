import type { CthulhuSheetData } from '../../types/cthulhu';
import type { CthulhuSystem } from '../../utils/cthulhu';

interface CthulhuDerivedStatsSectionProps {
    derived: CthulhuSheetData['derived'];
    onUpdate: (key: keyof CthulhuSheetData['derived'], value: number | string) => void;
    system: CthulhuSystem;
}

/**
 * クトゥルフ派生値表示・編集セクション
 */
export const CthulhuDerivedStatsSection = ({ derived, onUpdate, system }: CthulhuDerivedStatsSectionProps) => {
    return (
        <div className="section">
            <h4 className="section-title">派生値</h4>
            <div
                className="grid grid-auto-fit gap-md"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
            >
                <div>
                    <label className="block mb-sm font-bold">SAN値（現在/最大）</label>
                    <div className="flex gap-sm items-center" style={{ flexWrap: 'wrap' }}>
                        <input
                            type="number"
                            min="0"
                            max="99"
                            value={derived.SAN_current || 0}
                            onChange={(e) => onUpdate('SAN_current', parseInt(e.target.value) || 0)}
                            className="input"
                            style={{ width: '80px' }}
                        />
                        <span>/</span>
                        <input
                            type="number"
                            min="0"
                            max="99"
                            value={derived.SAN_max || 0}
                            readOnly
                            className="input"
                            style={{ width: '80px', backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                </div>
                <div>
                    <label className="block mb-sm font-bold">HP（現在/最大）</label>
                    <div className="flex gap-sm items-center" style={{ flexWrap: 'wrap' }}>
                        <input
                            type="number"
                            min="0"
                            value={derived.HP_current || 0}
                            onChange={(e) => onUpdate('HP_current', parseInt(e.target.value) || 0)}
                            className="input"
                            style={{ width: '80px' }}
                        />
                        <span>/</span>
                        <input
                            type="number"
                            min="0"
                            value={derived.HP_max || 0}
                            readOnly
                            className="input"
                            style={{ width: '80px', backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                </div>
                <div>
                    <label className="block mb-sm font-bold">MP（現在/最大）</label>
                    <div className="flex gap-sm items-center" style={{ flexWrap: 'wrap' }}>
                        <input
                            type="number"
                            min="0"
                            value={derived.MP_current || 0}
                            onChange={(e) => onUpdate('MP_current', parseInt(e.target.value) || 0)}
                            className="input"
                            style={{ width: '80px' }}
                        />
                        <span>/</span>
                        <input
                            type="number"
                            min="0"
                            value={derived.MP_max || 0}
                            readOnly
                            className="input"
                            style={{ width: '80px', backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                </div>
                {derived.IDEA !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">アイデア</label>
                        <input
                            type="number"
                            value={derived.IDEA}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {derived.KNOW !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">知識</label>
                        <input
                            type="number"
                            value={derived.KNOW}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {derived.LUCK !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">幸運</label>
                        <input
                            type="number"
                            value={derived.LUCK}
                            readOnly={system !== 'cthulhu7'}
                            onChange={(e) => onUpdate('LUCK', parseInt(e.target.value) || 0)}
                            className="input"
                            style={system !== 'cthulhu7' ? { backgroundColor: 'var(--color-bg-light)' } : undefined}
                        />
                    </div>
                )}
                {derived.DB && (
                    <div>
                        <label className="block mb-sm font-bold">ダメージボーナス</label>
                        <input
                            type="text"
                            value={derived.DB}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {system === 'cthulhu7' && derived.BUILD !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">ビルド</label>
                        <input
                            type="number"
                            value={derived.BUILD}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {system === 'cthulhu7' && derived.MOV !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">MOV（移動率）</label>
                        <input
                            type="number"
                            min="0"
                            value={derived.MOV}
                            onChange={(e) => onUpdate('MOV', parseInt(e.target.value) || 0)}
                            className="input"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
