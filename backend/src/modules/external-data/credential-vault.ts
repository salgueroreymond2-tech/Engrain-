import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";

const encryptionKey = (): Buffer => {
  // Read the process value too so a deployment secret injected after module loading is honored.
  const configuredKey = env.EXTERNAL_CREDENTIAL_ENCRYPTION_KEY || process.env.EXTERNAL_CREDENTIAL_ENCRYPTION_KEY;
  if (!configuredKey) {
    throw new AppError(503, "CREDENTIAL_VAULT_NOT_CONFIGURED", "Provider credential storage is not configured.");
  }

  const key = Buffer.from(configuredKey, "base64");
  if (key.length !== 32) {
    throw new AppError(500, "CREDENTIAL_VAULT_INVALID_KEY", "EXTERNAL_CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes.");
  }
  return key;
};

/** Encrypts an authorized provider secret; plaintext must never be persisted. */
export const encryptProviderSecret = (secret: string): string => {
  if (!secret) throw new AppError(422, "INVALID_CREDENTIAL", "Provider credential may not be empty.");
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
};

/** For future provider adapters only. This function intentionally has no HTTP endpoint. */
export const decryptProviderSecret = (serialized: string): string => {
  const [version, ivText, tagText, ciphertextText, extra] = serialized.split(".");
  if (version !== VERSION || !ivText || !tagText || !ciphertextText || extra) {
    throw new AppError(500, "CREDENTIAL_VAULT_INVALID_PAYLOAD", "Stored provider credential cannot be decrypted.");
  }
  try {
    const decipher = createDecipheriv(ALGORITHM, encryptionKey(), Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertextText, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    throw new AppError(500, "CREDENTIAL_VAULT_INVALID_PAYLOAD", "Stored provider credential cannot be decrypted.");
  }
};
