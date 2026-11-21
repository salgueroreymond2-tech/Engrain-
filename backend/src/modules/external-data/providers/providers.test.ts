import { describe, expect, it } from "vitest";

import { vehicleInformationProvider } from "./registry";

const demoPlate = { number: "DEMO001", normalized: "DEMO001" };

describe("external vehicle information providers", () => {
  it("never automates public portals that have no verified authorized API", async () => {
    const hacienda = vehicleInformationProvider("HACIENDA")!;
    const result = await hacienda.lookup(demoPlate);

    expect(hacienda.definition.status).toBe("MANUAL_ONLY");
    expect(hacienda.definition.allowsAutomation).toBe(false);
    expect(result).toMatchObject({ status: "MANUAL_REQUIRED", records: [] });
  });

  it("marks all mock records explicitly as simulated", async () => {
    const mock = vehicleInformationProvider("MOCK")!;
    const result = await mock.lookup(demoPlate);

    expect(mock.definition.status).toBe("AVAILABLE");
    expect(result.status).toBe("COMPLETED");
    expect(result.records.length).toBeGreaterThan(0);
    expect(result.records.every((record) => record.isSimulated)).toBe(true);
  });

  it("does not represent COSEVI open-data credentials as a plate lookup entitlement", () => {
    const cosevi = vehicleInformationProvider("COSEVI")!;

    expect(cosevi.definition.status).toBe("REQUIRES_CREDENTIALS");
    expect(cosevi.definition.supportsPlateLookup).toBe(false);
  });
});
