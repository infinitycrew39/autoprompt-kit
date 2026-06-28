import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { bundles } from "@/lib/site-data";

export function BundlesSection() {
  return (
    <section id="bundles" className="py-16 sm:py-24">
      <div className="container space-y-10">
        <Reveal>
          <SectionTitle
            eyebrow="Product Bundles"
            title="Choose Your Build Velocity"
            description="Three product bundles tailored for solo builders, professional operators, and elite autonomous teams."
          />
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {bundles.map((bundle, index) => (
            <Reveal key={bundle.name} delay={index * 0.08}>
              <article
                className={`h-full rounded-2xl border p-6 backdrop-blur-md ${
                  bundle.highlighted
                    ? "border-cyan-300/40 bg-cyan-300/10 shadow-cyan"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">{bundle.target}</p>
                <h3 className="mt-3 font-display text-2xl text-white">{bundle.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{bundle.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-200">
                  {bundle.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
