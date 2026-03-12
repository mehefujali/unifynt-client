"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const statsData = [
    { value: "500+", label: "Schools Globally", suffix: "" },
    { value: "50", label: "Million Data Points", suffix: "M" },
    { value: "99.9", label: "Uptime SLA", suffix: "%" },
    { value: "24/7", label: "Expert Support", suffix: "" }
];

export const LandingStats = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(".stat-item",
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: container.current,
                    start: "top 85%",
                }
            }
        );
    }, { scope: container });

    return (
        <section ref={container} className="py-24 bg-zinc-950 text-white relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dzvy8u50v/image/upload/v1727787340/grid_wzvw5p.svg')] opacity-10 bg-[length:32px_32px]"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 divide-x divide-zinc-800">
                    {statsData.map((stat, index) => (
                        <div key={index} className="stat-item flex flex-col items-center justify-center text-center px-4">
                            <h3 className="text-4xl md:text-6xl font-medium tracking-tighter mb-4 text-white">
                                {stat.value}
                            </h3>
                            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs md:text-sm">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
