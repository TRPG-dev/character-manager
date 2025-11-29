import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { getCharacter, deleteCharacter, publishCharacter } from '../services/api';
import type { Character, SystemEnum } from '../services/api';
import { CthulhuSheetView } from '../components/CthulhuSheetView';
import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
import { ShinobigamiSheetView } from '../components/ShinobigamiSheetView';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import { normalizeSheetData as normalizeShinobigamiSheetData } from '../utils/shinobigami';
import { CharacterSheetView } from '../components/CharacterSheetView';
import { ImageModal } from '../components/ImageModal';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const CharacterDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, getAccessToken } = useAuth();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id || !isAuthenticated) return;
      
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (token) {
          const char = await getCharacter(token, id);
          setCharacter(char);
          // 所有者かどうかの判定（簡易版、実際にはuser情報と比較）
          setIsOwner(true); // 認証済みなので所有者と仮定
        }
      } catch (error) {
        console.error('Failed to fetch character:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id, isAuthenticated]);

  const handleDelete = async () => {
    if (!id || !confirm('本当に削除しますか？')) return;
    
    try {
      const token = await getAccessToken();
      if (token) {
        await deleteCharacter(token, id);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
      alert('削除に失敗しました');
    }
  };

  const handleTogglePublish = async () => {
    if (!character || !id) return;
    
    try {
      const token = await getAccessToken();
      if (token) {
        const response = await publishCharacter(token, id, !character.is_public);
        setCharacter({ ...character, is_public: response.is_public, share_token: response.share_token });
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
      alert('公開状態の変更に失敗しました');
    }
  };

  const copyShareLink = () => {
    if (character?.share_token) {
      const shareUrl = `${window.location.origin}/share/${character.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      alert('共有リンクをコピーしました');
    }
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!character) {
    return <div>キャラクターが見つかりません</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* ヘッダーセクション */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{character.name}</h1>
          {isOwner && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/characters/${id}/edit`)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                編集
              </button>
              <button
                onClick={handleTogglePublish}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: character.is_public ? '#ffc107' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {character.is_public ? '非公開にする' : '公開する'}
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                削除
              </button>
            </div>
          )}
        </div>

        {character.is_public && character.share_token && isOwner && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#d1ecf1', 
            borderRadius: '8px',
            border: '1px solid #bee5eb'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.875rem' }}>共有リンク:</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ 
                flex: 1, 
                minWidth: '200px',
                padding: '0.5rem', 
                backgroundColor: '#fff', 
                borderRadius: '4px',
                fontSize: '0.875rem',
                wordBreak: 'break-all'
              }}>
                {window.location.origin}/share/{character.share_token}
              </code>
              <button
                onClick={copyShareLink}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                }}
              >
                コピー
              </button>
            </div>
          </div>
        )}
      </section>

      {/* プロフィール画像セクション */}
      <section style={{ marginBottom: '2rem' }}>
        {character.profile_image_url ? (
          <div 
            style={{ 
              marginBottom: '1rem',
              cursor: 'pointer',
              display: 'inline-block',
            }}
            onClick={() => setIsImageModalOpen(true)}
          >
            <img
              src={character.profile_image_url}
              alt={character.name}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                width: 'auto',
                height: 'auto',
                borderRadius: '8px',
                border: '2px solid #dee2e6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            />
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#6c757d',
              textAlign: 'center'
            }}>
              クリックで拡大表示
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            height: '300px',
            backgroundColor: '#f8f9fa',
            border: '2px dashed #dee2e6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6c757d',
            fontSize: '1rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</div>
              <div>プロフィール画像なし</div>
            </div>
          </div>
        )}
        {isImageModalOpen && character.profile_image_url && (
          <ImageModal
            imageUrl={character.profile_image_url}
            alt={character.name}
            onClose={() => setIsImageModalOpen(false)}
          />
        )}
      </section>

      {/* 基本情報セクション */}
      <section style={{ 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1rem', 
          fontSize: '1.5rem',
          borderBottom: '2px solid #007bff',
          paddingBottom: '0.5rem'
        }}>
          基本情報
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.25rem' }}>システム</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{SYSTEM_NAMES[character.system]}</div>
          </div>
          {character.tags.length > 0 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>タグ</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {character.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#007bff',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* キャラクターシートセクション */}
      <section style={{ 
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1.5rem', 
          fontSize: '1.5rem',
          borderBottom: '2px solid #007bff',
          paddingBottom: '0.5rem'
        }}>
          キャラクターシート
        </h2>
        {character.system === 'cthulhu' ? (
          <CthulhuSheetView data={normalizeCthulhuSheetData(character.sheet_data) as CthulhuSheetData} />
        ) : character.system === 'shinobigami' ? (
          <ShinobigamiSheetView data={normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData} />
        ) : (
          <CharacterSheetView data={character.sheet_data} />
        )}
      </section>
    </div>
  );
};

