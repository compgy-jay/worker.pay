# Worker Pay

Local project cost control for a house build. The app tracks workers, weekly wage records, material purchases, payment status, project budget, and exportable ledgers.

## Features

- Worker register with departments and contact details
- Weekly wage ledger with paid/unpaid status
- Material ledger with category, supplier, quantity, unit, cost, and notes
- Dashboard totals for wages, materials, unpaid wages, workers, and budget use
- Date range, search, worker, status, and category filters
- CSV exports for wages and materials
- Printable project report
- SQLite persistence through `better-sqlite3`

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run lint
npm run build
npm run start
```

## Database

By default, the app stores data in `data.db` in the project directory. For a more durable deployment, set:

```bash
WORKER_PAY_DB_PATH=/absolute/path/to/worker-pay.db
```

The local SQLite files are ignored by git. Back up the database file regularly if it contains real payroll or project cost records.
