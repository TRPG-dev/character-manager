import type { Sw25Language, Sw25Class } from '../../types/sw25';
import { SW25_LANGUAGES, getAutoLanguages, calculateRequiredLanguageCount } from '../../data/sw25';

interface Sw25LanguagesSectionProps {
  languages?: Sw25Language[];
  race: string;
  classes: Sw25Class[];
  onAddLanguage: () => void;
  onUpdateLanguage: (index: number, field: 'name' | 'speak' | 'read', value: string | boolean) => void;
  onRemoveLanguage: (index: number) => void;
}

export const Sw25LanguagesSection = ({
  languages,
  race,
  classes,
  onAddLanguage,
  onUpdateLanguage,
  onRemoveLanguage,
}: Sw25LanguagesSectionProps) => {
  const autoLanguages = getAutoLanguages(race, classes);
  const requiredCount = calculateRequiredLanguageCount(classes);

  // 自動言語と手動言語を分ける
  const currentLanguages = languages || [];
  const autoLangNames = autoLanguages.map(l => l.name);
  const manualLanguages = currentLanguages.filter(l => !autoLangNames.includes(l.name));

  // 手動言語の話・読の合計数をカウント
  const manualLangCount = manualLanguages.reduce((sum, lang) => {
    return sum + (lang.speak ? 1 : 0) + (lang.read ? 1 : 0);
  }, 0);

  return (
    <>
      {/* セージの言語取得情報 */}
      {requiredCount > 0 && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', border: '1px solid #0084ff' }}>
          <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            <strong>セージLv{classes.find(c => c.name === 'セージ')?.level}</strong>:
            自動取得以外の言語で<strong>話or読を{requiredCount}つ</strong>選択してください
          </div>
          <div style={{ fontSize: '0.875rem', color: manualLangCount >= requiredCount ? '#28a745' : '#dc3545' }}>
            現在の選択数: <strong>{manualLangCount} / {requiredCount}</strong>
          </div>
        </div>
      )}

      {/* 自動取得言語 */}
      {autoLanguages.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
            自動取得言語
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', backgroundColor: '#f8f9fa' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef' }}>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>言語名</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>話</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>読</th>
              </tr>
            </thead>
            <tbody>
              {autoLanguages.map((lang, index) => (
                <tr key={index}>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{lang.name}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <input type="checkbox" checked={lang.speak} disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                  <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <input type="checkbox" checked={lang.read} disabled style={{ cursor: 'not-allowed' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 手動追加言語 */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#666' }}>
            追加言語
          </h4>
          <button
            type="button"
            onClick={onAddLanguage}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            + 言語を追加
          </button>
        </div>

        {manualLanguages.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>言語名</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>話</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '80px' }}>読</th>
                <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center', width: '100px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {manualLanguages.map((lang) => {
                const originalIndex = currentLanguages.findIndex(l => l === lang);
                return (
                  <tr key={originalIndex}>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>
                      <select
                        value={lang.name}
                        onChange={(e) => onUpdateLanguage(originalIndex, 'name', e.target.value)}
                        style={{ width: '100%', padding: '0.25rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      >
                        <option value="">選択してください</option>
                        {SW25_LANGUAGES.filter(langName =>
                          !autoLangNames.includes(langName) || langName === lang.name
                        ).map(langName => (
                          <option key={langName} value={langName}>{langName}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={lang.speak}
                        onChange={(e) => onUpdateLanguage(originalIndex, 'speak', e.target.checked)}
                      />
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={lang.read}
                        onChange={(e) => onUpdateLanguage(originalIndex, 'read', e.target.checked)}
                      />
                    </td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => onRemoveLanguage(originalIndex)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                        }}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>
            追加した言語はありません
          </div>
        )}
      </div>
    </>
  );
};


