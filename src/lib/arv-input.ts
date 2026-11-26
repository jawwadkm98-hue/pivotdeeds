import type { ArvComp, ArvDeal, ArvSubject } from "./arv";
import { getListing } from "./inventory";

export type ArvPayload = {
  title: string;
  inventoryId: number | null;
  subject: ArvSubject;
  deal: ArvDeal;
  comps: ArvComp[];
};

function numberOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function text(value: unknown, max: number): string {
  return String(value ?? "").replace(/\0/g, "").trim().slice(0, max);
}

export async function parseArvPayload(body: unknown): Promise<{ ok: true; data: ArvPayload } | { ok: false; error: string }> {
  if (!body || typeof body !== "object") return { ok: false, error: "Missing calculation." };
  const record = body as Record<string, unknown>;
  const title = text(record.title, 120);
  if (title.length < 2) return { ok: false, error: "Enter a name for this calculation." };
  const subjectRaw = (record.subject ?? {}) as Record<string, unknown>;
  const dealRaw = (record.deal ?? {}) as Record<string, unknown>;
  const compsRaw = Array.isArray(record.comps) ? record.comps : [];
  if (compsRaw.length > 40) return { ok: false, error: "Use 40 comps or fewer." };
  const subject: ArvSubject = {
    address: text(subjectRaw.address, 180),
    sqft: numberOrNull(subjectRaw.sqft),
    beds: numberOrNull(subjectRaw.beds),
    baths: numberOrNull(subjectRaw.baths),
  };
  const percent = numberOrNull(dealRaw.arvPercent);
  const deal: ArvDeal = {
    repairs: numberOrNull(dealRaw.repairs),
    assignmentFee: numberOrNull(dealRaw.assignmentFee),
    arvPercent: percent == null ? 70 : Math.min(100, Math.max(0, percent)),
  };
  const comps: ArvComp[] = compsRaw.map((item) => {
    const comp = (item ?? {}) as Record<string, unknown>;
    return {
      address: text(comp.address, 180),
      salePrice: numberOrNull(comp.salePrice),
      sqft: numberOrNull(comp.sqft),
      beds: numberOrNull(comp.beds),
      baths: numberOrNull(comp.baths),
      saleDate: text(comp.saleDate, 20),
      adjustment: numberOrNull(comp.adjustment),
    };
  });
  let inventoryId: number | null = null;
  if (record.inventoryId != null && record.inventoryId !== "") {
    const id = Number(record.inventoryId);
    if (!Number.isInteger(id) || id < 1) return { ok: false, error: "Choose a real inventory listing." };
    const listing = await getListing(id);
    if (!listing) return { ok: false, error: "That inventory listing was not found." };
    inventoryId = id;
  }
  return { ok: true, data: { title, inventoryId, subject, deal, comps } };
}
