import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { createCharacter, getImageUploadUrl, updateCharacter } from '../services/api';
import type { SystemEnum } from '../services/api';
import { CthulhuSheetForm } from '../components/CthulhuSheetForm';
import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
import { ShinobigamiSheetForm } from '../components/ShinobigamiSheetForm';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import { normalizeSheetData as normalizeShinobigamiSheetData } from '../utils/shinobigami';
import { DiceRoller } from '../components/DiceRoller';
import { AutoRollAttributes } from '../components/AutoRollAttributes';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { useToast } from '../contexts/ToastContext';
import { handleApiError, formatErrorMessage } from '../utils/errorHandler';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const CharacterCreate = () => {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedSystem, setSelectedSystem] = useState<SystemEnum | null>(null);
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sheetData, setSheetData] = useState<CthulhuSheetData | ShinobigamiSheetData | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createdCharacterId, setCreatedCharacterId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSystemSelect = (system: SystemEnum) => {
    setSelectedSystem(system);
    setStep('form');
    // システムに応じて初期シートデータを設定
    if (system === 'cthulhu') {
      setSheetData(normalizeCthulhuSheetData({
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
    } else if (system === 'shinobigami') {
      setSheetData(normalizeShinobigamiSheetData({
        attributes: {
          体術: 0,
          忍術: 0,
          謀術: 0,
          戦術: 0,
          器術: 0,
          心術: 0,
        },
        skills: [],
        secret_flag: false,
        background: '',
      }));
    } else {
      setSheetData(null);
    }
  };


  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'PNGまたはJPEG形式の画像を選択してください';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'ファイルサイズは5MB以下にしてください';
    }
    return null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        alert(error);
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageAfterCreate = async (characterId: string, file: File, token: string) => {
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      // 1. 署名付きURLを取得
      const { upload_url, public_url } = await getImageUploadUrl(token, characterId, file.type);
      
      console.log('Upload URL received:', upload_url);
      console.log('Public URL:', public_url);
      console.log('File type:', file.type);
      console.log('File size:', file.size);

      // 2. 署名付きURLにPUTリクエストで画像をアップロード
      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', async () => {
          console.log('XHR load event - Status:', xhr.status);
          console.log('Response:', xhr.responseText);
          if (xhr.status === 200 || xhr.status === 204) {
            try {
              // 3. キャラクターのprofile_image_urlを更新
              await updateCharacter(token, characterId, {
                profile_image_url: public_url,
              });
              resolve();
            } catch (error: any) {
              console.error('Failed to update character:', error);
              reject(error);
            }
          } else {
            const errorMsg = `アップロードに失敗しました (ステータス: ${xhr.status}, レスポンス: ${xhr.responseText || 'なし'})`;
            console.error(errorMsg);
            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener('error', (e) => {
          console.error('XHR error:', e);
          console.error('Upload URL:', upload_url);
          console.error('File type:', file.type);
          console.error('File size:', file.size);
          reject(new Error(`アップロード中にエラーが発生しました。URL: ${upload_url}`));
        });

        xhr.addEventListener('timeout', () => {
          reject(new Error('アップロードがタイムアウトしました'));
        });

        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.timeout = 30000; // 30秒のタイムアウト
        xhr.send(file);
      });
    } catch (error: any) {
      console.error('Failed to get upload URL:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSystem || !name.trim()) return;

    // クトゥルフの場合、ポイント上限チェック
    if (selectedSystem === 'cthulhu' && sheetData && 'customSkills' in sheetData) {
      const { calculateTotalJobPoints, calculateTotalInterestPoints } = await import('../data/cthulhuSkills');
      const { getJobPointsLimit, getInterestPointsLimit } = await import('../utils/cthulhu');
      
      const cthulhuData = sheetData as CthulhuSheetData;
      const allSkills = [...cthulhuData.skills, ...(cthulhuData.combatSkills || []), ...(cthulhuData.customSkills || [])];
      const totalJobPoints = calculateTotalJobPoints(allSkills);
      const totalInterestPoints = calculateTotalInterestPoints(allSkills);
      const jobPointsLimit = getJobPointsLimit(cthulhuData.attributes.EDU);
      const interestPointsLimit = getInterestPointsLimit(cthulhuData.attributes.INT);

      if (totalJobPoints > jobPointsLimit || totalInterestPoints > interestPointsLimit) {
        showWarning(`ポイントの上限を超えています。\n職業P: ${totalJobPoints}/${jobPointsLimit}\n興味P: ${totalInterestPoints}/${interestPointsLimit}`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        showError('認証トークンの取得に失敗しました。再度ログインしてください。');
        setLoading(false);
        return;
      }
      const character = await createCharacter(token, {
        system: selectedSystem,
        name: name.trim(),
        tags,
        sheet_data: (selectedSystem === 'cthulhu' || selectedSystem === 'shinobigami') && sheetData ? sheetData : undefined,
      });
      
      setCreatedCharacterId(character.id);

      // 画像が選択されている場合はアップロード
      if (selectedImage) {
        try {
          await uploadImageAfterCreate(character.id, selectedImage, token);
          showSuccess('画像のアップロードが完了しました');
        } catch (error: any) {
          console.error('Failed to upload image:', error);
          showWarning('画像のアップロードに失敗しましたが、キャラクターは作成されました');
        }
      }

      showSuccess('キャラクターを作成しました。続けて編集できます。');
    } catch (error: any) {
      console.error('Failed to create character:', error);
      const apiError = handleApiError(error);
      showError(formatErrorMessage(apiError));
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
        <CollapsibleSection title="基本情報" defaultOpen={true}>
          {selectedSystem === 'cthulhu' && sheetData && (
            <BasicInfoForm
              data={sheetData as CthulhuSheetData}
              onChange={(data) => setSheetData(data)}
              system={selectedSystem}
              name={name}
              onNameChange={setName}
              tags={tags}
              onTagsChange={setTags}
              selectedImage={selectedImage}
              imagePreview={imagePreview}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              uploadingImage={uploadingImage}
              uploadProgress={uploadProgress}
              fileInputRef={fileInputRef}
              loading={loading}
              onSystemChange={() => setStep('select')}
            />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="ツール" defaultOpen={false}>
          <DiceRoller initialFormula="3d6" />

          {selectedSystem === 'cthulhu' && (
            <div style={{ marginTop: '1rem' }}>
              <AutoRollAttributes
                characterId={createdCharacterId || undefined}
                system={selectedSystem}
                onApply={(attributes, derived) => {
                  if (sheetData && 'attributes' in sheetData) {
                    const cthulhuData = sheetData as CthulhuSheetData;
                    const updated = {
                      ...cthulhuData,
                      attributes,
                      derived,
                    };
                    setSheetData(updated);
                  }
                }}
              />
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="キャラクターシート" defaultOpen={true}>
          {selectedSystem === 'cthulhu' && sheetData && (
            <CthulhuSheetForm
              data={sheetData as CthulhuSheetData}
              onChange={(data) => setSheetData(data)}
            />
          )}
        </CollapsibleSection>

        {selectedSystem === 'shinobigami' && sheetData && (
          <div style={{ marginTop: '2rem' }}>
            <ShinobigamiSheetForm
              data={sheetData as ShinobigamiSheetData}
              onChange={(data) => setSheetData(data)}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {!createdCharacterId ? (
            <>
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
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={async () => {
                  if (!createdCharacterId) return;
                  setLoading(true);
                  try {
                    const token = await getAccessToken();
                    if (!token) {
                      showError('認証トークンの取得に失敗しました。再度ログインしてください。');
                      setLoading(false);
                      return;
                    }
                    await updateCharacter(token, createdCharacterId, {
                      sheet_data: (selectedSystem === 'cthulhu' || selectedSystem === 'shinobigami') && sheetData ? sheetData : undefined,
                    });
                    showSuccess('更新が完了しました');
                    navigate(`/characters/${createdCharacterId}`);
                  } catch (error: any) {
                    console.error('Failed to update character:', error);
                    const apiError = handleApiError(error);
                    showError(formatErrorMessage(apiError));
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                }}
              >
                {loading ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/characters/${createdCharacterId}`)}
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
                詳細を見る
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

