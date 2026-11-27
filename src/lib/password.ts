import { timingSafeEqual } from "node:crypto";
import { getSql } from "./db";

export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_SALT_BYTES = 16;
export const PBKDF2_HASH_BITS = 256;
export const MIN_NEW_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 200;

export type StoredPassword = {
  hashHex: string;
  saltHex: string;
  iterations: number;
  version: number;
};

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.trim().toLowerCase();
  if (!normalized || normalized.length % 2 !== 0 || /[^0-9a-f]/.test(normalized)) {
    return new Uint8Array();
  }
  const out = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function equalHex(leftHex: string, rightHex: string): boolean {
  const left = Buffer.from(hexToBytes(leftHex));
  const right = Buffer.from(hexToBytes(rightHex));
  if (left.length === 0 || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function hashPassword(
  password: string,
  salt?: Uint8Array,
  iterations = PBKDF2_ITERATIONS,
): Promise<{ hashHex: string; saltHex: string; iterations: number }> {
  const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES));
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: saltBytes as BufferSource, iterations },
    material,
    PBKDF2_HASH_BITS,
  );
  return { hashHex: bytesToHex(new Uint8Array(bits)), saltHex: bytesToHex(saltBytes), iterations };
}

export async function verifyPbkdf2(password: string, stored: StoredPassword): Promise<boolean> {
  if (stored.iterations < PBKDF2_ITERATIONS) return false;
  const salt = hexToBytes(stored.saltHex);
  if (salt.byteLength !== PBKDF2_SALT_BYTES) return false;
  const derived = await hashPassword(password, salt, stored.iterations);
  return equalHex(derived.hashHex, stored.hashHex);
}

export async function getStoredPassword(): Promise<StoredPassword | null> {
  try {
    const sql = await getSql();
    const row = await sql.get<{ hash_hex: string; salt_hex: string; iterations: number; version: number }>(
      "SELECT hash_hex, salt_hex, iterations, version FROM admin_password WHERE id = 1",
    );
    if (!row?.hash_hex || !row.salt_hex || !Number.isInteger(row.iterations) || !Number.isInteger(row.version)) return null;
    return { hashHex: row.hash_hex, saltHex: row.salt_hex, iterations: row.iterations, version: row.version };
  } catch {
    return null;
  }
}

export async function getPasswordVersion(): Promise<number> {
  const stored = await getStoredPassword();
  return stored?.version ?? 0;
}

export async function hasStoredPassword(): Promise<boolean> {
  return (await getStoredPassword()) !== null;
}

export async function savePasswordHash(password: string): Promise<number> {
  const hashed = await hashPassword(password);
  const sql = await getSql();
  const current = await getStoredPassword();
  const version = (current?.version ?? 0) + 1;
  const updatedAt = new Date().toISOString();
  await sql.run(
    `INSERT INTO admin_password (id, hash_hex, salt_hex, iterations, version, updated_at)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       hash_hex = excluded.hash_hex,
       salt_hex = excluded.salt_hex,
       iterations = excluded.iterations,
       version = excluded.version,
       updated_at = excluded.updated_at`,
    [hashed.hashHex, hashed.saltHex, hashed.iterations, version, updatedAt],
  );
  return version;
}
