import { apiClient, setAuthToken } from '../lib/api-client';
import { AuthResponseData, LoginCredentials, RegisterCredentials, User } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const data = await apiClient<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(data.accessToken);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponseData> {
    const data = await apiClient<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(data.accessToken);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return apiClient<{ user: User }>('/auth/me', {
      method: 'GET',
    });
  },

  logout(): void {
    setAuthToken(null);
  },
};
