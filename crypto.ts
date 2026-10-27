import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function encryptionKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY ?? "";
  if (!/^[a-fA-F0-9]{64}$/.test(raw)) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY must be 64 hex characters (32 bytes).");
  }
  return Buffer.from(raw, "hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptJson<T>(blob: string): T {
  const data = Buffer.from(blob, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  return JSON.parse(plain) as T;
}

export function newAccessToken(): string {
  return randomBytes(32).toString("base64url");
}