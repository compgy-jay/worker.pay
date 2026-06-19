import Database from "better-sqlite3";
import path from "path";

// Example for better path management in production
const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

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
    foreman_contact TEXT DEFAULT '',
    currency TEXT DEFAULT 'KES',
    budget REAL DEFAULT 0
  );

  INSERT OR IGNORE INTO project_settings (id) VALUES (1);

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'pcs',
    cost REAL NOT NULL DEFAULT 0,
    date TEXT DEFAULT (date('now')),
    category TEXT DEFAULT '',
    supplier TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_salary_records_worker_id ON salary_records(worker_id);
  CREATE INDEX IF NOT EXISTS idx_salary_records_status ON salary_records(status);
  CREATE INDEX IF NOT EXISTS idx_salary_records_week_start ON salary_records(week_start);
  CREATE INDEX IF NOT EXISTS idx_materials_date ON materials(date);
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
try {
  db.exec("ALTER TABLE project_settings ADD COLUMN currency TEXT DEFAULT 'KES'");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE project_settings ADD COLUMN budget REAL DEFAULT 0");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE materials ADD COLUMN category TEXT DEFAULT ''");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE materials ADD COLUMN supplier TEXT DEFAULT ''");
} catch {
  // column already exists
}

db.exec("CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category)");

export default db;
