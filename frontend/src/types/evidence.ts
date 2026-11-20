export type EvidenceType = 'IMAGE' | 'VIDEO' | 'PDF' | 'INVOICE' | 'OBD_REPORT';
export type EvidenceCategory = 'BEFORE' | 'AFTER' | 'INVOICE' | 'DOCUMENT' | 'DIAGNOSTIC';

export interface EvidenceItem {
  id: string;
  workOrderId?: string;
  maintenanceId?: string;
  type: EvidenceType;
  category: EvidenceCategory;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey?: string;
  previewUrl?: string;
  notes?: string;
  sha256?: string;
  createdAt: string;
  _isDemo?: boolean;
}

export interface UploadIntentInput {
  workOrderId?: string;
  maintenanceId?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  type: EvidenceType;
}

export interface UploadIntentResponse {
  uploadUrl: string;
  storageKey: string;
}
