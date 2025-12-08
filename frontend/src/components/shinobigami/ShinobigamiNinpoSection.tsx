import type { ShinobigamiNinpo } from '../../types/shinobigami';

interface ShinobigamiNinpoSectionProps {
    ninpos: ShinobigamiNinpo[];
    onAdd: () => void;
    onUpdate: (index: number, field: keyof ShinobigamiNinpo, value: string) => void;
    onRemove: (index: number) => void;
}

/**
 * シノビガミ忍法管理セクション
 */
export const ShinobigamiNinpoSection = ({ ninpos, onAdd, onUpdate, onRemove }: ShinobigamiNinpoSectionProps) => {
    return (
        <div className="section">
            <h4 className="section-title">忍法</h4>

            {ninpos.map((ninpo, index) => (
                <div key={index} className="card mb-md">
                    <div className="grid grid-cols-2 gap-md mb-md">
                        <div>
                            <label className="block mb-sm font-bold">忍法名</label>
                            <input
                                type="text"
                                value={ninpo.name}
                                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-sm font-bold">ページ</label>
                            <input
                                type="text"
                                value={ninpo.page || ''}
                                onChange={(e) => onUpdate(index, 'page', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-sm font-bold">タイミング</label>
                            <input
                                type="text"
                                value={ninpo.type || ''}
                                onChange={(e) => onUpdate(index, 'type', e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block mb-sm font-bold">判定</label>
                            <input
                                type="text"
                                value={ninpo.skill || ''}
                                onChange={(e) => onUpdate(index, 'skill', e.target.value)}
                                className="input"
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
                + 忍法を追加
            </button>
        </div>
    );
};
