import { describe, expect, it } from "vitest";

import { LocalDiagnosticAIProvider } from "./ai.provider";

describe("LocalDiagnosticAIProvider", () => {
  it("interprets demo DTCs without certifying a repair or mechanical condition", async () => {
    const result = await new LocalDiagnosticAIProvider().analyze({
      kind: "DTC_INTERPRETATION",
      vehicle: { id: "vehicle-1", make: "Honda", model: "Accord", year: 2020, mileageKm: 72_450 },
      diagnostics: [{ id: "scan-1", scannedAt: new Date("2026-11-20T00:00:00.000Z"), mileageKm: 72_450, isSimulated: true, troubleCodes: [{ code: "P0300", severity: "WARNING", description: "Misfire." }] }],
      maintenances: [],
      schedules: [],
      mileageLogs: []
    });

    expect(result.findings[0]).toMatchObject({ severity: "WARNING", title: expect.stringContaining("P0300") });
    expect(result.recommendations.join(" ").toLowerCase()).toContain("revisar");
    expect(JSON.stringify(result).toLowerCase()).not.toContain("garantiza");
  });

  it("keeps mileage inconsistencies neutral", async () => {
    const result = await new LocalDiagnosticAIProvider().analyze({
      kind: "INCONSISTENCIES",
      vehicle: { id: "vehicle-1", make: "Honda", model: "Accord", year: 2020, mileageKm: 72_450 },
      diagnostics: [],
      maintenances: [],
      schedules: [],
      mileageLogs: [{ id: "mileage-1", mileageKm: 70_000, recordedAt: new Date(), inconsistencyDetected: true, inconsistencyReason: "Review required." }]
    });

    expect(JSON.stringify(result).toLowerCase()).not.toContain("fraud");
    expect(result.recommendations.join(" ").toLowerCase()).toContain("revisión");
  });
});
