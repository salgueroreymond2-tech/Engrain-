import { apiClient } from '../lib/api-client';
import { Maintenance } from '../types/maintenance';
import { MOCK_MAINTENANCES } from './mockAdapters';
import { isExplicitDemoMode } from '../lib/demo-mode';

let localMaintenances = [...MOCK_MAINTENANCES];

export const maintenanceService = {
  async getMaintenances(vehicleId?: string): Promise<Maintenance[]> {
    if (isExplicitDemoMode()) {
      if (vehicleId) {
        return localMaintenances.filter((m) => m.vehicleId === vehicleId);
      }
      return localMaintenances;
    }

    try {
      return await apiClient<Maintenance[]>('/maintenances', {
        params: vehicleId ? { vehicleId } : undefined,
      });
    } catch (err: any) {
      // Sin fallback silencioso en modo real
      throw err;
    }
  },

  async getMaintenanceById(id: string): Promise<Maintenance> {
    if (isExplicitDemoMode()) {
      const found = localMaintenances.find((m) => m.id === id);
      if (found) return found;
      throw new Error('Mantenimiento no encontrado');
    }

    try {
      return await apiClient<Maintenance>(`/maintenances/${id}`);
    } catch (err: any) {
      throw err;
    }
  },

  async createMaintenance(input: Partial<Maintenance>): Promise<Maintenance> {
    if (isExplicitDemoMode()) {
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

    try {
      return await apiClient<Maintenance>('/maintenances', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (err: any) {
      throw err;
    }
  },

  async updateMaintenance(id: string, updates: Partial<Maintenance>): Promise<Maintenance> {
    if (isExplicitDemoMode()) {
      const idx = localMaintenances.findIndex((m) => m.id === id);
      if (idx !== -1) {
        const updated = {
          ...localMaintenances[idx],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        localMaintenances[idx] = updated;
        return updated;
      }
      throw new Error('Mantenimiento no encontrado');
    }

    try {
      return await apiClient<Maintenance>(`/maintenances/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (err: any) {
      throw err;
    }
  },

  async deleteMaintenance(id: string): Promise<void> {
    if (isExplicitDemoMode()) {
      localMaintenances = localMaintenances.filter((m) => m.id !== id);
      return;
    }

    try {
      await apiClient<void>(`/maintenances/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      throw err;
    }
  },
};
