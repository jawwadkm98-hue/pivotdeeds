import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const SELLER_TABLE = `
CREATE TABLE seller_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  asset_category TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  timeline TEXT NOT NULL,
  asking_price INTEGER,
  description TEXT,
  address TEXT,
  property_type TEXT,
  condition TEXT,
  reason TEXT,
  item_type TEXT,
  weight TEXT,
  purity TEXT,
  certification TEXT,
  quantity TEXT,
  photo_count INTEGER NOT NULL DEFAULT 0,
  photo_names TEXT,
  tcpa_consent INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT
)`;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS seller_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  asset_category TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  timeline TEXT NOT NULL,
  asking_price INTEGER,
  description TEXT,
  address TEXT,
  property_type TEXT,
  condition TEXT,
  reason TEXT,
  item_type TEXT,
  weight TEXT,
  purity TEXT,
  certification TEXT,
  quantity TEXT,
  photo_count INTEGER NOT NULL DEFAULT 0,
  photo_names TEXT,
  tcpa_consent INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS buyer_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  categories TEXT NOT NULL,
  markets TEXT NOT NULL,
  property_types TEXT NOT NULL,
  price_range TEXT NOT NULL,
  buy_box TEXT NOT NULL,
  proof_of_funds TEXT NOT NULL,
  tcpa_consent INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  consent INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS rate_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  bucket TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_events_lookup ON rate_events (bucket, ip, created_at);
CREATE INDEX IF NOT EXISTS idx_seller_created ON seller_leads (created_at);
CREATE INDEX IF NOT EXISTS idx_buyer_created ON buyer_signups (created_at);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages (created_at);
`;

let db: Database.Database | null = null;

export function databasePath(): string {
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "crownwholesalers.sqlite");
}

function columnNames(instance: Database.Database, table: string): string[] {
  const rows = instance.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return rows.map((row) => row.name);
}

function migrate(instance: Database.Database) {
  const seller = columnNames(instance, "seller_leads");
  if (seller.length > 0 && !seller.includes("asset_category")) {
    instance.exec("ALTER TABLE seller_leads RENAME TO seller_leads_legacy");
    instance.exec(SELLER_TABLE);
    instance.exec(`
      INSERT INTO seller_leads (
        id, created_at, asset_category, name, phone, email, city, state, zip,
        timeline, asking_price, description, address, property_type, condition, reason,
        photo_count, tcpa_consent, ip, user_agent
      )
      SELECT
        id, created_at, 'real_estate', name, phone, email, city, state, zip,
        timeline, asking_price, notes, address, property_type, condition, reason,
        0, tcpa_consent, ip, user_agent
      FROM seller_leads_legacy
    `);
    instance.exec("DROP TABLE seller_leads_legacy");
  }

  const buyers = columnNames(instance, "buyer_signups");
  if (buyers.length > 0 && !buyers.includes("categories")) {
    instance.exec("ALTER TABLE buyer_signups ADD COLUMN categories TEXT NOT NULL DEFAULT 'Real estate'");
  }
}

export function getDb(): Database.Database {
  if (db) return db;
  const file = databasePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const instance = new Database(file);
  instance.pragma("foreign_keys = ON");
  instance.pragma("busy_timeout = 5000");
  try {
    instance.pragma("journal_mode = WAL");
  } catch {
    instance.pragma("journal_mode = DELETE");
  }
  instance.exec(SCHEMA);
  migrate(instance);
  db = instance;
  return instance;
}

export function closeDb(): void {
  db?.close();
  db = null;
}
