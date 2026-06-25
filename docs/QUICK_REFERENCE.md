# Pulse — Quick Reference

## Common Tasks

| Task | How |
|------|-----|
| Add team member | Workers tab → fill form → **Add Member** |
| Record labor cost | Wages tab → select worker, week, amount → **Add Cost** |
| Mark as paid | Wages tab → **Mark paid** on a record |
| Add material | Materials tab → fill form → **Add Item** |
| Export CSV | Wages/Materials tab → **Export CSV** |
| Print report | Settings tab → **Print Report** |
| Send notification | Settings tab → Notification Sender → pick channel |
| Update project config | Settings tab → edit fields → **Save Settings** |

## Dashboard Metrics

| Metric | Meaning |
|--------|---------|
| Total Spend | Labor + Material costs |
| Outstanding Labor | Unpaid wages |
| Material Cost | Total material spend |
| Team Size | Active workers |
| Budget Used % | (Total Spend / Budget) × 100 |

## Notifications

| Channel | Provider | Config |
|---------|----------|--------|
| Email | Resend | `RESEND_API_KEY` + `FROM_EMAIL` |
| SMS | Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |
| WhatsApp | Twilio | Same SID/Token + `TWILIO_WHATSAPP_NUMBER` |

## Env Vars Quick Reference

```
NEXT_PUBLIC_SUPABASE_URL=       # Required
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Required
SUPABASE_SERVICE_ROLE_KEY=      # Required
RESEND_API_KEY=                 # Optional (email)
TWILIO_ACCOUNT_SID=             # Optional (SMS/WhatsApp)
TWILIO_AUTH_TOKEN=              # Optional
TWILIO_PHONE_NUMBER=            # Optional (SMS)
TWILIO_WHATSAPP_NUMBER=         # Optional (WhatsApp)
FROM_EMAIL=                     # Optional (email sender)
```

## Project Structure

```
src/
├── app/          # Pages + API routes
├── components/   # AppShell, DashboardHero
├── hooks/        # Entrance animation, count-up
├── lib/          # DB, types, notifications, supabase
└── utils/        # Twilio client
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Print report | `Ctrl+P` / `Cmd+P` |
| Focus search | `Ctrl+F` / `Cmd+F` |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Can't log in | Check Supabase credentials in `.env.local` |
| Data not loading | Check browser console (F12) for errors |
| Notification fails | Verify API keys in env vars |
| Port in use | `npm run dev -- -p 3001` |
| DB corrupted | Delete `local.db`, restart (schema auto-creates) |
