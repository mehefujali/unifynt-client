/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { ArrowRight, ShieldCheck, Building2, Users2, Zap, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const stats = [
    { label: "Active Institutions", value: "150+", icon: <Building2 size={24} /> },
    { label: "Students Managed", value: "250k+", icon: <Users2 size={24} /> },
    { label: "System Uptime", value: "99.9%", icon: <Zap size={24} /> },
    { label: "Data Security", value: "AES-256", icon: <ShieldCheck size={24} /> },
];

export const LandingBottom = () => {
    const container = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container.current,
                start: "top 80%",
            }
        });

        // Stats Animation
        tl.fromTo(".stat-item",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "expo.out" }
        );

        // CTA Animation
        tl.fromTo(".cta-content",
            { opacity: 0, scale: 0.95, y: 40 },
            { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power4.out" },
            "-=0.4"
        );
    }, { scope: container });

    return (
        <section ref={container} className="relative pt-20 pb-0 bg-white overflow-hidden">
            
            {/* --- 1. Stats Section --- */}
            <div className="max-w-6xl mx-auto px-6 mb-32 relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 border-y border-zinc-100 py-16">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-item flex flex-col items-center lg:items-start text-center lg:text-left gap-4 group">
                            <div className="text-[#2B9EFF] bg-[#2B9EFF]/5 p-4 rounded-2xl w-fit transition-all duration-500 group-hover:scale-110 group-hover:bg-[#2B9EFF]/10">
                                {stat.icon}
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-3xl md:text-5xl font-bold text-zinc-900 tracking-tighter transition-all duration-500 group-hover:text-[#2B9EFF]">{stat.value}</h4>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 2. Final Dark CTA Section --- */}
            <div className="max-w-6xl mx-auto px-6 mb-24 relative z-10">
                <div className="cta-content relative rounded-[3rem] bg-zinc-950 overflow-hidden px-8 py-24 md:py-36 text-center border border-zinc-800/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col items-center">
                    
                    {/* Background Glow inside the dark card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-[#2B9EFF] opacity-[0.12] blur-[150px] rounded-full pointer-events-none"></div>
                    
                    {/* Grid Pattern inside CTA */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

                    <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
                         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-[#2B9EFF] mb-10">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#2B9EFF] animate-pulse"></div>
                             Available Worldwide
                         </div>
                         
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tighter mb-6 leading-[1.1] text-balance">
                            Ready to modernize your <br className="hidden md:block" /> institution&apos;s infrastructure?
                        </h2>
                        
                        <p className="text-lg md:text-xl text-zinc-400 mb-14 max-w-2xl mx-auto leading-relaxed text-balance font-medium">
                            Empower your institution with an AI-first operating system. Join the elite rank of schools already transforming their future.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
                            <Button className="h-16 px-10 rounded-2xl text-base font-bold bg-[#2B9EFF] text-white hover:bg-[#1a8ce8] hover:scale-[1.02] hover:shadow-[0_20px_40px_-5px_rgba(43,158,255,0.4)] transition-all duration-500 w-full sm:w-auto border-none">
                                Request Access
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button variant="outline" className="h-16 px-10 rounded-2xl text-base font-bold border-zinc-800 text-white hover:bg-zinc-900 transition-all duration-500 w-full sm:w-auto backdrop-blur-sm">
                                View Pricing
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. Premium Minimalist Footer --- */}
            <footer className="bg-[#fafafa] border-t border-zinc-200/50 pt-24 pb-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                        {/* Brand Column */}
                        <div className="space-y-6">
                            <Link href="/" className="flex items-center gap-3 group">
                            <img 
                                src="/unifynt-logo.png" 
                                alt="Unifynt Logo" 
                                className="h-10 w-auto group-hover:scale-105 transition-transform duration-500 ease-out" 
                            />
                            <span className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors duration-300">Unifynt</span>
                        </Link>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-xs">
                                The world&apos;s first AI-driven operating system designed to elevate school performance and automate intelligence.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-[#2B9EFF] hover:border-[#2B9EFF] hover:bg-blue-50 transition-all duration-300">
                                    <Twitter size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-[#2B9EFF] hover:border-[#2B9EFF] hover:bg-blue-50 transition-all duration-300">
                                    <Github size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-[#2B9EFF] hover:border-[#2B9EFF] hover:bg-blue-50 transition-all duration-300">
                                    <Linkedin size={18} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="space-y-6">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Platform</h5>
                            <ul className="space-y-4">
                                {["Features", "Enterprise", "Security", "Roadmap", "Pricing"].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-zinc-500 hover:text-[#2B9EFF] text-sm font-medium transition-colors">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Resources</h5>
                            <ul className="space-y-4">
                                {["Documentation", "API Reference", "Guides", "Community", "Blog"].map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-zinc-500 hover:text-[#2B9EFF] text-sm font-medium transition-colors">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Get Notified</h5>
                            <p className="text-zinc-500 text-sm font-medium">Join our private list for platform updates and AI insights.</p>
                            <div className="flex gap-2">
                                <input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="bg-white border border-zinc-200 rounded-lg px-4 py-2.5 text-sm w-full outline-none focus:border-[#2B9EFF]/50 focus:ring-4 focus:ring-[#2B9EFF]/5 transition-all"
                                />
                                <button className="bg-zinc-900 text-white p-2.5 rounded-lg hover:bg-zinc-800 transition-colors">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-10 border-t border-zinc-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-zinc-400">
                           <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
                           <Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
                           <Link href="/cookies" className="hover:text-zinc-900 transition-colors">Cookies</Link>
                        </div>
                        
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                            © {new Date().getFullYear()} Unifynt Operating System. Developed for Excellence.
                        </p>
                    </div>
                </div>
            </footer>
        </section>
    );
};
