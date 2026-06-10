"use client"

import { HeroSection } from "@/components/home/hero-section"
import { WhatIsFootprint } from "@/components/home/what-is-footprint"
import { HowItForms } from "@/components/home/how-it-forms"
import { WhyCare } from "@/components/home/why-care"
import { Methodology } from "@/components/home/methodology"
import { FeatureShowcase } from "@/components/home/feature-showcase"
import { AiTwinSection } from "@/components/home/ai-twin-section"
import { DashboardPreview } from "@/components/home/dashboard-preview"
import { FutureSimulatorPreview } from "@/components/home/future-simulator-preview"
import { TrustSection } from "@/components/home/trust-section"
import { FaqSection } from "@/components/home/faq-section"
import { CtaSection } from "@/components/home/cta-section"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex-1 flex flex-col w-full border-t border-border/20 transition-colors duration-300 selection:bg-primary/20 selection:text-primary">
      {/* Universal Decorative Background */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03] z-[-1]"></div>
      
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. What is a Carbon Footprint? */}
      <WhatIsFootprint />

      {/* 3. How is it Formed? */}
      <HowItForms />

      {/* 4. Why Should People Care? */}
      <WhyCare />

      {/* 5. How EcoTwin AI Calculates Impact */}
      <Methodology />

      {/* 6. What You Can Track */}
      <FeatureShowcase />

      {/* 7. Your AI Carbon Twin */}
      <AiTwinSection />

      {/* 8. What Users Will Manage */}
      <DashboardPreview />

      {/* 9. Future Impact Simulator */}
      <FutureSimulatorPreview />

      {/* 10. Why Trust EcoTwin AI? */}
      <TrustSection />

      {/* 11. FAQ */}
      <FaqSection />

      {/* 12. Final Call to Action */}
      <CtaSection />
    </div>
  )
}
