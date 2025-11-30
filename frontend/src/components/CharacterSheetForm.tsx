import { useState, useEffect } from 'react';
import { CollapsibleSection } from './CollapsibleSection';

interface CharacterSheetFormProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const CharacterSheetForm = ({ data, onChange }: CharacterSheetFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const updateField = (path: string[], value: any) => {
    const newData = { ...formData };
    let current: any = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setFormData(newData);
    onChange(newData);
  };

  const addArrayItem = (path: string[], defaultItem: any) => {
    const newData = { ...formData };
    let current: any = newData;
    
    for (let i = 0; i < path.length; i++) {
      if (!current[path[i]]) {
        current[path[i]] = [];
      }
      current = current[path[i]];
    }
    
    current.push(defaultItem);
    setFormData(newData);
    onChange(newData);
  };

  const updateArrayItem = (path: string[], index: number, field: string, value: any) => {
    const newData = { ...formData };
    let current: any = newData;
    
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    current[index] = { ...current[index], [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const removeArrayItem = (path: string[], index: number) => {
    const newData = { ...formData };
    let current: any = newData;
    
    for (let i = 0; i < path.length; i++) {
      current = current[path[i]];
    }
    
    current.splice(index, 1);
    setFormData(newData);
    onChange(newData);
  };

  const getNestedValue = (path: string[]): any => {
    let current: any = formData;
    for (const key of path) {
      current = current?.[key];
    }
    return current;
  };

  const renderObjectField = (key: string, value: any, path: string[] = []) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return (
        <CollapsibleSection key={key} title={key} defaultOpen={true}>
          {Object.entries(value).map(([subKey, subValue]) =>
            renderField(subKey, subValue, [...path, key])
          )}
        </CollapsibleSection>
      );
    }
    return null;
  };

  const renderArrayField = (key: string, value: any[], path: string[] = []) => {
    const currentPath = [...path, key];
    return (
      <CollapsibleSection key={key} title={`${key} (${value.length}件)`} defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {value.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                backgroundColor: '#f8f9fa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>{typeof item === 'object' ? `${key} #${index + 1}` : `項目 #${index + 1}`}</strong>
                <button
                  type="button"
                  onClick={() => removeArrayItem(currentPath, index)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  削除
                </button>
              </div>
              {typeof item === 'object' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  {Object.entries(item).map(([field, fieldValue]) => (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>
                        {field}
                      </label>
                      {typeof fieldValue === 'string' ? (
                        <input
                          type="text"
                          value={fieldValue}
                          onChange={(e) => updateArrayItem(currentPath, index, field, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        />
                      ) : typeof fieldValue === 'number' ? (
                        <input
                          type="number"
                          value={fieldValue}
                          onChange={(e) => updateArrayItem(currentPath, index, field, Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(fieldValue)}
                          onChange={(e) => updateArrayItem(currentPath, index, field, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={String(item)}
                  onChange={(e) => {
                    const newArray = [...value];
                    newArray[index] = e.target.value;
                    updateField(currentPath, newArray);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const defaultItem = value.length > 0 && typeof value[0] === 'object'
                ? Object.keys(value[0]).reduce((acc, k) => ({ ...acc, [k]: '' }), {})
                : '';
              addArrayItem(currentPath, defaultItem);
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + {key}を追加
          </button>
        </div>
      </CollapsibleSection>
    );
  };

  const renderField = (key: string, value: any, path: string[] = []): React.ReactNode => {
    if (Array.isArray(value)) {
      return renderArrayField(key, value, path);
    } else if (typeof value === 'object' && value !== null) {
      return renderObjectField(key, value, path);
    } else {
      const currentPath = [...path, key];
      return (
        <div key={key} style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {key}
          </label>
          {typeof value === 'boolean' ? (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => updateField(currentPath, e.target.checked)}
              />
              <span>{value ? 'はい' : 'いいえ'}</span>
            </label>
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => updateField(currentPath, Number(e.target.value))}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          ) : key.toLowerCase().includes('background') || key.toLowerCase().includes('notes') || key.toLowerCase().includes('detail') ? (
            <textarea
              value={String(value)}
              onChange={(e) => updateField(currentPath, e.target.value)}
              rows={6}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <input
              type="text"
              value={String(value)}
              onChange={(e) => updateField(currentPath, e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Object.entries(formData).map(([key, value]) => renderField(key, value, []))}
    </div>
  );
};


