"use client";

import { useUser } from "~/hooks/api/auth";
import { useRouter } from "next/navigation";
import { HeroSection } from "~/components/landing/hero-section";
import { FeaturesBento } from "~/components/landing/features-bento";
import { HowItWorks } from "~/components/landing/how-it-works";
import { TemplatesExplore } from "~/components/landing/templates-explore";
import { Testimonials } from "~/components/landing/testimonials";
import { PricingSection } from "~/components/landing/pricing-section";
import { FaqSection } from "~/components/landing/faq-section";
import { BottomCta } from "~/components/landing/bottom-cta";
import { SiteFooter } from "~/components/landing/site-footer";

export default function Home() {
  const { user } = useUser();
  const router = useRouter();

  // We can add a header component later that shows "Go to Dashboard" if user is logged in
  
  return (
    <main className="min-h-screen min-w-screen flex flex-col bg-white">
      <HeroSection />
      <HowItWorks />
      <FeaturesBento />
      <TemplatesExplore />
      <Testimonials />
      <PricingSection />
      <FaqSection />
      <BottomCta />
      <SiteFooter />
    </main>
  );
}
