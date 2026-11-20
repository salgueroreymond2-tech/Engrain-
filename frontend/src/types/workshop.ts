export type WorkshopMemberRole = 'ADMIN' | 'TECHNICIAN' | 'ADVISOR';
export type WorkOrderStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Workshop {
  id: string;
  ownerId: string;
  name: string;
  taxId?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopMember {
  id: string;
  workshopId: string;
  userId: string;
  role: WorkshopMemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  vehicleId: string;
  workshopId: string;
  createdById: string;
  status: WorkOrderStatus;
  title: string;
  description?: string;
  openedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}
