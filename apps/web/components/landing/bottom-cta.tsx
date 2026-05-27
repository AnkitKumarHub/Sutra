import { AnimatedSection } from "~/components/ui/animated-section";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BottomCta() {
  return (
    <section className="relative overflow-hidden bg-sutra-teal py-24 sm:py-32">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-sutra-lavender)_0%,transparent_70%)]" />
      <div className="container relative mx-auto px-4 text-center z-10">
        <AnimatedSection>
          <h2 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">
            Stop building forms. <span className="text-sutra-lavender font-bold">Start collecting answers.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70 font-body">
            Join thousands of indie makers and teams building beautiful forms in minutes without writing code.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="group flex h-12 items-center justify-center rounded-xl bg-sutra-mustard px-8 text-sm font-semibold text-sutra-teal transition-all hover:bg-sutra-mustard/90 shadow-lg hover:shadow-xl"
            >
              Start building
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
