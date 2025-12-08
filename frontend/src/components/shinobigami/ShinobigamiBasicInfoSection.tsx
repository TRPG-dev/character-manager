import type { ShinobigamiSheetData } from '../../types/shinobigami';
import { SHINOBI_SCHOOLS } from '../../data/shinobigamiSkills';

interface ShinobigamiBasicInfoSectionProps {
    playerName?: string;
    shinobiName?: string;
    age?: number;
    gender?: string;
    school?: string;
    rank?: string;
    belief?: string;
    onUpdate: (field: keyof ShinobigamiSheetData, value: any) => void;
}

export const ranks = [
    '下忍',
    '中忍',
    '上忍',
    '頭領'
];

/**
 * シノビガミ基本情報セクション
 */
export const ShinobigamiBasicInfoSection = ({
    playerName,
    shinobiName,
    age,
    gender,
    school,
    rank,
    belief,
    onUpdate,
}: ShinobigamiBasicInfoSectionProps) => {
    return (
        <div className="section">
            <h4 className="section-title">基本情報</h4>
            <div className="grid grid-cols-2 gap-md">
                <div>
                    <label className="block mb-sm font-bold">プレイヤー名</label>
                    <input
                        type="text"
                        value={playerName || ''}
                        onChange={(e) => onUpdate('playerName', e.target.value)}
                        className="input"
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">忍者名</label>
                    <input
                        type="text"
                        value={shinobiName || ''}
                        onChange={(e) => onUpdate('characterName', e.target.value)}
                        className="input"
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">年齢</label>
                    <input
                        type="number"
                        value={age || ''}
                        onChange={(e) => onUpdate('age', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="input"
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">性別</label>
                    <input
                        type="text"
                        value={gender || ''}
                        onChange={(e) => onUpdate('gender', e.target.value)}
                        className="input"
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">流派</label>
                    <select
                        value={school || ''}
                        onChange={(e) => onUpdate('school', e.target.value)}
                        className="select w-full"
                    >
                        <option value="">選択してください</option>
                        {SHINOBI_SCHOOLS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-sm font-bold">階級</label>
                    <select
                        value={rank || ''}
                        onChange={(e) => onUpdate('rank', e.target.value)}
                        className="select w-full"
                    >
                        <option value="">選択してください</option>
                        {ranks.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block mb-sm font-bold">信念</label>
                    <input
                        type="text"
                        value={belief || ''}
                        onChange={(e) => onUpdate('shinnen', e.target.value)}
                        className="input"
                    />
                </div>
            </div>
        </div>
    );
};
