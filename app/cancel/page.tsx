import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toPlanId } from "@/lib/downloads";

type CancelPageProps = {
  searchParams: {
    plan?: string;
  };
};

export default function CancelPage({ searchParams }: CancelPageProps) {
  const plan = toPlanId(searchParams.plan);
  const planLabel = plan ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)}` : "Selected";

  return (
    <main className="relative min-h-screen overflow-hidden py-20">
      <div className="container relative z-10 max-w-3xl">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-12">
          <h1 className="font-display text-3xl text-white sm:text-4xl">Checkout Was Canceled</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            No charge was made. You can continue with the {planLabel} plan anytime.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg">
              <Link href="/#pricing" className="group">
                <RotateCcw className="mr-2 h-4 w-4" />
                Return To Pricing
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/" className="group">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back To Home
              </Link>
            </Button>
          </div>
        </section>
      </div>
      <div className="pointer-events-none absolute -left-20 top-10 h-60 w-60 rounded-full bg-[#6366F1]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-12 h-60 w-60 rounded-full bg-[#22D3EE]/20 blur-3xl" />
    </main>
  );
}
