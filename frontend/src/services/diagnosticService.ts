import { apiClient } from '../lib/api-client';
import { Diagnostic } from '../types/diagnostic';
import { MOCK_DIAGNOSTICS } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const diagnosticService = {
  async getDiagnostics(vehicleId?: string): Promise<Diagnostic[]> {
    try {
      return await apiClient<Diagnostic[]>('/diagnostics', {
        params: vehicleId ? { vehicleId } : undefined,
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        if (vehicleId) {
          return MOCK_DIAGNOSTICS.filter((d) => d.vehicleId === vehicleId);
        }
        return MOCK_DIAGNOSTICS;
      }
      throw err;
    }
  },
};
