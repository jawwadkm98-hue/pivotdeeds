import { randomUUID } from "node:crypto";
import { LISTING_STATUSES, PIPELINE } from "./constants";
import { toCsv } from "./csv";
import { deleteBlob, getSql, readBlob, writeBlob } from "./db";
import { likeQuery } from "./format";
import type { InquiryInput, ListingInput } from "./validate";

export type ListingStatus = (typeof LISTING_STATUSES)[number];
export type PipelineStatus = (typeof PIPELINE)[number];

export type Listing = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  property_type: string;
  status: string;
  published: number;
  city: string;
  state: string;
  address: string | null;
  show_address: number;
  asking_price: number | null;
  arv: number | null;
  estimated_repairs: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  description: string | null;
  photo_names: string | null;
};

export type Inquiry = {
  id: number;
  created_at: string;
  inventory_id: number;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  status: string;
  notes: string | null;
  tcpa_consent: number;
  ip: string | null;
  user_agent: string | null;
  listing_title?: string | null;
  listing_city?: string | null;
  listing_state?: string | null;
};

export type LibraryFile = {
  id: number;
  created_at: string;
  name: string;
  r2_key: string;
  content_type: string;
  size_bytes: number;
};

const INQUIRY_HEADERS = [
  "id",
  "created_at",
  "inventory_id",
  "listing_title",
  "name",
  "phone",
  "email",
  "message",
  "status",
  "notes",
  "tcpa_consent",
  "ip",
  "user_agent",
] as const;

function nowIso(): string {
  return new Date().toISOString();
}

export function photoList(names: string | null | undefined): string[] {
  return (names ?? "").split("; ").map((name) => name.trim()).filter(Boolean);
}

export function listingPhotoName(id: number, ext: string, index: number): string {
  return `inventory/inv-${id}-${Date.now()}-${index}.${ext}`;
}

export function ownsListingPhoto(id: number, name: string): boolean {
  return new RegExp(`^inventory/inv-${id}-\\d+-\\d+\\.(jpg|png|webp)$`).test(name);
}

export async function countPublished(): Promise<number> {
  const sql = await getSql();
  const row = await sql.get<{ n: number }>("SELECT COUNT(*) AS n FROM inventory WHERE published = 1");
  return Number(row?.n ?? 0);
}

export async function listingStatusCounts(): Promise<Record<string, number>> {
  const sql = await getSql();
  const rows = await sql.all<{ status: string; n: number }>("SELECT status, COUNT(*) AS n FROM inventory GROUP BY status");
  const counts: Record<string, number> = { available: 0, "under contract": 0, sold: 0, unpublished: 0 };
  for (const row of rows) counts[row.status] = Number(row.n);
  const hidden = await sql.get<{ n: number }>("SELECT COUNT(*) AS n FROM inventory WHERE published = 0");
  counts.unpublished = Number(hidden?.n ?? 0);
  return counts;
}

export type ListingFilters = {
  state: string;
  type: string;
  min: number | null;
  max: number | null;
};

export async function searchPublished(filters: ListingFilters): Promise<Listing[]> {
  const sql = await getSql();
  return sql.all<Listing>(
    `SELECT * FROM inventory
     WHERE published = 1
       AND (? = '' OR state = ?)
       AND (? = '' OR property_type = ?)
       AND (? IS NULL OR asking_price >= ?)
       AND (? IS NULL OR asking_price <= ?)
     ORDER BY id DESC`,
    [filters.state, filters.state, filters.type, filters.type, filters.min, filters.min, filters.max, filters.max],
  );
}

export async function getPublishedListing(id: number): Promise<Listing | undefined> {
  const sql = await getSql();
  return sql.get<Listing>("SELECT * FROM inventory WHERE id = ? AND published = 1", [id]);
}

export async function publishedPhoto(name: string): Promise<boolean> {
  if (!/^inventory\/inv-\d+-\d+-\d+\.(jpg|png|webp)$/.test(name)) return false;
  const sql = await getSql();
  const rows = await sql.all<{ photo_names: string | null }>("SELECT photo_names FROM inventory WHERE published = 1 AND photo_names LIKE ?", [`%${name}%`]);
  return rows.some((row) => photoList(row.photo_names).includes(name));
}

export async function listInventory(): Promise<Listing[]> {
  const sql = await getSql();
  return sql.all<Listing>("SELECT * FROM inventory ORDER BY id DESC");
}

export async function getListing(id: number): Promise<Listing | undefined> {
  const sql = await getSql();
  return sql.get<Listing>("SELECT * FROM inventory WHERE id = ?", [id]);
}

export async function saveListing(input: ListingInput, id: number | null): Promise<number> {
  const sql = await getSql();
  const now = nowIso();
  if (id == null) {
    const result = await sql.run(
      `INSERT INTO inventory (
        created_at, updated_at, title, property_type, status, published, city, state, address, show_address,
        asking_price, arv, estimated_repairs, beds, baths, sqft, description, photo_names
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        now,
        now,
        input.title,
        input.propertyType,
        input.status,
        input.published ? 1 : 0,
        input.city,
        input.state,
        input.address,
        input.showAddress ? 1 : 0,
        input.askingPrice,
        input.arv,
        input.repairs,
        input.beds,
        input.baths,
        input.sqft,
        input.description,
      ],
    );
    return Number(result.lastInsertRowid);
  }
  await sql.run(
    `UPDATE inventory SET
      updated_at = ?, title = ?, property_type = ?, status = ?, published = ?, city = ?, state = ?, address = ?,
      show_address = ?, asking_price = ?, arv = ?, estimated_repairs = ?, beds = ?, baths = ?, sqft = ?, description = ?
     WHERE id = ?`,
    [
      now,
      input.title,
      input.propertyType,
      input.status,
      input.published ? 1 : 0,
      input.city,
      input.state,
      input.address,
      input.showAddress ? 1 : 0,
      input.askingPrice,
      input.arv,
      input.repairs,
      input.beds,
      input.baths,
      input.sqft,
      input.description,
      id,
    ],
  );
  return id;
}

export async function setListingPhotos(id: number, names: string[]): Promise<void> {
  const sql = await getSql();
  await sql.run("UPDATE inventory SET photo_names = ?, updated_at = ? WHERE id = ?", [names.length ? names.join("; ") : null, nowIso(), id]);
}

export async function deleteListing(id: number): Promise<void> {
  const listing = await getListing(id);
  const sql = await getSql();
  if (listing) {
    for (const name of photoList(listing.photo_names)) await deleteBlob(name);
  }
  await sql.run("DELETE FROM inventory_inquiries WHERE inventory_id = ?", [id]);
  await sql.run("DELETE FROM inventory WHERE id = ?", [id]);
}

export async function insertInquiry(inventoryId: number, input: InquiryInput, meta: { ip: string; userAgent: string }): Promise<number> {
  const sql = await getSql();
  const result = await sql.run(
    `INSERT INTO inventory_inquiries (
      created_at, inventory_id, name, phone, email, message, status, notes, tcpa_consent, ip, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, 'new', NULL, 1, ?, ?)`,
    [nowIso(), inventoryId, input.name, input.phone, input.email, input.message, meta.ip, meta.userAgent],
  );
  return Number(result.lastInsertRowid);
}

export async function searchInquiries(query: string, page: number, status = "", pageSize = 25): Promise<{ rows: Inquiry[]; total: number; page: number; pages: number }> {
  const sql = await getSql();
  const q = likeQuery(query);
  const where = `WHERE (? = '' OR i.name LIKE '%' || ? || '%' OR i.email LIKE '%' || ? || '%' OR i.phone LIKE '%' || ? || '%' OR i.message LIKE '%' || ? || '%' OR inv.title LIKE '%' || ? || '%' OR inv.city LIKE '%' || ? || '%')
    AND (? = '' OR i.status = ?)`;
  const filters = [q, q, q, q, q, q, q, status, status];
  const total = Number((await sql.get<{ n: number }>(`SELECT COUNT(*) AS n FROM inventory_inquiries i LEFT JOIN inventory inv ON inv.id = i.inventory_id ${where}`, filters))?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), total === 0 ? 1 : pages);
  const rows = await sql.all<Inquiry>(
    `SELECT i.*, inv.title AS listing_title, inv.city AS listing_city, inv.state AS listing_state
     FROM inventory_inquiries i LEFT JOIN inventory inv ON inv.id = i.inventory_id
     ${where} ORDER BY i.id DESC LIMIT ? OFFSET ?`,
    [...filters, pageSize, (safePage - 1) * pageSize],
  );
  return { rows, total, page: safePage, pages: total === 0 ? 1 : pages };
}

export async function getInquiry(id: number): Promise<Inquiry | undefined> {
  const sql = await getSql();
  return sql.get<Inquiry>(
    `SELECT i.*, inv.title AS listing_title, inv.city AS listing_city, inv.state AS listing_state
     FROM inventory_inquiries i LEFT JOIN inventory inv ON inv.id = i.inventory_id WHERE i.id = ?`,
    [id],
  );
}

export async function inquiriesCsv(): Promise<string> {
  const sql = await getSql();
  const rows = await sql.all<Inquiry>(
    `SELECT i.*, inv.title AS listing_title FROM inventory_inquiries i LEFT JOIN inventory inv ON inv.id = i.inventory_id ORDER BY i.id DESC`,
  );
  return toCsv(INQUIRY_HEADERS, rows.map((row) => INQUIRY_HEADERS.map((key) => row[key])));
}

export async function updateInquiry(id: number, status: string, notes: string): Promise<void> {
  const sql = await getSql();
  await sql.run("UPDATE inventory_inquiries SET status = ?, notes = ? WHERE id = ?", [status, notes, id]);
}

export async function deleteInquiry(id: number): Promise<void> {
  const sql = await getSql();
  await sql.run("DELETE FROM inventory_inquiries WHERE id = ?", [id]);
}

export async function countInquiries(status = "new"): Promise<number> {
  const sql = await getSql();
  return Number((await sql.get<{ n: number }>("SELECT COUNT(*) AS n FROM inventory_inquiries WHERE status = ?", [status]))?.n ?? 0);
}

export async function listFiles(): Promise<LibraryFile[]> {
  const sql = await getSql();
  return sql.all<LibraryFile>("SELECT * FROM library_files ORDER BY id DESC");
}

export async function getLibraryFile(id: number): Promise<LibraryFile | undefined> {
  const sql = await getSql();
  return sql.get<LibraryFile>("SELECT * FROM library_files WHERE id = ?", [id]);
}

export function safeLibraryName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return cleaned || "file";
}

export async function addLibraryFile(file: { name: string; bytes: Uint8Array; contentType: string }): Promise<number | null> {
  const key = `library/${randomUUID()}-${safeLibraryName(file.name)}`;
  const stored = await writeBlob(key, file.bytes, file.contentType);
  if (stored === "skipped") return null;
  const sql = await getSql();
  const result = await sql.run(
    "INSERT INTO library_files (created_at, name, r2_key, content_type, size_bytes) VALUES (?, ?, ?, ?, ?)",
    [nowIso(), file.name.slice(0, 180), key, file.contentType, file.bytes.byteLength],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteLibraryFile(id: number): Promise<void> {
  const file = await getLibraryFile(id);
  if (!file) return;
  await deleteBlob(file.r2_key);
  const sql = await getSql();
  await sql.run("DELETE FROM library_files WHERE id = ?", [id]);
}

export async function readLibraryFile(id: number): Promise<{ file: LibraryFile; body: Uint8Array | ReadableStream } | null> {
  const file = await getLibraryFile(id);
  if (!file) return null;
  const blob = await readBlob(file.r2_key);
  if (!blob) return null;
  return { file, body: blob.body };
}

export async function readListingPhoto(name: string): Promise<{ body: Uint8Array | ReadableStream; contentType: string } | null> {
  const blob = await readBlob(name);
  if (!blob) return null;
  const ext = name.slice(name.lastIndexOf(".") + 1);
  const types: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
  return { body: blob.body, contentType: blob.contentType.startsWith("image/") ? blob.contentType : types[ext] || "application/octet-stream" };
}
