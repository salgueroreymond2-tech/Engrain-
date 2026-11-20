import { apiClient } from '../lib/api-client';
import { Maintenance } from '../types/maintenance';
import { MOCK_MAINTENANCES } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const maintenanceService = {
  async getMaintenances(vehicleId?: string): Promise<Maintenance[]> {
    try {
      return await apiClient<Maintenance[]>('/maintenances', {
        params: vehicleId ? { vehicleId } : undefined,
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        if (vehicleId) {
          return MOCK_MAINTENANCES.filter((m) => m.vehicleId === vehicleId);
        }
        return MOCK_MAINTENANCES;
      }
      throw err;
    }
  },
};
