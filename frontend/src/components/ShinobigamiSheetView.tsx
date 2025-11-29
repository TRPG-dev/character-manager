import type { ShinobigamiSheetData } from '../types/shinobigami';
import { normalizeSheetData } from '../utils/shinobigami';

interface ShinobigamiSheetViewProps {
  data: ShinobigamiSheetData;
}

export const ShinobigamiSheetView = ({ data }: ShinobigamiSheetViewProps) => {
  const sheetData = normalizeSheetData(data);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 流派セクション */}
      {sheetData.school && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            流派
          </h2>
          <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
            {sheetData.school}
          </div>
        </section>
      )}

      {/* 特技セクション */}
      {sheetData.skills.length > 0 && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            特技
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {sheetData.skills.map((skill, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{skill.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>属性: {skill.domain}</div>
                <div style={{ fontSize: '1.25rem', color: '#007bff', marginTop: '0.25rem' }}>値: {skill.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 忍法セクション */}
      {(sheetData.ninpo || []).length > 0 && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            忍法
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sheetData.ninpo.map((ninpo, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.125rem' }}>
                  {ninpo.name || '(無名の忍法)'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>タイプ</div>
                    <div style={{ fontWeight: 'bold' }}>{ninpo.type || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>指定特技</div>
                    <div style={{ fontWeight: 'bold' }}>{ninpo.skill || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>間合い</div>
                    <div style={{ fontWeight: 'bold' }}>{ninpo.range || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>コスト</div>
                    <div style={{ fontWeight: 'bold' }}>{ninpo.cost || '-'}</div>
                  </div>
                  {ninpo.page && (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>参照ページ</div>
                      <div style={{ fontWeight: 'bold' }}>{ninpo.page}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* その他セクション */}
      {(sheetData.secret_flag || sheetData.background) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            その他
          </h2>
          {sheetData.secret_flag && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>秘密フラグ</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#dc3545' }}>✓ 有効</div>
            </div>
          )}
          {sheetData.background && (
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>背景</h3>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                }}
              >
                {sheetData.background}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

