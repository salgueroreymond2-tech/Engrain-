import { randomBytes } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";

import { AppError } from "../../shared/errors/app-error";

const originalKey = process.env.EXTERNAL_CREDENTIAL_ENCRYPTION_KEY;

afterEach(() => {
  if (originalKey === undefined) delete process.env.EXTERNAL_CREDENTIAL_ENCRYPTION_KEY;
  else process.env.EXTERNAL_CREDENTIAL_ENCRYPTION_KEY = originalKey;
});

describe("provider credential vault", () => {
  it("refuses to persist a provider secret without an encryption key", async () => {
    delete process.env.EXTERNAL_CREDENTIAL_ENCRYPTION_KEY;
    const { encryptProviderSecret } = await import("./credential-vault");
    expect(() => encryptProviderSecret("partner-secret")).toThrow(AppError);
  });

  it("encrypts and decrypts a credential without exposing the plaintext in storage", async () => {
    process.env.EXTERNAL_CREDENTIAL_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    const { decryptProviderSecret, encryptProviderSecret } = await import("./credential-vault");
    const serialized = encryptProviderSecret("partner-secret");

    expect(serialized).not.toContain("partner-secret");
    expect(decryptProviderSecret(serialized)).toBe("partner-secret");
  });
});
