import { LandingHeader } from "@/components/landing/header";
import { LandingFooter } from "@/components/landing/footer";
import { FloatingContact } from "@/components/floating-contact";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow">
        {children}
      </main>
      <FloatingContact />
      <LandingFooter />
    </div>
  );
}
