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

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

export const CharacterCreate = () => {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedSystem, setSelectedSystem] = useState<SystemEnum | null>(null);
  const [name, setName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetData, setSheetData] = useState<CthulhuSheetData | ShinobigamiSheetData | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
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
      const allSkills = [...cthulhuData.skills, ...(cthulhuData.customSkills || [])];
      const totalJobPoints = calculateTotalJobPoints(allSkills);
      const totalInterestPoints = calculateTotalInterestPoints(allSkills);
      const jobPointsLimit = getJobPointsLimit(cthulhuData.attributes.EDU);
      const interestPointsLimit = getInterestPointsLimit(cthulhuData.attributes.INT);

      if (totalJobPoints > jobPointsLimit || totalInterestPoints > interestPointsLimit) {
        alert(`ポイントの上限を超えています。\n職業P: ${totalJobPoints}/${jobPointsLimit}\n興味P: ${totalInterestPoints}/${interestPointsLimit}`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        alert('認証トークンの取得に失敗しました。再度ログインしてください。');
        setLoading(false);
        return;
      }
      const character = await createCharacter(token, {
        system: selectedSystem,
        name: name.trim(),
        tags,
        sheet_data: (selectedSystem === 'cthulhu' || selectedSystem === 'shinobigami') && sheetData ? sheetData : undefined,
      });

      // 画像が選択されている場合はアップロード
      if (selectedImage) {
        try {
          await uploadImageAfterCreate(character.id, selectedImage, token);
          alert('画像のアップロードが完了しました');
        } catch (error: any) {
          console.error('Failed to upload image:', error);
          alert('画像のアップロードに失敗しましたが、キャラクターは作成されました');
        }
      }

      navigate(`/characters/${character.id}`);
    } catch (error: any) {
      console.error('Failed to create character:', error);
      if (error.response?.status === 401) {
        const errorDetail = error.response?.data?.detail || '認証に失敗しました';
        alert(`認証エラー: ${errorDetail}\n再度ログインしてください。`);
      } else if (error.response?.data?.detail?.error === 'skill_points_limit_exceeded') {
        alert(`保存に失敗しました: ${error.response.data.detail.message}\n${error.response.data.detail.details?.join('\n')}`);
      } else {
        const errorMessage = error.response?.data?.detail || error.message || 'キャラクターの作成に失敗しました';
        alert(`エラー: ${errorMessage}`);
      }
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
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            システム
          </label>
          <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {selectedSystem && SYSTEM_NAMES[selectedSystem]}
          </div>
          <button
            type="button"
            onClick={() => setStep('select')}
            style={{
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            変更
          </button>
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
            プロフィール画像
          </label>
          {imagePreview && (
            <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
              <img
                src={imagePreview}
                alt="プレビュー"
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              />
              {!uploadingImage && (
                <button
                  type="button"
                  onClick={handleImageRemove}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'rgba(220, 53, 69, 0.9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  削除
                </button>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleImageSelect}
            disabled={uploadingImage || loading}
            style={{
              padding: '0.5rem',
              fontSize: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
            PNG/JPEG形式、最大5MB
          </div>
          {uploadingImage && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>画像をアップロード中...</div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  height: '8px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    backgroundColor: '#007bff',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
                {Math.round(uploadProgress)}%
              </div>
            </div>
          )}
        </div>

        <DiceRoller initialFormula="3d6" />

        {selectedSystem === 'cthulhu' && sheetData && (
          <div style={{ marginTop: '2rem' }}>
            <CthulhuSheetForm
              data={sheetData as CthulhuSheetData}
              onChange={(data) => setSheetData(data)}
            />
          </div>
        )}

        {selectedSystem === 'shinobigami' && sheetData && (
          <div style={{ marginTop: '2rem' }}>
            <ShinobigamiSheetForm
              data={sheetData as ShinobigamiSheetData}
              onChange={(data) => setSheetData(data)}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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
        </div>
      </form>
    </div>
  );
};

