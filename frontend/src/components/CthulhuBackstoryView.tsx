import type { CthulhuSheetData } from '../types/cthulhu';

interface CthulhuBackstoryViewProps {
  sheetData: CthulhuSheetData;
}

// バックストーリー項目のフィールド定義
const BACKSTORY_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'appearance', label: '容姿の描写' },
  { key: 'traits', label: '特徴' },
  { key: 'beliefs', label: 'イデオロギー/信念' },
  { key: 'injuries', label: '負傷、傷跡' },
  { key: 'importantPeople', label: '重要な人々' },
  { key: 'phobiasManias', label: '恐怖症、マニア' },
  { key: 'meaningfulPlaces', label: '意味のある場所' },
  { key: 'treasuredPossessions', label: '秘蔵の品' },
];

/**
 * バックストーリー項目のエントリを処理する
 */
const processBackstoryEntries = (sheetData: CthulhuSheetData) => {
  return BACKSTORY_FIELDS
    .map((f) => {
      const entry = (sheetData.backstory7 as any)?.[f.key];
      return {
        ...f,
        memo: entry?.memo ?? '',
        isKey: !!entry?.isKey,
      };
    })
    .filter((f) => (f.memo && f.memo.trim().length > 0) || f.isKey);
};

/**
 * mythosSectionsを生成する
 */
const createMythosSections = (sheetData: CthulhuSheetData) => {
  return [
    { title: '魔導書', items: sheetData.mythosBooks || [] },
    { title: '呪文', items: sheetData.spells || [] },
    { title: 'アーティファクト', items: sheetData.artifacts || [] },
    { title: '遭遇した超自然の存在', items: sheetData.encounteredEntities || [] },
  ].filter((s) => (s.items || []).length > 0);
};

/**
 * バックストーリー項目の表示コンポーネント
 */
const BackstoryEntriesView = ({ entries }: { entries: ReturnType<typeof processBackstoryEntries> }) => {
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((e) => (
        <div key={e.key} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
            {e.isKey ? `${e.label}★` : e.label}
          </h3>
          {e.memo && (
            <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {e.memo}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

/**
 * mythosSectionsの表示コンポーネント
 */
const MythosSectionsView = ({ sections }: { sections: ReturnType<typeof createMythosSections> }) => {
  if (sections.length === 0) return null;

  return (
    <div>
      {sections.map((sec) => (
        <div key={sec.title} style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>{sec.title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sec.items.map((it: any, idx: number) => (
              <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1rem', backgroundColor: '#f8f9fa' }}>
                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                  {(it?.name || '(無名)') + (it?.isKey ? '★' : '')}
                </h4>
                {it?.memo && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fff', borderRadius: '4px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.875rem' }}>
                    {it.memo}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * その他のメモの表示コンポーネント
 */
const NotesView = ({ notes }: { notes?: string }) => {
  if (!notes) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem' }}>その他のメモ</h3>
      <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
        {notes}
      </div>
    </div>
  );
};

/**
 * 第7版のバックストーリー表示コンポーネント
 */
export const Cthulhu7BackstoryView = ({ sheetData }: CthulhuBackstoryViewProps) => {
  const entries = processBackstoryEntries(sheetData);
  const mythosSections = createMythosSections(sheetData);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <BackstoryEntriesView entries={entries} />
      <MythosSectionsView sections={mythosSections} />
      <NotesView notes={sheetData.notes} />
    </div>
  );
};

/**
 * 第6版の魔導書・呪文・アーティファクト・遭遇した超自然の存在の表示コンポーネント
 */
export const Cthulhu6MythosView = ({ sheetData }: CthulhuBackstoryViewProps) => {
  const sections = [
    { title: '魔導書', items: sheetData.mythosBooks || [] },
    { title: '呪文', items: sheetData.spells || [] },
    { title: 'アーティファクト', items: sheetData.artifacts || [] },
    { title: '遭遇した超自然の存在', items: sheetData.encounteredEntities || [] },
  ].filter((s) => (s.items || []).length > 0);

  if (sections.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {sections.map((sec) => (
        <div key={sec.title}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{sec.title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sec.items.map((item, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <h4 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1rem' }}>
                  {item.name || `(無名の${sec.title === '魔導書' ? '魔導書' : sec.title === '呪文' ? '呪文' : sec.title === 'アーティファクト' ? 'アーティファクト' : '存在'})`}
                </h4>
                {item.memo && (
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      fontSize: '0.875rem',
                    }}
                  >
                    {item.memo}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

