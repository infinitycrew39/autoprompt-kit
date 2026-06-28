import Link from "next/link";
import { Download, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDownloadsForPlan, toPlanId } from "@/lib/downloads";
import { getOrderBySessionId } from "@/lib/orders";
import { getStripeServerClient } from "@/lib/stripe";

type SuccessPageProps = {
  searchParams: {
    session_id?: string;
    plan?: string;
    demo?: string;
  };
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const isDemo = searchParams.demo === "true";
  let paymentStatus: string | null = null;
  let customerEmail: string | null = null;
  let deliveryEmailSent: boolean | null = null;
  let deliveryEmailReason: string | undefined;

  if (!isDemo && searchParams.session_id && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = getStripeServerClient();
      const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
      paymentStatus = session.payment_status;
      customerEmail = session.customer_details?.email ?? null;
    } catch {
      paymentStatus = null;
    }
  }

  const hasSession = Boolean(searchParams.session_id);
  const isPaid = isDemo || paymentStatus === "paid" || !hasSession;
  const plan = toPlanId(searchParams.plan);
  const planLabel = plan
    ? plan.charAt(0).toUpperCase() + plan.slice(1)
    : "";
  const downloadItems = getDownloadsForPlan(plan);

  if (searchParams.session_id) {
    const order = await getOrderBySessionId(searchParams.session_id);
    if (order) {
      deliveryEmailSent = order.deliveryEmailSent;
      deliveryEmailReason = order.deliveryEmailReason;
      if (!customerEmail && order.customerEmail) {
        customerEmail = order.customerEmail;
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden py-20">
      <div className="container relative z-10 max-w-3xl">

        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-sm text-yellow-200">
            <FlaskConical className="h-5 w-5 shrink-0 text-yellow-300" />
            <div>
              <p className="font-semibold">Demo Mode — simulated checkout</p>
              <p className="mt-0.5 text-xs text-yellow-300/80">
                No Stripe keys configured. This simulates the full purchase flow for testing and demo purposes.
                Add real keys to <code className="rounded bg-yellow-400/10 px-1">.env.local</code> to enable live payments.
              </p>
            </div>
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#22D3EE] text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>

          <h1 className="mt-6 font-display text-3xl text-white sm:text-4xl">
            {isDemo ? "Purchase Simulated Successfully" : "Thank you for your purchase"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            {isDemo
              ? `This is a demo confirmation for the ${planLabel} plan. In production, customers land here after a real Stripe payment.`
              : `Your access to AutoPrompt Kit 2026 is now active.${planLabel ? ` Plan: ${planLabel}.` : ""}`}
          </p>

          <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-100">
            Payment status:{" "}
            <span className="font-semibold uppercase">
              {isDemo ? "DEMO — SIMULATED PAID" : isPaid ? "Confirmed" : "Pending"}
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
            <div className="mt-8 space-y-3">
              <h2 className="font-display text-xl text-white">Download Access</h2>
              {downloadItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  download
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0A1428]/60 px-4 py-3 text-sm text-slate-200 transition-colors hover:border-cyan-300/30 hover:text-cyan-200"
                >
                  {item.name}
                  <Download className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">Payment is still pending.</p>
                  <p className="mt-1 text-xs text-amber-100/80">
                    Complete payment in Stripe Checkout, then refresh this page to unlock downloads.
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
