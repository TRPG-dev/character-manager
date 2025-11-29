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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>{character.name}</h1>
        {isOwner && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate(`/characters/${id}/edit`)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
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
              }}
            >
              削除
            </button>
          </div>
        )}
      </div>

      {character.is_public && character.share_token && isOwner && (
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#d1ecf1', borderRadius: '4px' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>共有リンク:</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <code style={{ flex: 1, padding: '0.5rem', backgroundColor: '#fff', borderRadius: '4px' }}>
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
              }}
            >
              コピー
            </button>
          </div>
        </div>
      )}

      {character.profile_image_url && (
        <div style={{ marginBottom: '2rem' }}>
          <img
            src={character.profile_image_url}
            alt={character.name}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <strong>システム:</strong> {SYSTEM_NAMES[character.system]}
      </div>

      {character.tags.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <strong>タグ:</strong>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {character.tags.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>キャラクターシート</h2>
        {character.system === 'cthulhu' ? (
          <CthulhuSheetView data={normalizeCthulhuSheetData(character.sheet_data) as CthulhuSheetData} />
        ) : character.system === 'shinobigami' ? (
          <ShinobigamiSheetView data={normalizeShinobigamiSheetData(character.sheet_data) as ShinobigamiSheetData} />
        ) : (
          <pre style={{
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            {JSON.stringify(character.sheet_data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

