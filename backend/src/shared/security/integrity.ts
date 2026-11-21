import { createHash } from "node:crypto";

type JsonLike = null | boolean | number | string | Date | JsonLike[] | { [key: string]: JsonLike | undefined };

const normalize = (value: JsonLike | undefined): unknown => {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normalize(value[key])])
    );
  }
  return value;
};

export const stableJson = (value: JsonLike): string => JSON.stringify(normalize(value));

export const sha256 = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

export const hashRecord = (value: JsonLike): string => sha256(stableJson(value));
