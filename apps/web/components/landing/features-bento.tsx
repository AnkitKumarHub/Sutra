import { AnimatedSection } from "~/components/ui/animated-section";
import { LayoutGrid, Globe, Zap, LineChart, BarChart3 } from "lucide-react";
import { cn } from "~/lib/utils";
import { ReactNode } from "react";

interface BentoCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
  children?: ReactNode;
}

function BentoCard({ title, description, icon, className, children }: BentoCardProps) {
  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-sutra-teal/10 bg-white p-6 shadow-sm transition-all hover:shadow-md", className)}>
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-sutra-cream text-sutra-teal">
          {icon}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-sutra-teal font-display tracking-tight">{title}</h3>
        <p className="text-sm text-sutra-teal/70 font-body leading-relaxed max-w-sm">
          {description}
        </p>
        <div className="mt-6 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section id="features" className="bg-sutra-cream py-24 sm:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-sutra-mustard">
              Everything you need
            </span>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-sutra-teal sm:text-5xl font-display">
              From first draft to <span className="text-sutra-lavender font-bold">first 1,000 responses</span>.
            </h2>
            <p className="mt-4 text-lg text-sutra-teal/70 font-body">
              Building a form shouldn't take an afternoon. Shipping it shouldn't need a developer. Reading the answers shouldn't need a spreadsheet.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[380px]">
          {/* Main big card */}
          <AnimatedSection className="md:col-span-2 md:row-span-2" delay={0.1}>
            <BentoCard
              title="Build forms that flow"
              description="Drag fields. Drop them anywhere. Multi-page logic, conditional sections, and live preview — without leaving the canvas."
              icon={<LayoutGrid className="h-5 w-5" />}
              className="h-full"
            >
              <div className="h-full w-full rounded-lg border border-sutra-teal/5 bg-sutra-cream p-4 relative overflow-hidden">
                {/* Abstract UI mockup for form builder */}
                <div className="flex h-full gap-4">
                  <div className="w-1/3 rounded-md bg-white border border-sutra-teal/5 p-3 flex flex-col gap-2">
                    <div className="h-2 w-12 bg-sutra-teal/10 rounded-full mb-2" />
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-8 w-full bg-sutra-cream rounded-md border border-sutra-teal/5" />
                    ))}
                  </div>
                  <div className="flex-1 rounded-md bg-white border border-sutra-teal/5 shadow-sm p-6 relative">
                     <div className="h-4 w-32 bg-sutra-teal/20 rounded-full mb-6" />
                     <div className="space-y-4">
                        <div>
                          <div className="h-3 w-16 bg-sutra-teal/10 rounded-full mb-2" />
                          <div className="h-10 w-full bg-sutra-cream rounded-md border border-sutra-teal/10" />
                        </div>
                        <div className="relative group/field">
                          <div className="absolute -inset-2 bg-sutra-mustard/10 rounded-lg opacity-0 transition-opacity" />
                          <div className="h-3 w-24 bg-sutra-teal/10 rounded-full mb-2" />
                          <div className="h-10 w-full bg-sutra-cream rounded-md border border-sutra-mustard ring-1 ring-sutra-mustard/50 shadow-sm" />
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </BentoCard>
          </AnimatedSection>

          {/* Top right card */}
          <AnimatedSection className="md:col-span-1" delay={0.2}>
            <BentoCard
              title="Ship to any audience"
              description="A public URL by default. Embed anywhere. Mobile-first out of the box."
              icon={<Globe className="h-5 w-5" />}
              className="h-full bg-sutra-mustard/5"
            >
               <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full border border-sutra-mustard/20 bg-sutra-mustard/10 blur-2xl" />
            </BentoCard>
          </AnimatedSection>

          {/* Middle right card */}
          <AnimatedSection className="md:col-span-1" delay={0.3}>
            <BentoCard
              title="Replies, in real time"
              description="Watch submissions land as they happen. Replay against exact form version."
              icon={<Zap className="h-5 w-5 text-sutra-mustard" />}
              className="h-full"
            >
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-sutra-teal/5 bg-sutra-cream p-2">
                    <div className="h-8 w-8 rounded-full bg-sutra-lavender/30 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-sutra-teal/40" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-16 bg-sutra-teal/20 rounded-full mb-1.5" />
                      <div className="h-1.5 w-24 bg-sutra-teal/10 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </AnimatedSection>

          {/* Bottom left card (spans 1 col but is in the bottom row with the next one) */}
          <AnimatedSection className="md:col-span-1" delay={0.4}>
            <BentoCard
              title="Know what's working"
              description="Every form ships with funnel analytics — started, completed, drop-off."
              icon={<LineChart className="h-5 w-5" />}
              className="h-full"
            >
              <div className="mt-4 space-y-4">
                {[{l: 'Started', v: '100%'}, {l: 'Page 2', v: '89%'}, {l: 'Completed', v: '77%'}].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold text-sutra-teal/70 mb-1">
                      <span>{stat.l}</span>
                      <span>{stat.v}</span>
                    </div>
                    <div className="h-1.5 w-full bg-sutra-cream rounded-full overflow-hidden">
                      <div className="h-full bg-sutra-teal rounded-full" style={{ width: stat.v }} />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </AnimatedSection>

          {/* Bottom right card (spans 2 cols) */}
          <AnimatedSection className="md:col-span-2" delay={0.5}>
            <BentoCard
              title="Built-in analytics, no dashboards"
              description="Per-field distributions, device and locale breakdowns, UTM cohorts — already live the moment your first submission lands."
              icon={<BarChart3 className="h-5 w-5" />}
              className="h-full"
            >
              <div className="mt-4 h-full w-full rounded-lg border border-sutra-teal/5 bg-sutra-cream p-4">
                <div className="flex items-end gap-2 h-full pt-8 px-4 pb-2">
                   {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
                     <div key={i} className="flex-1 bg-sutra-lavender/50 rounded-t-sm hover:bg-sutra-lavender transition-colors" style={{ height: `${h}%` }} />
                   ))}
                </div>
              </div>
            </BentoCard>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
