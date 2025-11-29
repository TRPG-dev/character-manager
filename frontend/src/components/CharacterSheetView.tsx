interface CharacterSheetViewProps {
  data: Record<string, any>;
}

export const CharacterSheetView = ({ data }: CharacterSheetViewProps) => {
  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>未設定</span>;
    }

    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>なし</span>;
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {value.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                }}
              >
                {typeof item === 'object' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {Object.entries(item).map(([key, val]) => (
                      <div key={key}>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>{key}</div>
                        <div style={{ fontWeight: 'bold' }}>{renderValue(val)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>{String(item)}</div>
                )}
              </div>
            ))}
          </div>
        );
      }
      // オブジェクトの場合
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {Object.entries(value).map(([key, val]) => (
            <div key={key}>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>{key}</div>
              <div style={{ fontWeight: 'bold' }}>{renderValue(val)}</div>
            </div>
          ))}
        </div>
      );
    }

    return String(value);
  };

  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
        シートデータがありません
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {entries.map(([key, value]) => (
        <section key={key}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', borderBottom: '2px solid #ddd', paddingBottom: '0.5rem' }}>
            {key}
          </h3>
          <div style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
            {renderValue(value)}
          </div>
        </section>
      ))}
    </div>
  );
};

