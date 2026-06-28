# AutoPrompt Kit 2026 Landing Page

Premium landing page for selling a digital product: **AutoPrompt Kit 2026**.
Built with Next.js 14 App Router + TypeScript + Tailwind + shadcn-style UI + Radix + Framer Motion + Stripe Checkout.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui style components + Radix UI
- Framer Motion
- Lucide React Icons
- Stripe Checkout (test mode)

## Features

- Premium futuristic dark UI (Deep Blue / Electric Purple / Cyan)
- Sticky navbar, glassmorphism cards, subtle grid background
- Smooth reveal animation and gradient shimmer effects
- Full landing structure:
	- Navbar
	- Hero
	- Problem
	- Solution
	- What's Inside
	- Product Bundles
	- Testimonials
	- Pricing
	- FAQ accordion
	- Final CTA + Footer
- Stripe checkout for 3 plans with loading and error states
- Success page after payment
- SEO metadata + Open Graph image route
- Hackathon Ops runtime for autonomous earn/spend/provision demos
- NemoClaw-style guardrail policy checks before spend/provision actions
- Nemotron planner integration (optional via NVIDIA API key)
- Agent run audit trail with local JSON persistence

## Project Structure

```text
app/
	admin/orders/page.tsx
	hackathon/page.tsx
	api/checkout/route.ts
	api/agent/run/route.ts
	api/agent/runs/route.ts
	api/orders/route.ts
	api/orders/[sessionId]/route.ts
	api/stripe/webhook/route.ts
	cancel/page.tsx
	opengraph-image.tsx
	success/page.tsx
	globals.css
	layout.tsx
	page.tsx
components/
	checkout-button.tsx
	landing-page.tsx
	reveal.tsx
	section-title.tsx
	sections/
		navbar.tsx
		hero.tsx
		problem.tsx
		solution.tsx
		inside.tsx
		bundles.tsx
		testimonials.tsx
		pricing.tsx
		faq.tsx
		final-cta.tsx
		footer.tsx
	ui/
		button.tsx
		accordion.tsx
lib/
	agent-runtime.ts
	agent-runs.ts
	agent-types.ts
	downloads.ts
	email.ts
	nemo-claw.ts
	nvidia.ts
	site-data.ts
	stripe-skills.ts
	stripe.ts
scripts/
	test-webhook.mjs
.env.example
```

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create environment file

```bash
cp .env.example .env.local
```

3. Fill Stripe test keys in `.env.local`

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PROFESSIONAL=
STRIPE_PRICE_ULTIMATE=
STRIPE_CURRENCY=usd
STRIPE_WEBHOOK_SECRET=whsec_xxx
RESEND_API_KEY=re_xxx
RESEND_FROM=AutoPrompt Kit <deliveries@yourdomain.com>
DELIVERY_OVERRIDE_EMAIL=
DOWNLOAD_URL_MASTER_INDEX=
DOWNLOAD_URL_WORKFLOW_BLUEPRINTS=
DOWNLOAD_URL_STARTER_PACK=
DOWNLOAD_URL_STARTER_QA=
DOWNLOAD_URL_PRO_PACK=
DOWNLOAD_URL_PRO_CHAINS=
DOWNLOAD_URL_ULTIMATE_VAULT=
DOWNLOAD_URL_ULTIMATE_BONUS=
ORDERS_DATA_PATH=
ADMIN_DASHBOARD_TOKEN=
NVIDIA_API_KEY=
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_NEMOTRON_MODEL=nvidia/llama-3.1-nemotron-ultra-253b-v1
AGENT_MAX_BUDGET_CENTS=50000
AGENT_RUNS_DATA_PATH=
```

Note:
- If `STRIPE_PRICE_*` variables are not set, checkout route auto-generates inline product pricing in test mode.
- For production consistency, define price IDs in Stripe Dashboard.

## Stripe Webhook (Recommended)

Webhook endpoint is implemented at `/api/stripe/webhook`.

1. Run Stripe CLI and forward events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

2. Copy the generated signing secret (`whsec_...`) into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

3. Trigger test events:

```bash
stripe trigger checkout.session.completed
```

The webhook currently logs completed/expired sessions and is ready to extend with DB writes, email delivery, or license provisioning.

### Delivery Behavior

- Success page pulls download links from `DOWNLOAD_URL_*` environment variables.
- Webhook sends a delivery email (via Resend) when a paid checkout session completes.
- Optional: `DELIVERY_OVERRIDE_EMAIL` forces all deliveries to one inbox for QA/testing.
- If `RESEND_API_KEY` or `RESEND_FROM` is missing, checkout still succeeds and webhook logs the reason email was skipped.
- Webhook persists order status to local JSON storage (`data/orders.json` by default, overridable by `ORDERS_DATA_PATH`).

Order tracking endpoint:

```bash
GET /api/orders/{sessionId}
```

Recent orders endpoint:

```bash
GET /api/orders?limit=20&status=paid
```

CSV export:

```bash
GET /api/orders?limit=100&status=paid&format=csv
```

Admin dashboard:

```bash
/admin/orders
```

If `ADMIN_DASHBOARD_TOKEN` is set, access with query token:

```bash
/admin/orders?token=YOUR_TOKEN
```

The dashboard includes quick status filters and CSV export for the currently selected status.

Webhook idempotency:

- Stripe event IDs are tracked locally to avoid duplicate processing.
- Replayed webhook events are acknowledged and skipped safely.

Local webhook smoke test without Stripe CLI:

```bash
npm run test:webhook:local
```

4. Run dev server

```bash
npm run dev
```

Open: `http://localhost:3000`

## Hermes Hackathon Mode

The project now includes a demo runtime aligned with the hackathon brief:

- **Run business operations**: agent plans and executes multi-step flows.
- **Earn via Stripe skills**: creates revenue checkout sessions.
- **Spend/provision via Stripe skills**: creates procurement flows with budget guardrails.
- **Safety layer**: NemoClaw-style policy checks block overspend or blocked vendors.
- **NVIDIA planner**: uses Nemotron when `NVIDIA_API_KEY` is configured.

### Demo UI

Open:

```bash
http://localhost:3000/hackathon
```

### APIs

Run one autonomous operation:

```bash
POST /api/agent/run
{
	"objective": "Launch growth sprint and provision one SaaS tool",
	"budgetCents": 5000
}
```

List recent runs:

```bash
GET /api/agent/runs?limit=20
```

### Fully Automatic Mode (Scheduler)

To run without manual clicks, schedule autopilot with Vercel Cron:

1. Set env vars:

```env
CRON_SECRET=your_random_secret
AUTOPILOT_OBJECTIVES_JSON=["Objective A","Objective B"]
AUTOPILOT_DEFAULT_BUDGET_CENTS=5000
AUTOPILOT_DEFAULT_LIMIT=2
AUTOPILOT_DEFAULT_PROMPT_ASSET_KEY=workflow-blueprints
```

2. Cron is configured in [vercel.json](vercel.json) to hit `/api/agent/autopilot` every 30 minutes.
3. Vercel will call `GET /api/agent/autopilot` automatically.
4. For security, endpoint accepts `Authorization: Bearer <CRON_SECRET>` (used by Vercel Cron) and also supports manual token header `x-autopilot-token` when `AUTOPILOT_TOKEN` is configured.

This gives continuous autonomous execution with persisted audit logs.

## Stripe Test Flow

1. Go to pricing section and click any plan.
2. Stripe Checkout page opens.
3. Use test card number:

```text
4242 4242 4242 4242
Any future date, any CVC, any ZIP
```

4. After successful payment, user is redirected to `/success`.

## Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Add environment variables in Vercel Project Settings:
	 - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
	 - `STRIPE_SECRET_KEY`
	 - `STRIPE_PRICE_STARTER`
	 - `STRIPE_PRICE_PROFESSIONAL`
	 - `STRIPE_PRICE_ULTIMATE`
	 - `STRIPE_CURRENCY`
4. Deploy.

## Hackathon Demo Playbook

1. Start with Hero section and click **Watch Demo** to show value proposition.
2. Scroll to **What's Inside** and explain each prompt pack by use case.
3. Open **Pricing** and trigger Stripe checkout live in test mode.
4. Complete payment with test card to show end-to-end purchase flow.
5. Land on **Success** page to prove delivery pipeline is ready.

## Performance and SEO Notes

- App Router server rendering for static sections
- Lightweight icon usage (Lucide)
- Motion effects scoped to reveal components for smoother runtime
- SEO-ready metadata in `app/layout.tsx`
- Dynamic OG image from `app/opengraph-image.tsx`

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run test:webhook:local
```
