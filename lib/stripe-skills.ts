import { getStripeServerClient } from "@/lib/stripe";

type SkillResult = {
  mode: "live" | "demo";
  checkoutUrl: string;
};

type SkillInput = {
  origin: string;
  title: string;
  amountCents: number;
  metadata?: Record<string, string>;
};

function isDemoMode() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return !key || key.startsWith("sk_test_xxx") || key === "sk_live_xxx";
}

export async function createRevenueCheckoutSkill(input: SkillInput): Promise<SkillResult> {
  if (isDemoMode()) {
    return {
      mode: "demo",
      checkoutUrl: `${input.origin}/success?demo=true&plan=professional`,
    };
  }

  const stripe = getStripeServerClient();
  const currency = process.env.STRIPE_CURRENCY ?? "usd";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: input.amountCents,
          product_data: {
            name: input.title,
            description: "Agent-generated revenue operation",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${input.origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=professional`,
    cancel_url: `${input.origin}/cancel?plan=professional`,
    metadata: {
      skill: "earn",
      ...(input.metadata ?? {}),
    },
    allow_promotion_codes: true,
  });

  return {
    mode: "live",
    checkoutUrl: session.url ?? `${input.origin}/success?demo=true&plan=professional`,
  };
}

export async function createProcurementSkill(input: SkillInput): Promise<SkillResult> {
  if (isDemoMode()) {
    return {
      mode: "demo",
      checkoutUrl: `${input.origin}/success?demo=true&plan=starter`,
    };
  }

  const stripe = getStripeServerClient();
  const currency = process.env.STRIPE_CURRENCY ?? "usd";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: input.amountCents,
          product_data: {
            name: input.title,
            description: "Agent-driven SaaS procurement",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${input.origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=starter`,
    cancel_url: `${input.origin}/cancel?plan=starter`,
    metadata: {
      skill: "spend",
      ...(input.metadata ?? {}),
    },
  });

  return {
    mode: "live",
    checkoutUrl: session.url ?? `${input.origin}/success?demo=true&plan=starter`,
  };
}
