import { CheckCircle2 } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";

const pillars = [
  "Model-adaptive prompts designed for Hermes, Nemotron, Claude, Cursor, and Grok.",
  "Operational playbooks so teams can execute prompt workflows consistently.",
  "Battle-tested templates for business, research, content, and coding operations.",
];

export function SolutionSection() {
  return (
    <section id="solution" className="py-16 sm:py-24">
      <div className="container grid items-center gap-10 lg:grid-cols-[1fr,1fr]">
        <Reveal>
          <SectionTitle
            eyebrow="The Solution"
            title="Meet AutoPrompt Kit"
            description="A premium, production-ready prompt operating system that upgrades how autonomous AI agents plan, reason, and execute."
          />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl sm:p-8">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">What makes it premium</p>
            <div className="mt-5 space-y-4">
              {pillars.map((pillar) => (
                <div key={pillar} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-300" />
                  <p className="text-sm leading-relaxed text-slate-200 sm:text-base">{pillar}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
