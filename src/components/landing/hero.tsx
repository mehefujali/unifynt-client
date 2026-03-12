"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Command, Zap, Users, Activity, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LandingHero = () => {
    const container = useRef<HTMLDivElement>(null);
    const uiCardRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

        tl.fromTo(".fade-up",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, delay: 0.1 }
        );

        tl.fromTo(uiCardRef.current,
            { y: 150, opacity: 0, rotateX: 20, scale: 0.95 },
            { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1.5, ease: "power4.out" },
            "-=0.9"
        );

        tl.fromTo(".dash-bar",
            { height: "0%" },
            { height: "100%", duration: 1.5, stagger: 0.1, ease: "bounce.out" },
            "-=0.5"
        );

        gsap.to(uiCardRef.current, {
            y: -12, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1
        });

        const handleMouseMove = (e: MouseEvent) => {
            if (!container.current || !uiCardRef.current) return;
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 2;
            const y = (e.clientY / innerHeight - 0.5) * 2;

            gsap.to(uiCardRef.current, {
                rotateY: x * 8,
                rotateX: -y * 8,
                duration: 1,
                ease: "power2.out"
            });

            gsap.to(glowRef.current, {
                x: x * 50,
                y: y * 50,
                duration: 1.5,
                ease: "power2.out"
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);

    }, { scope: container });

    return (
        <section ref={container} className="relative pt-32 pb-0 lg:pt-40 px-6 overflow-hidden min-h-[100svh] flex flex-col items-center bg-[#fafafa] perspective-1000">

            <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)] opacity-70"></div>
                <div ref={glowRef} className="absolute top-[-20%] w-[800px] h-[500px] bg-[#2B9EFF] opacity-[0.08] blur-[100px] rounded-[100%]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center mt-8">
                <div className="fade-up mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#2B9EFF]/20 bg-white/60 backdrop-blur-md shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2B9EFF] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B9EFF]"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#2B9EFF]">Next-Generation School ERP</span>
                </div>

                <h1 className="fade-up text-5xl md:text-7xl lg:text-[6rem] font-semibold tracking-tighter text-zinc-900 leading-[1] mb-6 drop-shadow-sm">
                    The Intelligent <br className="hidden md:block" />
                    <span className="relative inline-block mt-2">
                        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900">
                            School Operating System.
                        </span>
                    </span>
                </h1>

                <p className="fade-up text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mb-10 leading-relaxed text-balance">
                    Replace fragmented tools with one unified platform. Automate admissions, streamline fee collection, manage payroll, and run your entire institution from a single, powerful dashboard.
                </p>

                <div className="fade-up flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                    <Button className="group h-14 px-8 rounded-xl text-base font-semibold bg-[#2B9EFF] text-white shadow-[0_8px_30px_-6px_rgba(43,158,255,0.6)] hover:bg-[#1a8ce8] hover:shadow-[0_12px_40px_-6px_rgba(43,158,255,0.7)] hover:-translate-y-0.5 transition-all duration-300 border border-[#2B9EFF]/50">
                        Book a Demo
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button variant="outline" className="h-14 px-8 rounded-xl text-base font-semibold text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 transition-all duration-300 bg-white/60 backdrop-blur-sm shadow-sm">
                        <Command className="mr-2 h-4 w-4 text-zinc-400" />
                        Explore Features
                    </Button>
                </div>
            </div>

            <div className="relative z-20 w-full max-w-5xl mt-16 perspective-[2000px] flex-grow flex items-end justify-center">
                <div className="absolute inset-x-10 bottom-0 h-40 bg-[#2B9EFF]/20 blur-[80px] -z-10 rounded-t-full"></div>

                <div
                    ref={uiCardRef}
                    className="w-full max-w-[900px] h-[350px] md:h-[450px] rounded-t-3xl border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col transform-gpu"
                >
                    <div className="w-full h-12 bg-white/50 flex items-center px-5 border-b border-zinc-200/50 backdrop-blur-md">
                        <div className="flex gap-2 w-20">
                            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                        </div>
                        <div className="flex-1 text-center flex items-center justify-center gap-2">
                            <div className="px-3 py-1 bg-zinc-100 rounded-md flex items-center gap-2 border border-zinc-200/50">
                                <Zap size={12} className="text-[#2B9EFF]" />
                                <span className="text-xs font-semibold text-zinc-500">unifynt-admin-panel</span>
                            </div>
                        </div>
                        <div className="w-20 flex justify-end">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        </div>
                    </div>

                    <div className="flex-grow p-6 flex flex-col md:flex-row gap-6 bg-gradient-to-b from-white/40 to-zinc-50/80">
                        <div className="flex flex-col gap-4 w-full md:w-1/3">
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-[#2B9EFF]/10 flex items-center justify-center text-[#2B9EFF]">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-400">Total Enrolled Students</p>
                                    <p className="text-xl font-bold text-zinc-800">2,845</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-400">Average Attendance</p>
                                    <p className="text-xl font-bold text-zinc-800">96.8%</p>
                                </div>
                            </div>

                            <div className="mt-auto bg-zinc-900 rounded-xl p-4 flex items-center justify-between text-white shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-[#2B9EFF]/20 blur-xl"></div>
                                <div className="flex items-center gap-2">
                                    <Server size={14} className="text-[#2B9EFF]" />
                                    <span className="text-xs font-medium">Secure Cloud Node</span>
                                </div>
                                <span className="text-xs text-emerald-400 font-mono tracking-widest">ONLINE</span>
                            </div>
                        </div>

                        <div className="flex-grow bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-800">Fee Collection Overview</h3>
                                    <p className="text-xs text-zinc-400">Weekly revenue tracking</p>
                                </div>
                                <div className="flex gap-1 items-end h-4">
                                    <div className="w-1 h-2 bg-[#2B9EFF]/40 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-3 bg-[#2B9EFF]/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1 h-4 bg-[#2B9EFF] rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>

                            <div className="flex-grow flex items-end justify-between gap-2 h-full mt-4 border-b border-zinc-100 pb-2">
                                {[40, 70, 45, 90, 65, 85, 55, 100, 75].map((height, i) => (
                                    <div key={i} className="w-full bg-zinc-100 rounded-t-md relative group flex items-end justify-center h-full">
                                        <div
                                            className="dash-bar w-full bg-gradient-to-t from-[#2B9EFF] to-[#6366f1] rounded-t-md shadow-sm transition-all duration-300 group-hover:opacity-80"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] text-zinc-400 font-medium">
                                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};