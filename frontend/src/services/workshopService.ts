import { apiClient } from '../lib/api-client';
import { Workshop } from '../types/workshop';
import { MOCK_WORKSHOPS } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const workshopService = {
  async getWorkshops(): Promise<Workshop[]> {
    try {
      return await apiClient<Workshop[]>('/workshops');
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return MOCK_WORKSHOPS;
      }
      throw err;
    }
  },

  async getWorkshopById(id: string): Promise<Workshop> {
    try {
      return await apiClient<Workshop>(`/workshops/${id}`);
    } catch (err: any) {
      if (ENABLE_MOCKS) {
        const found = MOCK_WORKSHOPS.find((w) => w.id === id);
        if (found) return found;
      }
      throw err;
    }
  },
};
