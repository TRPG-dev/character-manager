import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { FaDiceD20 } from 'react-icons/fa';
import { useAuth } from '../auth/useAuth';
import { deleteCharacterImage, getCharacter, updateCharacter, uploadCharacterImage } from '../services/api';
import type { Character, SystemEnum } from '../services/api';
import { CthulhuSheetForm } from '../components/CthulhuSheetForm';
import type { CthulhuSheetData } from '../types/cthulhu';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
import { ShinobigamiSheetForm } from '../components/ShinobigamiSheetForm';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import { normalizeSheetData as normalizeShinobigamiSheetData } from '../utils/shinobigami';
import { Sw25SheetForm } from '../components/Sw25SheetForm';
import type { Sw25SheetData } from '../types/sw25';
import { normalizeSheetData as normalizeSw25SheetData, rollAttributeInitialsByRace } from '../utils/sw25';
import { CharacterSheetForm } from '../components/CharacterSheetForm';
import { DiceRoller } from '../components/DiceRoller';
import { AutoRollAttributes } from '../components/AutoRollAttributes';
import { CollapsibleSection } from '../components/CollapsibleSection';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImageAction, setPendingImageAction] = useState<'none' | 'upload' | 'delete'>('none');
  const [sheetData, setSheetData] = useState<string>('');
  const [cthulhuSheetData, setCthulhuSheetData] = useState<CthulhuSheetData | null>(null);
  const [shinobigamiSheetData, setShinobigamiSheetData] = useState<ShinobigamiSheetData | null>(null);
  const [sw25SheetData, setSw25SheetData] = useState<Sw25SheetData | null>(null);
  const [genericSheetData, setGenericSheetData] = useState<Record<string, any> | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const token = await getAccessToken();
        if (token) {
          const char = await getCharacter(token, id);
          setCharacter(char);
          setName(char.name);
          setTags(char.tags);
          setProfileImageUrl(char.profile_image_url || null);
          setImagePreview(char.profile_image_url || null);
          setSelectedImage(null);
          setPendingImageAction('none');
          setSheetData(JSON.stringify(char.sheet_data, null, 2));
          // システムに応じてシートデータを正規化
          if (char.system === 'cthulhu') {
            setCthulhuSheetData(normalizeCthulhuSheetData(char.sheet_data));
            setShinobigamiSheetData(null);
            setSw25SheetData(null);
            setGenericSheetData(null);
          } else if (char.system === 'shinobigami') {
            setShinobigamiSheetData(normalizeShinobigamiSheetData(char.sheet_data));
            setCthulhuSheetData(null);
            setSw25SheetData(null);
            setGenericSheetData(null);
          } else if (char.system === 'sw25') {
            setSw25SheetData(normalizeSw25SheetData(char.sheet_data));
            setCthulhuSheetData(null);
            setShinobigamiSheetData(null);
            setGenericSheetData(null);
          } else {
            setCthulhuSheetData(null);
            setShinobigamiSheetData(null);
            setSw25SheetData(null);
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

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
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
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      showError(error);
      return;
    }

    setSelectedImage(file);
    setPendingImageAction('upload');

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    // ここでは「削除予定」にするだけ（GCS操作は保存ボタン押下時）
    setSelectedImage(null);
    setPendingImageAction('delete');
    setImagePreview(null);
  };

  const handleSubmitClick = (e: FormEvent) => {
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
      
      const allSkills = [...cthulhuSheetData.skills, ...(cthulhuSheetData.combatSkills || []), ...(cthulhuSheetData.customSkills || [])];
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
        } else if (character.system === 'sw25' && sw25SheetData) {
          // ソードワールド2.5の場合はフォームデータを使用
          parsedSheetData = sw25SheetData;
        } else if (genericSheetData) {
          // satasupeの場合はフォームデータを使用
          parsedSheetData = genericSheetData;
        } else {
          // フォールバック: JSONテキストエリアから取得
          try {
            parsedSheetData = JSON.parse(sheetData);
          } catch {
            showError('シートデータが正しいJSON形式ではありません');
            setSaving(false);
            return;
          }
        }

        // NOTE: 画像は専用エンドポイントでのみ更新/削除する。
        // get/create/update は署名付きURLを返すため、それを profile_image_url として保存してしまう事故を避ける。
        await updateCharacter(token, id, {
          name: name.trim(),
          tags,
          sheet_data: parsedSheetData,
        });

        // 画像の変更は「保存」タイミングで実行
        if (pendingImageAction === 'delete') {
          await deleteCharacterImage(token, id);
          setProfileImageUrl(null);
          setImagePreview(null);
          setSelectedImage(null);
          setPendingImageAction('none');
        } else if (pendingImageAction === 'upload' && selectedImage) {
          const { public_url } = await uploadCharacterImage(token, id, selectedImage);
          setProfileImageUrl(public_url);
          setImagePreview(public_url);
          setSelectedImage(null);
          setPendingImageAction('none');
        }

        showSuccess('更新が完了しました');
        setTimeout(() => {
          navigate(`/characters/${id}`);
        }, 500);
      }
    } catch (error: unknown) {
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
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <IconText icon={<FiArrowLeft />}>マイページに戻る</IconText>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>キャラクター編集</h1>
      <form onSubmit={handleSubmitClick}>
        <CollapsibleSection title="基本情報" defaultOpen={true}>
          {/* 画像は保存ボタン押下時に反映 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              プロフィール画像（保存ボタン押下時に反映）
            </label>
            {imagePreview && (
              <div style={{ marginBottom: '0.75rem', position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    display: 'block',
                  }}
                />
                {!saving && (
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: 'color-mix(in srgb, var(--color-danger) 90%, transparent)',
                      color: 'var(--color-text-inverse)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                    }}
                  >
                    <IconText icon={<FiTrash2 />}>削除（保存で反映）</IconText>
                  </button>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageSelect}
                disabled={saving}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                }}
              />
              {!imagePreview && profileImageUrl && !saving && (
                <button
                  type="button"
                  onClick={handleImageRemove}
                  style={{
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--color-danger)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  <IconText icon={<FiTrash2 />}>削除（保存で反映）</IconText>
                </button>
              )}
            </div>
            {pendingImageAction !== 'none' && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {pendingImageAction === 'upload'
                  ? '画像の変更が保留中です（保存でアップロード）。'
                  : '画像の削除が保留中です（保存で削除）。'}
              </div>
            )}
          </div>

          {character.system === 'cthulhu' && cthulhuSheetData ? (
            <>
              <BasicInfoForm
                data={cthulhuSheetData}
                onChange={(data) => setCthulhuSheetData(data as CthulhuSheetData)}
                system={character.system}
                name={name}
                onNameChange={setName}
                tags={tags}
                onTagsChange={setTags}
              />
            </>
          ) : character.system === 'shinobigami' && shinobigamiSheetData ? (
            <>
              <BasicInfoForm
                data={shinobigamiSheetData}
                onChange={(data) => setShinobigamiSheetData(data as ShinobigamiSheetData)}
                system={character.system}
                name={name}
                onNameChange={setName}
                tags={tags}
                onTagsChange={setTags}
              />
            </>
          ) : character.system === 'sw25' && sw25SheetData ? (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  システム
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  {SYSTEM_NAMES[character.system]}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  名前 <span style={{ color: 'var(--color-danger)' }}>*</span>
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
                    border: nameError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                    borderRadius: '4px',
                  }}
                />
                {nameError && (
                  <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {nameError}
                  </div>
                )}
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
                        }}
                      >
                        <span aria-hidden>×</span>
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
                      border: '1px solid var(--color-border)',
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
                      backgroundColor: 'var(--color-secondary)',
                      color: 'var(--color-text-inverse)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <IconText icon={<FiPlus />}>追加</IconText>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  システム
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  {SYSTEM_NAMES[character.system]}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  名前 <span style={{ color: 'var(--color-danger)' }}>*</span>
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
                    border: nameError ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
                    borderRadius: '4px',
                  }}
                />
                {nameError && (
                  <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {nameError}
                  </div>
                )}
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
                        }}
                      >
                        <span aria-hidden>×</span>
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
                      border: '1px solid var(--color-border)',
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
                      backgroundColor: 'var(--color-secondary)',
                      color: 'var(--color-text-inverse)',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <IconText icon={<FiPlus />}>追加</IconText>
                  </button>
                </div>
              </div>
            </>
          )}
        </CollapsibleSection>

        {character.system !== 'shinobigami' && (
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

            {character.system === 'sw25' && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-muted)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 'bold' }}>能力値初期値ダイスロール</h3>
                <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  種族に応じた能力値初期値を自動でダイスロールします。<br />
                  ※基本情報で種族を選択してから使用してください。
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!sw25SheetData) {
                      showError('シートデータが読み込まれていません');
                      return;
                    }
                    if (!sw25SheetData.race || sw25SheetData.race === 'その他') {
                      showError('種族を選択してください');
                      return;
                    }
                    if (!confirm(`${sw25SheetData.race}の能力値初期値をダイスロールで決定しますか？\n現在の初期値は上書きされます。`)) {
                      return;
                    }
                    const rolledValues = rollAttributeInitialsByRace(sw25SheetData.race);
                    const updated = { 
                      ...sw25SheetData, 
                      attributeInitials: rolledValues 
                    };
                    setSw25SheetData(updated);
                    showSuccess(`能力値初期値をダイスロールしました（${sw25SheetData.race}）`);
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
                  <IconText icon={<FaDiceD20 />}>能力値初期値をダイスロール</IconText>
                </button>
              </div>
            )}
          </CollapsibleSection>
        )}


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
          ) : character.system === 'sw25' && sw25SheetData ? (
            <Sw25SheetForm
              data={sw25SheetData}
              onChange={(data) => setSw25SheetData(data)}
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
                  border: '1px solid var(--color-border)',
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
              backgroundColor: saving || !name.trim() || !!nameError ? 'var(--color-disabled-bg)' : 'var(--color-primary)',
              color: saving || !name.trim() || !!nameError ? 'var(--color-disabled-text)' : 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: '4px',
              cursor: saving || !name.trim() || !!nameError ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
            }}
          >
            {saving ? '保存中...' : <IconText icon={<FiSave />}>保存</IconText>}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/characters/${id}`)}
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
            <IconText icon={<FiArrowLeft />}>詳細に戻る</IconText>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="保存の確認"
        message="変更内容を保存しますか？"
        confirmText="保存"
        cancelText="閉じる"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmDialog(false)}
      />

    </div>
  );
};

