import type { Sw25Class } from '../../types/sw25';
import { getClassesByCategory } from '../../data/sw25';

interface Sw25ClassSectionProps {
    classes: Sw25Class[];
    adventurerLevel: number;
    usedExperiencePoints: number;
    remainingExperiencePoints: number;
    initialExperiencePoints?: number;
    gainedExperiencePoints?: number;
    onUpdateGainedExp: (value: number | undefined) => void;
    onAddClass: () => void;
    onUpdateClass: (index: number, field: 'name' | 'level', value: string | number) => void;
    onRemoveClass: (index: number) => void;
}

/**
 * SW25技能管理セクション
 */
export const Sw25ClassSection = ({
    classes,
    adventurerLevel,
    usedExperiencePoints,
    remainingExperiencePoints,
    initialExperiencePoints,
    gainedExperiencePoints,
    onUpdateGainedExp,
    onAddClass,
    onUpdateClass,
    onRemoveClass,
}: Sw25ClassSectionProps) => {
    const warriorClasses = getClassesByCategory('戦士系');
    const magicClasses = getClassesByCategory('魔法系');
    const otherClasses = getClassesByCategory('その他');

    return (
        <div>
            <div className="flex gap-md items-center flex-wrap mb-md">
                <div>
                    <strong>冒険者レベル: {adventurerLevel}</strong>
                </div>
                <div>
                    <label className="inline-block mr-sm font-bold">初期経験点:</label>
                    <input
                        type="number"
                        min="0"
                        value={initialExperiencePoints ?? 3000}
                        readOnly
                        className="input-sm"
                        style={{ width: '100px', backgroundColor: 'var(--color-bg-light)' }}
                    />
                </div>
                <div>
                    <label className="inline-block mr-sm font-bold">獲得経験点:</label>
                    <input
                        type="number"
                        min="0"
                        value={gainedExperiencePoints || ''}
                        onChange={(e) => onUpdateGainedExp(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="input-sm"
                        style={{ width: '100px' }}
                    />
                </div>
                <div>
                    <strong>経験点: {(initialExperiencePoints || 3000) + (gainedExperiencePoints || 0)}</strong>
                </div>
                <div>
                    <strong>使用経験点: {usedExperiencePoints}</strong>
                </div>
                <div>
                    <strong>
                        残り経験点: <span style={{ color: remainingExperiencePoints < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                            {remainingExperiencePoints}
                        </span>
                    </strong>
                </div>
            </div>

            {classes.map((cls, index) => (
                <div key={index} className="flex gap-md items-center mb-md flex-wrap">
                    <div className="flex-1 min-w-200">
                        <label className="block mb-sm font-bold">技能</label>
                        <select
                            value={cls.name}
                            onChange={(e) => onUpdateClass(index, 'name', e.target.value)}
                            className="select w-full"
                        >
                            <option value="">選択してください</option>
                            <optgroup label="戦士系">
                                {warriorClasses.map((c) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="魔法系">
                                {magicClasses.map((c) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="その他">
                                {otherClasses.map((c) => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    <div style={{ width: '100px' }}>
                        <label className="block mb-sm font-bold">レベル</label>
                        <input
                            type="number"
                            min="1"
                            max="15"
                            value={cls.level}
                            onChange={(e) => onUpdateClass(index, 'level', parseInt(e.target.value) || 1)}
                            className="input"
                        />
                    </div>
                    <div style={{ paddingTop: '1.5rem' }}>
                        <button
                            type="button"
                            onClick={() => onRemoveClass(index)}
                            className="btn btn-danger btn-sm"
                        >
                            削除
                        </button>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={onAddClass}
                className="btn btn-primary"
            >
                + 技能を追加
            </button>
        </div>
    );
};
