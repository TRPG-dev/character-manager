import type { Sw25SheetData } from '../../types/sw25';

interface Sw25AbilitySectionProps {
    abilities: Sw25SheetData['abilities'];
    onUpdate: (key: '技' | '体' | '心', value: number) => void;
}

/**
 * SW25基本能力（技、体、心）入力セクション
 */
export const Sw25AbilitySection = ({ abilities, onUpdate }: Sw25AbilitySectionProps) => {
    return (
        <div className="section">
            <h4 className="section-title">基本能力（技、体、心）</h4>
            <div className="grid grid-cols-3 gap-md">
                <div>
                    <label className="block mb-sm font-bold">技</label>
                    <input
                        type="number"
                        value={abilities.技}
                        onChange={(e) => onUpdate('技', parseInt(e.target.value) || 0)}
                        className="input"
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">体</label>
                    <input
                        type="number"
                        value={abilities.体}
                        onChange={(e) => onUpdate('体', parseInt(e.target.value) || 0)}
                        className="input"
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">心</label>
                    <input
                        type="number"
                        value={abilities.心}
                        onChange={(e) => onUpdate('心', parseInt(e.target.value) || 0)}
                        className="input"
                    />
                </div>
            </div>
        </div>
    );
};
