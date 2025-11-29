import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { createCharacter } from '../services/api';
import type { SystemEnum } from '../services/api';
import { CthulhuSheetForm } from '../components/CthulhuSheetForm';
import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData } from '../utils/cthulhu';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const CharacterCreate = () => {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedSystem, setSelectedSystem] = useState<SystemEnum | null>(null);
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetData, setSheetData] = useState<CthulhuSheetData | null>(null);

  const handleSystemSelect = (system: SystemEnum) => {
    setSelectedSystem(system);
    setStep('form');
    // クトゥルフの場合、初期シートデータを設定
    if (system === 'cthulhu') {
      setSheetData(normalizeSheetData({
        attributes: {
          STR: 0,
          CON: 0,
          POW: 0,
          DEX: 0,
          APP: 0,
          INT: 0,
          EDU: 0,
          SIZ: 0,
        },
        derived: {
          SAN_current: 0,
          SAN_max: 0,
          HP_current: 0,
          HP_max: 0,
          MP_current: 0,
          MP_max: 0,
        },
        skills: [],
        backstory: '',
      }));
    } else {
      setSheetData(null);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSystem || !name.trim()) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (token) {
        const character = await createCharacter(token, {
          system: selectedSystem,
          name: name.trim(),
          tags,
          sheet_data: selectedSystem === 'cthulhu' && sheetData ? sheetData : undefined,
        });
        navigate(`/characters/${character.id}`);
      }
    } catch (error) {
      console.error('Failed to create character:', error);
      alert('キャラクターの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <div>
        <h1>システムを選択</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
          {Object.entries(SYSTEM_NAMES).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleSystemSelect(value as SystemEnum)}
              style={{
                padding: '2rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '1.125rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.backgroundColor = '#f0f8ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.backgroundColor = '#fff';
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '2rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          キャンセル
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>キャラクター作成</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            システム
          </label>
          <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {selectedSystem && SYSTEM_NAMES[selectedSystem]}
          </div>
          <button
            type="button"
            onClick={() => setStep('select')}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            変更
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            名前 <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              fontSize: '1rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            タグ
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            {tags.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="タグを追加"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              style={{
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                flex: 1,
                maxWidth: '300px',
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              追加
            </button>
          </div>
        </div>

        {selectedSystem === 'cthulhu' && sheetData && (
          <div style={{ marginTop: '2rem' }}>
            <CthulhuSheetForm
              data={sheetData}
              onChange={(data) => setSheetData(data)}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading || !name.trim() ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {loading ? '作成中...' : '作成'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};

