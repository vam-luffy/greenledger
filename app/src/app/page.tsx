import { Header } from "@/components/Header";
import { LiveStats } from "@/components/LiveStats";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MotionProvider } from "@/components/landing/MotionProvider";
import { ProductSurfaces } from "@/components/landing/ProductSurfaces";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { WhySection } from "@/components/landing/WhySection";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col font-[family-name:var(--font-geist-sans)]">
      <Header />
      <MotionProvider>
        {/* overflow-x-clip (not hidden) keeps position: sticky working for the pinned section */}
        <main className="flex-1 overflow-x-clip">
          <Hero />
          <StatsStrip>
            <LiveStats />
          </StatsStrip>
          <HowItWorks />
          <WhySection />
          <ProductSurfaces />
          <FinalCTA />
        </main>
      </MotionProvider>
      <Footer />
    </div>
  );
}
