import { useState, useRef } from 'react';
import type { CthulhuSheetData } from '../types/cthulhu';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import type { SystemEnum } from '../services/api';

const SYSTEM_NAMES: Record<SystemEnum, string> = {
  cthulhu: 'クトゥルフ神話TRPG',
  shinobigami: 'シノビガミ',
  sw25: 'ソードワールド2.5',
  satasupe: 'サタスペ',
};

interface BasicInfoFormProps {
  data: CthulhuSheetData | ShinobigamiSheetData;
  onChange: (data: CthulhuSheetData | ShinobigamiSheetData) => void;
  // キャラクター基本情報
  system?: SystemEnum | null;
  name: string;
  onNameChange: (name: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  // プロフィール画像
  selectedImage?: File | null;
  imagePreview?: string | null;
  onImageSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove?: () => void;
  uploadingImage?: boolean;
  uploadProgress?: number;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
  loading?: boolean;
  // システム変更（新規作成時のみ）
  onSystemChange?: () => void;
}

export const BasicInfoForm = ({
  data,
  onChange,
  system,
  name,
  onNameChange,
  tags,
  onTagsChange,
  selectedImage,
  imagePreview,
  onImageSelect,
  onImageRemove,
  uploadingImage,
  uploadProgress,
  fileInputRef,
  loading,
  onSystemChange,
}: BasicInfoFormProps) => {
  const [tagInput, setTagInput] = useState('');


  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* システム */}
      {system !== undefined && (
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            システム
          </label>
          <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {system && SYSTEM_NAMES[system]}
          </div>
          {onSystemChange && (
            <button
              type="button"
              onClick={onSystemChange}
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
          )}
        </div>
      )}

      {/* 名前 */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          キャラクター名 <span style={{ color: 'red' }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
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

      {/* タグ */}
      <div>
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

      {/* プロフィール画像 */}
      {onImageSelect && (
        <div>
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
              {onImageRemove && !uploadingImage && (
                <button
                  type="button"
                  onClick={onImageRemove}
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
            onChange={onImageSelect}
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
          {uploadingImage && uploadProgress !== undefined && (
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
      )}

      {/* キャラクターシート基本情報 */}
      <div style={{ borderTop: '1px solid #ddd', paddingTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 'bold' }}>
          キャラクターシート基本情報
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {system === 'cthulhu' && 'occupation' in data && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  プレイヤー名
                </label>
                <input
                  type="text"
                  value={(data as CthulhuSheetData).playerName || ''}
                  onChange={(e) => {
                    const updated = { ...data, playerName: e.target.value } as CthulhuSheetData;
                    onChange(updated);
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  職業
                </label>
                <input
                  type="text"
                  value={(data as CthulhuSheetData).occupation || ''}
                  onChange={(e) => {
                    const updated = { ...data, occupation: e.target.value } as CthulhuSheetData;
                    onChange(updated);
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  年齢
                </label>
                <input
                  type="number"
                  value={(data as CthulhuSheetData).age || ''}
                  onChange={(e) => {
                    const updated = { ...data, age: e.target.value ? parseInt(e.target.value) : undefined } as CthulhuSheetData;
                    onChange(updated);
                  }}
                  min="0"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  性別
                </label>
                <input
                  type="text"
                  value={(data as CthulhuSheetData).gender || ''}
                  onChange={(e) => {
                    const updated = { ...data, gender: e.target.value } as CthulhuSheetData;
                    onChange(updated);
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  出身地
                </label>
                <input
                  type="text"
                  value={(data as CthulhuSheetData).birthplace || ''}
                  onChange={(e) => {
                    const updated = { ...data, birthplace: e.target.value } as CthulhuSheetData;
                    onChange(updated);
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </>
          )}
          {system === 'shinobigami' && 'characterName' in data && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  プレイヤー名
                </label>
                <input
                  type="text"
                  value={(data as ShinobigamiSheetData).playerName || ''}
                  onChange={(e) => {
                    const updated = { ...data, playerName: e.target.value } as ShinobigamiSheetData;
                    onChange(updated);
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  年齢
                </label>
                <input
                  type="number"
                  value={(data as ShinobigamiSheetData).age || ''}
                  onChange={(e) => {
                    const updated = { ...data, age: e.target.value ? parseInt(e.target.value) : undefined } as ShinobigamiSheetData;
                    onChange(updated);
                  }}
                  min="0"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.875rem' }}>
                  性別
                </label>
                <input
                  type="text"
                  value={(data as ShinobigamiSheetData).gender || ''}
                  onChange={(e) => {
                    const updated = { ...data, gender: e.target.value } as ShinobigamiSheetData;
                    onChange(updated);
                  }}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

