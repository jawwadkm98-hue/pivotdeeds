import { createHash } from "node:crypto";
import { getSql, readRuntimeEnv } from "./db";

export const LEAD_LIMIT = 6;
export const LEAD_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_LIMIT = 8;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const memoryBuckets = new Map<string, number[]>();

async function hashIp(ip: string): Promise<string> {
  const secret =
    (await readRuntimeEnv("SESSION_SECRET")) ||
    (await readRuntimeEnv("ADMIN_SESSION_SECRET")) ||
    "crownwholesalers-rate-limit";
  return createHash("sha256").update(`${secret}|${ip}`).digest("hex");
}

function consumeMemory(ip: string, bucket: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const key = `${bucket}|${ip}`;
  const recent = (memoryBuckets.get(key) ?? []).filter((time) => time > now - windowMs);
  if (recent.length >= limit) {
    memoryBuckets.set(key, recent);
    return false;
  }
  recent.push(now);
  memoryBuckets.set(key, recent);
  return true;
}

/** Fixed window. Uses D1 or local SQLite, and memory if the database is unavailable. */
export async function consumeRate(ip: string, bucket: string, limit: number, windowMs: number): Promise<boolean> {
  try {
    const sql = await getSql();
    const now = Date.now();
    const key = await hashIp(ip);
    await sql.run("DELETE FROM rate_events WHERE created_at < ?", [now - 24 * 60 * 60 * 1000]);
    const row = await sql.get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM rate_events WHERE ip = ? AND bucket = ? AND created_at > ?",
      [key, bucket, now - windowMs],
    );
    if ((row?.n ?? 0) >= limit) return false;
    await sql.run("INSERT INTO rate_events (ip, bucket, created_at) VALUES (?, ?, ?)", [key, bucket, now]);
    return true;
  } catch (error) {
    console.error("rate limit database unavailable", error instanceof Error ? error.message : "unknown");
    return consumeMemory(ip, bucket, limit, windowMs);
  }
}
