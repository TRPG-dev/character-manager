import type { Sw25SheetData } from '../../types/sw25';

interface Sw25AttributeTableProps {
    abilities: Sw25SheetData['abilities'];
    attributes: Sw25SheetData['attributes'];
    attributeInitials?: Sw25SheetData['attributeInitials'];
    attributeGrowth?: Sw25SheetData['attributeGrowth'];
    onUpdateInitial: (key: '器用度' | '敏捷度' | '筋力' | '生命力' | '知力' | '精神力', value: number) => void;
    onUpdateGrowth: (key: '器用度' | '敏捷度' | '筋力' | '生命力' | '知力' | '精神力', value: number) => void;
    calculateAttributeBonus: (value: number) => number;
}

/**
 * SW25能力値テーブルセクション
 */
export const Sw25AttributeTable = ({
    abilities,
    attributes,
    attributeInitials,
    attributeGrowth,
    onUpdateInitial,
    onUpdateGrowth,
    calculateAttributeBonus,
}: Sw25AttributeTableProps) => {
    const attributeRows = [
        { key: '器用度' as const, base: '技' as const },
        { key: '敏捷度' as const, base: '技' as const },
        { key: '筋力' as const, base: '体' as const },
        { key: '生命力' as const, base: '体' as const },
        { key: '知力' as const, base: '心' as const },
        { key: '精神力' as const, base: '心' as const },
    ];

    return (
        <div className="section">
            <h4 className="section-title">能力値</h4>
            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>能力値</th>
                            <th className="center">基本能力</th>
                            <th className="center">初期値</th>
                            <th className="center">成長値</th>
                            <th className="center">合計</th>
                            <th className="center">能力値ボーナス</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attributeRows.map(({ key, base }) => {
                            const baseValue = abilities[base];
                            const initial = attributeInitials?.[key] || 0;
                            const growth = attributeGrowth?.[key] || 0;
                            const total = attributes[key];
                            const bonus = calculateAttributeBonus(total);

                            return (
                                <tr key={key}>
                                    <td className="font-bold">{key}</td>
                                    <td className="center readonly">{baseValue}</td>
                                    <td className="center">
                                        <input
                                            type="number"
                                            value={initial}
                                            onChange={(e) => onUpdateInitial(key, parseInt(e.target.value) || 0)}
                                            className="input-sm"
                                            style={{ width: '60px', textAlign: 'center' }}
                                        />
                                    </td>
                                    <td className="center">
                                        <input
                                            type="number"
                                            value={growth}
                                            onChange={(e) => onUpdateGrowth(key, parseInt(e.target.value) || 0)}
                                            className="input-sm"
                                            style={{ width: '60px', textAlign: 'center' }}
                                        />
                                    </td>
                                    <td className="center readonly">{total}</td>
                                    <td className="center readonly">{bonus}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
