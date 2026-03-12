"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const LandingCTA = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(container.current,
            { opacity: 0, scale: 0.95, y: 50 },
            {
                opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power4.out",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top 80%",
                }
            }
        );
    }, { scope: container });

    return (
        <section className="py-32 px-6 bg-zinc-50 relative overflow-hidden">
            <div
                ref={container}
                className="max-w-5xl mx-auto rounded-[3rem] bg-zinc-950 text-white overflow-hidden flex flex-col items-center justify-center text-center p-16 lg:p-32 relative shadow-2xl"
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                
                <div className="relative z-10 w-full flex flex-col items-center">
                    <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Join the Future of Education
                    </div>
                    
                    <h2 className="text-5xl md:text-7xl font-medium tracking-tight mb-8 leading-[1.1]">
                        Ready to upgrade <br /> your institution?
                    </h2>
                    
                    <p className="text-xl text-zinc-400 font-normal max-w-xl mb-12 leading-relaxed">
                        Join hundreds of forward-thinking schools that have already streamlined their operations with Unifynt&apos;s intelligent ecosystem.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button className="h-16 px-10 rounded-full text-lg font-bold bg-white text-zinc-950 shadow-xl hover:scale-105 transition-transform">
                            Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="h-16 px-10 rounded-full text-lg font-bold border-white/10 hover:bg-white/5 transition-colors">
                            Book a Demo
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
