import type { Sw25SheetData } from '../../types/sw25';

interface Sw25DerivedStatsProps {
    attributes: Sw25SheetData['attributes'];
}

/**
 * SW25派生値表示セクション（HP、MP、抵抗力など）
 */
export const Sw25DerivedStats = ({ attributes }: Sw25DerivedStatsProps) => {
    return (
        <div className="section">
            <h4 className="section-title">派生値</h4>
            <div className="grid grid-auto-fit gap-md">
                <div>
                    <label className="block mb-sm font-bold">HP</label>
                    <input
                        type="number"
                        value={attributes.HP}
                        readOnly
                        className="input"
                        style={{ backgroundColor: 'var(--color-bg-light)' }}
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">MP</label>
                    <input
                        type="number"
                        value={attributes.MP}
                        readOnly
                        className="input"
                        style={{ backgroundColor: 'var(--color-bg-light)' }}
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">生命抵抗力</label>
                    <input
                        type="number"
                        value={attributes.生命抵抗力}
                        readOnly
                        className="input"
                        style={{ backgroundColor: 'var(--color-bg-light)' }}
                    />
                </div>
                <div>
                    <label className="block mb-sm font-bold">精神抵抗力</label>
                    <input
                        type="number"
                        value={attributes.精神抵抗力}
                        readOnly
                        className="input"
                        style={{ backgroundColor: 'var(--color-bg-light)' }}
                    />
                </div>
                {attributes.移動力 !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">移動力</label>
                        <input
                            type="number"
                            value={attributes.移動力}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {attributes.全力移動 !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">全力移動</label>
                        <input
                            type="number"
                            value={attributes.全力移動}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {attributes.先制力 !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">先制力</label>
                        <input
                            type="number"
                            value={attributes.先制力}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {attributes.魔物知識 !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">魔物知識</label>
                        <input
                            type="number"
                            value={attributes.魔物知識}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
                {attributes.防護点 !== undefined && (
                    <div>
                        <label className="block mb-sm font-bold">防護点</label>
                        <input
                            type="number"
                            value={attributes.防護点}
                            readOnly
                            className="input"
                            style={{ backgroundColor: 'var(--color-bg-light)' }}
                        />
                    </div>
                )}
            </div>

            {/* 技巧、運動、観察、知識の表示 */}
            {((attributes.技巧 && attributes.技巧.length > 0) ||
                (attributes.運動 && attributes.運動.length > 0) ||
                (attributes.観察 && attributes.観察.length > 0) ||
                (attributes.知識 && attributes.知識.length > 0) ||
                (attributes.命中力 && attributes.命中力.length > 0) ||
                (attributes.追加ダメージ && attributes.追加ダメージ.length > 0) ||
                (attributes.回避力 && attributes.回避力.length > 0)) && (
                    <div className="mt-md">
                        <h5 className="section-subtitle">スキル判定値</h5>
                        <div className="grid grid-auto-fit gap-md">
                            {attributes.技巧 && attributes.技巧.length > 0 && (
                                <div>
                                    <label className="block mb-sm font-bold">技巧</label>
                                    <div className="text-small">{attributes.技巧.join(', ')}</div>
                                </div>
                            )}
                            {attributes.運動 && attributes.運動.length > 0 && (
                                <div>
                                    <label className="block mb-sm font-bold">運動</label>
                                    <div className="text-small">{attributes.運動.join(', ')}</div>
                                </div>
                            )}
                            {attributes.観察 && attributes.観察.length > 0 && (
                                <div>
                                    <label className="block mb-sm font-bold">観察</label>
                                    <div className="text-small">{attributes.観察.join(', ')}</div>
                                </div>
                            )}
                            {attributes.知識 && attributes.知識.length > 0 && (
                                <div>
                                    <label className="block mb-sm font-bold">知識</label>
                                    <div className="text-small">{attributes.知識.join(', ')}</div>
                                </div>
                            )}
                            {attributes.命中力 && attributes.命中力.length > 0 && (
                                <div>
                                    <label className="block mb-sm font-bold">命中力</label>
                                    <div className="text-small">{attributes.命中力.join(', ')}</div>
                                </div>
                            )}
                            {attributes.追加ダメージ && attributes.追加ダメージ.length > 0 && (
                                <div>
                                    <label className="block mb-sm font-bold">追加ダメージ</label>
                                    <div className="text-small">{attributes.追加ダメージ.join(', ')}</div>
                                </div>
                            )}
                            {attributes.回避力 && attributes.回避力.length > 0 && (
                                <div>
                                    <label className="block mb-sm font-bold">回避力</label>
                                    <div className="text-small">{attributes.回避力.join(', ')}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
        </div>
    );
};
