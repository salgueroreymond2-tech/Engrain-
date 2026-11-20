export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Maintenance {
  id: string;
  vehicleId: string;
  createdById: string;
  status: MaintenanceStatus;
  title: string;
  description?: string;
  dueDate?: string;
  completedAt?: string;
  mileageKm?: number;
  createdAt: string;
  updatedAt: string;
}
