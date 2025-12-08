import type { CthulhuSheetData } from '../../types/cthulhu';

interface CthulhuDerivedStatsSectionProps {
    derived: CthulhuSheetData['derived'];
    onUpdate: (key: keyof CthulhuSheetData['derived'], value: number | string) => void;
}

/**
 * クトゥルフ派生値表示・編集セクション
 */
export const CthulhuDerivedStatsSection = ({ derived, onUpdate }: CthulhuDerivedStatsSectionProps) => {
    return (
        <div className="section">
            <h4 className="section-title">派生値</h4>
            <div className="grid grid-auto-fit gap-md">
                <div>
                    <label className="block mb-sm font-bold">SAN値（現在/最大）</label>
                    <div className="flex gap-sm items-center">
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
                    <div className="flex gap-sm items-center">
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
                    <div className="flex gap-sm items-center">
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
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
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
            </div>
        </div>
    );
};
