import { describe, expect, it } from "vitest";

import { evaluateMileageInconsistency } from "./trust.service";

describe("mileage consistency evaluation", () => {
  it("does not flag a forward mileage reading", () => {
    expect(evaluateMileageInconsistency(72_000, 72_450)).toEqual({ detected: false, reason: undefined });
  });

  it("requests review for a lower reading without assigning fraud or blame", () => {
    const result = evaluateMileageInconsistency(72_450, 71_000);

    expect(result.detected).toBe(true);
    expect(result.reason).toContain("review is required");
    expect(result.reason?.toLowerCase()).not.toContain("fraud");
  });
});
