import type { Sw25SheetData } from '../../types/sw25';

interface Sw25OtherInfoSectionProps {
  experiencePoints?: number;
  honorPoints?: number;
  background?: string;
  memo?: string;
  onUpdate: (field: keyof Sw25SheetData, value: any) => void;
}

export const Sw25OtherInfoSection = ({
  experiencePoints,
  honorPoints,
  background,
  memo,
  onUpdate,
}: Sw25OtherInfoSectionProps) => {
  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>経験点・名誉点</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              使用経験点
            </label>
            <input
              type="number"
              min="0"
              value={experiencePoints || ''}
              onChange={(e) => onUpdate('experiencePoints', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              名誉点
            </label>
            <input
              type="number"
              min="0"
              value={honorPoints || ''}
              onChange={(e) => onUpdate('honorPoints', e.target.value ? parseInt(e.target.value) : undefined)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          背景・経歴
        </label>
        <textarea
          value={background}
          onChange={(e) => onUpdate('background', e.target.value)}
          rows={6}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          メモ
        </label>
        <textarea
          value={memo}
          onChange={(e) => onUpdate('memo', e.target.value)}
          rows={6}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      </div>
    </>
  );
};
