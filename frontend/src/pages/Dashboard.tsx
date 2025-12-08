import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { getCharacters } from '../services/api';
import type { Character, SystemEnum } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { handleApiError, formatErrorMessage } from '../utils/errorHandler';
import { LoadingSpinner } from '../components/LoadingSpinner';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const Dashboard = () => {
  const { isAuthenticated, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<SystemEnum | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [tagInput, setTagInput] = useState('');

  const fetchCharacters = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const token = await getAccessToken();
      if (token) {
        const response = await getCharacters(token, {
          query: searchQuery || undefined,
          system: selectedSystem || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          page: currentPage,
          limit: 20,
        });
        setCharacters(response.items);
        setTotal(response.total);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
      const apiError = handleApiError(error);
      showError(formatErrorMessage(apiError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [isAuthenticated, searchQuery, selectedSystem, selectedTags, currentPage]);

  const handleAddTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      setSelectedTags([...selectedTags, tagInput.trim()]);
      setTagInput('');
      setCurrentPage(1);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCharacters();
  };

  if (loading && characters.length === 0) {
    return <LoadingSpinner fullScreen message="キャラクターを読み込み中..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>キャラクター一覧</h1>
        <button
          onClick={() => navigate('/characters/new')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          + 新規作成
        </button>
      </div>

      {/* 検索・フィルター */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* 名前検索 */}
            <input
              type="text"
              placeholder="名前で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: '1 1 200px',
                minWidth: '150px',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />

            {/* システム選択 */}
            <select
              value={selectedSystem}
              onChange={(e) => {
                setSelectedSystem(e.target.value as SystemEnum | '');
                setCurrentPage(1);
              }}
              style={{
                flex: '0 1 180px',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="">すべてのシステム</option>
              {Object.entries(SYSTEM_NAMES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* タグ検索 */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: '1 1 200px' }}>
              <input
                type="text"
                placeholder="タグで絞り込み..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                style={{
                  flex: '1',
                  minWidth: '120px',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                }}
              >
                絞り込み
              </button>
            </div>
          </div>

          {/* 選択されたタグの表示 */}
          {selectedTags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#666', alignSelf: 'center' }}>タグ:</span>
              {selectedTags.map(tag => (
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
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => {
                  setSelectedTags([]);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'transparent',
                  color: '#dc3545',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                すべてクリア
              </button>
            </div>
          )}
        </form>
      </div>

      {/* キャラクター一覧 */}
      {characters.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>キャラクターがありません。</p>
          <button
            onClick={() => navigate('/characters/new')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            最初のキャラクターを作成
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => navigate(`/characters/${character.id}`)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {character.profile_image_url && (
                  <img
                    src={character.profile_image_url}
                    alt={character.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                    }}
                  />
                )}
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{character.name}</h3>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666', fontSize: '0.875rem' }}>
                  {SYSTEM_NAMES[character.system]}
                </p>
                {character.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {character.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#e9ecef',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {character.tags.length > 3 && (
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>
                        +{character.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ページネーション */}
          {total > 20 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage === 1 ? '#ccc' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                前へ
              </button>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                ページ {currentPage} / {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(total / 20)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: currentPage >= Math.ceil(total / 20) ? '#ccc' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer',
                }}
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

