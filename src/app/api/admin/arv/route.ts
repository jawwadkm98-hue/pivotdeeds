import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { parseArvPayload } from "@/lib/arv-input";
import { insertArvCalc, listArvCalcs } from "@/lib/arv-store";

export const dynamic = "force-dynamic";

function blocked(request: Request): boolean {
  return request.headers.get("sec-fetch-site") === "cross-site";
}

export async function GET(request: Request) {
  if (blocked(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const calculations = await listArvCalcs();
  return NextResponse.json({ calculations });
}

export async function POST(request: Request) {
  if (blocked(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = await parseArvPayload(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const id = await insertArvCalc({
    title: parsed.data.title,
    inventory_id: parsed.data.inventoryId,
    subject: parsed.data.subject,
    deal: parsed.data.deal,
    comps: parsed.data.comps,
  });
  return NextResponse.json({ id }, { status: 201 });
}
