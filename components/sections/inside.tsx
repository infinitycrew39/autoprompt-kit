import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { promptPacks } from "@/lib/site-data";

export function WhatsInsideSection() {
  return (
    <section id="packs" className="py-16 sm:py-24">
      <div className="container space-y-10">
        <Reveal>
          <SectionTitle
            eyebrow="What's Inside"
            title="8 High-Performance Prompt Packs"
            description="Each pack is designed as a mini operating module with frameworks, examples, and execution checklists."
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {promptPacks.map((pack, index) => (
            <Reveal key={pack.title} delay={index * 0.04}>
              <article className="group h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-cyan">
                <pack.icon className="h-5 w-5 text-cyan-300" />
                <h3 className="mt-4 font-display text-lg text-white">{pack.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{pack.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
