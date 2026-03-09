"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.fromTo(".hero-badge",
            { y: 50, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 1.2, delay: 0.2 }
        )
            .fromTo(".hero-title-line",
                { y: 150, opacity: 0, rotateX: -45, transformOrigin: "0% 50% -50" },
                { y: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.15 },
                "-=1.0"
            )
            .fromTo(".hero-subtitle",
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2 },
                "-=1.2"
            )
            .fromTo(".hero-buttons",
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 1.2 },
                "-=1.0"
            )
            .fromTo(".hero-visual",
                { scale: 0.8, opacity: 0, filter: "blur(40px)", rotateY: 10, rotateX: 10 },
                { scale: 1, opacity: 1, filter: "blur(0px)", rotateY: 0, rotateX: 0, duration: 2, ease: "power4.out" },
                "-=1.5"
            );
    }, { scope: container });

    return (
        <section ref={container} className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 px-6 overflow-hidden min-h-screen flex items-center justify-center">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-white">
                <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-100 via-purple-50 to-transparent blur-[120px] opacity-70" />
                <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-50 via-zinc-100 to-transparent blur-[120px] opacity-70" />
            </div>

            <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-left flex flex-col items-start z-10">
                    <div className="hero-badge mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Unifynt OS 2.0 is Live</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-zinc-950 leading-[1.05] mb-8">
                        <div className="overflow-hidden pb-2"><div className="hero-title-line">The Operating</div></div>
                        <div className="overflow-hidden pb-2"><div className="hero-title-line text-zinc-400">System for</div></div>
                        <div className="overflow-hidden pb-2"><div className="hero-title-line">Modern Schools.</div></div>
                    </h1>

                    <p className="hero-subtitle text-xl text-zinc-500 font-light max-w-lg mb-12 leading-relaxed">
                        Unifynt replaces your fragmented software with a single, elegant platform for academics, operations, and community engagement.
                    </p>

                    <div className="hero-buttons flex flex-wrap items-center gap-4">
                        <Button className="h-14 px-8 rounded-full text-lg font-bold bg-zinc-950 shadow-xl shadow-zinc-950/20 hover:scale-105 transition-transform text-white">
                            Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-full text-lg font-bold bg-white/50 border-zinc-200 hover:bg-zinc-50 transition-colors">
                            <PlayCircle className="mr-2 h-5 w-5 text-zinc-400" /> Watch Demo
                        </Button>
                    </div>
                </div>

                <div className="hero-visual relative lg:h-[600px] w-full rounded-[2.5rem] bg-zinc-100 border border-zinc-200 shadow-2xl overflow-hidden flex items-center justify-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 transition-opacity duration-500 group-hover:opacity-0" />
                    <img
                        src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2000"
                        alt="Dashboard Preview"
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Glass floating element */}
                    <div className="absolute bottom-8 -left-8 right-8 mx-auto w-11/12 max-w-md h-24 rounded-2xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl transition-transform duration-500 group-hover:-translate-y-4 flex items-center px-6 gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">98%</div>
                        <div>
                            <p className="text-zinc-900 font-bold">Attendance Rate</p>
                            <p className="text-zinc-500 text-sm">Increased by 12% this month</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
