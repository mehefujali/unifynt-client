import { Metadata } from "next";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingVideo } from "@/components/landing/video";
import { LandingBottom } from "@/components/landing/bottom";

export const metadata: Metadata = {
  title: "Unifynt | #1 School Management Service & Advanced ERP Software",
  description: "The intelligent operating system for modern schools. Automate admissions, fees, attendance, and examinations with Unifynt's cloud-based ERP.",
  keywords: "school management service, best school erp in india, school software, unifynt erp, school automation",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-[#2B9EFF]/30">
      <LandingHero />
      <LandingFeatures />
      <LandingVideo />
      <LandingBottom />
    </div>
  );
}
