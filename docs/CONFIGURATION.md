# Pulse — Configuration Guide

Environment variables, deployment, and platform configuration.

## Environment Variables

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

### Required

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Same page |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin) | Same page (keep secret!) |

### Optional — Notifications

| Variable | Description | Required For |
|----------|-------------|-------------|
| `RESEND_API_KEY` | Resend API key | Email notifications |
| `FROM_EMAIL` | Sender email address | Email (must be verified in Resend) |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | SMS / WhatsApp |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | SMS / WhatsApp |
| `TWILIO_PHONE_NUMBER` | Twilio SMS-capable number | SMS |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp number | WhatsApp |

### Database

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:local.db` | Local SQLite path or Turso URL |

Turso connection string format: `libsql://your-db-name-org.turso.io`

## Vercel Deployment

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com/new)
3. Add all environment variables in Project Settings → Environment Variables
4. Deploy

The `netlify.toml` file is present for legacy compatibility but the project is deployed on Vercel.

## Local Development

```bash
npm install
npm run dev     # http://localhost:3000
```

The database auto-creates as `local.db` in the project root on first run.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Email + Password** auth in Authentication → Providers
3. Copy the project URL and anon key to your `.env.local`
4. For the auth callback URL, set it to:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.vercel.app/auth/callback`
