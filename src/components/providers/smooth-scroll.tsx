"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

export const SmoothScroll = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    // List of prefixes where smooth scrolling should be DISABLED
    const disabledPrefixes = ["/admin", "/super-admin", "/student", "/parent", "/teacher"];
    const isDashboard = disabledPrefixes.some(prefix => pathname.startsWith(prefix));

    if (isDashboard) {
      // Ensure GSAP ScrollTrigger works even without Lenis
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Connect Lenis to ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    // Synchronize GSAP ticker with Lenis
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
};
