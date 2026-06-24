import { createClient, type Client } from "@libsql/client";

export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();

  if (url) {
    if (url.startsWith("file:")) {
      if (process.env.VERCEL) {
        throw new DatabaseConfigError(
          "Local SQLite cannot run on Vercel. Set DATABASE_URL to a Turso libsql:// URL in Vercel project settings."
        );
      }
      return url;
    }
    return url;
  }

  if (process.env.VERCEL) {
    throw new DatabaseConfigError(
      "DATABASE_URL is not configured on Vercel. Create a Turso database and add DATABASE_URL plus DATABASE_AUTH_TOKEN. See docs/VERCEL_DEPLOYMENT.md."
    );
  }

  return "file:local.db";
}

function resolveAuthToken(url: string): string {
  const token = process.env.DATABASE_AUTH_TOKEN?.trim() || "";
  if (url.startsWith("file:")) {
    return token;
  }
  if (!token) {
    throw new DatabaseConfigError(
      "DATABASE_AUTH_TOKEN is required when using a remote libSQL database (Turso)."
    );
  }
  return token;
}

let client: Client;
let ready: Promise<void>;

function bootstrap() {
  const url = resolveDatabaseUrl();
  const authToken = resolveAuthToken(url);
  client = createClient({ url, authToken });
  ready = initDb(client).catch((error) => {
    console.error("Database initialization failed:", error);
    throw error;
  });
}

async function initDb(db: Client) {
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
      project_name TEXT DEFAULT 'Site Project',
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

async function ensureReady() {
  await ready;
}

try {
  bootstrap();
} catch (error) {
  ready = Promise.reject(error);
}

export const db = {
  execute: (...args: Parameters<Client["execute"]>) =>
    ensureReady().then(() => client.execute(...args)),
  executeMultiple: (...args: Parameters<Client["executeMultiple"]>) =>
    ensureReady().then(() => client.executeMultiple(...args)),
  batch: (...args: Parameters<Client["batch"]>) =>
    ensureReady().then(() => client.batch(...args)),
};

export async function waitReady() {
  await ensureReady();
}

export function getDatabaseStatus() {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  const isVercel = Boolean(process.env.VERCEL);
  const mode = configuredUrl?.startsWith("file:") || (!configuredUrl && !isVercel)
    ? "local"
    : configuredUrl
      ? "remote"
      : "missing";

  return {
    ok: mode !== "missing" && !(isVercel && mode === "local"),
    mode,
    platform: isVercel ? "vercel" : "local",
  };
}
