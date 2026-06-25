# Pulse — Architecture Overview

System design, technology stack, and data architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Browser                          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────┐
│              Vercel Edge Network (CDN)                   │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│          Next.js Server (Node.js / Serverless)           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Supabase Auth Middleware (proxy.ts)          │  │
│  │  - Session refresh on every request               │  │
│  │  - Redirect unauthenticated users to /login       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      App Pages (Server Components + Client)       │  │
│  │  - Dashboard  (metrics, charts, pending items)    │  │
│  │  - Workers    (team roster CRUD)                  │  │
│  │  - Wages      (labor cost tracking)               │  │
│  │  - Materials  (procurement management)            │  │
│  │  - Settings   (project config)                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      API Routes (/api/*)                         │  │
│  │  - workers, records, materials (CRUD)            │  │
│  │  - summary (aggregated metrics)                  │  │
│  │  - notifications/send (dispatch)                 │  │
│  │  - send-sms (direct Twilio)                      │  │
│  │  - auth/welcome (post-signup)                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      External Services                           │  │
│  │  - Supabase (Auth)                               │  │
│  │  - Turso/libSQL (Database)                       │  │
│  │  - Resend (Email)                                │  │
│  │  - Twilio (SMS / WhatsApp)                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 19 with Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4 with CSS custom properties
- **Typography**: Outfit (sans) + Noto Serif SC (serif) via `next/font`
- **Language**: TypeScript 5

### Backend
- **Runtime**: Node.js 18+ (serverless on Vercel)
- **API**: Next.js Route Handlers (REST)
- **Database**: Turso (libSQL/SQLite) — local `file:local.db` or remote Turso DB
- **Auth**: Supabase SSR (server-side sessions with cookie-based refresh)

### Notifications
- **Email**: Resend SDK (`react-email` compatible)
- **SMS**: Twilio SDK (lazy-initialized, build-safe)
- **WhatsApp**: Twilio REST API (via fetch, no SDK needed)

### Development
- **Linting**: ESLint 9 (`eslint-config-next`)
- **Package Manager**: npm
- **Font Optimization**: `next/font/google` (automatic subsetting, preload)

## Database Schema

### `workers`
```sql
CREATE TABLE workers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  contact     TEXT DEFAULT '',
  department  TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now'))
);
```

### `salary_records`
```sql
CREATE TABLE salary_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  worker_id   INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  week_start  TEXT NOT NULL,
  amount      REAL NOT NULL,
  status      TEXT DEFAULT 'unpaid',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
```

### `materials`
```sql
CREATE TABLE materials (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  quantity    REAL NOT NULL DEFAULT 1,
  unit        TEXT DEFAULT 'pcs',
  cost        REAL NOT NULL DEFAULT 0,
  date        TEXT DEFAULT (date('now')),
  category    TEXT DEFAULT '',
  supplier    TEXT DEFAULT '',
  notes       TEXT DEFAULT '',
  created_at  TEXT DEFAULT (datetime('now'))
);
```

### `project_settings`
```sql
CREATE TABLE project_settings (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  project_name    TEXT DEFAULT 'Site Project',
  pm_name         TEXT DEFAULT '',
  pm_contact      TEXT DEFAULT '',
  foreman_name    TEXT DEFAULT '',
  foreman_contact TEXT DEFAULT '',
  currency        TEXT DEFAULT 'KES',
  budget          REAL DEFAULT 0
);
```

### `notification_log`
```sql
CREATE TABLE notification_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  channel     TEXT NOT NULL,
  recipient   TEXT NOT NULL,
  subject     TEXT DEFAULT '',
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'sent',
  created_at  TEXT DEFAULT (datetime('now'))
);
```

### Indexes
```sql
-- salary_records
CREATE INDEX idx_salary_records_worker_id   ON salary_records(worker_id);
CREATE INDEX idx_salary_records_status      ON salary_records(status);
CREATE INDEX idx_salary_records_week_start  ON salary_records(week_start);
CREATE INDEX idx_salary_records_worker_week ON salary_records(worker_id, week_start DESC);
CREATE INDEX idx_salary_records_status_week ON salary_records(status, week_start DESC);

-- materials
CREATE INDEX idx_materials_date    ON materials(date);
CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_date_id ON materials(date DESC, id DESC);
```

## Key Design Decisions

### Safe Twilio Initialization
The Twilio SDK is initialized lazily via `getTwilioClient()` in `src/utils/twilio.ts`. This prevents build-time crashes when env vars are absent during static generation:
- Returns `null` if credentials missing instead of throwing
- One-time warning in production logs
- All notification channels check for `null` before sending

### Notification Dispatch Pattern
`src/lib/notifications/index.ts` implements a channel-based dispatcher:
- `sendNotification({ channel, to, template, data })` resolves template, renders with mustache-style `{{var}}` interpolation, sends via the correct channel, and logs the result to `notification_log`.

### Performance Optimizations
- **Duplicate fetch prevention**: Query-dependent refetches skip initial mount via `booted` ref
- **Optimized summary query**: Single pass over `salary_records` with `CASE` aggregates instead of 9 correlated subqueries
- **CSS animations** replace GSAP for entrance effects and glow animation
- **next/font** replaces CSS @import for render-blocking font optimization

## Data Flow

### Authentication
```
Request → proxy.ts middleware → updateSession() refreshes token
  → Protected route? → No → serve page
  → No user? → Redirect to /login?redirect=path
  → Authenticated → Render page with session cookie
```

### Notification Send
```
POST /api/notifications/send
  → requireAuth() (Supabase session check)
  → sendNotification({ channel, to, template, data })
    → Resolve template → Render {{vars}}
    → Channel implementation (email/sms/whatsapp)
    → Log to notification_log table
  → Return { success, id?, error? }
```

## Project Structure

```
src/
├── app/
│   ├── (app)/               # Authenticated layout + pages
│   │   ├── dashboard/       # Summary metrics, pending items
│   │   ├── workers/         # Team member management
│   │   ├── wages/           # Labor cost tracking
│   │   ├── materials/       # Material procurement
│   │   ├── settings/        # Project config + print
│   │   └── layout.tsx       # App shell layout (client nav)
│   ├── (auth)/              # Auth pages
│   │   ├── login/           # Sign in
│   │   ├── signup/          # Register
│   │   ├── reset-password/  # Password reset
│   │   └── auth/callback/   # OAuth callback
│   ├── (marketing)/         # Landing page
│   ├── api/                 # Route handlers
│   │   ├── workers/         # CRUD
│   │   ├── records/         # CRUD + filtering
│   │   ├── materials/       # CRUD + filtering
│   │   ├── project-settings/
│   │   ├── summary/         # Aggregated metrics
│   │   ├── notifications/   # send + log
│   │   ├── send-sms/        # Direct Twilio
│   │   └── auth/            # welcome notification
│   ├── globals.css          # Tailwind + custom styles
│   └── layout.tsx           # Root layout (fonts, html)
├── components/
│   ├── AppShell.tsx         # Monolithic app UI (tabs, all forms)
│   ├── DashboardHero.tsx    # Hero section
│   └── Providers.tsx        # No-op provider wrapper
├── hooks/
│   ├── useEntranceAnimation.ts  # IntersectionObserver + CSS transitions
│   └── useEntranceAnimation.ts  # requestAnimationFrame count-up
├── lib/
│   ├── db.ts                # DB client + schema init
│   ├── format.ts            # formatDate, formatMoney, downloadCsv
│   ├── types.ts             # Shared TypeScript types
│   └── supabase/
│       ├── server.ts        # Server-side client
│       ├── client.ts        # Browser client
│       ├── middleware.ts    # Session update helper
│       ├── admin.ts         # Admin client (service role)
│       ├── guard.ts         # requireUser / requireUserApi
│       └── phone.ts         # E.164 normalization
├── utils/
│   └── twilio.ts            # Lazy Twilio client init
└── proxy.ts                 # Middleware (auth guard)
```

## Security

- **Auth**: Supabase SSR with HTTP-only session cookies
- **Middleware**: Session check on every protected route request
- **API Auth**: Every route handler calls `requireAuth()` / `requireUserApi()`
- **SQL Injection**: All queries use parameterized statements (`?` placeholders)
- **Secrets**: Env vars via Vercel environment manager, never committed to git
