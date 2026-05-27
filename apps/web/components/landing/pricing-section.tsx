import { AnimatedSection } from "~/components/ui/animated-section";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";

const TIERS = [
  {
    name: "Free",
    description: "For individuals exploring the product.",
    priceMonthly: "$0",
    href: "/login",
    buttonText: "Start for free",
    buttonVariant: "outline",
    features: [
      "100 responses per month",
      "Unlimited forms",
      "Basic logic and branching",
      "Standard analytics",
      "Community support",
    ],
  },
  {
    name: "Pro",
    description: "For professionals building forms daily.",
    priceMonthly: "$29",
    href: "/login",
    buttonText: "Get Pro",
    buttonVariant: "primary",
    highlighted: true,
    features: [
      "5,000 responses per month",
      "Everything in Free",
      "Remove Sutra branding",
      "Advanced conditional logic",
      "Priority email support",
    ],
  },
  {
    name: "Business",
    description: "For growing teams needing scale.",
    priceMonthly: "$99",
    href: "/login",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    features: [
      "Unlimited responses",
      "Everything in Pro",
      "Custom domains",
      "Workspace roles & permissions",
      "24/7 dedicated support",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-sutra-cream py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-sutra-mustard">
              Pricing
            </span>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-sutra-teal sm:text-5xl font-display">
              Free forever. Pay when you scale.
            </h2>
            <p className="mt-4 text-lg text-sutra-teal/70 font-body">
              Simple, transparent pricing that grows with you. No hidden fees.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto items-center">
          {TIERS.map((tier, idx) => (
            <AnimatedSection key={tier.name} delay={idx * 0.1}>
              <div
                className={cn(
                  "relative flex flex-col rounded-3xl p-8 border",
                  tier.highlighted
                    ? "bg-white border-sutra-mustard shadow-xl ring-2 ring-sutra-mustard/20 transform md:-translate-y-4"
                    : "bg-white/50 border-sutra-teal/10 shadow-sm hover:shadow-md transition-shadow"
                )}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-sutra-mustard px-3 py-1 text-center text-xs font-semibold text-sutra-teal">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-sutra-teal font-display">{tier.name}</h3>
                  <p className="mt-2 text-sm text-sutra-teal/70 font-body h-10">{tier.description}</p>
                </div>
                
                <div className="mb-6 flex items-baseline gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-sutra-teal font-display">{tier.priceMonthly}</span>
                  <span className="text-sm font-semibold text-sutra-teal/60">/month</span>
                </div>

                <Link
                  href={tier.href}
                  className={cn(
                    "mb-8 flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-all",
                    tier.buttonVariant === "primary"
                      ? "bg-sutra-teal text-white hover:bg-sutra-teal/90 shadow-md"
                      : "border-2 border-sutra-teal text-sutra-teal hover:bg-sutra-teal/5"
                  )}
                >
                  {tier.buttonText}
                </Link>

                <ul className="space-y-4 text-sm text-sutra-teal/80 flex-1 font-body">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <Check className="h-5 w-5 flex-none text-sutra-lavender" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
