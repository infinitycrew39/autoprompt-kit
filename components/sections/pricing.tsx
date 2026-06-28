import { Check } from "lucide-react";

import { CheckoutButton } from "@/components/checkout-button";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { pricingPlans } from "@/lib/site-data";

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-24">
      <div className="container space-y-10">
        <Reveal>
          <SectionTitle
            eyebrow="Pricing"
            title="Simple One-Time Purchase"
            description="Launch with confidence. All plans include instant access and secure Stripe checkout in test mode."
            centered
            className="mx-auto max-w-3xl"
          />
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.07}>
              <article
                className={`h-full rounded-3xl border p-6 backdrop-blur-xl ${
                  plan.highlighted
                    ? "border-cyan-300/40 bg-cyan-300/10 shadow-cyan"
                    : "border-white/10 bg-white/5"
                }`}
              >
                {plan.badge ? (
                  <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className="mt-3 font-display text-2xl text-white">{plan.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{plan.description}</p>
                <div className="mt-6">
                  <p className="font-display text-4xl text-white">{plan.price}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{plan.oneTime}</p>
                </div>

                <ul className="mt-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-200">
                      <Check className="mt-0.5 h-4 w-4 text-cyan-300" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <CheckoutButton plan={plan.id} className="w-full">
                    {plan.cta}
                  </CheckoutButton>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
