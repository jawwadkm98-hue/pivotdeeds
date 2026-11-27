import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { readRuntimeEnv } from "./db";
import { getPasswordVersion, getStoredPassword, hasStoredPassword, verifyPbkdf2 } from "./password";

export const SESSION_COOKIE = "pd_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

export async function adminPassword(): Promise<string> {
  return readRuntimeEnv("ADMIN_PASSWORD");
}

export async function sessionSecret(): Promise<string> {
  return (await readRuntimeEnv("SESSION_SECRET")) || (await readRuntimeEnv("ADMIN_SESSION_SECRET"));
}

export async function adminConfigured(): Promise<boolean> {
  const secret = await sessionSecret();
  if (secret.length < 24) return false;
  if (await hasStoredPassword()) return true;
  const password = await adminPassword();
  return password.length >= 10;
}

export function passwordMatches(input: string, expected: string): boolean {
  if (expected.length < 10 || input.length === 0 || input.length > 200) return false;
  const actualHash = createHash("sha256").update(input).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(actualHash, expectedHash);
}

export async function verifyAdminPassword(input: string): Promise<boolean> {
  if (input.length === 0 || input.length > 200) return false;
  const stored = await getStoredPassword();
  if (stored) return verifyPbkdf2(input, stored);
  return passwordMatches(input, await adminPassword());
}

export function secureCookie(): boolean {
  if (process.env.COOKIE_SECURE === "false") return false;
  if (process.env.COOKIE_SECURE === "true") return true;
  return process.env.NODE_ENV === "production";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secureCookie(),
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export async function createSessionToken(): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + MAX_AGE_SECONDS * 1000,
      n: randomBytes(16).toString("hex"),
      v: await getPasswordVersion(),
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", await sessionSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token || !(await adminConfigured())) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", await sessionSecret()).update(payload).digest("base64url");
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: unknown; v?: unknown };
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return false;
    const tokenVersion = typeof data.v === "number" && Number.isInteger(data.v) ? data.v : 0;
    return tokenVersion === (await getPasswordVersion());
  } catch {
    return false;
  }
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}
