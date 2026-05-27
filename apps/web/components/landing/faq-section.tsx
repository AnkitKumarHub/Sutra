import { AnimatedSection } from "~/components/ui/animated-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const FAQS = [
  {
    question: "Is it really free?",
    answer: "Yes, the core builder is free forever for individuals. We only charge for high-volume responses or advanced team features.",
  },
  {
    question: "Can I use my own domain?",
    answer: "Yes, custom domains are available on our Business plan. You can use any domain or subdomain you own.",
  },
  {
    question: "What happens if I exceed my response limit?",
    answer: "We will never block your users from submitting forms. However, you will need to upgrade to a paid tier to view the responses beyond your monthly limit.",
  },
  {
    question: "Can I embed the forms on my website?",
    answer: "Absolutely. Every form comes with a snippet of code you can paste into any HTML page, Notion doc, or React app.",
  },
  {
    question: "Do you integrate with other tools?",
    answer: "We have built-in webhooks and a Zapier integration that lets you connect to thousands of apps securely and instantly.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-sutra-cream py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-sutra-teal/60">
              FAQ
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-sutra-teal sm:text-4xl font-display">
              Questions, answered.
            </h2>
          </div>
        </AnimatedSection>

        <div className="mx-auto max-w-3xl">
          <AnimatedSection delay={0.1}>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border-sutra-teal/10 px-2"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-sutra-teal hover:text-sutra-teal/80 font-display">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-sutra-teal/70 font-body pb-6 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
