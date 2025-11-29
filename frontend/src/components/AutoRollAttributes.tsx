import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { autoRollAttributes, AutoRollAttributesResponse, SystemEnum } from '../services/api';
import type { CthulhuAttributes, CthulhuDerived } from '../types/cthulhu';

interface AutoRollAttributesProps {
  characterId: string;
  system: SystemEnum;
  onApply?: (attributes: CthulhuAttributes, derived: CthulhuDerived) => void;
}

export const AutoRollAttributes = ({
  characterId,
  system,
  onApply,
}: AutoRollAttributesProps) => {
  const { getAccessToken } = useAuth();
  const [result, setResult] = useState<AutoRollAttributesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoll = async () => {
    if (system !== 'cthulhu') {
      setError('能力値自動生成は現在クトゥルフ神話TRPGのみ対応しています');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        setError('認証トークンの取得に失敗しました');
        setLoading(false);
        return;
      }

      const rollResult = await autoRollAttributes(token, characterId, system);
      setResult(rollResult);
    } catch (err: any) {
      console.error('Failed to auto roll attributes:', err);
      const errorMessage = err.response?.data?.detail || err.message || '能力値の自動生成に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result && onApply) {
      onApply(result.attributes as CthulhuAttributes, result.derived as CthulhuDerived);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.125rem' }}>能力値自動生成</h3>
        <button
          type="button"
          onClick={handleRoll}
          disabled={loading || system !== 'cthulhu'}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading || system !== 'cthulhu' ? '#ccc' : '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || system !== 'cthulhu' ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? '生成中...' : '能力値を自動生成'}
        </button>
      </div>

      {system !== 'cthulhu' && (
        <div style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '0.5rem' }}>
          能力値自動生成は現在クトゥルフ神話TRPGのみ対応しています
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>生成された能力値</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
              {Object.entries(result.attributes).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0.5rem', backgroundColor: '#fff', borderRadius: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>派生値</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#fff', borderRadius: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>SAN:</span> {result.derived.SAN_current}/{result.derived.SAN_max}
              </div>
              <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#fff', borderRadius: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>HP:</span> {result.derived.HP_current}/{result.derived.HP_max}
              </div>
              <div style={{ padding: '0.25rem 0.5rem', backgroundColor: '#fff', borderRadius: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>MP:</span> {result.derived.MP_current}/{result.derived.MP_max}
              </div>
            </div>
          </div>

          {onApply && (
            <button
              type="button"
              onClick={handleApply}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              この能力値を適用
            </button>
          )}
        </div>
      )}
    </div>
  );
};

