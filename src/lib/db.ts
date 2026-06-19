import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS salary_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    week_start TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'unpaid',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    project_name TEXT DEFAULT 'House Project',
    pm_name TEXT DEFAULT '',
    pm_contact TEXT DEFAULT '',
    foreman_name TEXT DEFAULT '',
    foreman_contact TEXT DEFAULT ''
  );

  INSERT OR IGNORE INTO project_settings (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    cost REAL NOT NULL DEFAULT 0,
    date TEXT DEFAULT (date('now')),
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

try {
  db.exec("ALTER TABLE workers ADD COLUMN contact TEXT DEFAULT ''");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE workers ADD COLUMN department TEXT DEFAULT ''");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE salary_records ADD COLUMN week_start TEXT");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE salary_records ADD COLUMN status TEXT DEFAULT 'unpaid'");
} catch {
  // column already exists
}

export default db;
