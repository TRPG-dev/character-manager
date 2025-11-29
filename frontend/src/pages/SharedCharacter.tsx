import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedCharacter, Character, SystemEnum } from '../services/api';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const SharedCharacter = () => {
  const { token } = useParams<{ token: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!token) return;
      
      setLoading(true);
      try {
        const char = await getSharedCharacter(token);
        setCharacter(char);
      } catch (error) {
        console.error('Failed to fetch shared character:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [token]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (!character) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>キャラクターが見つかりません</h1>
        <p>このリンクは無効か、キャラクターが非公開になっています。</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>{character.name}</h1>

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
        <pre style={{
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
        }}>
          {JSON.stringify(character.sheet_data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

