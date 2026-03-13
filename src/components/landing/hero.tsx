"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Command, Zap, Users, Activity, Server, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
    const container = useRef<HTMLDivElement>(null);
    const uiCardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

        tl.fromTo(".fade-up",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, delay: 0.1 }
        );

        tl.fromTo(uiCardRef.current,
            { x: 60, y: 40, opacity: 0, rotateY: -12, rotateX: 8, scale: 0.95 },
            { x: 0, y: 0, opacity: 1, rotateY: -4, rotateX: 4, scale: 1, duration: 1.8, ease: "expo.out" },
            "-=1"
        );

        tl.fromTo(".dash-bar",
            { height: "0%" },
            { height: "100%", duration: 1.5, stagger: 0.08, ease: "bounce.out" },
            "-=0.8"
        );

        gsap.to(uiCardRef.current, {
            y: -8, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1
        });

        const handleMouseMove = (e: MouseEvent) => {
            if (!container.current || !uiCardRef.current) return;
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 2;
            const y = (e.clientY / innerHeight - 0.5) * 2;

            gsap.to(uiCardRef.current, {
                rotateY: -4 + x * 6,
                rotateX: 4 - y * 6,
                duration: 1.5,
                ease: "power2.out"
            });

            gsap.to(glowRef.current, {
                x: x * 30,
                y: y * 30,
                duration: 2,
                ease: "power2.out"
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);

    }, { scope: container });

    return (
        <section ref={container} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 overflow-hidden min-h-[100svh] flex items-center bg-[#fafafa] perspective-[2000px] font-sans">

            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.35] mix-blend-multiply"
                style={{
                    backgroundImage: "url('/hero-paper-bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            ></div>

            <div ref={glowRef} className="absolute top-1/2 right-[-5%] -translate-y-1/2 w-[700px] h-[700px] bg-[#2B9EFF] opacity-[0.05] blur-[100px] rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                <div className="flex flex-col items-center text-center lg:items-start lg:text-left mt-8 lg:mt-0 lg:pr-6">

                    <div className="fade-up mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-zinc-200/80 bg-white/80 backdrop-blur-md shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B9EFF] opacity-60"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B9EFF]"></span>
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600">
                            Next-Generation School ERP
                        </span>
                    </div>

                    <h1 className="fade-up text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold tracking-tighter leading-[1.02] mb-6 text-balance">
                        <span className="inline-block text-zinc-800 antialiased drop-shadow-sm" style={{ textShadow: "0px 1px 1px rgba(255,255,255,0.9), 0px -1px 1px rgba(0,0,0,0.15)" }}>
                            The Intelligent
                        </span>
                        <br />
                        <span className="relative inline-block mt-1">
                            <span className="inline-block text-[#218ce0] antialiased" style={{ textShadow: "0px 1px 1px rgba(255,255,255,0.9), 0px -1px 1px rgba(0,0,0,0.2)" }}>
                                Operating System.
                            </span>
                        </span>
                    </h1>

                    <p className="fade-up text-lg md:text-xl text-zinc-500 font-medium max-w-lg mb-10 leading-relaxed text-balance tracking-tight">
                        Replace fragmented tools with one unified platform. Automate admissions, streamline fee collection, manage payroll, and run your entire institution effortlessly.
                    </p>

                    <div className="fade-up flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Button className="group h-14 px-8 rounded-xl text-base font-semibold bg-[#2B9EFF] text-white shadow-[0_4px_20px_-4px_rgba(43,158,255,0.5)] hover:bg-[#1a8ce8] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_-6px_rgba(43,158,255,0.6)] transition-all duration-300 w-full sm:w-auto border-none">
                            Start 7-Day Free Trial
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                        <Link href="/features" className="w-full sm:w-auto">
                            <Button variant="outline" className="h-14 px-8 rounded-xl text-base font-semibold text-zinc-700 border-zinc-200/80 hover:bg-white hover:text-zinc-950 transition-all duration-300 bg-white/50 backdrop-blur-md shadow-sm w-full">
                                <Command className="mr-2 h-4 w-4 text-zinc-400" />
                                Explore Features
                            </Button>
                        </Link>
                    </div>

                    <div className="fade-up mt-14 flex items-center gap-5 opacity-80">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 shadow-sm"></div>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-zinc-500 tracking-tight">
                            Trusted by <span className="text-zinc-900 font-bold">150+</span> leading institutions
                        </p>
                    </div>
                </div>

                <div className="relative z-20 w-full flex items-center justify-center lg:justify-end mt-12 lg:mt-0">
                    <div
                        ref={uiCardRef}
                        className="w-full max-w-[650px] rounded-[1.5rem] border border-white/60 bg-white/60 backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transform-gpu relative origin-center ring-1 ring-zinc-200/50"
                    >
                        <div className="w-full h-12 bg-white/40 flex items-center px-5 border-b border-zinc-200/50 backdrop-blur-md">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
                            </div>

                            <div className="mx-auto flex items-center gap-2 px-4 py-1.5 bg-white/50 rounded-md border border-zinc-200/50 shadow-sm">
                                <Zap size={14} className="text-[#2B9EFF]" />
                                <span className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.2em]" style={{ textShadow: "0px 1px 1px rgba(255,255,255,0.9), 0px -1px 1px rgba(0,0,0,0.15)" }}>unifynt</span>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col gap-6 bg-gradient-to-b from-white/30 to-zinc-50/50">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100/80 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-9 w-9 rounded-xl bg-[#2B9EFF]/10 flex items-center justify-center text-[#2B9EFF]">
                                            <Users size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Students</p>
                                    </div>
                                    <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">2,845</p>
                                </div>
                                <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100/80 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                            <Activity size={18} />
                                        </div>
                                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Attendance</p>
                                    </div>
                                    <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">96.8%</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-zinc-100/80 shadow-sm p-6 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Fee Collection</h3>
                                        <p className="text-[11px] font-medium text-zinc-400 mt-0.5">Weekly revenue tracking</p>
                                    </div>
                                    <div className="flex gap-1.5 items-end h-4">
                                        <div className="w-1.5 h-2 bg-[#2B9EFF]/30 rounded-full"></div>
                                        <div className="w-1.5 h-3 bg-[#2B9EFF]/60 rounded-full"></div>
                                        <div className="w-1.5 h-4 bg-[#2B9EFF] rounded-full"></div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between gap-2 h-28 border-b border-zinc-100 pb-2">
                                    {[40, 70, 45, 90, 65, 85, 55, 100, 75, 50, 80].map((height, i) => (
                                        <div key={i} className="w-full bg-zinc-50 rounded-t-md relative group flex items-end justify-center h-full">
                                            <div
                                                className="dash-bar w-full bg-[#2B9EFF] rounded-t-md transition-all duration-300 group-hover:opacity-80 shadow-sm"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-950 rounded-2xl p-4 md:p-5 flex items-center justify-between text-white shadow-xl border border-zinc-800/80">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                                        <Server size={18} className="text-[#2B9EFF]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold tracking-tight">Core System Server</p>
                                        <p className="text-[11px] font-medium text-zinc-400 mt-0.5">AES-256 Encrypted</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-emerald-400 tracking-wider">ONLINE</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};