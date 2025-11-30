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
      {(sheetData.school || sheetData.rank || sheetData.ryuugi || sheetData.surfaceFace || sheetData.shinnen || sheetData.koseki !== undefined) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            流派
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {sheetData.school && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流派</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.school}</div>
              </div>
            )}
            {sheetData.rank && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>階級</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.rank}</div>
              </div>
            )}
            {sheetData.surfaceFace && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>表の顔</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.surfaceFace}</div>
              </div>
            )}
            {sheetData.shinnen && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>信念</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.shinnen}</div>
              </div>
            )}
            {sheetData.koseki !== undefined && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>功績点</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{sheetData.koseki}</div>
              </div>
            )}
          </div>
          {sheetData.ryuugi && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>流儀</div>
              <div style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{sheetData.ryuugi}</div>
            </div>
          )}
        </section>
      )}

      {/* 能力値セクション */}
      {(sheetData.hp !== undefined || (sheetData.hencho || []).length > 0 || (sheetData.emotions || []).length > 0) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            能力値
          </h2>
          {sheetData.hp !== undefined && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>生命点（HP）</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {sheetData.hp} / 6
            </div>
          </div>
        )}
        {(sheetData.hencho || []).length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>変調</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {sheetData.hencho.map((h, index) => (
                <span
                  key={index}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
        {(sheetData.emotions || []).length > 0 && (
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>感情</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sheetData.emotions.map((emotion, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{emotion.pcName || '(PC名未設定)'}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    感情: {emotion.emotion || '(未設定)'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* 奥義セクション */}
      {(sheetData.okugi || []).length > 0 && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            奥義
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sheetData.okugi.map((okugi, index) => (
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
                  {okugi.name || '(無名の奥義)'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>指定特技</div>
                    <div style={{ fontWeight: 'bold' }}>{okugi.skill || '-'}</div>
                  </div>
                  {okugi.effect && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>効果</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{okugi.effect}</div>
                    </div>
                  )}
                  {okugi.strength && (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>強み</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{okugi.strength}</div>
                    </div>
                  )}
                  {okugi.weakness && (
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>弱み</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{okugi.weakness}</div>
                    </div>
                  )}
                  {okugi.memo && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>メモ</div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{okugi.memo}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 忍具セクション */}
      {sheetData.ningu && (sheetData.ningu.heiryomaru > 0 || sheetData.ningu.jintsumaru > 0 || sheetData.ningu.tonkofu > 0) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            忍具
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>兵糧丸</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.ningu.heiryomaru}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>神通丸</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.ningu.jintsumaru}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>遁甲符</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{sheetData.ningu.tonkofu}</div>
            </div>
          </div>
        </section>
      )}

      {/* その他セクション */}
      {(sheetData.background || sheetData.memo) && (
        <section>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            その他
          </h2>
          {sheetData.background && (
            <div style={{ marginBottom: '1rem' }}>
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
          {sheetData.memo && (
            <div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>メモ</h3>
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
                {sheetData.memo}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

