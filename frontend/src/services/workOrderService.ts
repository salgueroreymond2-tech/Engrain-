import { apiClient } from '../lib/api-client';
import { WorkOrder } from '../types/workshop';
import { MOCK_WORK_ORDERS } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const workOrderService = {
  async getWorkOrders(filters?: { vehicleId?: string; workshopId?: string; status?: string }): Promise<WorkOrder[]> {
    try {
      return await apiClient<WorkOrder[]>('/work-orders', {
        params: filters,
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        let list = [...MOCK_WORK_ORDERS];
        if (filters?.vehicleId) {
          list = list.filter((wo) => wo.vehicleId === filters.vehicleId);
        }
        if (filters?.status) {
          list = list.filter((wo) => wo.status === filters.status);
        }
        return list;
      }
      throw err;
    }
  },

  async getWorkOrderById(id: string): Promise<WorkOrder> {
    try {
      return await apiClient<WorkOrder>(`/work-orders/${id}`);
    } catch (err: any) {
      if (ENABLE_MOCKS) {
        const found = MOCK_WORK_ORDERS.find((wo) => wo.id === id);
        if (found) return found;
      }
      throw err;
    }
  },
};
