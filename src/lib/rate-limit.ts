import { createHash } from "node:crypto";
import { getDb } from "./db";

export const LEAD_LIMIT = 6;
export const LEAD_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_LIMIT = 8;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function hashIp(ip: string): string {
  const salt = process.env.ADMIN_SESSION_SECRET || "pivotdeeds-rate-limit";
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex");
}

/** Fixed window. Returns true when the request is allowed and records it. */
export function consumeRate(ip: string, bucket: string, limit: number, windowMs: number): boolean {
  const db = getDb();
  const now = Date.now();
  const key = hashIp(ip);
  db.prepare("DELETE FROM rate_events WHERE created_at < ?").run(now - 24 * 60 * 60 * 1000);
  const row = db
    .prepare<unknown[], { n: number }>(
      "SELECT COUNT(*) AS n FROM rate_events WHERE ip = ? AND bucket = ? AND created_at > ?",
    )
    .get(key, bucket, now - windowMs);
  if ((row?.n ?? 0) >= limit) return false;
  db.prepare("INSERT INTO rate_events (ip, bucket, created_at) VALUES (?, ?, ?)").run(key, bucket, now);
  return true;
}
