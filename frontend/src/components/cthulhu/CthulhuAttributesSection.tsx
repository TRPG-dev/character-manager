import type { CthulhuSheetData } from '../../types/cthulhu';
import type { CthulhuSystem } from '../../utils/cthulhu';

interface CthulhuAttributesSectionProps {
    attributes: CthulhuSheetData['attributes'];
    onUpdate: (key: keyof CthulhuSheetData['attributes'], value: number) => void;
    system: CthulhuSystem;
}

/**
 * クトゥルフ能力値入力セクション
 */
export const CthulhuAttributesSection = ({ attributes, onUpdate, system }: CthulhuAttributesSectionProps) => {
    const attributeFields = [
        { key: 'STR' as const, label: 'STR（筋力）' },
        { key: 'CON' as const, label: 'CON（体力）' },
        { key: 'POW' as const, label: 'POW（精神力）' },
        { key: 'DEX' as const, label: 'DEX（敏捷性）' },
        { key: 'APP' as const, label: 'APP（外見）' },
        { key: 'SIZ' as const, label: 'SIZ（体格）' },
        { key: 'INT' as const, label: 'INT（知性）' },
        { key: 'EDU' as const, label: 'EDU（教育）' },
        ...(system === 'cthulhu7' ? [{ key: 'LUK' as const, label: 'LUK（幸運）' }] : []),
    ];

    return (
        <div className="section">
            <h4 className="section-title">能力値</h4>
            <div className="grid grid-cols-4 gap-md">
                {attributeFields.map(({ key, label }) => (
                    <div key={key}>
                        <label className="block mb-sm font-bold">{label}</label>
                        <input
                            type="number"
                            min="0"
                            max="99"
                            value={attributes[key] || 0}
                            onChange={(e) => onUpdate(key, parseInt(e.target.value) || 0)}
                            className="input"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
