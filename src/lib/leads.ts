import fs from "node:fs";
import path from "node:path";
import { toCsv } from "./csv";
import { getPhotoBucket, getSql, isCloudflareWorker } from "./db";
import { likeQuery } from "./format";
import type { BuyerInput, ContactInput, SellerInput } from "./validate";

export type RequestMeta = { ip: string; userAgent: string };

export type SellerLead = {
  id: number;
  created_at: string;
  asset_category: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  zip: string;
  timeline: string;
  asking_price: number | null;
  description: string | null;
  address: string | null;
  property_type: string | null;
  condition: string | null;
  reason: string | null;
  item_type: string | null;
  weight: string | null;
  purity: string | null;
  certification: string | null;
  quantity: string | null;
  photo_count: number;
  photo_names: string | null;
  tcpa_consent: number;
  ip: string | null;
  user_agent: string | null;
  status: string;
  notes: string | null;
};

export type BuyerSignup = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  company: string | null;
  categories: string;
  markets: string;
  property_types: string;
  price_range: string;
  buy_box: string;
  proof_of_funds: string;
  tcpa_consent: number;
  ip: string | null;
  user_agent: string | null;
  status: string;
  notes: string | null;
};

export type ContactMessage = {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  consent: number;
  ip: string | null;
  user_agent: string | null;
  status: string;
  notes: string | null;
};

export type LeadPage<T> = {
  rows: T[];
  total: number;
  page: number;
  pages: number;
};

const SELLER_HEADERS = [
  "id",
  "created_at",
  "asset_category",
  "name",
  "phone",
  "email",
  "city",
  "state",
  "zip",
  "timeline",
  "asking_price",
  "description",
  "address",
  "property_type",
  "condition",
  "reason",
  "item_type",
  "weight",
  "purity",
  "certification",
  "quantity",
  "photo_count",
  "photo_names",
  "tcpa_consent",
  "ip",
  "user_agent",
  "status",
  "notes",
] as const;

const BUYER_HEADERS = [
  "id",
  "created_at",
  "name",
  "phone",
  "email",
  "company",
  "categories",
  "markets",
  "property_types",
  "price_range",
  "buy_box",
  "proof_of_funds",
  "tcpa_consent",
  "ip",
  "user_agent",
  "status",
  "notes",
] as const;

const MESSAGE_HEADERS = ["id", "created_at", "name", "email", "phone", "message", "consent", "ip", "user_agent", "status", "notes"] as const;

function nowIso(): string {
  return new Date().toISOString();
}

function localUploadDirectory(): string {
  const root = process.env.DATABASE_PATH
    ? path.dirname(process.env.DATABASE_PATH)
    : path.join(process.cwd(), "data");
  return path.join(root, "uploads");
}

export async function insertSeller(input: SellerInput, meta: RequestMeta): Promise<number> {
  const sql = await getSql();
  const result = await sql.run(
    `INSERT INTO seller_leads (
        created_at, asset_category, name, phone, email, city, state, zip,
        timeline, asking_price, description, address, property_type, condition, reason,
        item_type, weight, purity, certification, quantity, photo_count,
        tcpa_consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)`,
    [
      nowIso(),
      input.assetCategory,
      input.name,
      input.phone,
      input.email,
      input.city,
      input.state,
      input.zip,
      input.timeline,
      input.askingPrice,
      input.description,
      input.address,
      input.propertyType,
      input.condition,
      input.reason,
      input.itemType,
      input.weight,
      input.purity,
      input.certification,
      input.quantity,
      meta.ip,
      meta.userAgent,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function deleteSeller(id: number): Promise<void> {
  const sql = await getSql();
  await sql.run("DELETE FROM seller_leads WHERE id = ?", [id]);
}

const PHOTO_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function saveSellerPhotos(leadId: number, files: { ext: string; bytes: Buffer }[]): Promise<string[]> {
  if (files.length === 0) return [];
  const names = files.map((file, index) => `${leadId}-${index + 1}.${file.ext}`);
  const bucket = await getPhotoBucket();
  const sql = await getSql();

  if (bucket) {
    await Promise.all(
      files.map((file, index) =>
        bucket.put(names[index], file.bytes, { httpMetadata: { contentType: PHOTO_TYPES[file.ext] ?? "application/octet-stream" } }),
      ),
    );
  } else if (!isCloudflareWorker()) {
    const directory = localUploadDirectory();
    fs.mkdirSync(directory, { recursive: true });
    files.forEach((file, index) => {
      fs.writeFileSync(path.join(directory, names[index]), file.bytes);
    });
  } else {
    return [];
  }

  await sql.run("UPDATE seller_leads SET photo_count = ?, photo_names = ? WHERE id = ?", [names.length, names.join("; "), leadId]);
  return names;
}

export async function readSellerPhoto(filename: string): Promise<{ body: Uint8Array | ReadableStream; contentType: string } | null> {
  if (!/^\d+-\d+\.(jpg|png|webp)$/.test(filename)) return null;
  const ext = filename.slice(filename.lastIndexOf(".") + 1);
  const contentType = PHOTO_TYPES[ext] ?? "application/octet-stream";
  const bucket = await getPhotoBucket();
  if (bucket) {
    const object = await bucket.get(filename);
    if (!object) return null;
    return { body: object.body, contentType: object.httpMetadata?.contentType || contentType };
  }
  if (isCloudflareWorker()) return null;
  const directory = path.resolve(localUploadDirectory());
  const full = path.resolve(directory, filename);
  if (!full.startsWith(directory + path.sep) || !fs.existsSync(full)) return null;
  return { body: fs.readFileSync(full), contentType };
}

export async function insertBuyer(input: BuyerInput, meta: RequestMeta): Promise<number> {
  const sql = await getSql();
  const result = await sql.run(
    `INSERT INTO buyer_signups (
        created_at, name, phone, email, company, categories, markets, property_types,
        price_range, buy_box, proof_of_funds, tcpa_consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      nowIso(),
      input.name,
      input.phone,
      input.email,
      input.company,
      input.categories,
      input.markets,
      input.propertyTypes,
      input.priceRange,
      input.buyBox,
      input.proofOfFunds,
      meta.ip,
      meta.userAgent,
    ],
  );
  return Number(result.lastInsertRowid);
}

export async function insertMessage(input: ContactInput, meta: RequestMeta): Promise<number> {
  const sql = await getSql();
  const result = await sql.run(
    `INSERT INTO contact_messages (
        created_at, name, email, phone, message, consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    [nowIso(), input.name, input.email, input.phone, input.message, meta.ip, meta.userAgent],
  );
  return Number(result.lastInsertRowid);
}

export async function leadCounts(): Promise<{ sellers: number; buyers: number; messages: number }> {
  const sql = await getSql();
  const count = async (statement: string) => (await sql.get<{ n: number }>(statement))?.n ?? 0;
  return {
    sellers: await count("SELECT COUNT(*) AS n FROM seller_leads"),
    buyers: await count("SELECT COUNT(*) AS n FROM buyer_signups"),
    messages: await count("SELECT COUNT(*) AS n FROM contact_messages"),
  };
}

async function paginate<T>(table: "seller_leads" | "buyer_signups" | "contact_messages", whereSql: string, query: string, page: number, pageSize: number, status = ""): Promise<LeadPage<T>> {
  const sql = await getSql();
  const q = likeQuery(query);
  const filters = [...(whereSql.match(/\?/g)?.map(() => q) ?? []), status, status];
  const clause = `${whereSql} AND (? = '' OR status = ?)`;
  const total = (await sql.get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} ${clause}`, filters))?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), total === 0 ? 1 : pages);
  const offset = (safePage - 1) * pageSize;
  const rows = await sql.all<T>(`SELECT * FROM ${table} ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`, [...filters, pageSize, offset]);
  return { rows, total, page: safePage, pages: total === 0 ? 1 : pages };
}

const sellerSearch = `WHERE (
  ? = ''
  OR name LIKE '%' || ? || '%'
  OR email LIKE '%' || ? || '%'
  OR phone LIKE '%' || ? || '%'
  OR city LIKE '%' || ? || '%'
  OR address LIKE '%' || ? || '%'
  OR state LIKE '%' || ? || '%'
  OR zip LIKE '%' || ? || '%'
  OR asset_category LIKE '%' || ? || '%'
  OR item_type LIKE '%' || ? || '%'
)`;

export function searchSellers(query: string, page: number, pageSize = 25, status = ""): Promise<LeadPage<SellerLead>> {
  return paginate<SellerLead>("seller_leads", sellerSearch, query, page, pageSize, status);
}

const buyerSearch = `WHERE (
  ? = ''
  OR name LIKE '%' || ? || '%'
  OR email LIKE '%' || ? || '%'
  OR phone LIKE '%' || ? || '%'
  OR company LIKE '%' || ? || '%'
  OR markets LIKE '%' || ? || '%'
  OR property_types LIKE '%' || ? || '%'
  OR categories LIKE '%' || ? || '%'
)`;

export function searchBuyers(query: string, page: number, pageSize = 25, status = ""): Promise<LeadPage<BuyerSignup>> {
  return paginate<BuyerSignup>("buyer_signups", buyerSearch, query, page, pageSize, status);
}

const messageSearch = `WHERE (
  ? = ''
  OR name LIKE '%' || ? || '%'
  OR email LIKE '%' || ? || '%'
  OR phone LIKE '%' || ? || '%'
  OR message LIKE '%' || ? || '%'
)`;

export function searchMessages(query: string, page: number, pageSize = 25, status = ""): Promise<LeadPage<ContactMessage>> {
  return paginate<ContactMessage>("contact_messages", messageSearch, query, page, pageSize, status);
}

export async function sellersCsv(): Promise<string> {
  const sql = await getSql();
  const rows = await sql.all<SellerLead>("SELECT * FROM seller_leads ORDER BY id DESC");
  return toCsv(
    SELLER_HEADERS,
    rows.map((row) => SELLER_HEADERS.map((key) => row[key])),
  );
}

export async function buyersCsv(): Promise<string> {
  const sql = await getSql();
  const rows = await sql.all<BuyerSignup>("SELECT * FROM buyer_signups ORDER BY id DESC");
  return toCsv(
    BUYER_HEADERS,
    rows.map((row) => BUYER_HEADERS.map((key) => row[key])),
  );
}

export async function messagesCsv(): Promise<string> {
  const sql = await getSql();
  const rows = await sql.all<ContactMessage>("SELECT * FROM contact_messages ORDER BY id DESC");
  return toCsv(
    MESSAGE_HEADERS,
    rows.map((row) => MESSAGE_HEADERS.map((key) => row[key])),
  );
}

const LEAD_TABLES = {
  sellers: "seller_leads",
  buyers: "buyer_signups",
  messages: "contact_messages",
} as const;

export type LeadKind = keyof typeof LEAD_TABLES;

export function leadTable(kind: LeadKind): (typeof LEAD_TABLES)[LeadKind] {
  return LEAD_TABLES[kind];
}

export async function getSeller(id: number): Promise<SellerLead | undefined> {
  return (await getSql()).get<SellerLead>("SELECT * FROM seller_leads WHERE id = ?", [id]);
}

export async function getBuyer(id: number): Promise<BuyerSignup | undefined> {
  return (await getSql()).get<BuyerSignup>("SELECT * FROM buyer_signups WHERE id = ?", [id]);
}

export async function getMessage(id: number): Promise<ContactMessage | undefined> {
  return (await getSql()).get<ContactMessage>("SELECT * FROM contact_messages WHERE id = ?", [id]);
}

export async function countLeadStatus(kind: LeadKind, status: string): Promise<number> {
  const row = await (await getSql()).get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${leadTable(kind)} WHERE status = ?`, [status]);
  return Number(row?.n ?? 0);
}

export async function updateLead(kind: LeadKind, id: number, status: string, notes: string): Promise<void> {
  await (await getSql()).run(`UPDATE ${leadTable(kind)} SET status = ?, notes = ? WHERE id = ?`, [status, notes, id]);
}

export async function deleteLead(kind: LeadKind, id: number): Promise<void> {
  await (await getSql()).run(`DELETE FROM ${leadTable(kind)} WHERE id = ?`, [id]);
}

export async function recentLeads(kind: LeadKind): Promise<{ id: number; created_at: string; name: string }[]> {
  return (await getSql()).all(`SELECT id, created_at, name FROM ${leadTable(kind)} ORDER BY id DESC LIMIT 5`);
}

export async function leadRows(kind: LeadKind, query: string, page: number, status: string) {
  const result = kind === "sellers" ? await searchSellers(query, page, 25, status) : kind === "buyers" ? await searchBuyers(query, page, 25, status) : await searchMessages(query, page, 25, status);
  return {
    total: result.total,
    page: result.page,
    pages: result.pages,
    rows: result.rows.map((row) => ({
      id: row.id,
      created_at: row.created_at,
      name: row.name,
      email: row.email,
      status: row.status,
      detail: "city" in row ? `${row.city}, ${row.state}` : "message" in row ? row.message.slice(0, 80) : row.markets,
    })),
  };
}
