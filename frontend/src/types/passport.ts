export type PassportVisibility = 'PRIVATE' | 'SHAREABLE' | 'PUBLIC';
export type PassportStatus = 'ACTIVE' | 'REVOKED';

export interface PassportRecord {
  date: string;
  type: 'MAINTENANCE' | 'DIAGNOSTIC' | 'WORK_ORDER' | 'INSPECTION';
  title: string;
  source: string;
  mileageKm: number;
  verified: boolean;
  notes?: string;
}

export interface PassportSnapshot {
  vehicle: {
    vin: string;
    plate: string;
    make: string;
    model: string;
    year: number;
    mileageKm: number;
  };
  metrics: {
    trustScore: number; // 0-100
    totalInterventions: number;
    activeAlertsCount: number;
    verifiedMileage: boolean;
    lastInspectionDate?: string;
  };
  records: PassportRecord[];
  generatedAt: string;
}

export interface Passport {
  id: string;
  vehicleId: string;
  publicToken: string;
  visibility: PassportVisibility;
  status: PassportStatus;
  expiresAt?: string;
  snapshot: PassportSnapshot;
  createdAt: string;
  updatedAt: string;
}
