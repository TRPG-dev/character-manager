import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { getCharacter } from '../services/api';
import type { Character } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { handleApiError, formatErrorMessage } from '../utils/errorHandler';

export interface UseCharacterResult {
    character: Character | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing a single character
 * @param characterId - The character ID to fetch
 * @returns Character data, loading state, error state, and refetch function
 */
export const useCharacter = (characterId: string | undefined): UseCharacterResult => {
    const { getAccessToken } = useAuth();
    const { showError } = useToast();
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCharacter = async () => {
        if (!characterId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = await getAccessToken();
            if (token) {
                const data = await getCharacter(token, characterId);
                setCharacter(data);
            }
        } catch (err) {
            console.error('Failed to fetch character:', err);
            const apiError = handleApiError(err);
            const errorMessage = formatErrorMessage(apiError);
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCharacter();
    }, [characterId]);

    return {
        character,
        loading,
        error,
        refetch: fetchCharacter,
    };
};
