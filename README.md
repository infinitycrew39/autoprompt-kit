# AutoPrompt Kit

Premium digital product landing page and **Hermes Agent Hackathon** ops runtime. Sell prompt packs with Stripe Checkout, deliver secured downloads after purchase, and run autonomous business operations through an NVIDIA Nemotron-powered Ops Console with Stripe Skills.

**Live:** [https://autoprompt-kit.vercel.app](https://autoprompt-kit.vercel.app)  
**Demo video:** [Watch on X](https://x.com/InfinityCrew39/status/2071243980310982705)  
**Ops Console:** [https://autoprompt-kit.vercel.app/hackathon](https://autoprompt-kit.vercel.app/hackathon)

## What It Does

1. **Landing & checkout** — marketing site with Starter / Professional / Ultimate one-time plans via Stripe.
2. **Purchase gating** — downloads and Ops Console unlock only after a verified paid checkout session.
3. **Email restore** — buyers can restore access with the Gmail used at checkout.
4. **Autonomous ops** — Nemotron plans multi-step runs (analyze → earn → spend → provision); Stripe Skills execute revenue and procurement flows.
5. **Safety layer** — NemoClaw-style budget and vendor guardrails before spend/provision actions.
6. **Admin dashboard** — live orders synced from Stripe with delivery status from webhooks.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components + Radix UI
- Framer Motion + Lucide icons
- Stripe Checkout, webhooks, and Skills-style session creation
- NVIDIA NIM API (Nemotron planner, optional)
- Vercel deployment + daily cron autopilot endpoint

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Stripe test account (for checkout)
- Optional: NVIDIA API key (for live Nemotron planning)

### 1. Clone and install

```bash
git clone https://github.com/infinitycrew39/autoprompt-kit.git
cd autoprompt-kit
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_CURRENCY=usd
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional Stripe price IDs (auto inline pricing works in test mode if omitted)
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_ULTIMATE=

# Email delivery (optional)
RESEND_API_KEY=
RESEND_FROM=AutoPrompt Kit <deliveries@yourdomain.com>
DELIVERY_OVERRIDE_EMAIL=

# NVIDIA Nemotron planner (optional — falls back to safe planner)
NVIDIA_API_KEY=
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NEMOTRON_MODEL=nvidia/nemotron-3-ultra-550b-a55b
NVIDIA_REQUEST_TIMEOUT_MS=8000

# Agent guardrails
AGENT_MAX_BUDGET_CENTS=50000

# Admin (optional)
ADMIN_DASHBOARD_TOKEN=
ADMIN_ORDERS_SINCE=

# Autopilot cron (optional, production)
CRON_SECRET=
AUTOPILOT_OBJECTIVES_JSON=["Launch growth sprint for AutoPrompt Kit"]
AUTOPILOT_DEFAULT_BUDGET_CENTS=5000
AUTOPILOT_DEFAULT_LIMIT=1
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Stripe webhook (recommended for full flow)

In a second terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`, then restart `npm run dev`.

Local smoke test without Stripe CLI:

```bash
npm run test:webhook:local
```

## User Flow

| Step | Screen | URL |
|------|--------|-----|
| Browse product | Landing page | `/` |
| Watch demo | X video (opens in new tab) | Hero → **Watch Demo** |
| Choose plan | Pricing | `/#pricing` |
| Pay | Stripe Checkout | redirected from checkout API |
| Get files | Success + secured downloads | `/success?session_id=...` |
| Run agents | Ops Console | `/hackathon?session_id=...` |
| Restore access | Email on gated console | `/hackathon` → Restore Access |

### Test card (Stripe sandbox)

```text
4242 4242 4242 4242
Any future expiry, any CVC, any ZIP
```

## Ops Console (Hackathon Mode)

Open `/hackathon` after a paid checkout (or pass `?session_id=cs_...`).

The console:

1. Loads purchased prompt files as planning context.
2. Calls Nemotron when `NVIDIA_API_KEY` is set (otherwise uses fallback planner).
3. Applies NemoClaw-style policies on spend/provision steps.
4. Executes Stripe Skills for earn and procurement actions.
5. Shows run summary: spend, projected revenue, ROI, and per-step status.

### Agent APIs

```bash
# Run one autonomous operation (requires verified purchase session)
POST /api/agent/run
{
  "objective": "Launch growth sprint and provision one SaaS tool",
  "budgetCents": 5000,
  "sessionId": "cs_xxx"
}

# List recent runs
GET /api/agent/runs?limit=20
```

### Secured downloads

```bash
GET /api/access/download?session_id=cs_xxx&file=workflow-blueprints
```

### Restore access by email

```bash
POST /api/access/restore
{ "email": "you@gmail.com" }
```

## Admin Dashboard

```text
/admin/orders
/admin/orders?token=YOUR_TOKEN
```

- Syncs orders from Stripe checkout sessions.
- Merges webhook delivery status from local order store.
- Filter by `paid` / `expired` / `unpaid`.
- Export CSV via `/api/orders?format=csv`.
- Set `ADMIN_ORDERS_SINCE` (ISO timestamp) to hide older orders.

## Project Structure

```text
app/
  page.tsx                    # Landing page
  hackathon/page.tsx          # Ops Console
  success/page.tsx            # Post-checkout delivery
  admin/orders/page.tsx       # Orders dashboard
  api/
    checkout/                 # Stripe Checkout sessions
    stripe/webhook/           # Payment webhooks + email delivery
    access/download/          # Secured file downloads
    access/restore/           # Email-based access restore
    agent/run/                # Autonomous ops runner
    agent/runs/               # Run history
    agent/autopilot/          # Cron-triggered batch runs
    hackathon/assets/         # Purchased prompt file API
components/
  sections/                   # Landing sections (hero, pricing, FAQ, …)
  hackathon-console.tsx       # Ops Console UI
content/downloads/            # Secured prompt pack files (not public/)
lib/
  agent-runtime.ts            # Plan + execute autonomous ops
  nvidia.ts                   # Nemotron planner
  nemo-claw.ts                # Budget/vendor guardrails
  stripe-skills.ts            # Earn/spend Stripe session helpers
  purchase-access.ts          # Checkout verification
  secured-downloads.ts        # Plan-based file access
data/
  orders.json                 # Local order + webhook idempotency store
  agent-runs.json             # Agent run audit log
```

## Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run test:webhook:local
```

## Deploy to Vercel

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add environment variables (at minimum Stripe keys; NVIDIA key for live Nemotron).
4. Set `NEXT_PUBLIC_APP_URL` to your production URL.
5. Deploy.

Cron in `vercel.json` calls `/api/agent/autopilot` daily when `CRON_SECRET` is configured.

## Hackathon Demo Playbook

1. **Homepage** — product intro; click **Watch Demo** for the X video.
2. **Pricing** — pick a plan and complete Stripe checkout (test card).
3. **Success** — download files and open Ops Console.
4. **Ops Console** — set objective + budget, run autonomous ops.
5. **Results** — show analyze / earn / spend / provision steps and ROI.
6. **Admin** (optional) — show order synced on `/admin/orders`.

## License

Private project. All rights reserved.
