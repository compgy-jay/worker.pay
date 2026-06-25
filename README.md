# Pulse — Project Management & Cost Tracking

A professional project management platform for tracking teams, labor costs, materials, budgets, and notifications — built with Next.js 16, Supabase Auth, and Turso (SQLite).

## Features

- **Team Management** — Worker roster with departments and contact details
- **Labor Cost Tracking** — Weekly wage records with paid/unpaid status
- **Material Management** — Procurement tracking with categories, suppliers, and costing
- **Budget Monitoring** — Real-time budget vs. spend with utilization metrics
- **CSV Export** — Export labor and material records for accounting
- **Print Reports** — Formatted printable project reports
- **Notifications** — Email via Resend, SMS via Twilio, WhatsApp via Twilio
- **Supabase Auth** — Secure email/password authentication with session management
- **Advanced Filtering** — Filter by date range, worker, status, category, and full-text search

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — sign up or log in.

### Production

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | dev only | Local SQLite path (default: `file:local.db`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin operations) |
| `RESEND_API_KEY` | No | Resend API key (email notifications) |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID (SMS/WhatsApp) |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | No* | Twilio number for SMS |
| `TWILIO_WHATSAPP_NUMBER` | No* | Twilio number for WhatsApp |
| `FROM_EMAIL` | No | Sender email for notifications |

\* Required only if using the corresponding notification channel.

## Project Structure

```
src/
├── app/
│   ├── (app)/             # Authenticated app pages
│   │   ├── dashboard/     # Project overview with metrics
│   │   ├── workers/       # Team member management
│   │   ├── wages/         # Labor cost tracking
│   │   ├── materials/     # Material management
│   │   └── settings/      # Project configuration
│   ├── (auth)/            # Auth pages (login, signup, reset)
│   ├── (marketing)/       # Landing page
│   └── api/               # REST API routes
│       ├── workers/       # Worker CRUD
│       ├── records/       # Labor cost CRUD
│       ├── materials/     # Material CRUD
│       ├── project-settings/
│       ├── summary/       # Aggregated metrics
│       ├── notifications/ # Send (email/sms/whatsapp), Log
│       ├── send-sms/      # Direct Twilio SMS
│       └── auth/          # Auth callback & welcome
├── components/            # React components
│   ├── AppShell.tsx       # Main app UI (tabs, forms, tables)
│   └── DashboardHero.tsx  # Hero section with project info
├── hooks/                 # Custom React hooks
├── lib/
│   ├── db.ts              # Database connection & init
│   ├── format.ts          # Formatting helpers (dates, money, CSV)
│   ├── types.ts           # TypeScript type definitions
│   ├── supabase/          # Supabase auth utilities
│   └── notifications/     # Notification channel implementations
│       ├── index.ts       # sendNotification dispatcher
│       ├── sms.ts         # Twilio SMS
│       ├── whatsapp.ts    # Twilio WhatsApp
│       └── email.ts       # Resend email
├── utils/
│   └── twilio.ts          # Safe Twilio client initialization
└── proxy.ts               # Supabase auth middleware
```

## API Endpoints

All endpoints require authentication (session cookie).

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/workers` | List / create workers |
| PUT/DELETE | `/api/workers/[id]` | Update / delete worker |
| GET/POST | `/api/records` | List (with filters) / create labor records |
| PUT/DELETE | `/api/records/[id]` | Update / delete record |
| GET/POST | `/api/materials` | List (with filters) / create materials |
| PUT/DELETE | `/api/materials/[id]` | Update / delete material |
| GET/PUT | `/api/project-settings` | Read / update project config |
| GET | `/api/summary` | Aggregated budget & metrics |
| POST | `/api/notifications/send` | Send notification via channel |
| POST | `/api/send-sms` | Direct Twilio SMS |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Auth | Supabase (SSR sessions) |
| Database | Turso (libSQL/SQLite) |
| Fonts | Outfit, Noto Serif SC (next/font) |
| Email | Resend |
| SMS | Twilio |
| WhatsApp | Twilio |
| Language | TypeScript 5 |
| Package Manager | npm |

## Deployment

The project is configured for **Vercel** deployment:

1. Push to GitHub
2. Import repo in Vercel dashboard
3. Add all environment variables from `.env.example`
4. Deploy — `vercel --prod`

## Documentation

- **[Getting Started](./docs/GETTING_STARTED.md)** — Setup guide
- **[API Reference](./docs/API_REFERENCE.md)** — Full endpoint docs
- **[Configuration](./docs/CONFIGURATION.md)** — Env vars, deployment
- **[Architecture](./docs/ARCHITECTURE.md)** — System design, schema
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** — Common tasks
- **[Changelog](./CHANGELOG.md)** — Version history

## License

ISC
