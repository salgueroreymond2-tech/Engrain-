import type { DiagnosticScanStatus, DiagnosticTroubleCodeSeverity, DiagnosticTroubleCodeStatus } from "@prisma/client";

export type ObdJsonValue = null | boolean | number | string | ObdJsonValue[] | { [key: string]: ObdJsonValue };

export type ObdMeasurement = {
  metric: string;
  label: string;
  rawValue: string;
  normalizedValue?: number;
  unit?: string;
  capturedAt: Date;
  metadata?: Record<string, ObdJsonValue>;
};

export type ObdTroubleCode = {
  code: string;
  status: DiagnosticTroubleCodeStatus;
  severity: DiagnosticTroubleCodeSeverity;
  description?: string;
};

export type ObdDiagnosticReading = {
  providerKey: string;
  providerMetadata?: Record<string, ObdJsonValue>;
  isSimulated: boolean;
  /** True only when a concrete adapter has been validated with compatible hardware. */
  physicalConnectionVerified: boolean;
  vin?: string;
  capturedAt: Date;
  status: DiagnosticScanStatus;
  mileageKm?: number;
  troubleCodes: ObdTroubleCode[];
  measurements: ObdMeasurement[];
  rawPayload: Record<string, ObdJsonValue>;
};

export type ObdReadRequest = {
  vehicleVin: string;
  scenario?: string;
};

/** Read-only contract for any diagnostic data source. Providers must never send ECU commands. */
export interface ObdProvider {
  readonly key: string;
  readonly isSimulated: boolean;
  read(request: ObdReadRequest): Promise<ObdDiagnosticReading>;
}

/**
 * Integration boundary for a future physical adapter. A driver implementation must explicitly
 * attest hardware validation before its readings can be accepted as a physical connection.
 */
export interface PhysicalObdAdapter {
  readonly adapterName: string;
  readonly hardwareVerified: boolean;
  readSnapshot(): Promise<Omit<ObdDiagnosticReading, "providerKey" | "isSimulated" | "physicalConnectionVerified">>;
}
