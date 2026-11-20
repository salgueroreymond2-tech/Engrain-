import { apiClient } from '../lib/api-client';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '../types/vehicle';
import { MOCK_VEHICLES } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    try {
      return await apiClient<Vehicle[]>('/vehicles');
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return MOCK_VEHICLES;
      }
      throw err;
    }
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    try {
      return await apiClient<Vehicle>(`/vehicles/${id}`);
    } catch (err: any) {
      if (ENABLE_MOCKS) {
        const found = MOCK_VEHICLES.find((v) => v.id === id);
        if (found) return found;
      }
      throw err;
    }
  },

  async createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
    return apiClient<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async updateVehicle(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    return apiClient<Vehicle>(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  async deleteVehicle(id: string): Promise<void> {
    return apiClient<void>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },
};
