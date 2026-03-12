"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Play } from "lucide-react";
import Image from "next/image";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export const LandingVideo = () => {
    const container = useRef<HTMLDivElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useGSAP(() => {
        gsap.fromTo(".video-content",
            { opacity: 0, y: 50, scale: 0.95 },
            {
                opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top 80%",
                }
            }
        );
    }, { scope: container });

    return (
        <section ref={container} className="py-24 px-6 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
                <div className="video-content w-full max-w-5xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-6">
                            See Unifynt in Action
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 mb-6 font-display">
                            Everything you need, <br /> beautifully connected.
                        </h2>
                        <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-normal leading-relaxed">
                            Watch how Unifynt transforms complex school operations into a simple, high-performance digital experience.
                        </p>
                    </div>

                    <div className="relative group cursor-pointer" onClick={() => setIsPlaying(true)}>
                        {/* Decorative Background Glow */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

                        {/* Video Container */}
                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-zinc-950 shadow-2xl border border-zinc-200 shadow-blue-900/10 z-10">
                            {!isPlaying ? (
                                <div className="absolute inset-0 z-20 flex items-center justify-center">
                                    <Image
                                        src="https://img.youtube.com/vi/D0UnqGm_miA/maxresdefault.jpg"
                                        alt="Unifynt Platform Tour"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-1000 grayscale-[20%] group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-zinc-950/40 group-hover:bg-zinc-950/20 transition-colors" />

                                    {/* Extreme Professional Play Button */}
                                    <div className="relative flex items-center justify-center scale-90 md:scale-100">
                                        <div className="absolute w-28 h-28 rounded-full bg-blue-500/20 blur-2xl animate-pulse" />
                                        <div className="absolute w-24 h-24 rounded-full border border-white/20 animate-ping duration-[3000ms]" />

                                        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-3xl border border-white/30 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-2xl shadow-white/20">
                                                <Play className="fill-current ml-1" size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <iframe
                                    className="w-full h-full"
                                    src="https://www.youtube.com/embed/D0UnqGm_miA?autoplay=1&rel=0&modestbranding=1"
                                    title="Unifynt Platform Tour"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>

                        {/* Floating Badge - Fixed positioning and z-index */}
                        <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[1.5rem] p-5 hidden md:flex items-center gap-5 z-20 transition-all duration-500 group-hover:-translate-y-3 group-hover:-translate-x-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                                <span className="text-[10px] font-black tracking-tighter">PREVIEW</span>
                            </div>
                            <div className="pr-4">
                                <p className="text-zinc-900 font-bold text-sm tracking-tight">Platform Experience</p>
                                <p className="text-zinc-500 text-xs font-medium">Explore the 2.0 Interface</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
