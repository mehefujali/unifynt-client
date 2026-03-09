import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingStats } from "@/components/landing/stats";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 selection:bg-indigo-500/30">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingStats />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
