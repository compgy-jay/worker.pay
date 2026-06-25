# Getting Started with Pulse

## Prerequisites

- Node.js 18+
- npm 9+
- A Supabase account (free tier works)

## Setup (10 minutes)

### 1. Clone & Install

```bash
git clone <repo-url>
cd worker-pay
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Dashboard → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same page

### 3. Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Create Your Account

1. Click **Sign up**
2. Enter email and password
3. You'll be logged in automatically

### 5. Configure Your Project

1. Go to **Settings** tab
2. Set your project name, currency, and budget
3. Add your name as Project Manager
4. Click **Save Settings**

## Next Steps

- Add team members in the **Team Members** tab
- Record labor costs in the **Wages** tab
- Track materials in the **Materials** tab
- Monitor budget on the **Dashboard**

## Optional — Notifications

To enable email, SMS, or WhatsApp notifications:

1. **Resend** (email): Sign up at resend.com, add API key
2. **Twilio** (SMS/WhatsApp): Sign up at twilio.com, buy a number, add SID and token
3. Set the corresponding env vars and redeploy
