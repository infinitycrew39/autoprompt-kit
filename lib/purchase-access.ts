import { toPlanId } from "@/lib/downloads";
import { getOrderBySessionId } from "@/lib/orders";
import type { PlanId } from "@/lib/site-data";
import { getStripeServerClient } from "@/lib/stripe";

export type PurchaseAccess = {
  sessionId: string;
  plan: PlanId;
  customerEmail?: string;
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
  };
}
