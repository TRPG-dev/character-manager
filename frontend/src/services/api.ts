import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  display_name: string;
}

export type SystemEnum = 'cthulhu' | 'shinobigami' | 'sw25' | 'satasupe';

export type CharacterSort =
  | 'name_asc'
  | 'name_desc'
  | 'created_asc'
  | 'created_desc'
  | 'updated_asc'
  | 'updated_desc'
  | 'system_asc';

export interface Character {
  id: string;
  user_id: string;
  system: SystemEnum;
  name: string;
  tags: string[];
  profile_image_url: string | null;
  sheet_data: Record<string, any>;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterListResponse {
  items: Character[];
  total: number;
  page: number;
  limit: number;
}

export interface CharacterCreate {
  system: SystemEnum;
  name: string;
  tags?: string[];
  profile_image_url?: string | null;
  sheet_data?: Record<string, any>;
}

export interface CharacterUpdate {
  name?: string;
  tags?: string[];
  profile_image_url?: string | null;
  sheet_data?: Record<string, any>;
}

export interface PublishRequest {
  is_public: boolean;
}

export interface PublishResponse {
  is_public: boolean;
  share_token: string | null;
}

export interface ImageUploadUrlRequest {
  mime_type: string;
}

export interface ImageUploadUrlResponse {
  upload_url: string;
  public_url: string;
  expires_at: string;
}

export interface ImageUploadResponse {
  public_url: string;
}

export const getUser = async (accessToken: string): Promise<User> => {
  const response = await axios.get<User>(`${API_BASE_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export const getCharacters = async (
  accessToken: string,
  params?: {
    query?: string;
    tags?: string[];
    system?: SystemEnum;
    sort?: CharacterSort;
    page?: number;
    limit?: number;
  }
): Promise<CharacterListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.append('query', params.query);
  if (params?.tags) params.tags.forEach(tag => queryParams.append('tags', tag));
  if (params?.system) queryParams.append('system', params.system);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await axios.get<CharacterListResponse>(
    `${API_BASE_URL}/api/characters?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const getCharacter = async (
  accessToken: string,
  characterId: string
): Promise<Character> => {
  const response = await axios.get<Character>(
    `${API_BASE_URL}/api/characters/${characterId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const createCharacter = async (
  accessToken: string,
  data: CharacterCreate
): Promise<Character> => {
  const response = await axios.post<Character>(
    `${API_BASE_URL}/api/characters`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const updateCharacter = async (
  accessToken: string,
  characterId: string,
  data: CharacterUpdate
): Promise<Character> => {
  const response = await axios.put<Character>(
    `${API_BASE_URL}/api/characters/${characterId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const deleteCharacter = async (
  accessToken: string,
  characterId: string
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/characters/${characterId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const publishCharacter = async (
  accessToken: string,
  characterId: string,
  isPublic: boolean
): Promise<PublishResponse> => {
  const response = await axios.post<PublishResponse>(
    `${API_BASE_URL}/api/characters/${characterId}/publish`,
    { is_public: isPublic },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const getSharedCharacter = async (token: string): Promise<Character> => {
  const response = await axios.get<Character>(
    `${API_BASE_URL}/api/share/${token}`
  );
  return response.data;
};

export const getImageUploadUrl = async (
  accessToken: string,
  characterId: string,
  mimeType: string
): Promise<ImageUploadUrlResponse> => {
  const response = await axios.post<ImageUploadUrlResponse>(
    `${API_BASE_URL}/api/characters/${characterId}/image/upload-url`,
    { mime_type: mimeType },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const uploadCharacterImage = async (
  accessToken: string,
  characterId: string,
  file: File,
  onUploadProgress?: (percent: number) => void
): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<ImageUploadResponse>(
    `${API_BASE_URL}/api/characters/${characterId}/image`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Content-Typeはaxiosがmultipart boundary付きで自動設定するため指定しない
      },
      onUploadProgress: (evt: AxiosProgressEvent) => {
        if (!onUploadProgress) return;
        const total = evt.total ?? 0;
        if (total > 0) {
          onUploadProgress((evt.loaded / total) * 100);
        }
      },
    }
  );
  return response.data;
};

export const deleteCharacterImage = async (
  accessToken: string,
  characterId: string
): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/api/characters/${characterId}/image`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export interface DiceRollRequest {
  formula: string;
}

export interface DiceRollResponse {
  rolls: number[];
  total: number;
}

export const rollDice = async (
  accessToken: string,
  formula: string
): Promise<DiceRollResponse> => {
  const response = await axios.post<DiceRollResponse>(
    `${API_BASE_URL}/api/dice/roll`,
    { formula },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export interface AutoRollAttributesRequest {
  system: SystemEnum;
}

export interface AutoRollAttributesResponse {
  attributes: {
    STR: number;
    CON: number;
    POW: number;
    DEX: number;
    APP: number;
    INT: number;
    EDU: number;
    SIZ: number;
  };
  derived: {
    SAN_current: number;
    SAN_max: number;
    HP_current: number;
    HP_max: number;
    MP_current: number;
    MP_max: number;
    IDEA?: number;
    KNOW?: number;
    LUCK?: number;
    DB?: string;
  };
}

export const autoRollAttributes = async (
  accessToken: string,
  characterId: string,
  system: SystemEnum
): Promise<AutoRollAttributesResponse> => {
  const response = await axios.post<AutoRollAttributesResponse>(
    `${API_BASE_URL}/api/characters/${characterId}/attributes/auto-roll`,
    { system },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export type ExportSkillScope = 'changed' | 'all';
export type ExportDiceStyle = 'CCB' | 'CC';

export interface CocofoliaExportResponse {
  clipboard: Record<string, any>;
  clipboardText: string;
  meta: {
    system: SystemEnum;
    skill_scope: ExportSkillScope;
    dice: ExportDiceStyle;
    include_icon: boolean;
  };
}

export const exportCocofolia = async (
  accessToken: string,
  characterId: string,
  params: {
    system: SystemEnum;
    skill_scope: ExportSkillScope;
    dice: ExportDiceStyle;
    include_icon?: boolean;
  }
): Promise<CocofoliaExportResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('system', params.system);
  queryParams.append('skill_scope', params.skill_scope);
  queryParams.append('dice', params.dice);
  if (params.include_icon !== undefined) {
    queryParams.append('include_icon', String(params.include_icon));
  }

  const response = await axios.get<CocofoliaExportResponse>(
    `${API_BASE_URL}/api/characters/${characterId}/export/cocofolia?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export default axios.create({
  baseURL: API_BASE_URL,
});

