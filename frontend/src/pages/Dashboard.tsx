import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiFilter, FiPlus, FiSearch, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../auth/useAuth';
import { getCharacters } from '../services/api';
import type { Character, CharacterSort, SystemEnum } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { handleApiError, formatErrorMessage } from '../utils/errorHandler';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { IconText } from '../components/IconText';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

const SORT_OPTIONS: { value: CharacterSort; label: string }[] = [
  { value: 'updated_desc', label: '更新日（新しい順）' },
  { value: 'updated_asc', label: '更新日（古い順）' },
  { value: 'created_desc', label: '作成日（新しい順）' },
  { value: 'created_asc', label: '作成日（古い順）' },
  { value: 'name_asc', label: '名前（昇順）' },
  { value: 'name_desc', label: '名前（降順）' },
  { value: 'system_asc', label: 'システム（昇順）' },
];

export const Dashboard = () => {
  const { isAuthenticated, getAccessToken } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<SystemEnum | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<CharacterSort>('updated_desc');
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
          query: appliedSearchQuery || undefined,
          system: selectedSystem || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          sort,
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
  }, [isAuthenticated, appliedSearchQuery, selectedSystem, selectedTags, sort, currentPage]);

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

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setAppliedSearchQuery(searchQuery);
    setCurrentPage(1);
  };

  if (loading && characters.length === 0) {
    return <LoadingSpinner fullScreen message="キャラクターを読み込み中..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>マイページ</h1>
      </div>

      {/* 検索・フィルター */}
      <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--color-surface-muted)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
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
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            />
            
            {/* 検索ボタン */}
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-success)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              <IconText icon={<FiSearch />}>検索</IconText>
            </button>

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
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
            >
              <option value="">すべてのシステム</option>
              {Object.entries(SYSTEM_NAMES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* 並び替え */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as CharacterSort);
                setCurrentPage(1);
              }}
              style={{
                flex: '0 1 200px',
                padding: '0.5rem',
                fontSize: '0.875rem',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
              }}
              aria-label="並び替え"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* タグ検索 */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: '1 1 200px' }}>
              <input
                type="text"
                placeholder="タグで絞り込み..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddTag();
                  }
                }}
                style={{
                  flex: '1',
                  minWidth: '120px',
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                }}
              >
                <IconText icon={<FiFilter />}>絞り込み</IconText>
              </button>
            </div>
          </div>

          {/* 選択されたタグの表示 */}
          {selectedTags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>タグ:</span>
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-inverse)',
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
                      color: 'var(--color-text-inverse)',
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
                  color: 'var(--color-danger)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                <IconText icon={<FiXCircle />}>クリア</IconText>
              </button>
            </div>
          )}
        </form>

        {/* 現在の並び替え状態 */}
        <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          並び替え: <strong style={{ color: 'var(--color-text)' }}>{SORT_OPTIONS.find(o => o.value === sort)?.label ?? sort}</strong>
        </div>
      </div>

      {/* キャラクター一覧 */}
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* 新規作成カード（一覧の先頭） */}
          <div
            onClick={() => navigate('/characters/new')}
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: '8px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
              backgroundColor: 'var(--color-surface-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '260px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>＋</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                <IconText icon={<FiPlus />}>キャラクター作成</IconText>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                新しいキャラクターを作成します
              </div>
            </div>
          </div>

          {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => navigate(`/characters/${character.id}`)}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  backgroundColor: 'var(--color-surface)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
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
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  {SYSTEM_NAMES[character.system]}
                </p>
                {character.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {character.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--color-surface-muted)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {character.tags.length > 3 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        +{character.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
          ))}
        </div>

        {characters.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--color-text-muted)' }}>
            キャラクターがありません。
          </div>
        )}

        {/* ページネーション */}
        {total > 20 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentPage === 1 ? 'var(--color-disabled-bg)' : 'var(--color-primary)',
                color: currentPage === 1 ? 'var(--color-disabled-text)' : 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <IconText icon={<FiChevronLeft />}>前へ</IconText>
            </button>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              ページ {currentPage} / {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= Math.ceil(total / 20)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: currentPage >= Math.ceil(total / 20) ? 'var(--color-disabled-bg)' : 'var(--color-primary)',
                color: currentPage >= Math.ceil(total / 20) ? 'var(--color-disabled-text)' : 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: '4px',
                cursor: currentPage >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer',
              }}
            >
              <IconText icon={<FiChevronRight />}>次へ</IconText>
            </button>
          </div>
        )}
      </>
    </div>
  );
};

