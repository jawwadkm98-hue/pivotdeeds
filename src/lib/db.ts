import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS seller_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  property_type TEXT NOT NULL,
  condition TEXT NOT NULL,
  timeline TEXT NOT NULL,
  asking_price INTEGER,
  reason TEXT,
  notes TEXT,
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
  return process.env.DATABASE_PATH || path.join(process.cwd(), "data", "pivotdeeds.sqlite");
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
  db = instance;
  return instance;
}

export function closeDb(): void {
  db?.close();
  db = null;
}
