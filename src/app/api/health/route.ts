import { getSql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await (await getSql()).get("SELECT 1 AS ok");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
