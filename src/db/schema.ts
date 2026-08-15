export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  currency TEXT NOT NULL DEFAULT 'USD',
  current_balance REAL NOT NULL DEFAULT 0,
  savings_target_type TEXT NOT NULL DEFAULT 'none',
  savings_target_amount REAL NOT NULL DEFAULT 0,
  onboarding_complete INTEGER NOT NULL DEFAULT 0,
  theme_mode TEXT NOT NULL DEFAULT 'system',
  week_starts_on INTEGER NOT NULL DEFAULT 0,
  is_pro_dev INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS income_sources (
  id TEXT PRIMARY KEY NOT NULL,
  label TEXT NOT NULL,
  amount REAL NOT NULL,
  frequency TEXT NOT NULL,
  anchor_date TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY NOT NULL,
  label TEXT NOT NULL,
  amount REAL NOT NULL,
  frequency TEXT NOT NULL,
  anchor_date TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  reminder_days_before INTEGER NOT NULL DEFAULT 3,
  reminders_enabled INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY NOT NULL,
  label TEXT NOT NULL,
  kind TEXT NOT NULL,
  target_amount REAL NOT NULL,
  saved_amount REAL NOT NULL DEFAULT 0,
  target_date TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
CREATE INDEX IF NOT EXISTS idx_bills_active ON bills (active);
CREATE INDEX IF NOT EXISTS idx_goals_active ON goals (active);
`;

export const SEED_SETTINGS_SQL = `
INSERT OR IGNORE INTO settings (id) VALUES (1);
`;
