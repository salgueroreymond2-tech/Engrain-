import { apiClient } from '../lib/api-client';
import { Vehicle, CreateVehicleInput, UpdateVehicleInput } from '../types/vehicle';
import { MOCK_VEHICLES } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

let localVehicles = [...MOCK_VEHICLES];

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    try {
      return await apiClient<Vehicle[]>('/vehicles');
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return localVehicles;
      }
      throw err;
    }
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    try {
      return await apiClient<Vehicle>(`/vehicles/${id}`);
    } catch (err: any) {
      if (ENABLE_MOCKS) {
        const found = localVehicles.find((v) => v.id === id);
        if (found) return found;
      }
      throw err;
    }
  },

  async createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
    try {
      const res = await apiClient<Vehicle>('/vehicles', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      localVehicles = [res, ...localVehicles];
      return res;
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        const newVeh: Vehicle = {
          id: `veh-${Math.floor(100 + Math.random() * 900)}`,
          ownerId: 'usr-owner-demo',
          vin: input.vin.toUpperCase(),
          plate: input.plate.toUpperCase(),
          make: input.make,
          model: input.model,
          year: input.year,
          mileageKm: input.mileageKm,
          status: 'ACTIVE',
          dataSource: input.dataSource || 'WORKSHOP',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localVehicles = [newVeh, ...localVehicles];
        return newVeh;
      }
      throw err;
    }
  },

  async updateVehicle(id: string, input: UpdateVehicleInput): Promise<Vehicle> {
    try {
      const res = await apiClient<Vehicle>(`/vehicles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      const idx = localVehicles.findIndex((v) => v.id === id);
      if (idx !== -1) localVehicles[idx] = res;
      return res;
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        const idx = localVehicles.findIndex((v) => v.id === id);
        if (idx !== -1) {
          localVehicles[idx] = {
            ...localVehicles[idx],
            ...input,
            updatedAt: new Date().toISOString(),
          };
          return localVehicles[idx];
        }
      }
      throw err;
    }
  },

  async deleteVehicle(id: string): Promise<void> {
    try {
      await apiClient<void>(`/vehicles/${id}`, {
        method: 'DELETE',
      });
      localVehicles = localVehicles.filter((v) => v.id !== id);
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        localVehicles = localVehicles.filter((v) => v.id !== id);
        return;
      }
      throw err;
    }
  },
};
