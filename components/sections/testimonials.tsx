import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { testimonials } from "@/lib/site-data";

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container space-y-10">
        <Reveal>
          <SectionTitle
            eyebrow="Testimonials"
            title="Loved by AI-Native Operators"
            description="Teams shipping fast with autonomous agents rely on AutoPrompt Kit to increase output quality and consistency."
          />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.05}>
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6366F1] to-[#22D3EE] font-semibold text-white">
                    {item.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">“{item.quote}”</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
