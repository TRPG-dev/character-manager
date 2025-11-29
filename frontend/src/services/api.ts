import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  display_name: string;
}

export const getUser = async (accessToken: string): Promise<User> => {
  const response = await axios.get<User>(`${API_BASE_URL}/api/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export default axios.create({
  baseURL: API_BASE_URL,
});

