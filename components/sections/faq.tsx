import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { faqItems } from "@/lib/site-data";

export function FaqSection() {
  return (
    <section id="faq" className="py-16 sm:py-24">
      <div className="container space-y-10">
        <Reveal>
          <SectionTitle
            eyebrow="FAQ"
            title="Everything You Need to Know"
            description="Answers for builders preparing to deploy autonomous AI agents with premium prompt infrastructure."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
