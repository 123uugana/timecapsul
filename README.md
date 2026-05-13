# Digital Time Capsule Social

A Next.js App Router + Supabase MVP for text-only future message capsules.

## Features

- Landing page with cinematic dark glassmorphism styling
- Email/password login and signup with Supabase Auth
- Dashboard for private capsule management
- Create text capsules for yourself or a recipient email
- Capsule detail page with countdown and locked blur state
- Public/private unlock page that reveals the message after the unlock date
- AI Memory Experience section for unlocked capsules:
  cinematic narration text, emotional rewrite, and social share card copy
- MNT pricing page and Stripe Checkout-ready payment route:
  Free 0₮, Premium 15,000₮ / month, AI Cinematic Reveal 3,000₮ one-time

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project and run the SQL in `supabase/schema.sql`.

3. Copy `.env.example` to `.env.local` and add your Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
CRON_SECRET=...
RESEND_API_KEY=...
NOTIFICATION_FROM_EMAIL=...
```

4. Start the dev server:

```bash
npm run dev
```

## Notes

This MVP intentionally supports text capsules only. Voice, video, AI generation,
notifications, and delivery automation are left out so the core product is clean.

The database schema revokes direct `message` column reads from browser roles and
uses `get_unlocked_capsule_message` to return capsule text only after the unlock
date for the owner or for public capsules.

`/api/capsules/[id]/memory-experience` is the prepared backend endpoint for the
AI Memory Experience. It currently uses a deterministic local text generator and
caches results in `ai_memory_experiences`, so a real text AI provider can be
added later without changing the UI contract. Voice and video APIs are not
connected in this MVP.

Pricing amounts live in `src/lib/pricing.js`. Stripe checkout uses currency
`mnt`; the checkout route keeps a clear replacement point for a future QPay
invoice integration.

Unlock notifications are prepared through `/api/cron/unlock-notifications` and
`vercel.json`. Vercel Cron calls the route every 10 minutes. If `RESEND_API_KEY`
and `NOTIFICATION_FROM_EMAIL` are configured, unlocked capsules with pending
notifications send an email and then set `notified_at`.
