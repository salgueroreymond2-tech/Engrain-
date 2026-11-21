import type { NormalizedPlate, ProviderDefinition, ProviderLookupResult, VehicleInformationProvider } from "./types";

/** Clearly labeled hackathon data; never represents a government response. */
export class MockVehicleProvider implements VehicleInformationProvider {
  readonly definition: ProviderDefinition = {
    code: "MOCK", name: "ENGRAIN simulated vehicle provider", status: "AVAILABLE", supportsPlateLookup: true, allowsAutomation: true,
    requiresCredentials: false, requiresAgreement: false, dataClassification: "SIMULATED",
    termsSummary: "Generates fictional data for the hackathon. Every returned record is marked isSimulated=true and source=MOCK."
  };

  async lookup(plate: NormalizedPlate): Promise<ProviderLookupResult> {
    const now = new Date();
    const year = now.getUTCFullYear();
    return {
      status: "COMPLETED",
      records: [
        { type: "VEHICLE_PROFILE", isSimulated: true, data: { plate: plate.normalized, make: "Honda", style: "Sedan", year: 2020, engineDisplacementCc: 1500, fuel: "Gasoline", transmission: "CVT" } },
        { type: "TAX", isSimulated: true, data: { fiscalValue: 12_500_000, propertyTax: 187_500, currency: "CRC", taxPeriod: String(year), institution: "SIMULATED_HACIENDA" } },
        { type: "INSURANCE", isSimulated: true, data: { marchamoStatus: "SIMULATED_PENDING", paymentStatus: "NOT_VERIFIED", period: String(year), quotedAmount: 325_000, currency: "CRC", institution: "SIMULATED_INS" } },
        { type: "INSPECTION", isSimulated: true, data: { inspectedAt: new Date(year, 2, 15).toISOString(), result: "APPROVED", expiresAt: new Date(year + 1, 2, 15).toISOString(), defects: [], institution: "SIMULATED_DEKRA" } },
        { type: "TRAFFIC", isSimulated: true, data: { infractionCount: 0, outstandingAmount: 0, currency: "CRC", institution: "SIMULATED_COSEVI" } },
        { type: "REGISTRY", isSimulated: true, data: { vin: "SIMULATED-VIN-NOT-REAL", registryStatus: "ACTIVE", characteristics: { color: "Gray" }, encumbrances: [], ownershipDisclosed: false, institution: "SIMULATED_REGISTRO_NACIONAL" } },
        { type: "LEGAL", isSimulated: true, data: { legalStatus: "NO_VERIFIED_LIENS", encumbrances: [], annotations: [], institution: "SIMULATED_REGISTRO_NACIONAL" } }
      ]
    };
  }
}
