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
