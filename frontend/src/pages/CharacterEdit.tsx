import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { getCharacter, updateCharacter } from '../services/api';
import type { Character, SystemEnum } from '../services/api';
import { CthulhuSheetForm } from '../components/CthulhuSheetForm';
import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
import { ShinobigamiSheetForm } from '../components/ShinobigamiSheetForm';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import { normalizeSheetData as normalizeShinobigamiSheetData } from '../utils/shinobigami';
import { CharacterSheetForm } from '../components/CharacterSheetForm';
import { ImageUpload } from '../components/ImageUpload';
import { DiceRoller } from '../components/DiceRoller';
import { AutoRollAttributes } from '../components/AutoRollAttributes';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Toast } from '../components/Toast';
import { useToast } from '../contexts/ToastContext';
import { handleApiError, formatErrorMessage } from '../utils/errorHandler';
import { LoadingSpinner } from '../components/LoadingSpinner';

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
  const { showSuccess, showError } = useToast();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<string>('');
  const [cthulhuSheetData, setCthulhuSheetData] = useState<CthulhuSheetData | null>(null);
  const [shinobigamiSheetData, setShinobigamiSheetData] = useState<ShinobigamiSheetData | null>(null);
  const [genericSheetData, setGenericSheetData] = useState<Record<string, any> | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (token) {
          setAccessToken(token);
          const char = await getCharacter(token, id);
          setCharacter(char);
          setName(char.name);
          setTags(char.tags);
          setProfileImageUrl(char.profile_image_url || null);
          setSheetData(JSON.stringify(char.sheet_data, null, 2));
          // システムに応じてシートデータを正規化
          if (char.system === 'cthulhu') {
            setCthulhuSheetData(normalizeCthulhuSheetData(char.sheet_data));
            setShinobigamiSheetData(null);
            setGenericSheetData(null);
          } else if (char.system === 'shinobigami') {
            setShinobigamiSheetData(normalizeShinobigamiSheetData(char.sheet_data));
            setCthulhuSheetData(null);
            setGenericSheetData(null);
          } else {
            setCthulhuSheetData(null);
            setShinobigamiSheetData(null);
            setGenericSheetData(char.sheet_data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch character:', error);
        const apiError = handleApiError(error);
        showError(formatErrorMessage(apiError));
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('名前は必須です');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.trim()) {
      setNameError('');
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

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateName(name)) {
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    await performSave();
  };

  const performSave = async () => {
    if (!id || !character) return;

    // クトゥルフの場合、ポイント上限チェック
    if (character.system === 'cthulhu' && cthulhuSheetData) {
      const { calculateTotalJobPoints, calculateTotalInterestPoints } = await import('../data/cthulhuSkills');
      const { getJobPointsLimit, getInterestPointsLimit } = await import('../utils/cthulhu');
      
      const allSkills = [...cthulhuSheetData.skills, ...(cthulhuSheetData.customSkills || [])];
      const totalJobPoints = calculateTotalJobPoints(allSkills);
      const totalInterestPoints = calculateTotalInterestPoints(allSkills);
      const jobPointsLimit = getJobPointsLimit(cthulhuSheetData.attributes.EDU);
      const interestPointsLimit = getInterestPointsLimit(cthulhuSheetData.attributes.INT);

      if (totalJobPoints > jobPointsLimit || totalInterestPoints > interestPointsLimit) {
        alert(`ポイントの上限を超えています。\n職業P: ${totalJobPoints}/${jobPointsLimit}\n興味P: ${totalInterestPoints}/${interestPointsLimit}`);
        return;
      }
    }

    setSaving(true);
    try {
      const token = await getAccessToken();
      if (token) {
        let parsedSheetData;
        if (character.system === 'cthulhu' && cthulhuSheetData) {
          // クトゥルフの場合はフォームデータを使用
          parsedSheetData = cthulhuSheetData;
        } else if (character.system === 'shinobigami' && shinobigamiSheetData) {
          // シノビガミの場合はフォームデータを使用
          parsedSheetData = shinobigamiSheetData;
        } else if (genericSheetData) {
          // sw25、satasupeの場合はフォームデータを使用
          parsedSheetData = genericSheetData;
        } else {
          // フォールバック: JSONテキストエリアから取得
          try {
            parsedSheetData = JSON.parse(sheetData);
          } catch (error) {
            showError('シートデータが正しいJSON形式ではありません');
            setSaving(false);
            return;
          }
        }

        await updateCharacter(token, id, {
          name: name.trim(),
          tags,
          profile_image_url: profileImageUrl,
          sheet_data: parsedSheetData,
        });
        showSuccess('更新が完了しました');
        setTimeout(() => {
          navigate(`/characters/${id}`);
        }, 1000);
      }
    } catch (error: any) {
      console.error('Failed to update character:', error);
      const apiError = handleApiError(error);
      showError(formatErrorMessage(apiError));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="キャラクターを読み込み中..." />;
  }

  if (!character) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>キャラクターが見つかりません</h2>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ダッシュボードに戻る
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>キャラクター編集</h1>
      <form onSubmit={handleSubmitClick}>
        <CollapsibleSection title="基本情報" defaultOpen={true}>
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
              onChange={handleNameChange}
              onBlur={() => validateName(name)}
              required
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.75rem',
                fontSize: '1rem',
                border: nameError ? '1px solid #dc3545' : '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
            {nameError && (
              <div style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {nameError}
              </div>
            )}
          </div>

          {id && accessToken && (
            <div style={{ marginBottom: '1.5rem' }}>
              <ImageUpload
                characterId={id}
                accessToken={accessToken}
                currentImageUrl={profileImageUrl}
                onUploadSuccess={(imageUrl) => {
                  setProfileImageUrl(imageUrl);
                  showSuccess('画像のアップロードが完了しました');
                }}
                onError={(error) => {
                  showError(`エラー: ${error}`);
                }}
              />
            </div>
          )}

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
        </CollapsibleSection>

        <CollapsibleSection title="ツール" defaultOpen={false}>
          <DiceRoller initialFormula="3d6" />

          {id && character.system === 'cthulhu' && (
            <div style={{ marginTop: '1rem' }}>
              <AutoRollAttributes
                characterId={id}
                system={character.system}
                onApply={(attributes, derived) => {
                  if (cthulhuSheetData) {
                    const updated = {
                      ...cthulhuSheetData,
                      attributes,
                      derived,
                    };
                    setCthulhuSheetData(updated);
                  }
                }}
              />
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="キャラクターシート" defaultOpen={true}>
          {character.system === 'cthulhu' && cthulhuSheetData ? (
            <CthulhuSheetForm
              data={cthulhuSheetData}
              onChange={(data) => setCthulhuSheetData(data)}
            />
          ) : character.system === 'shinobigami' && shinobigamiSheetData ? (
            <ShinobigamiSheetForm
              data={shinobigamiSheetData}
              onChange={(data) => setShinobigamiSheetData(data)}
            />
          ) : genericSheetData ? (
            <CharacterSheetForm
              data={genericSheetData}
              onChange={(data) => setGenericSheetData(data)}
            />
          ) : (
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
          )}
        </CollapsibleSection>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            type="submit"
            disabled={saving || !name.trim() || !!nameError}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: saving || !name.trim() || !!nameError ? '#ccc' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: saving || !name.trim() || !!nameError ? 'not-allowed' : 'pointer',
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

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="保存の確認"
        message="変更内容を保存しますか？"
        confirmText="保存"
        cancelText="キャンセル"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmDialog(false)}
      />

    </div>
  );
};

