import { describe, expect, it } from "vitest";

import { normalizePlate } from "./plate";

describe("normalizePlate", () => {
  it("keeps category, code and number separate while producing a canonical key", () => {
    expect(normalizePlate({ category: "moto", code: "  abc ", number: "12-34 5" })).toEqual({
      category: "MOTO",
      code: "ABC",
      number: "12345",
      normalized: "MOTO-ABC-12345"
    });
  });

  it("rejects an unsafe or empty plate component", () => {
    expect(() => normalizePlate({ number: "---" })).toThrow(/invalid format/i);
    expect(() => normalizePlate({ number: "A<script>" })).toThrow(/invalid format/i);
  });
});
