import { AppError } from "../../shared/errors/app-error";

import type { NormalizedPlate } from "./providers/types";

const segment = (value: string | undefined, field: string, maxLength: number): string | undefined => {
  if (value === undefined || value.trim() === "") return undefined;
  if (!/^[A-Za-z0-9 -]+$/.test(value)) throw new AppError(422, "INVALID_PLATE", `${field} has an invalid format.`);
  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!normalized || normalized.length > maxLength) throw new AppError(422, "INVALID_PLATE", `${field} has an invalid format.`);
  return normalized;
};

/** Preserves optional category/code components; providers must not assume a single Costa Rican plate shape. */
export const normalizePlate = (input: { category?: string; code?: string; number: string }): NormalizedPlate => {
  const category = segment(input.category, "plate category", 24);
  const code = segment(input.code, "plate code", 24);
  const number = segment(input.number, "plate number", 64);
  if (!number) throw new AppError(422, "INVALID_PLATE", "A plate number is required.");
  return { category, code, number, normalized: [category, code, number].filter(Boolean).join("-") };
};
