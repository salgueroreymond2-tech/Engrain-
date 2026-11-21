import { apiClient } from '../lib/api-client';
import { WorkOrder } from '../types/workshop';
import { MOCK_WORK_ORDERS } from './mockAdapters';
import { isExplicitDemoMode } from '../lib/demo-mode';

// In-memory store for interactive demo mutations
let localWorkOrders = [...MOCK_WORK_ORDERS];

export const workOrderService = {
  async getWorkOrders(filters?: { vehicleId?: string; workshopId?: string; status?: string }): Promise<WorkOrder[]> {
    if (isExplicitDemoMode()) {
      let list = [...localWorkOrders];
      if (filters?.vehicleId) {
        list = list.filter((wo) => wo.vehicleId === filters.vehicleId);
      }
      if (filters?.status && filters.status !== 'ALL') {
        list = list.filter((wo) => wo.status === filters.status);
      }
      return list;
    }

    try {
      return await apiClient<WorkOrder[]>('/work-orders', {
        params: filters,
      });
    } catch (err: any) {
      // Sin fallback silencioso en modo real
      throw err;
    }
  },

  async getWorkOrderById(id: string): Promise<WorkOrder> {
    if (isExplicitDemoMode()) {
      const found = localWorkOrders.find((wo) => wo.id === id);
      if (found) return found;
      throw new Error('Orden de trabajo no encontrada');
    }

    try {
      return await apiClient<WorkOrder>(`/work-orders/${id}`);
    } catch (err: any) {
      throw err;
    }
  },

  async createWorkOrder(input: Partial<WorkOrder>): Promise<WorkOrder> {
    if (isExplicitDemoMode()) {
      const newOrder: WorkOrder = {
        id: `wo-${Math.floor(7800 + Math.random() * 200)}`,
        vehicleId: input.vehicleId || 'veh-001',
        workshopId: input.workshopId || 'mock-ws-001',
        createdById: 'usr-tech-1',
        technicianId: input.technicianId || 'mem-001',
        technicianName: input.technicianName || 'Ing. Roberto Sánchez',
        status: input.status || 'IN_PROGRESS',
        title: input.title || 'Nueva Orden de Servicio',
        description: input.description || '',
        receptionMileageKm: input.receptionMileageKm || 45000,
        symptoms: input.symptoms || '',
        technicalDiagnosis: input.technicalDiagnosis || '',
        workflowStep: input.workflowStep || 1,
        items: input.items || [],
        budget: input.budget || {
          subtotal: 0,
          tax: 0,
          total: 0,
          status: 'PENDING_APPROVAL',
        },
        evidences: input.evidences || [],
        openedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localWorkOrders = [newOrder, ...localWorkOrders];
      return newOrder;
    }

    try {
      // Filtrar campos estipulados en el contrato del backend para createWorkOrderSchema
      const payload: Record<string, any> = {
        vehicleId: input.vehicleId,
        title: input.title,
      };
      if (input.workshopId) payload.workshopId = input.workshopId;
      if (input.description !== undefined) payload.description = input.description;
      if (input.status !== undefined) payload.status = input.status;

      const serverRes = await apiClient<WorkOrder>('/work-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      return {
        ...serverRes,
        ...input,
      };
    } catch (err: any) {
      throw err;
    }
  },

  async updateWorkOrder(id: string, updates: Partial<WorkOrder>): Promise<WorkOrder> {
    if (isExplicitDemoMode()) {
      const index = localWorkOrders.findIndex((wo) => wo.id === id);
      if (index !== -1) {
        const updated: WorkOrder = {
          ...localWorkOrders[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        if (updates.status === 'COMPLETED' && !updated.closedAt) {
          updated.closedAt = new Date().toISOString();
        }
        localWorkOrders[index] = updated;
        return updated;
      }
      throw new Error('Orden de trabajo no encontrada');
    }

    try {
      // Filtrar campos estrictos permitidos por el backend (updateWorkOrderSchema.strict())
      const payload: Record<string, any> = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.closedAt !== undefined) payload.closedAt = updates.closedAt;

      const serverRes = await apiClient<WorkOrder>(`/work-orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      return {
        ...serverRes,
        ...updates,
      };
    } catch (err: any) {
      throw err;
    }
  },
};
