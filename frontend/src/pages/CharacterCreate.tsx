import { useState, useRef, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { createCharacter, updateCharacter, uploadCharacterImage } from '../services/api';
import type { SystemEnum } from '../services/api';
import { CthulhuSheetForm } from '../components/CthulhuSheetForm';
import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
import { ShinobigamiSheetForm } from '../components/ShinobigamiSheetForm';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import { normalizeSheetData as normalizeShinobigamiSheetData } from '../utils/shinobigami';
import { Sw25SheetForm } from '../components/Sw25SheetForm';
import type { Sw25SheetData } from '../types/sw25';
import { normalizeSheetData as normalizeSw25SheetData, rollAttributeInitialsByRace } from '../utils/sw25';
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
  const [sheetData, setSheetData] = useState<CthulhuSheetData | ShinobigamiSheetData | Sw25SheetData | null>(null);
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
    } else if (system === 'sw25') {
      setSheetData(normalizeSw25SheetData({
        abilities: {
          技: 0,
          体: 0,
          心: 0,
        },
        attributes: {
          器用度: 0,
          敏捷度: 0,
          筋力: 0,
          生命力: 0,
          知力: 0,
          精神力: 0,
          HP: 0,
          MP: 0,
          生命抵抗力: 0,
          精神抵抗力: 0,
        },
        classes: [],
        skills: [],
        magics: [],
        weapons: [],
        armors: [],
        items: [],
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

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
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
      await uploadCharacterImage(token, characterId, file, (percent) => setUploadProgress(percent));
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
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
        sheet_data: (selectedSystem === 'cthulhu' || selectedSystem === 'shinobigami' || selectedSystem === 'sw25') && sheetData ? sheetData : undefined,
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
                border: '2px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                fontSize: '1.125rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
              }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
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
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text-inverse)',
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
          {selectedSystem === 'shinobigami' && sheetData && (
            <BasicInfoForm
              data={sheetData as ShinobigamiSheetData}
              onChange={(data) => setSheetData(data)}
              system={selectedSystem}
              name={name}
              onNameChange={setName}
              tags={tags}
              onTagsChange={setTags}
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
          {selectedSystem === 'sw25' && sheetData && (
            <BasicInfoForm
              data={sheetData as Sw25SheetData}
              onChange={(data) => setSheetData(data)}
              system={selectedSystem}
              name={name}
              onNameChange={setName}
              tags={tags}
              onTagsChange={setTags}
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

        {selectedSystem !== 'shinobigami' && (
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

            {selectedSystem === 'sw25' && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold' }}>能力値初期値ダイスロール</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  種族に応じた能力値初期値を自動でダイスロールします。<br />
                  ※基本情報で種族を選択してから使用してください。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!sheetData || !('race' in sheetData)) {
                      showWarning('シートデータが読み込まれていません');
                      return;
                    }
                    const sw25Data = sheetData as Sw25SheetData;
                    if (!sw25Data.race || sw25Data.race === 'その他') {
                      showWarning('種族を選択してください');
                      return;
                    }
                    if (!confirm(`${sw25Data.race}の能力値初期値をダイスロールで決定しますか？\n現在の初期値は上書きされます。`)) {
                      return;
                    }
                    const rolledValues = rollAttributeInitialsByRace(sw25Data.race);
                    const updated = { 
                      ...sw25Data, 
                      attributeInitials: rolledValues 
                    };
                    setSheetData(updated);
                    showSuccess(`能力値初期値をダイスロールしました（${sw25Data.race}）`);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-success)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                  }}
                >
                  🎲 能力値初期値をダイスロール
                </button>
              </div>
            )}
          </CollapsibleSection>
        )}

        <CollapsibleSection title="キャラクターシート" defaultOpen={true}>
          {selectedSystem === 'cthulhu' && sheetData && (
            <CthulhuSheetForm
              data={sheetData as CthulhuSheetData}
              onChange={(data) => setSheetData(data)}
            />
          )}
          {selectedSystem === 'shinobigami' && sheetData && (
            <ShinobigamiSheetForm
              data={sheetData as ShinobigamiSheetData}
              onChange={(data) => setSheetData(data)}
            />
          )}
          {selectedSystem === 'sw25' && sheetData && (
            <Sw25SheetForm
              data={sheetData as Sw25SheetData}
              onChange={(data) => setSheetData(data)}
            />
          )}
        </CollapsibleSection>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {!createdCharacterId ? (
            <>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: loading || !name.trim() ? 'var(--color-disabled-bg)' : 'var(--color-primary)',
                  color: loading || !name.trim() ? 'var(--color-disabled-text)' : 'var(--color-text-inverse)',
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
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-text-inverse)',
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
                      sheet_data: (selectedSystem === 'cthulhu' || selectedSystem === 'shinobigami' || selectedSystem === 'sw25') && sheetData ? sheetData : undefined,
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
                  backgroundColor: loading ? 'var(--color-disabled-bg)' : 'var(--color-success)',
                  color: loading ? 'var(--color-disabled-text)' : 'var(--color-text-inverse)',
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
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-text-inverse)',
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

