export type DiagnosticSource = 'OBD2' | 'MANUAL' | 'WORKSHOP';
export type DiagnosticStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';

export interface DtcItem {
  code: string;
  status: 'PENDING' | 'CONFIRMED' | 'PERMANENT';
  description: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Diagnostic {
  id: string;
  vehicleId: string;
  createdById: string;
  source: DiagnosticSource;
  status: DiagnosticStatus;
  mileageKm?: number;
  dtcs: DtcItem[];
  payload?: Record<string, unknown>;
  performedAt?: string;
  createdAt: string;
  updatedAt: string;
}
