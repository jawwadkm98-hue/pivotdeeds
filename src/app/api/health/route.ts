import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  try {
    getDb().prepare("SELECT 1 AS ok").get();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
