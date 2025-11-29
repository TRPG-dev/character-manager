import { useState, useRef } from 'react';
import { getImageUploadUrl, updateCharacter } from '../services/api';

interface ImageUploadProps {
  characterId: string;
  accessToken: string;
  currentImageUrl?: string | null;
  onUploadSuccess: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const ImageUpload = ({
  characterId,
  accessToken,
  currentImageUrl,
  onUploadSuccess,
  onError,
}: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return 'PNGまたはJPEG形式の画像を選択してください';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'ファイルサイズは5MB以下にしてください';
    }
    return null;
  };

  const handleFileSelect = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      onError?.(validationError);
      return;
    }

    // プレビューを設定
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // アップロード処理
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. 署名付きURLを取得
      const { upload_url, public_url } = await getImageUploadUrl(
        accessToken,
        characterId,
        file.type
      );

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
              await updateCharacter(accessToken, characterId, {
                profile_image_url: public_url,
              });
              setPreviewUrl(public_url);
              onUploadSuccess(public_url);
              setUploadProgress(100);
              resolve();
            } catch (error: any) {
              console.error('Failed to update character:', error);
              onError?.('画像のアップロードは成功しましたが、プロフィール画像の更新に失敗しました');
              reject(error);
            }
          } else {
            const errorMsg = `アップロードに失敗しました (ステータス: ${xhr.status}, レスポンス: ${xhr.responseText || 'なし'})`;
            console.error(errorMsg);
            onError?.(errorMsg);
            reject(new Error(errorMsg));
          }
        });

        xhr.addEventListener('error', (e) => {
          console.error('XHR error:', e);
          console.error('Upload URL:', upload_url);
          console.error('File type:', file.type);
          console.error('File size:', file.size);
          const errorMsg = `アップロード中にエラーが発生しました。URL: ${upload_url}`;
          onError?.(errorMsg);
          reject(new Error(errorMsg));
        });

        xhr.addEventListener('timeout', () => {
          const errorMsg = 'アップロードがタイムアウトしました';
          onError?.(errorMsg);
          reject(new Error(errorMsg));
        });

        xhr.addEventListener('abort', () => {
          const errorMsg = 'アップロードがキャンセルされました';
          onError?.(errorMsg);
          reject(new Error(errorMsg));
        });

        xhr.open('PUT', upload_url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.timeout = 30000; // 30秒のタイムアウト
        xhr.send(file);
      });
    } catch (error: any) {
      console.error('Failed to get upload URL:', error);
      const errorMsg = error.response?.data?.detail || '署名付きURLの取得に失敗しました';
      onError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        プロフィール画像
      </label>

      {previewUrl && (
        <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
          <img
            src={previewUrl}
            alt="プレビュー"
            style={{
              maxWidth: '300px',
              maxHeight: '300px',
              borderRadius: '8px',
              border: '1px solid #ddd',
            }}
          />
          {!uploading && (
            <button
              type="button"
              onClick={handleRemoveImage}
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

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? '#007bff' : '#ddd'}`,
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f0f8ff' : '#fff',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileInputChange}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        {uploading ? (
          <div>
            <div style={{ marginBottom: '0.5rem' }}>アップロード中...</div>
            <div
              style={{
                width: '100%',
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
        ) : (
          <div>
            <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              {previewUrl ? '画像を変更' : '画像を選択'}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
              ドラッグ&ドロップまたはクリックして選択
            </div>
            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
              PNG/JPEG形式、最大5MB
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

