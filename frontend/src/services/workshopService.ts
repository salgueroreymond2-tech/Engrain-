import { apiClient } from '../lib/api-client';
import { Workshop, WorkshopMember } from '../types/workshop';
import { MOCK_WORKSHOPS, MOCK_WORKSHOP_MEMBERS } from './mockAdapters';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

let localWorkshop = { ...MOCK_WORKSHOPS[0] };
let localMembers = [...MOCK_WORKSHOP_MEMBERS];

export const workshopService = {
  async getWorkshops(): Promise<Workshop[]> {
    try {
      return await apiClient<Workshop[]>('/workshops');
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return [localWorkshop];
      }
      throw err;
    }
  },

  async getWorkshopById(id: string): Promise<Workshop> {
    try {
      return await apiClient<Workshop>(`/workshops/${id}`);
    } catch (err: any) {
      if (ENABLE_MOCKS) {
        return localWorkshop;
      }
      throw err;
    }
  },

  async updateWorkshop(id: string, updates: Partial<Workshop>): Promise<Workshop> {
    try {
      return await apiClient<Workshop>(`/workshops/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        localWorkshop = {
          ...localWorkshop,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        return localWorkshop;
      }
      throw err;
    }
  },

  async getMembers(workshopId: string): Promise<WorkshopMember[]> {
    try {
      return await apiClient<WorkshopMember[]>(`/workshops/${workshopId}/members`);
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return localMembers;
      }
      throw err;
    }
  },

  async addMember(workshopId: string, member: Partial<WorkshopMember>): Promise<WorkshopMember> {
    try {
      return await apiClient<WorkshopMember>(`/workshops/${workshopId}/members`, {
        method: 'POST',
        body: JSON.stringify(member),
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        const newMember: WorkshopMember = {
          id: `mem-${Date.now()}`,
          workshopId,
          userId: `usr-${Date.now()}`,
          name: member.name || 'Nuevo Técnico',
          email: member.email || 'tecnico@precisionmotors.mx',
          role: member.role || 'TECHNICIAN',
          specialty: member.specialty || 'General',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localMembers = [...localMembers, newMember];
        return newMember;
      }
      throw err;
    }
  },
};
