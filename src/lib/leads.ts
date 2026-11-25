import fs from "node:fs";
import path from "node:path";
import { toCsv } from "./csv";
import { databasePath, getDb } from "./db";
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
] as const;

const MESSAGE_HEADERS = ["id", "created_at", "name", "email", "phone", "message", "consent", "ip", "user_agent"] as const;

function nowIso(): string {
  return new Date().toISOString();
}

export function uploadDirectory(): string {
  return path.join(path.dirname(databasePath()), "uploads");
}

export function insertSeller(input: SellerInput, meta: RequestMeta): number {
  const result = getDb()
    .prepare(
      `INSERT INTO seller_leads (
        created_at, asset_category, name, phone, email, city, state, zip,
        timeline, asking_price, description, address, property_type, condition, reason,
        item_type, weight, purity, certification, quantity, photo_count,
        tcpa_consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?, ?)`,
    )
    .run(
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
    );
  return Number(result.lastInsertRowid);
}

export function deleteSeller(id: number): void {
  getDb().prepare("DELETE FROM seller_leads WHERE id = ?").run(id);
}

export function saveSellerPhotos(leadId: number, files: { ext: string; bytes: Buffer }[]): string[] {
  const directory = uploadDirectory();
  fs.mkdirSync(directory, { recursive: true });
  const names = files.map((file, index) => {
    const filename = `${leadId}-${index + 1}.${file.ext}`;
    fs.writeFileSync(path.join(directory, filename), file.bytes);
    return filename;
  });
  if (names.length > 0) {
    getDb()
      .prepare("UPDATE seller_leads SET photo_count = ?, photo_names = ? WHERE id = ?")
      .run(names.length, names.join("; "), leadId);
  }
  return names;
}

export function resolveUpload(filename: string): string | null {
  if (!/^\d+-\d+\.(jpg|png|webp)$/.test(filename)) return null;
  const directory = path.resolve(uploadDirectory());
  const full = path.resolve(directory, filename);
  if (!full.startsWith(directory + path.sep)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

export function insertBuyer(input: BuyerInput, meta: RequestMeta): void {
  getDb()
    .prepare(
      `INSERT INTO buyer_signups (
        created_at, name, phone, email, company, categories, markets, property_types,
        price_range, buy_box, proof_of_funds, tcpa_consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(
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
    );
}

export function insertMessage(input: ContactInput, meta: RequestMeta): void {
  getDb()
    .prepare(
      `INSERT INTO contact_messages (
        created_at, name, email, phone, message, consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(nowIso(), input.name, input.email, input.phone, input.message, meta.ip, meta.userAgent);
}

export function leadCounts(): { sellers: number; buyers: number; messages: number } {
  const db = getDb();
  const count = (sql: string) => db.prepare<unknown[], { n: number }>(sql).get()?.n ?? 0;
  return {
    sellers: count("SELECT COUNT(*) AS n FROM seller_leads"),
    buyers: count("SELECT COUNT(*) AS n FROM buyer_signups"),
    messages: count("SELECT COUNT(*) AS n FROM contact_messages"),
  };
}

function paginate<T>(table: "seller_leads" | "buyer_signups" | "contact_messages", whereSql: string, query: string, page: number, pageSize: number): LeadPage<T> {
  const q = likeQuery(query);
  const filters = whereSql.match(/\?/g)?.map(() => q) ?? [];
  const total =
    getDb()
      .prepare<unknown[], { n: number }>(`SELECT COUNT(*) AS n FROM ${table} ${whereSql}`)
      .get(...filters)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), total === 0 ? 1 : pages);
  const offset = (safePage - 1) * pageSize;
  const rows = getDb()
    .prepare<unknown[], T>(`SELECT * FROM ${table} ${whereSql} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...filters, pageSize, offset);
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

export function searchSellers(query: string, page: number, pageSize = 25): LeadPage<SellerLead> {
  return paginate<SellerLead>("seller_leads", sellerSearch, query, page, pageSize);
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

export function searchBuyers(query: string, page: number, pageSize = 25): LeadPage<BuyerSignup> {
  return paginate<BuyerSignup>("buyer_signups", buyerSearch, query, page, pageSize);
}

const messageSearch = `WHERE (
  ? = ''
  OR name LIKE '%' || ? || '%'
  OR email LIKE '%' || ? || '%'
  OR phone LIKE '%' || ? || '%'
  OR message LIKE '%' || ? || '%'
)`;

export function searchMessages(query: string, page: number, pageSize = 25): LeadPage<ContactMessage> {
  return paginate<ContactMessage>("contact_messages", messageSearch, query, page, pageSize);
}

export function sellersCsv(): string {
  const rows = getDb().prepare<unknown[], SellerLead>("SELECT * FROM seller_leads ORDER BY id DESC").all();
  return toCsv(
    SELLER_HEADERS,
    rows.map((row) => SELLER_HEADERS.map((key) => row[key])),
  );
}

export function buyersCsv(): string {
  const rows = getDb().prepare<unknown[], BuyerSignup>("SELECT * FROM buyer_signups ORDER BY id DESC").all();
  return toCsv(
    BUYER_HEADERS,
    rows.map((row) => BUYER_HEADERS.map((key) => row[key])),
  );
}

export function messagesCsv(): string {
  const rows = getDb().prepare<unknown[], ContactMessage>("SELECT * FROM contact_messages ORDER BY id DESC").all();
  return toCsv(
    MESSAGE_HEADERS,
    rows.map((row) => MESSAGE_HEADERS.map((key) => row[key])),
  );
}
