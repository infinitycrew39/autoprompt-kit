import type Stripe from "stripe";

import { toPlanId } from "@/lib/downloads";
import { listRecentOrders, type OrderRecord } from "@/lib/orders";
import { getStripeServerClient } from "@/lib/stripe";

const DEMO_SESSION_IDS = new Set(["cs_duplicate_guard_demo", "cs_local_1781831373703"]);

function hasStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return Boolean(key && !key.startsWith("sk_test_xxx") && key !== "sk_live_xxx");
}

function isAutopromptSession(metadata: Stripe.Metadata | null | undefined) {
  return metadata?.product === "autoprompt-kit-2026" || Boolean(metadata?.plan);
}

function toOrderFromStripeSession(
  session: {
    id: string;
    metadata: Stripe.Metadata | null;
    customer_details: { email?: string | null } | null;
    amount_total: number | null;
    currency: string | null;
    payment_status: string | null;
    created: number;
  },
  local?: OrderRecord,
): OrderRecord {
  const createdAt = new Date(session.created * 1000).toISOString();

  return {
    sessionId: session.id,
    plan: toPlanId(session.metadata?.plan) ?? local?.plan ?? "unknown",
    customerEmail: session.customer_details?.email ?? local?.customerEmail ?? "",
    amountTotal: session.amount_total ?? local?.amountTotal ?? 0,
    currency: session.currency ?? local?.currency ?? "usd",
    paymentStatus: session.payment_status ?? local?.paymentStatus ?? "unknown",
    deliveryEmailSent: local?.deliveryEmailSent ?? false,
    deliveryEmailReason: local?.deliveryEmailReason,
    createdAt: local?.createdAt ?? createdAt,
    updatedAt: local?.updatedAt ?? createdAt,
  };
}

export async function listAdminOrders(limit = 100): Promise<OrderRecord[]> {
  const localOrders = (await listRecentOrders(limit)).filter(
    (order) => !DEMO_SESSION_IDS.has(order.sessionId),
  );
  const localBySessionId = new Map(localOrders.map((order) => [order.sessionId, order]));

  if (!hasStripeSecretKey()) {
    return localOrders.slice(0, limit);
  }

  try {
    const stripe = getStripeServerClient();
    const sessions = await stripe.checkout.sessions.list({
      limit: Math.min(Math.max(limit, 1), 100),
    });

    const stripeOrders = sessions.data
      .filter((session) => isAutopromptSession(session.metadata))
      .map((session) => toOrderFromStripeSession(session, localBySessionId.get(session.id)));

    const merged = new Map<string, OrderRecord>();
    for (const order of stripeOrders) {
      merged.set(order.sessionId, order);
    }

    for (const order of localOrders) {
      if (!merged.has(order.sessionId)) {
        merged.set(order.sessionId, order);
      }
    }

    return Array.from(merged.values())
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, limit);
  } catch {
    return localOrders.slice(0, limit);
  }
}
