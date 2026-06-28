import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { getSecuredDownloadsForPlan } from "@/lib/secured-downloads";
import { toPlanId } from "@/lib/downloads";
import { sendDeliveryEmail } from "@/lib/email";
import {
  hasProcessedWebhookEvent,
  markWebhookEventProcessed,
  upsertOrder,
} from "@/lib/orders";
import { getStripeServerClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature or secret." },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripeServerClient();
    const rawBody = await request.text();

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (await hasProcessedWebhookEvent(event.id)) {
      console.log("[stripe-webhook] duplicate event ignored", {
        eventId: event.id,
        eventType: event.type,
      });
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const plan = toPlanId(session.metadata?.plan);
      const email = session.customer_details?.email ?? "";
      const amountTotal = session.amount_total ?? 0;
      const isPaid = session.payment_status === "paid";

      let emailDeliveryResult: { sent: boolean; reason?: string } | undefined;
      if (isPaid && plan && email) {
        const origin = process.env.NEXT_PUBLIC_APP_URL?.trim() || new URL(request.url).origin;
        const downloads = getSecuredDownloadsForPlan(plan, session.id, origin);
        emailDeliveryResult = await sendDeliveryEmail({
          to: email,
          plan,
          downloads,
          sessionId: session.id,
          origin,
        });
      }

      await upsertOrder({
        sessionId: session.id,
        plan: plan ?? "unknown",
        customerEmail: email,
        amountTotal,
        currency: session.currency ?? "usd",
        paymentStatus: session.payment_status,
        deliveryEmailSent: emailDeliveryResult?.sent ?? false,
        deliveryEmailReason: emailDeliveryResult?.reason,
      });

      console.log("[stripe-webhook] checkout.session.completed", {
        sessionId: session.id,
        plan: plan ?? "unknown",
        email,
        amountTotal,
        currency: session.currency,
        paymentStatus: session.payment_status,
        deliveryEmailSent: emailDeliveryResult?.sent ?? false,
        deliveryEmailReason: emailDeliveryResult?.reason,
      });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await upsertOrder({
        sessionId: session.id,
        plan: toPlanId(session.metadata?.plan) ?? "unknown",
        customerEmail: session.customer_details?.email ?? "",
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        paymentStatus: "expired",
        deliveryEmailSent: false,
        deliveryEmailReason: "Checkout session expired",
      });

      console.log("[stripe-webhook] checkout.session.expired", {
        sessionId: session.id,
        plan: session.metadata?.plan ?? "unknown",
      });
    }

    await markWebhookEventProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
