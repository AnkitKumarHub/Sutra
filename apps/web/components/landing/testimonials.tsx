import { AnimatedSection } from "~/components/ui/animated-section";

const TESTIMONIALS = [
  {
    quote: "Sutra let us build complex checkout and lead-gen forms without a developer. It's the best tool we've used in years.",
    author: "Maya R.",
    role: "Head of Growth",
    initials: "MR",
    color: "bg-sutra-mustard",
  },
  {
    quote: "We switched from our previous form builder and saved thousands. The flexibility of the conditional logic is unmatched.",
    author: "Jordan L.",
    role: "Startup Founder",
    initials: "JL",
    color: "bg-sutra-lavender",
  },
  {
    quote: "Seamless integration into our stack. Built-in webhooks mean data flows directly into our CRM in real-time.",
    author: "Anu S.",
    role: "Engineering Lead",
    initials: "AS",
    color: "bg-sutra-teal text-white",
  },
];

export function Testimonials() {
  return (
    <section className="bg-sutra-cream py-24 sm:py-32 border-t border-sutra-teal/5">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-sutra-teal/60">
              Customer Stories
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-sutra-teal sm:text-4xl font-display">
              Real teams, real outcomes.
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial, idx) => (
            <AnimatedSection key={testimonial.author} delay={idx * 0.1}>
              <div className="flex flex-col justify-between h-full rounded-2xl border border-sutra-teal/5 bg-white p-8 shadow-sm">
                <p className="text-lg text-sutra-teal font-body leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${testimonial.color}`}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sutra-teal">
                      {testimonial.author}
                    </p>
                    <p className="text-xs text-sutra-teal/60">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
