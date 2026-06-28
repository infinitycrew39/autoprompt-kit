import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { painPoints } from "@/lib/site-data";

export function ProblemSection() {
  return (
    <section id="problem" className="py-16 sm:py-24">
      <div className="container space-y-10">
        <Reveal>
          <SectionTitle
            eyebrow="The Problem"
            title="Most AI Teams Are Trapped in Prompt Chaos"
            description="Without a structured prompt system, autonomous agents become expensive, inconsistent, and difficult to scale."
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <item.icon className="h-5 w-5 text-cyan-300" />
                <h3 className="mt-4 font-display text-xl text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
