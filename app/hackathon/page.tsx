import { HackathonConsole } from "@/components/hackathon-console";

export default function HackathonPage() {
  return (
    <main className="min-h-screen bg-[#0A1428] py-12">
      <div className="container max-w-4xl space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Hermes Agent Hackathon</p>
          <h1 className="mt-2 text-3xl font-bold text-white">NVIDIA + Stripe Skills Demo</h1>
          <p className="mt-2 text-sm text-slate-300">
            This page demonstrates autonomous business operations: planning, policy checks, spending,
            provisioning, and revenue workflows in one run. You can also attach purchased prompt
            files as planning context.
          </p>
        </div>

        <HackathonConsole />
      </div>
    </main>
  );
}
