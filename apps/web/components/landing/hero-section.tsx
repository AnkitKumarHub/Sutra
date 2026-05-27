import { AnimatedSection } from "~/components/ui/animated-section";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-sutra-cream" />
      <div 
        className="absolute inset-0 z-0 opacity-40" 
        style={{
          backgroundImage: "radial-gradient(var(--color-sutra-teal) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
        }}
      />
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <AnimatedSection>
          <div className="mx-auto flex max-w-fit items-center gap-2 rounded-full border border-sutra-teal/10 bg-white/60 px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-sutra-mustard" />
            <span className="text-sm font-medium text-sutra-teal">
              Now in beta · 1,500+ forms submitted
            </span>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold tracking-tight text-sutra-teal sm:text-7xl font-display">
            Forms so simple, people actually{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 text-sutra-mustard">finish</span>
              <svg className="absolute -bottom-2 left-0 -z-10 h-3 w-full text-sutra-lavender/40" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>{" "}
            them.
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-sutra-teal/70 font-body">
            Build, ship, and analyze beautiful forms in minutes. 
            Ten ready-made templates, real-time analytics, free forever for indie projects.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/login"
              className="group flex h-12 items-center justify-center rounded-xl bg-sutra-teal px-8 text-sm font-semibold text-white transition-all hover:bg-sutra-teal/90 shadow-lg hover:shadow-xl"
            >
              Start building
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="text-sm font-semibold leading-6 text-sutra-teal transition-colors hover:text-sutra-teal/80"
            >
              See it live <span aria-hidden="true">→</span>
            </Link>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <div className="mx-auto mt-16 max-w-5xl sm:mt-24">
            <div className="rounded-2xl border border-sutra-teal/10 bg-white/50 p-2 backdrop-blur-xl shadow-2xl">
              <div className="overflow-hidden rounded-xl bg-white border border-sutra-teal/5">
                <img
                  src="https://lh3.googleusercontent.com/aida/ADBb0uhA6mrUyi5VpA7gU0PBfK4mM1TZGpKvYQeo4gbo62uQACmMYoJ9ejgoXBwkCkt2VrTjFMXjAarYXPzIbvAqQrZFNTYliitREAZFO1Mrckehi7Egn2nNE8-HfGiEc2Vr_RITdQCH7NIjzQrNh57um7cvZrMskFmj9sQKjT5wQQuq9EdvzjMS6DtEvKK1qlSIkSHS7NHf33-D_PbCvcG-Nve23mqRW3q0TcfnP5DW87-sKU_SqmLo6QiB7ks"
                  alt="Sutra Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
