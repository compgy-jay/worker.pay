# Deploying to Vercel

ProjectHub uses SQLite via `@libsql/client`. Vercel serverless functions cannot write to a local `file:` database, so production on Vercel requires a hosted **Turso** database.

## 1. Create a Turso database

Install the [Turso CLI](https://docs.turso.tech/cli/introduction), then:

```bash
turso auth login
turso db create worker-pay --region nrt
turso db show worker-pay --url
turso db tokens create worker-pay
```

Save the **URL** (`libsql://...`) and **token**.

## 2. Add Vercel environment variables

In **Vercel → Project → Settings → Environment Variables**, add for **Production**, **Preview**, and **Development**:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | `libsql://your-db-name-org.turso.io` |
| `DATABASE_AUTH_TOKEN` | token from `turso db tokens create` |

Redeploy after saving variables.

## 3. Verify deployment

Open:

```
https://your-app.vercel.app/api/health
```

Expected response:

```json
{ "status": "healthy", "database": { "ok": true, "mode": "remote", "platform": "vercel" } }
```

If misconfigured, the response explains what is missing.

## 4. Local development with Turso (optional)

Copy `.env.example` to `.env.local` and set the same Turso variables to share data with production, or omit them to use `file:local.db` locally.

## CLI shortcut

If the project is linked to Vercel:

```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_AUTH_TOKEN production
vercel --prod
```

## Why this is required

- Vercel functions have a **read-only filesystem** (except `/tmp`, which is ephemeral).
- Each function instance is isolated; a local SQLite file would not persist or stay consistent.
- Turso provides a remote libSQL database that all serverless instances share.

Tables are created automatically on first request via `src/lib/db.ts`.
