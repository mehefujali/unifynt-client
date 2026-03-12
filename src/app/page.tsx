import { LandingHeader } from "@/components/landing/header";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingVideo } from "@/components/landing/video";
import { LandingBottom } from "@/components/landing/bottom";

export default function Home() {
  return (
    <main className="min-h-screen bg-white selection:bg-[#2B9EFF]/30">
      <LandingHeader />
      <LandingHero />
      <LandingFeatures />
      <LandingVideo />
      <LandingBottom />
    </main>
  );
}
