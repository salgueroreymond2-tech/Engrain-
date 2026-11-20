import { EvidenceItem } from './evidence';

export type WorkshopMemberRole = 'ADMIN' | 'TECHNICIAN' | 'ADVISOR';
export type WorkOrderStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Workshop {
  id: string;
  ownerId: string;
  name: string;
  taxId?: string;
  phone?: string;
  address?: string;
  website?: string;
  hours?: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopMember {
  id: string;
  workshopId: string;
  userId: string;
  name: string;
  email: string;
  role: WorkshopMemberRole;
  specialty?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderItem {
  id: string;
  type: 'PROCEDURE' | 'PART' | 'DIAGNOSTIC' | 'SUPPLY';
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  completed?: boolean;
}

export interface WorkOrderBudget {
  subtotal: number;
  tax: number;
  total: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
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

  // Extended management fields:
  technicianId?: string;
  technicianName?: string;
  receptionMileageKm?: number;
  symptoms?: string;
  technicalDiagnosis?: string;
  diagnosticDtcCodes?: string[];
  items?: WorkOrderItem[];
  budget?: WorkOrderBudget;
  evidences?: EvidenceItem[];
  workflowStep?: number; // 1 to 7
  finalNotes?: string;
}
