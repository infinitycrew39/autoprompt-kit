import { NextResponse } from "next/server";

import type { PlanId } from "@/lib/site-data";
import { getStripeServerClient } from "@/lib/stripe";

const planConfig: Record<
  PlanId,
  { amount: number; title: string; priceEnv: string }
> = {
  starter: {
    amount: 4900,
    title: "AutoPrompt Kit - Starter",
    priceEnv: "STRIPE_PRICE_STARTER",
  },
  professional: {
    amount: 9900,
    title: "AutoPrompt Kit - Professional",
    priceEnv: "STRIPE_PRICE_PROFESSIONAL",
  },
  ultimate: {
    amount: 19900,
    title: "AutoPrompt Kit - Ultimate",
    priceEnv: "STRIPE_PRICE_ULTIMATE",
  },
};

// Demo mode: activated when Stripe secret key is missing or a placeholder
function isDemoMode() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return !key || key.startsWith("sk_test_xxx") || key === "sk_live_xxx";
}

type CheckoutBody = {
  plan?: PlanId;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const selectedPlan = body.plan;

    if (!selectedPlan || !planConfig[selectedPlan]) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;

    // --- Demo Mode: skip Stripe and redirect straight to success page ---
    if (isDemoMode()) {
      const demoUrl = `${origin}/success?demo=true&plan=${selectedPlan}`;
      return NextResponse.json({ url: demoUrl });
    }

    const stripe = getStripeServerClient();
    const config = planConfig[selectedPlan];

    const rawPriceId = process.env[config.priceEnv];
    const configuredPriceId =
      rawPriceId && rawPriceId !== "price_xxx" ? rawPriceId : undefined;
    const currency = process.env.STRIPE_CURRENCY ?? "usd";

    const lineItems = configuredPriceId
      ? [{ price: configuredPriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency,
              unit_amount: config.amount,
              product_data: {
                name: config.title,
                description: "Premium prompt packs for autonomous AI agents",
              },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${selectedPlan}`,
      cancel_url: `${origin}/cancel?plan=${selectedPlan}`,
      metadata: {
        plan: selectedPlan,
        product: "autoprompt-kit-2026",
      },
      customer_creation: "always",
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize Stripe checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
