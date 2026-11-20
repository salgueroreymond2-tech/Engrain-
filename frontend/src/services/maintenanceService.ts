import { apiClient } from '../lib/api-client';
import { Maintenance } from '../types/maintenance';
import { MOCK_MAINTENANCES } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

let localMaintenances = [...MOCK_MAINTENANCES];

export const maintenanceService = {
  async getMaintenances(vehicleId?: string): Promise<Maintenance[]> {
    try {
      return await apiClient<Maintenance[]>('/maintenances', {
        params: vehicleId ? { vehicleId } : undefined,
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        if (vehicleId) {
          return localMaintenances.filter((m) => m.vehicleId === vehicleId);
        }
        return localMaintenances;
      }
      throw err;
    }
  },

  async createMaintenance(input: Partial<Maintenance>): Promise<Maintenance> {
    try {
      const res = await apiClient<Maintenance>('/maintenances', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      localMaintenances = [res, ...localMaintenances];
      return res;
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        const newMnt: Maintenance = {
          id: `mnt-${Math.floor(200 + Math.random() * 800)}`,
          vehicleId: input.vehicleId || 'veh-001',
          createdById: 'usr-tech-1',
          status: input.status || 'SCHEDULED',
          title: input.title || 'Servicio de Mantenimiento',
          description: input.description,
          dueDate: input.dueDate,
          completedAt: input.completedAt,
          mileageKm: input.mileageKm,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localMaintenances = [newMnt, ...localMaintenances];
        return newMnt;
      }
      throw err;
    }
  },
};
