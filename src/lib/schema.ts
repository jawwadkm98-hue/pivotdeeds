/** Shared with migrations/0001_init.sql. D1 and the local SQLite fallback both apply these statements. */
export const SCHEMA_SQL = `
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
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT
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
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT
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
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT
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

CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  published INTEGER NOT NULL DEFAULT 0,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  show_address INTEGER NOT NULL DEFAULT 0,
  asking_price INTEGER,
  arv INTEGER,
  estimated_repairs INTEGER,
  beds REAL,
  baths REAL,
  sqft INTEGER,
  description TEXT,
  photo_names TEXT
);

CREATE TABLE IF NOT EXISTS inventory_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  inventory_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  tcpa_consent INTEGER NOT NULL,
  ip TEXT,
  user_agent TEXT
);

CREATE TABLE IF NOT EXISTS library_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inventory_public ON inventory (published, state, property_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_inventory ON inventory_inquiries (inventory_id, created_at);

CREATE TABLE IF NOT EXISTS arv_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  title TEXT NOT NULL,
  inventory_id INTEGER,
  subject_address TEXT,
  subject_sqft INTEGER,
  subject_beds REAL,
  subject_baths REAL,
  repair_estimate INTEGER,
  assignment_fee INTEGER,
  arv_percent REAL NOT NULL DEFAULT 70,
  comps_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_arv_updated ON arv_calculations (updated_at);
`;

/** Applied after SCHEMA_SQL so databases created before these columns still gain them. */
export const COLUMN_PATCHES = [
  "ALTER TABLE seller_leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new'",
  "ALTER TABLE seller_leads ADD COLUMN notes TEXT",
  "ALTER TABLE buyer_signups ADD COLUMN status TEXT NOT NULL DEFAULT 'new'",
  "ALTER TABLE buyer_signups ADD COLUMN notes TEXT",
  "ALTER TABLE contact_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'new'",
  "ALTER TABLE contact_messages ADD COLUMN notes TEXT",
];
