import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { getCharacter, updateCharacter } from '../services/api';
import type { Character, SystemEnum } from '../services/api';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const CharacterEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [sheetData, setSheetData] = useState<string>('');

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (token) {
          const char = await getCharacter(token, id);
          setCharacter(char);
          setName(char.name);
          setTags(char.tags);
          setProfileImageUrl(char.profile_image_url || '');
          setSheetData(JSON.stringify(char.sheet_data, null, 2));
        }
      } catch (error) {
        console.error('Failed to fetch character:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

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
    if (!id || !character) return;

    setSaving(true);
    try {
      const token = await getAccessToken();
      if (token) {
        let parsedSheetData;
        try {
          parsedSheetData = JSON.parse(sheetData);
        } catch (error) {
          alert('シートデータが正しいJSON形式ではありません');
          setSaving(false);
          return;
        }

        await updateCharacter(token, id, {
          name: name.trim(),
          tags,
          profile_image_url: profileImageUrl || null,
          sheet_data: parsedSheetData,
        });
        navigate(`/characters/${id}`);
      }
    } catch (error) {
      console.error('Failed to update character:', error);
      alert('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!character) {
    return <div>キャラクターが見つかりません</div>;
  }

  return (
    <div>
      <h1>キャラクター編集</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            システム
          </label>
          <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {SYSTEM_NAMES[character.system]}
          </div>
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
            プロフィール画像URL
          </label>
          <input
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '600px',
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

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            シートデータ (JSON)
          </label>
          <textarea
            value={sheetData}
            onChange={(e) => setSheetData(e.target.value)}
            rows={20}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: saving || !name.trim() ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/characters/${id}`)}
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

