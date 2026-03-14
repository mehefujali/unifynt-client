"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { Facebook, Instagram, Linkedin, Twitter, Shield, ArrowUp } from "lucide-react";

export const Footer = ({ data, theme, school }: SectionProps) => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-white pt-32 pb-16 relative overflow-hidden border-t border-zinc-100">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-32">
          
          <div className="lg:col-span-2 space-y-12">
                <div className="flex items-center gap-4">
                    <Shield size={40} className="text-zinc-900" style={{ color: theme?.primary }} />
                    <div className="flex flex-col">
                        <span className="text-3xl font-black uppercase tracking-[0.2em] text-zinc-950 leading-none">
                            {data?.logoText || school?.name || "Prestige"}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] mt-2 text-zinc-400">Academy Excellence</span>
                    </div>
                </div>
                <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-md">
                    {data?.description || "Providing a monumental foundation for the leaders of tomorrow through ancestral values and modern rigor."}
                </p>
                <div className="flex gap-8">
                    {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                        <a key={idx} href="#" className="text-zinc-300 hover:text-zinc-900 transition-all transform hover:-translate-y-1">
                            <Icon size={24} strokeWidth={1.5} />
                        </a>
                    ))}
                </div>
          </div>

          <div>
            <h4 className="text-zinc-900 font-black uppercase tracking-[0.3em] text-[11px] mb-12">Institutional</h4>
            <ul className="space-y-6">
                {['The Legacy', 'Academic Charter', 'Global Admissions', 'Career Excellence', 'Contact Office'].map((item) => (
                    <li key={item}>
                        <a href="#" className="text-zinc-400 font-bold hover:text-zinc-900 transition-colors cursor-pointer text-sm tracking-wide">
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="text-zinc-900 font-black uppercase tracking-[0.3em] text-[11px] mb-12">Governance</h4>
            <ul className="space-y-6">
                {['Privacy Protocols', 'Terms of Admission', 'Ethical Standards', 'Compliance'].map((item) => (
                    <li key={item}>
                        <a href="#" className="text-zinc-400 font-bold hover:text-zinc-900 transition-colors cursor-pointer text-sm tracking-wide">
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
          </div>

        </div>

        <div className="pt-16 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.4em]">
                © {new Date().getFullYear()} {data?.logoText || school?.name || "Prestige Academy"}. All Rights Reserved.
            </p>
            <button 
                onClick={scrollToTop}
                className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 hover:text-primary transition-all"
            >
                Back to Summit <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
            </button>
        </div>
      </div>

      {/* Mammoth Watermark Logo */}
      <div className="absolute -bottom-20 -right-20 text-zinc-50/50 font-black text-[300px] leading-none select-none -z-0 pointer-events-none">
        PA
      </div>
    </footer>
  );
};
