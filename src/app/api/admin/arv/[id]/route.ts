import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { parseArvPayload } from "@/lib/arv-input";
import { deleteArvCalc, getArvCalc, updateArvCalc } from "@/lib/arv-store";

export const dynamic = "force-dynamic";

function blocked(request: Request): boolean {
  return request.headers.get("sec-fetch-site") === "cross-site";
}

function idFrom(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (blocked(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = idFrom(await context.params);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const calculation = await getArvCalc(id);
  if (!calculation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ calculation });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (blocked(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = idFrom(await context.params);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = await parseArvPayload(await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const updated = await updateArvCalc(id, {
    title: parsed.data.title,
    inventory_id: parsed.data.inventoryId,
    subject: parsed.data.subject,
    deal: parsed.data.deal,
    comps: parsed.data.comps,
  });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (blocked(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = idFrom(await context.params);
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await deleteArvCalc(id);
  return NextResponse.json({ ok: true });
}
