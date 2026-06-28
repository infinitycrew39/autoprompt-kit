import { Suspense } from "react";

import { HackathonConsole } from "@/components/hackathon-console";

function HackathonConsoleFallback() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0C1730]/70 p-5 text-sm text-slate-300">
      Loading purchase access...
    </div>
  );
}

export default function HackathonPage() {
  return (
    <main className="min-h-screen bg-[#0A1428] py-12">
      <div className="container max-w-4xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Hermes Agent Hackathon</p>
          <h1 className="mt-2 text-3xl font-bold text-white">NVIDIA + Stripe Skills Console</h1>
          <p className="mt-2 text-sm text-slate-300">
            Verified purchasers can run autonomous business operations with purchased prompt files as
            planning context. Complete checkout first, then open this page from your success receipt.
          </p>
        </div>

        <Suspense fallback={<HackathonConsoleFallback />}>
          <HackathonConsole />
        </Suspense>
      </div>
    </main>
  );
}
