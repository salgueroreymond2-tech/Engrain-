import { describe, expect, it } from "vitest";

import { hashRecord } from "./integrity";

describe("record integrity hashes", () => {
  it("is deterministic despite object key order and changes when the protected content changes", () => {
    const first = hashRecord({ vehicleId: "vehicle-1", mileageKm: 72450, evidenceHashes: ["a", "b"] });
    const reordered = hashRecord({ evidenceHashes: ["a", "b"], mileageKm: 72450, vehicleId: "vehicle-1" });
    const changed = hashRecord({ vehicleId: "vehicle-1", mileageKm: 72451, evidenceHashes: ["a", "b"] });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(reordered).toBe(first);
    expect(changed).not.toBe(first);
  });
});
