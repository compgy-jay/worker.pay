import { createClient } from '@libsql/client';
import { hashPassword } from "@/lib/auth";

const url = process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.DATABASE_AUTH_TOKEN || '';

export const db = createClient({
  url,
  authToken,
});

async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS workers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact TEXT DEFAULT '',
      department TEXT DEFAULT '',
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

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

async function seedAdmin() {
  const { rows } = await db.execute("SELECT COUNT(*) as c FROM admins");
  if ((rows[0] as unknown as { c: number }).c === 0) {
    await db.execute(
      `INSERT INTO admins (name, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`,
      ["Admin", "0795351158", "admin@worker-pay.com", hashPassword("newday"), "superadmin"]
    );
  }
}

const ready = initDb()
  .then(() => seedAdmin())
  .catch(console.error);

export async function waitReady() {
  await ready;
}
