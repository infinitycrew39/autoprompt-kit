import Link from "next/link";
import { Download, FlaskConical, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toPlanId } from "@/lib/downloads";
import { getOrderBySessionId } from "@/lib/orders";
import { verifyPaidPurchase } from "@/lib/purchase-access";
import { getSecuredDownloadsForPlan } from "@/lib/secured-downloads";
import { getStripeServerClient } from "@/lib/stripe";

type SuccessPageProps = {
  searchParams: {
    session_id?: string;
    plan?: string;
    demo?: string;
  };
};

function getOrigin() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://autoprompt-kit-2026.vercel.app";
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const isDemo = searchParams.demo === "true";
  const sessionId = searchParams.session_id?.trim() ?? "";
  let paymentStatus: string | null = null;
  let customerEmail: string | null = null;
  let deliveryEmailSent: boolean | null = null;
  let deliveryEmailReason: string | undefined;

  const purchase = sessionId ? await verifyPaidPurchase(sessionId) : null;

  if (!isDemo && sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripeServerClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paymentStatus = session.payment_status;
      customerEmail = session.customer_details?.email ?? null;
    } catch {
      paymentStatus = purchase ? "paid" : null;
    }
  }

  const plan = purchase?.plan ?? toPlanId(searchParams.plan);
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : "";
  const isPaid = Boolean(purchase);
  const downloadItems =
    purchase && plan ? getSecuredDownloadsForPlan(plan, purchase.sessionId, getOrigin()) : [];

  if (sessionId) {
    const order = await getOrderBySessionId(sessionId);
    if (order) {
      deliveryEmailSent = order.deliveryEmailSent;
      deliveryEmailReason = order.deliveryEmailReason;
      if (!customerEmail && order.customerEmail) {
        customerEmail = order.customerEmail;
      }
    }
  }

  const hackathonHref = sessionId
    ? `/hackathon?session_id=${encodeURIComponent(sessionId)}`
    : "/hackathon";

  return (
    <main className="relative min-h-screen overflow-hidden py-20">
      <div className="container relative z-10 max-w-3xl">
        {isDemo && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-sm text-yellow-200">
            <FlaskConical className="h-5 w-5 shrink-0 text-yellow-300" />
            <div>
              <p className="font-semibold">Demo Mode — simulated checkout</p>
              <p className="mt-0.5 text-xs text-yellow-300/80">
                Demo checkout does not unlock downloads or Ops Console. Configure Stripe keys and
                complete a real payment to access purchased files.
              </p>
            </div>
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>

          <h1 className="mt-6 font-display text-3xl text-white sm:text-4xl">
            {isPaid ? "Thank you for your purchase" : isDemo ? "Checkout Simulated" : "Processing your purchase"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            {isPaid
              ? `Your access to AutoPrompt Kit 2026 is now active.${planLabel ? ` Plan: ${planLabel}.` : ""}`
              : isDemo
                ? `This is a demo confirmation for the ${planLabel || "selected"} plan.`
                : "We are confirming your payment. Refresh this page after checkout completes."}
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">
            Payment status:{" "}
            <span className="font-semibold uppercase">
              {isPaid ? "Confirmed" : isDemo ? "Demo only" : paymentStatus ?? "Pending"}
            </span>
            {customerEmail ? (
              <p className="mt-1 text-xs text-cyan-100/80">Receipt email: {customerEmail}</p>
            ) : null}
            {deliveryEmailSent !== null ? (
              <p className="mt-1 text-xs text-cyan-100/80">
                Delivery email: {deliveryEmailSent ? "Sent" : "Not sent yet"}
                {deliveryEmailReason ? ` (${deliveryEmailReason})` : ""}
              </p>
            ) : null}
          </div>

          {isPaid ? (
            <>
              <div className="mt-8 space-y-3">
                <h2 className="font-display text-xl text-white">Download Access</h2>
                <p className="text-xs text-slate-400">
                  Links are tied to your purchase session and only include files from your plan.
                </p>
                {downloadItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0A1428]/60 px-4 py-3 text-sm text-slate-200 transition-colors hover:border-cyan-300/30 hover:text-cyan-200"
                  >
                    {item.name}
                    <Download className="h-4 w-4" />
                  </a>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Workflow className="mt-0.5 h-5 w-5 text-violet-300" />
                  <div>
                    <h2 className="font-display text-lg text-white">Ops Console Access</h2>
                    <p className="mt-1 text-sm text-slate-300">
                      Run autonomous agent workflows with your purchased prompt files as context.
                    </p>
                    <Button asChild className="mt-3" variant="secondary">
                      <Link href={hackathonHref}>Open Ops Console</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">
                    {isDemo ? "Demo checkout does not unlock files." : "Payment is still pending."}
                  </p>
                  <p className="mt-1 text-xs text-amber-100/80">
                    {isDemo
                      ? "Add Stripe keys and complete a real payment to unlock downloads and Ops Console."
                      : "Complete payment in Stripe Checkout, then refresh this page to unlock access."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/#faq">Read Setup FAQ</Link>
            </Button>
          </div>
        </section>
      </div>
      <div className="pointer-events-none absolute -left-20 top-10 h-60 w-60 rounded-full bg-[#6366F1]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-12 h-60 w-60 rounded-full bg-[#22D3EE]/20 blur-3xl" />
    </main>
  );
}
