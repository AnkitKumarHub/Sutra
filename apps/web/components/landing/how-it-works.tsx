import { AnimatedSection } from "~/components/ui/animated-section";
import { PenTool, Send, LineChart } from "lucide-react";

export function HowItWorks() {
  return (
    <section className="bg-sutra-cream py-24 sm:py-32 border-t border-sutra-teal/5">
      <div className="container mx-auto px-4 text-center">
        <AnimatedSection>
          <span className="text-xs font-semibold uppercase tracking-wider text-sutra-lavender">
            How it works
          </span>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-sutra-teal sm:text-4xl font-display">
            Three steps. Zero learning curve.
          </h2>
        </AnimatedSection>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <AnimatedSection delay={0.1}>
            <div className="flex flex-col items-center rounded-2xl border border-sutra-teal/5 bg-white p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sutra-mustard/10 text-sutra-mustard">
                <PenTool className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-sutra-teal font-display">1. Build</h3>
              <p className="text-center text-sm leading-relaxed text-sutra-teal/70 font-body">
                Drag and drop fields onto the canvas. Set up logic and routing without writing a single line of code.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="flex flex-col items-center rounded-2xl border border-sutra-teal/5 bg-white p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sutra-lavender/20 text-sutra-lavender">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-sutra-teal font-display">2. Share</h3>
              <p className="text-center text-sm leading-relaxed text-sutra-teal/70 font-body">
                Get a public link instantly, or embed the form directly into your website. Mobile-friendly by default.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <div className="flex flex-col items-center rounded-2xl border border-sutra-teal/5 bg-white p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-sutra-teal/10 text-sutra-teal">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-sutra-teal font-display">3. Analyze</h3>
              <p className="text-center text-sm leading-relaxed text-sutra-teal/70 font-body">
                Watch responses land in real-time. View completion rates, drop-offs, and deep-dive analytics instantly.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
