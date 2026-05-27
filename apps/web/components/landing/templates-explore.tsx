import { AnimatedSection } from "~/components/ui/animated-section";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TEMPLATES = [
  {
    title: "Product Satisfaction Survey",
    category: "Survey",
    description: "Gather detailed feedback on your product's latest features.",
    color: "bg-sutra-mustard",
  },
  {
    title: "Event Registration",
    category: "Registration",
    description: "Collect attendee details, dietary preferences, and plus-ones.",
    color: "bg-sutra-lavender",
  },
  {
    title: "Job Application",
    category: "HR",
    description: "Streamline your hiring process with structured candidate data.",
    color: "bg-sutra-teal",
  },
  {
    title: "Bug Report",
    category: "Engineering",
    description: "Allow users to submit structured bug reports with steps to reproduce.",
    color: "bg-red-400",
  },
  {
    title: "Newsletter Signup",
    category: "Marketing",
    description: "A simple, high-converting form to grow your mailing list.",
    color: "bg-green-400",
  },
  {
    title: "Customer Feedback",
    category: "Survey",
    description: "Measure NPS and understand how your customers really feel.",
    color: "bg-blue-400",
  },
];

export function TemplatesExplore() {
  return (
    <section className="bg-sutra-cream py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-sutra-teal/60">
                Templates
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-sutra-teal sm:text-4xl font-display">
                Don't start from scratch.
              </h2>
              <p className="mt-4 text-sutra-teal/70 font-body">
                Jumpstart your next project with our pre-built, highly optimized form templates.
              </p>
            </div>
            <Link
              href="/templates"
              className="group inline-flex items-center text-sm font-semibold text-sutra-teal hover:text-sutra-teal/80"
            >
              Browse all templates
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template, idx) => (
            <AnimatedSection key={template.title} delay={idx * 0.1}>
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sutra-teal/10 bg-white p-6 shadow-sm transition-all hover:border-sutra-teal/30 hover:shadow-md cursor-pointer">
                <div className="mb-4 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${template.color}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-sutra-teal/60">
                    {template.category}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-sutra-teal font-display">
                  {template.title}
                </h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-sutra-teal/70 font-body">
                  {template.description}
                </p>
                
                {/* Visual mockup of the form fields */}
                <div className="mt-auto space-y-2 rounded-lg bg-sutra-cream p-4 border border-sutra-teal/5">
                  <div className="h-2 w-1/3 rounded-full bg-sutra-teal/10" />
                  <div className="h-8 w-full rounded-md bg-white border border-sutra-teal/5" />
                  <div className="h-2 w-1/4 rounded-full bg-sutra-teal/10 mt-3" />
                  <div className="h-8 w-full rounded-md bg-white border border-sutra-teal/5" />
                </div>

                <div className="mt-6 flex items-center text-sm font-medium text-sutra-teal opacity-0 transition-opacity group-hover:opacity-100">
                  Use template <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
