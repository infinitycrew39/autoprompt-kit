import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { heroSubtitle, heroTitle, sectionBadge, trustedBy, demoVideoUrl } from "@/lib/site-data";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden py-20 sm:py-28">
      <div className="container relative z-10 grid items-center gap-14 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-8">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <sectionBadge.icon className="h-4 w-4" />
              {sectionBadge.text}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">{heroSubtitle}</p>
          </Reveal>

          <Reveal delay={0.2} className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="#pricing" className="group">
                Get Early Access
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <a
                href={demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-base"
              >
                <PlayCircle className="mr-2 h-5 w-5 text-cyan-300" />
                Watch Demo
              </a>
            </Button>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400 sm:text-sm">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Trusted by builders from
              {trustedBy.map((brand) => (
                <span
                  key={brand}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-200"
                >
                  {brand}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-cyan backdrop-blur-xl">
            <div className="absolute inset-0 bg-hero-mesh opacity-80" />
            <div className="relative space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Agent Memory Control",
                  "Research Synthesis",
                  "Code Review Pipeline",
                  "Offer Generation",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-[#0A1428]/70 p-3 text-xs text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div
                id="demo"
                className="relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#09142A] p-6"
              >
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(34,211,238,0.18),transparent)] bg-[length:240%_100%] animate-shimmer" />
                <p className="relative text-sm uppercase tracking-[0.2em] text-cyan-300">Demo Ready</p>
                <p className="relative mt-2 font-display text-2xl text-white sm:text-3xl">
                  Premium Prompt Engine
                </p>
                <p className="relative mt-2 text-sm text-slate-300">
                  Big, clear call-to-action area designed for live demo recordings and hackathon pitches.
                </p>
                <Button asChild className="relative mt-5 w-full" size="lg">
                  <a href="#pricing">Launch Checkout</a>
                </Button>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-[#6366F1]/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-12 h-28 w-28 rounded-full bg-[#22D3EE]/30 blur-3xl" />
        </Reveal>
      </div>
    </section>
  );
}
