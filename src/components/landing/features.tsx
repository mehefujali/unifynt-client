"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

const features = [
    {
        icon: "/Untitled design (3).png",
        title: "Student Intelligence",
        desc: "A unified core for student lifecycle management, from enrollment to graduation.",
        colSpan: "lg:col-span-2",
        bgHover: "group-hover:bg-blue-50/50",
        accent: "bg-blue-500",
        visual: (
            <div className="absolute right-0 bottom-0 w-[60%] h-[70%] bg-white rounded-tl-2xl border-t border-l border-zinc-200 shadow-xl opacity-40 group-hover:opacity-100 group-hover:translate-y-[-10px] group-hover:translate-x-[-10px] transition-all duration-700 ease-out flex flex-col gap-3 p-4">
                <div className="flex gap-2 items-center border-b border-zinc-100 pb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0"></div>
                    <div className="space-y-1 w-full">
                        <div className="h-2 w-1/2 bg-zinc-200 rounded-full"></div>
                        <div className="h-1.5 w-1/3 bg-zinc-100 rounded-full"></div>
                    </div>
                </div>
                <div className="space-y-2 mt-2">
                    <div className="h-2 w-full bg-zinc-100 rounded-full"></div>
                    <div className="h-2 w-4/5 bg-zinc-100 rounded-full"></div>
                    <div className="h-2 w-5/6 bg-zinc-100 rounded-full"></div>
                </div>
            </div>
        )
    },
    {
        icon: "/Untitled design (2).png",
        title: "Finance 2.0",
        desc: "Automated billing, smart collections, and real-time ledger.",
        colSpan: "lg:col-span-1",
        bgHover: "group-hover:bg-emerald-50/50",
        accent: "bg-emerald-500",
        visual: (
            <div className="absolute right-[-10%] bottom-[-10%] w-[120%] h-[50%] bg-gradient-to-t from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex items-end justify-around px-6 pb-4">
                {[40, 70, 30, 90, 50].map((h, i) => (
                    <div key={i} className="w-4 bg-emerald-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
            </div>
        )
    },
    {
        icon: "/Untitled design (1).png",
        title: "Academic Core",
        desc: "Digital curriculum delivery and automated assessment engine.",
        colSpan: "lg:col-span-1",
        bgHover: "group-hover:bg-violet-50/50",
        accent: "bg-violet-500",
        visual: (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.08)_0%,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        )
    },
    {
        icon: "/Untitled design (4).png",
        title: "Operations Hub",
        desc: "Managing transport, inventory, and campus infrastructure with precision.",
        colSpan: "lg:col-span-2",
        bgHover: "group-hover:bg-amber-50/50",
        accent: "bg-amber-500",
        visual: (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[40%] h-[80%] opacity-0 group-hover:opacity-100 group-hover:-translate-x-6 transition-all duration-700 pointer-events-none">
                <div className="absolute top-1/4 left-0 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-amber-500 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)]"></div>
                <div className="absolute bottom-1/4 right-0 w-3 h-3 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <path d="M 0 25% L 50% 50% L 100% 75%" stroke="rgba(251,191,36,0.3)" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[dash_20s_linear_infinite]" />
                </svg>
            </div>
        )
    },
    {
        icon: "/Untitled design (5).png",
        title: "Smart Insights",
        desc: "Data-driven decision making powered by advanced analytics.",
        colSpan: "lg:col-span-2",
        bgHover: "group-hover:bg-indigo-50/50",
        accent: "bg-indigo-500",
        visual: (
            <div className="absolute right-8 bottom-[-20px] w-[50%] h-[120px] bg-white rounded-xl border border-zinc-200 shadow-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-8 transition-all duration-700 flex flex-col justify-end p-3 overflow-hidden">
                <svg className="w-full h-16" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0 40 Q 20 10, 40 25 T 80 5 L 100 0 L 100 40 Z" fill="rgba(99, 102, 241, 0.1)" />
                    <path d="M0 40 Q 20 10, 40 25 T 80 5 L 100 0" fill="none" stroke="#6366f1" strokeWidth="2" />
                </svg>
            </div>
        )
    },
    {
        icon: "/Untitled design.png",
        title: "Fortified Security",
        desc: "Bank-grade protection for your institution's most vital data.",
        colSpan: "lg:col-span-1",
        bgHover: "group-hover:bg-rose-50/50",
        accent: "bg-rose-500",
        visual: (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-1000">
                <div className="absolute w-[150%] h-[150%] border border-rose-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute w-[100%] h-[100%] border border-rose-500/20 rounded-full animate-[spin_7s_linear_infinite_reverse]"></div>
            </div>
        )
    }
];

export const LandingFeatures = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const cards = gsap.utils.toArray(".feature-card") as HTMLElement[];

        gsap.fromTo(".features-header",
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0, duration: 1.2, ease: "expo.out",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top 85%",
                }
            }
        );

        cards.forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 1,
                    delay: i * 0.1,
                    ease: "expo.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                    }
                }
            );
        });
    }, { scope: container });

    return (
        <section id="features" ref={container} className="py-32 px-6 bg-[#fafafa] relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="features-header flex flex-col items-center text-center mb-20 md:mb-28">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 shadow-sm text-xs font-bold uppercase tracking-widest text-zinc-500 mb-8">
                        <div className="w-2 h-2 rounded-full bg-[#2B9EFF] animate-pulse"></div>
                        The Full Ecosystem
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tighter text-zinc-900 max-w-4xl mb-6 leading-[1.05] text-balance">
                        Everything you need to <br className="hidden md:block" /> power a modern institution.
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-500 max-w-2xl font-medium leading-relaxed">
                        Say goodbye to fragmented tools. Unifynt provides a cohesive, high-performance platform that scales with your growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[320px]">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`feature-card group relative rounded-[2rem] bg-white border border-zinc-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] hover:border-zinc-300/80 transition-all duration-500 overflow-hidden ${feature.colSpan} flex flex-col`}
                        >
                            <div className={`absolute inset-0 ${feature.bgHover} transition-colors duration-500`}></div>

                            <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className={`h-full w-full ${feature.accent}`}></div>
                            </div>

                            <div className="relative z-10 p-8 md:p-10 flex flex-col h-full pointer-events-none">
                                <div className="h-14 w-14 mb-8 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:shadow-md">
                                    <Image src={feature.icon} alt={feature.title} width={32} height={32} className="object-contain drop-shadow-sm" />
                                </div>
                                <div className="mt-auto space-y-3 w-full max-w-[85%]">
                                    <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">{feature.title}</h3>
                                    <p className="text-zinc-500 text-base leading-relaxed font-medium">{feature.desc}</p>
                                </div>
                            </div>

                            {feature.visual}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};