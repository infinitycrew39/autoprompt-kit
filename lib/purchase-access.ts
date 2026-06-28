import { toPlanId } from "@/lib/downloads";
import { getOrderBySessionId, listPaidOrdersByEmail } from "@/lib/orders";
import type { PlanId } from "@/lib/site-data";
import { getStripeServerClient } from "@/lib/stripe";

export type PurchaseAccess = {
  sessionId: string;
  plan: PlanId;
  customerEmail?: string;
  updatedAt?: string;
};

function hasStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return Boolean(key && !key.startsWith("sk_test_xxx") && key !== "sk_live_xxx");
}

export async function verifyPaidPurchase(sessionId: string): Promise<PurchaseAccess | null> {
  const trimmedSessionId = sessionId.trim();
  if (!trimmedSessionId) {
    return null;
  }

  if (hasStripeSecretKey()) {
    try {
      const stripe = getStripeServerClient();
      const session = await stripe.checkout.sessions.retrieve(trimmedSessionId);
      const plan = toPlanId(session.metadata?.plan);

      if (session.payment_status !== "paid" || !plan) {
        return null;
      }

      return {
        sessionId: trimmedSessionId,
        plan,
        customerEmail: session.customer_details?.email ?? undefined,
      };
    } catch {
      // Fall through to local order store.
    }
  }

  const order = await getOrderBySessionId(trimmedSessionId);
  const plan = toPlanId(order?.plan);

  if (!order || order.paymentStatus !== "paid" || !plan) {
    return null;
  }

  return {
    sessionId: trimmedSessionId,
    plan,
    customerEmail: order.customerEmail || undefined,
    updatedAt: order.updatedAt,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function findStripePurchasesByEmail(email: string) {
  const stripe = getStripeServerClient();
  const purchases = new Map<string, PurchaseAccess>();

  const customers = await stripe.customers.list({ email, limit: 10 });
  for (const customer of customers.data) {
    const sessions = await stripe.checkout.sessions.list({
      customer: customer.id,
      limit: 20,
    });

    for (const session of sessions.data) {
      const plan = toPlanId(session.metadata?.plan);
      if (
        session.payment_status !== "paid" ||
        session.metadata?.product !== "autoprompt-kit-2026" ||
        !plan
      ) {
        continue;
      }

      purchases.set(session.id, {
        sessionId: session.id,
        plan,
        customerEmail: session.customer_details?.email ?? email,
        updatedAt: new Date(session.created * 1000).toISOString(),
      });
    }
  }

  return Array.from(purchases.values());
}

export async function findPaidPurchasesByEmail(email: string): Promise<PurchaseAccess[]> {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return [];
  }

  const purchases = new Map<string, PurchaseAccess>();

  for (const order of await listPaidOrdersByEmail(normalized)) {
    const plan = toPlanId(order.plan);
    if (!plan) {
      continue;
    }

    purchases.set(order.sessionId, {
      sessionId: order.sessionId,
      plan,
      customerEmail: order.customerEmail,
      updatedAt: order.updatedAt,
    });
  }

  if (hasStripeSecretKey()) {
    try {
      for (const purchase of await findStripePurchasesByEmail(normalized)) {
        purchases.set(purchase.sessionId, purchase);
      }
    } catch {
      // Keep local order matches if Stripe lookup fails.
    }
  }

  return Array.from(purchases.values()).sort((left, right) =>
    (right.updatedAt ?? "").localeCompare(left.updatedAt ?? ""),
  );
}
