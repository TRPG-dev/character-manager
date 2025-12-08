import { useState } from 'react';
import type { SystemEnum } from '../services/api';
import type { CthulhuSheetData } from '../types/cthulhu';
import type { ShinobigamiSheetData } from '../types/shinobigami';
import type { Sw25SheetData } from '../types/sw25';
import { normalizeSheetData as normalizeCthulhuSheetData } from '../utils/cthulhu';
import { normalizeSheetData as normalizeShinobigamiSheetData } from '../utils/shinobigami';
import { normalizeSheetData as normalizeSw25SheetData } from '../utils/sw25';

export type SheetData = CthulhuSheetData | ShinobigamiSheetData | Sw25SheetData | Record<string, any>;

export interface UseCharacterFormResult {
    name: string;
    setName: (name: string) => void;
    tags: string[];
    setTags: (tags: string[]) => void;
    profileImageUrl: string | null;
    setProfileImageUrl: (url: string | null) => void;
    sheetData: SheetData | null;
    setSheetData: (data: SheetData) => void;
    tagInput: string;
    setTagInput: (input: string) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
    validateName: (name: string) => boolean;
    nameError: string;
    initializeForm: (system: SystemEnum, initialData: {
        name: string;
        tags: string[];
        profileImageUrl: string | null;
        sheetData: any;
    }) => void;
}

/**
 * Custom hook for managing character form state
 * Centralizes common form logic used in CharacterCreate and CharacterEdit
 */
export const useCharacterForm = (): UseCharacterFormResult => {
    const [name, setName] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [sheetData, setSheetData] = useState<SheetData | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [nameError, setNameError] = useState('');

    const validateName = (value: string): boolean => {
        if (!value.trim()) {
            setNameError('名前は必須です');
            return false;
        }
        setNameError('');
        return true;
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const initializeForm = (
        system: SystemEnum,
        initialData: {
            name: string;
            tags: string[];
            profileImageUrl: string | null;
            sheetData: any;
        }
    ) => {
        setName(initialData.name);
        setTags(initialData.tags);
        setProfileImageUrl(initialData.profileImageUrl);

        // Normalize sheet data based on system
        let normalized: SheetData;
        switch (system) {
            case 'cthulhu':
                normalized = normalizeCthulhuSheetData(initialData.sheetData);
                break;
            case 'shinobigami':
                normalized = normalizeShinobigamiSheetData(initialData.sheetData);
                break;
            case 'sw25':
                normalized = normalizeSw25SheetData(initialData.sheetData);
                break;
            default:
                normalized = initialData.sheetData;
        }
        setSheetData(normalized);
    };

    return {
        name,
        setName,
        tags,
        setTags,
        profileImageUrl,
        setProfileImageUrl,
        sheetData,
        setSheetData,
        tagInput,
        setTagInput,
        addTag,
        removeTag,
        validateName,
        nameError,
        initializeForm,
    };
};
