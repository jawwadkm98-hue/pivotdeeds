import { NextResponse } from "next/server";
import { createSessionToken, isAuthed, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { changeAdminPassword, parseChangePasswordPayload } from "@/lib/change-password";
import { consumeRate, LOGIN_LIMIT, LOGIN_WINDOW_MS } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function blocked(request: Request): boolean {
  return request.headers.get("sec-fetch-site") === "cross-site";
}

function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: Request) {
  if (blocked(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await consumeRate(clientIp(request), "password-change", LOGIN_LIMIT, LOGIN_WINDOW_MS))) {
    return NextResponse.json({ error: "Too many password changes. Wait 15 minutes and try again." }, { status: 429 });
  }
  const parsed = parseChangePasswordPayload(await request.json().catch(() => null));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const result = await changeAdminPassword(parsed);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
  return response;
}
