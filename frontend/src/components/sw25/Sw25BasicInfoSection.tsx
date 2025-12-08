import type { Sw25SheetData, Sw25Race, Sw25Birth } from '../../types/sw25';

interface Sw25BasicInfoSectionProps {
    playerName?: string;
    characterName?: string;
    age?: number;
    gender?: string;
    race?: Sw25Race;
    birth?: Sw25Birth;
    onUpdate: (field: keyof Sw25SheetData, value: any) => void;
}

const races: Sw25Race[] = [
    '人間', 'エルフ', 'ドワーフ', 'タビット', 'ルーンフォーク',
    'ナイトメア', 'リカント', 'リルドラケン', 'グラスランナー',
    'メリア', 'ティエンス', 'レプラカーン', 'その他'
];

const births: Sw25Birth[] = [
    '魔動機師', '魔術師', '軽戦士', '一般人', '傭兵', '神官',
    '操霊術師', '剣士', '薬師', '戦士', '拳闘士', '学者',
    '射手', '密偵', '野伏', '商人', '盗人', '趣味人',
    '妖精使い', '騎手', '魔法使い', '錬金術師', 'その他'
];

/**
 * SW25基本情報セクション
 */
export const Sw25BasicInfoSection = ({
    playerName,
    characterName,
    age,
    gender,
    race,
    birth,
    onUpdate,
}: Sw25BasicInfoSectionProps) => {
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
                    <label className="block mb-sm font-bold">キャラクター名</label>
                    <input
                        type="text"
                        value={characterName || ''}
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
                    <label className="block mb-sm font-bold">種族</label>
                    <select
                        value={race || ''}
                        onChange={(e) => onUpdate('race', e.target.value as Sw25Race)}
                        className="select w-full"
                    >
                        <option value="">選択してください</option>
                        {races.map((r) => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-sm font-bold">生まれ</label>
                    <select
                        value={birth || ''}
                        onChange={(e) => onUpdate('birth', e.target.value as Sw25Birth)}
                        className="select w-full"
                    >
                        <option value="">選択してください</option>
                        {births.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
