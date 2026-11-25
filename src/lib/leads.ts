import { toCsv } from "./csv";
import { getDb } from "./db";
import { likeQuery } from "./format";
import type { BuyerInput, ContactInput, SellerInput } from "./validate";

export type RequestMeta = { ip: string; userAgent: string };

export type SellerLead = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  condition: string;
  timeline: string;
  asking_price: number | null;
  reason: string | null;
  notes: string | null;
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
  "name",
  "phone",
  "email",
  "address",
  "city",
  "state",
  "zip",
  "property_type",
  "condition",
  "timeline",
  "asking_price",
  "reason",
  "notes",
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

export function insertSeller(input: SellerInput, meta: RequestMeta): void {
  getDb()
    .prepare(
      `INSERT INTO seller_leads (
        created_at, name, phone, email, address, city, state, zip,
        property_type, condition, timeline, asking_price, reason, notes,
        tcpa_consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(
      nowIso(),
      input.name,
      input.phone,
      input.email,
      input.address,
      input.city,
      input.state,
      input.zip,
      input.propertyType,
      input.condition,
      input.timeline,
      input.askingPrice,
      input.reason,
      input.notes,
      meta.ip,
      meta.userAgent,
    );
}

export function insertBuyer(input: BuyerInput, meta: RequestMeta): void {
  getDb()
    .prepare(
      `INSERT INTO buyer_signups (
        created_at, name, phone, email, company, markets, property_types,
        price_range, buy_box, proof_of_funds, tcpa_consent, ip, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
    )
    .run(
      nowIso(),
      input.name,
      input.phone,
      input.email,
      input.company,
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
