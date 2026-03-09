"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Users, GraduationCap, Building2, CreditCard, ShieldCheck, Zap } from "lucide-react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const features = [
    {
        icon: <Users className="h-6 w-6" />,
        title: "Student Information System",
        desc: "Centralized database for student records, attendance, and academic performance tracking.",
        colSpan: "lg:col-span-2",
        bg: "bg-indigo-50",
        color: "text-indigo-600"
    },
    {
        icon: <CreditCard className="h-6 w-6" />,
        title: "Automated Billing & Fees",
        desc: "Streamlined fee collection, reminders, and comprehensive financial reporting.",
        colSpan: "lg:col-span-1",
        bg: "bg-emerald-50",
        color: "text-emerald-600"
    },
    {
        icon: <GraduationCap className="h-6 w-6" />,
        title: "Learning Management",
        desc: "Distribute materials, conduct assessments, and track progress effortlessly.",
        colSpan: "lg:col-span-1",
        bg: "bg-orange-50",
        color: "text-orange-600"
    },
    {
        icon: <Building2 className="h-6 w-6" />,
        title: "Campus Operations",
        desc: "Manage inventory, transport, hostels, and staff attendance in one place.",
        colSpan: "lg:col-span-2",
        bg: "bg-blue-50",
        color: "text-blue-600"
    },
    {
        icon: <ShieldCheck className="h-6 w-6" />,
        title: "Enterprise Security",
        desc: "Bank-grade encryption and role-based access control.",
        colSpan: "lg:col-span-1",
        bg: "bg-rose-50",
        color: "text-rose-600"
    },
    {
        icon: <Zap className="h-6 w-6" />,
        title: "Real-time Analytics",
        desc: "Actionable insights for data-driven decision making.",
        colSpan: "lg:col-span-2",
        bg: "bg-purple-50",
        color: "text-purple-600"
    }
];

export const LandingFeatures = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const cards = gsap.utils.toArray(".feature-card") as HTMLElement[];

        gsap.fromTo(".features-header",
            { opacity: 0, y: 50 },
            {
                opacity: 1, y: 0, duration: 1,
                scrollTrigger: {
                    trigger: container.current,
                    start: "top 80%",
                }
            }
        );

        cards.forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 50, scale: 0.95 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                    }
                }
            );
        });
    }, { scope: container });

    return (
        <section id="features" ref={container} className="py-32 px-6 bg-zinc-50 relative">
            <div className="max-w-7xl mx-auto">
                <div className="features-header text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Everything You Need</p>
                    <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900">
                        A comprehensive suite for modern institutions.
                    </h2>
                    <p className="text-xl text-zinc-500 font-light">
                        Stop switching between dozen of tools. Unifynt brings your entire school&apos;s workflow into a single, cohesive experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`feature-card group relative p-10 rounded-[2rem] bg-white border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${feature.colSpan}`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                                <div className={`h-40 w-40 rounded-full blur-3xl ${feature.bg}`} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${feature.bg} ${feature.color}`}>
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                                    <p className="text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
