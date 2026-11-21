export type ProviderCode = "HACIENDA" | "INS" | "DEKRA" | "COSEVI" | "REGISTRO_NACIONAL" | "MANUAL_DOCUMENT" | "MOCK";
export type ProviderStatus = "AVAILABLE" | "REQUIRES_CREDENTIALS" | "REQUIRES_AGREEMENT" | "MANUAL_ONLY" | "UNAVAILABLE" | "NOT_IMPLEMENTED";
export type ExternalRecordKind = "VEHICLE_PROFILE" | "TAX" | "INSURANCE" | "INSPECTION" | "TRAFFIC" | "REGISTRY" | "LEGAL" | "DOCUMENT";

export type NormalizedPlate = {
  category?: string;
  code?: string;
  number: string;
  normalized: string;
};

export type ProviderDefinition = {
  code: ProviderCode;
  name: string;
  status: ProviderStatus;
  supportsPlateLookup: boolean;
  allowsAutomation: boolean;
  requiresCredentials: boolean;
  requiresAgreement: boolean;
  documentationUrl?: string;
  manualPortalUrl?: string;
  dataClassification: "PUBLIC_TECHNICAL" | "FINANCIAL" | "PERSONAL_OR_REGISTRY" | "USER_PROVIDED" | "SIMULATED";
  termsSummary: string;
};

export type ProviderRecord = {
  type: ExternalRecordKind;
  data: Record<string, unknown>;
  sourceUrl?: string;
  sourceReference?: string;
  evidenceType?: string;
  validUntil?: Date;
  isSimulated: boolean;
};

export type ProviderLookupResult = {
  status: "COMPLETED" | "MANUAL_REQUIRED" | "FAILED";
  records: ProviderRecord[];
  errorCode?: string;
  errorMessage?: string;
  instructions?: string;
};

/** Adapter boundary. Implementations must only issue requests the provider expressly authorizes. */
export interface VehicleInformationProvider {
  readonly definition: ProviderDefinition;
  lookup(plate: NormalizedPlate): Promise<ProviderLookupResult>;
}
