import type { ArvComp, ArvDeal, ArvSubject } from "./arv";
import { getSql } from "./db";

export type ArvRecord = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  inventory_id: number | null;
  subject: ArvSubject;
  deal: ArvDeal;
  comps: ArvComp[];
};

type Row = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  inventory_id: number | null;
  subject_address: string | null;
  subject_sqft: number | null;
  subject_beds: number | null;
  subject_baths: number | null;
  repair_estimate: number | null;
  assignment_fee: number | null;
  arv_percent: number;
  comps_json: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function toRecord(row: Row): ArvRecord {
  let comps: ArvComp[] = [];
  try {
    const parsed = JSON.parse(row.comps_json) as ArvComp[];
    if (Array.isArray(parsed)) comps = parsed;
  } catch {
    comps = [];
  }
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    title: row.title,
    inventory_id: row.inventory_id,
    subject: {
      address: row.subject_address ?? "",
      sqft: row.subject_sqft,
      beds: row.subject_beds,
      baths: row.subject_baths,
    },
    deal: {
      repairs: row.repair_estimate,
      assignmentFee: row.assignment_fee,
      arvPercent: row.arv_percent,
    },
    comps,
  };
}

export async function listArvCalcs(): Promise<Pick<ArvRecord, "id" | "title" | "updated_at" | "inventory_id">[]> {
  const sql = await getSql();
  const rows = await sql.all<Pick<Row, "id" | "title" | "updated_at" | "inventory_id">>(
    "SELECT id, title, updated_at, inventory_id FROM arv_calculations ORDER BY updated_at DESC, id DESC",
  );
  return rows;
}

export async function getArvCalc(id: number): Promise<ArvRecord | undefined> {
  const sql = await getSql();
  const row = await sql.get<Row>("SELECT * FROM arv_calculations WHERE id = ?", [id]);
  return row ? toRecord(row) : undefined;
}

export async function insertArvCalc(input: Omit<ArvRecord, "id" | "created_at" | "updated_at">): Promise<number> {
  const sql = await getSql();
  const now = nowIso();
  const result = await sql.run(
    `INSERT INTO arv_calculations (
      created_at, updated_at, title, inventory_id, subject_address, subject_sqft, subject_beds, subject_baths,
      repair_estimate, assignment_fee, arv_percent, comps_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      now,
      now,
      input.title,
      input.inventory_id,
      input.subject.address || null,
      input.subject.sqft,
      input.subject.beds,
      input.subject.baths,
      input.deal.repairs,
      input.deal.assignmentFee,
      input.deal.arvPercent ?? 70,
      JSON.stringify(input.comps),
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function updateArvCalc(id: number, input: Omit<ArvRecord, "id" | "created_at" | "updated_at">): Promise<boolean> {
  const sql = await getSql();
  const existing = await sql.get<{ id: number }>("SELECT id FROM arv_calculations WHERE id = ?", [id]);
  if (!existing) return false;
  await sql.run(
    `UPDATE arv_calculations SET
      updated_at = ?, title = ?, inventory_id = ?, subject_address = ?, subject_sqft = ?, subject_beds = ?, subject_baths = ?,
      repair_estimate = ?, assignment_fee = ?, arv_percent = ?, comps_json = ?
     WHERE id = ?`,
    [
      nowIso(),
      input.title,
      input.inventory_id,
      input.subject.address || null,
      input.subject.sqft,
      input.subject.beds,
      input.subject.baths,
      input.deal.repairs,
      input.deal.assignmentFee,
      input.deal.arvPercent ?? 70,
      JSON.stringify(input.comps),
      id,
    ],
  );
  return true;
}

export async function deleteArvCalc(id: number): Promise<void> {
  const sql = await getSql();
  await sql.run("DELETE FROM arv_calculations WHERE id = ?", [id]);
}
