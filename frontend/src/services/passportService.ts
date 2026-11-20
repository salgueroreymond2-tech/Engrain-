import { apiClient } from '../lib/api-client';
import { Passport } from '../types/passport';
import { MOCK_PASSPORT } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const passportService = {
  async getPassportByToken(publicToken: string): Promise<Passport> {
    try {
      return await apiClient<Passport>(`/passports/public/${publicToken}`);
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR' || err.statusCode === 404)) {
        return {
          ...MOCK_PASSPORT,
          publicToken,
        };
      }
      throw err;
    }
  },

  async getPassportById(id: string): Promise<Passport> {
    try {
      return await apiClient<Passport>(`/passports/${id}`);
    } catch (err: any) {
      if (ENABLE_MOCKS) {
        return MOCK_PASSPORT;
      }
      throw err;
    }
  },

  async createPassport(vehicleId: string, visibility: 'PUBLIC' | 'SHAREABLE' | 'PRIVATE' = 'PUBLIC'): Promise<Passport> {
    try {
      return await apiClient<Passport>('/passports', {
        method: 'POST',
        body: JSON.stringify({ vehicleId, visibility }),
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return {
          ...MOCK_PASSPORT,
          vehicleId,
          publicToken: `engrain-${Math.random().toString(36).substring(2, 9)}`,
          visibility,
        };
      }
      throw err;
    }
  },
};
