/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    MapPin, Phone, Mail, ArrowRight, PlayCircle, Star,
    BookOpen, Microscope, GraduationCap, Quote, CheckCircle2
} from "lucide-react";

export const PreviewRenderer = ({ config }: { config: any }) => {

    useEffect(() => {
        AOS.init({ once: true, offset: 50, duration: 800, easing: 'ease-out-cubic' });
    }, []);

    const sections = config?.sections || [];
    const primaryColor = config?.primaryColor || "#0f172a";
    const secondaryColor = config?.secondaryColor || "#d4af37";
    const schoolName = config?.schoolName || "School Name";

    const getSec = (type: string) => sections.find((s: any) => s.type === type && s.isVisible);

    const styleVars = {
        "--primary": primaryColor,
        "--secondary": secondaryColor,
    } as React.CSSProperties;

    return (
        <div className="font-sans text-slate-600 antialiased bg-white w-full h-full overflow-y-auto" style={styleVars}>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
                
                .font-serif { font-family: 'Playfair Display', serif; }
                .text-primary { color: var(--primary) !important; }
                .bg-primary { background-color: var(--primary) !important; }
                .text-secondary { color: var(--secondary) !important; }
                .bg-secondary { background-color: var(--secondary) !important; }
                .border-secondary { border-color: var(--secondary) !important; }
            `}</style>

            {getSec("TOPBAR") && (
                <div className="bg-primary text-white text-[11px] py-2.5 border-b border-white/10">
                    <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2">
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2"><MapPin size={12} className="text-secondary" /> {getSec("TOPBAR").content.location}</span>
                            <span className="flex items-center gap-2"><Phone size={12} className="text-secondary" /> {getSec("TOPBAR").content.phone}</span>
                            <span className="flex items-center gap-2 hidden lg:flex"><Mail size={12} className="text-secondary" /> {getSec("TOPBAR").content.email}</span>
                        </div>
                        <div className="flex items-center gap-4 font-medium">
                            <span className="text-secondary animate-pulse">{getSec("TOPBAR").content.noticeText}</span>
                        </div>
                    </div>
                </div>
            )}

            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm">
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary text-secondary flex items-center justify-center rounded font-serif text-xl font-bold shadow-lg">
                            {schoolName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif text-lg font-bold text-primary leading-none">{schoolName}</span>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-800">
                        {["Home", "About", "Academics", "Contact"].map(item => (
                            <span key={item} className="cursor-pointer hover:text-secondary transition relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
                            </span>
                        ))}
                    </div>
                </div>
            </nav>

            {getSec("HERO") && (
                <section className="relative h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img src={getSec("HERO").content.bgImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"} className="w-full h-full object-cover scale-105" alt="Hero" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent"></div>
                    </div>
                    <div className="container mx-auto px-6 relative z-10 pt-10">
                        <div className="max-w-3xl" data-aos="fade-up">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-0.5 w-12 bg-secondary"></div>
                                <span className="text-secondary font-bold tracking-widest uppercase text-xs">{getSec("HERO").content.subtitle}</span>
                            </div>
                            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 drop-shadow-lg">
                                {getSec("HERO").content.heading}
                            </h1>
                            <p className="text-slate-200 text-lg mb-10 leading-relaxed max-w-2xl opacity-90">
                                {getSec("HERO").content.description}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {getSec("ABOUT") && (
                <section className="py-20 bg-slate-50">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="w-full lg:w-1/2 relative" data-aos="fade-right">
                                <img src={getSec("ABOUT").content.image1 || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"} className="rounded-lg shadow-lg w-full h-96 object-cover" alt="About" />
                            </div>
                            <div className="w-full lg:w-1/2" data-aos="fade-left">
                                <h4 className="text-secondary font-bold uppercase tracking-widest text-xs mb-2">About Us</h4>
                                <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6">{getSec("ABOUT").content.heading}</h2>
                                <p className="text-slate-600 mb-6 text-lg leading-relaxed">{getSec("ABOUT").content.description}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {getSec("FOOTER") && (
                <footer className="bg-slate-950 text-white pt-20 pb-10">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-12 mb-16 border-b border-white/10 pb-12">
                            <div className="col-span-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-secondary text-primary rounded flex items-center justify-center font-bold text-xl font-serif">
                                        {schoolName.charAt(0)}
                                    </div>
                                    <span className="font-serif text-2xl font-bold">{schoolName}</span>
                                </div>
                                <p className="text-slate-400 leading-relaxed max-w-sm mb-6">{getSec("FOOTER").content.aboutText}</p>
                            </div>
                            <div>
                                <h4 className="font-serif text-lg font-bold mb-6 text-secondary">Contact</h4>
                                <ul className="space-y-4 text-sm text-slate-400">
                                    <li className="flex items-start gap-3">
                                        <MapPin size={18} className="text-secondary shrink-0" /> {getSec("FOOTER").content.address}
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Phone size={18} className="text-secondary shrink-0" /> {getSec("FOOTER").content.phone}
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Mail size={18} className="text-secondary shrink-0" /> {getSec("FOOTER").content.email}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-center text-xs text-slate-500">
                            {getSec("FOOTER").content.copyright}
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};