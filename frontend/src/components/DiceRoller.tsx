import { useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { rollDice } from '../services/api';

interface DiceRollResponse {
  rolls: number[];
  total: number;
}

interface DiceRollerProps {
  onRollResult?: (result: DiceRollResponse) => void;
  initialFormula?: string;
}

export const DiceRoller = ({ onRollResult, initialFormula = '3d6' }: DiceRollerProps) => {
  const { getAccessToken } = useAuth();
  const [formula, setFormula] = useState(initialFormula);
  const [result, setResult] = useState<DiceRollResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoll = async () => {
    if (!formula.trim()) {
      setError('ダイス式を入力してください');
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

      const rollResult = await rollDice(token, formula.trim());
      setResult(rollResult);
      onRollResult?.(rollResult);
    } catch (err: any) {
      console.error('Failed to roll dice:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'ダイスロールに失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFormulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormula(e.target.value);
    setError(null);
    setResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleRoll();
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        ダイスロール
      </label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={formula}
          onChange={handleFormulaChange}
          onKeyPress={handleKeyPress}
          placeholder="3d6"
          disabled={loading}
          style={{
            padding: '0.5rem',
            fontSize: '0.875rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: '100px',
            maxWidth: '150px',
          }}
        />
        <button
          type="button"
          onClick={handleRoll}
          disabled={loading || !formula.trim()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading || !formula.trim() ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !formula.trim() ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'ロール中...' : 'ロール'}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: '0.5rem',
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
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#d4edda',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
            結果: {result.rolls.join(', ')}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
            合計: {result.total}
          </div>
        </div>
      )}

      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
        形式: XdY (例: 3d6, 1d20, 4d10)
      </div>
    </div>
  );
};

