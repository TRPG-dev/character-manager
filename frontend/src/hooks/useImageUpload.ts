import { useState } from 'react';
import { getImageUploadUrl } from '../services/api';
import axios from 'axios';

export interface UseImageUploadResult {
    uploading: boolean;
    error: string | null;
    uploadImage: (characterId: string, accessToken: string, file: File) => Promise<string>;
}

/**
 * Custom hook for handling image uploads
 * @returns Upload utilities including uploading state, error state, and upload function
 */
export const useImageUpload = (): UseImageUploadResult => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImage = async (
        characterId: string,
        accessToken: string,
        file: File
    ): Promise<string> => {
        setUploading(true);
        setError(null);

        try {
            // Get upload URL from backend
            const { upload_url, public_url } = await getImageUploadUrl(
                accessToken,
                characterId,
                file.type
            );

            // Upload to Cloud Storage
            await axios.put(upload_url, file, {
                headers: {
                    'Content-Type': file.type,
                },
            });

            return public_url;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'アップロードに失敗しました';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        error,
        uploadImage,
    };
};
