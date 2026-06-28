import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="pb-20 pt-10 sm:pb-24">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-cyan-300/30 bg-gradient-to-r from-[#1E1B4B]/70 to-[#0C4A6E]/70 p-8 text-center shadow-cyan backdrop-blur-xl sm:p-12">
            <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#6366F1]/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-[#22D3EE]/30 blur-3xl" />
            <p className="relative text-xs uppercase tracking-[0.2em] text-cyan-200">Ready to upgrade?</p>
            <h2 className="relative mt-4 font-display text-3xl text-white sm:text-5xl">
              Build Faster. Reason Better. Ship More.
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              Join builders using AutoPrompt Kit to run autonomous AI systems with premium-quality prompts and repeatable workflows.
            </p>
            <Button asChild size="lg" className="relative mt-8">
              <a href="#pricing" className="group">
                Get AutoPrompt Kit
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
