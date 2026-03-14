"use client";
import React from "react";
import { SectionProps } from "./types";
import { Link as ScrollLink } from "react-scroll";
import { Facebook, Instagram, Linkedin, Twitter, Rocket, Heart } from "lucide-react";
import Link from "next/link";

export const Footer = ({ data, theme, school }: SectionProps) => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="bg-zinc-900 pt-32 pb-16 relative overflow-hidden">
        {/* Wave Top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-24">
                <path d="M321.39,56.44c13.27-2.61,26.54-5.22,39.81-7.82,13.27-2.61,26.54-5.22,39.81-7.83,13.27,2.61,26.54,5.22,39.81,7.82,13.27,2.61,26.54,5.22,39.81,7.83,13.27-2.61,26.54-5.22,39.81-7.83L1200,120H0V0C0,0,160.69,72.05,321.39,56.44Z" fill="#FFF9F0" />
            </svg>
        </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
                <div className="flex items-center gap-3">
                    {school?.logo ? (
                        <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain bg-transparent" />
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white rotate-6 transition-transform shadow-lg" style={{ backgroundColor: theme?.primary || '#FF6B6B' }}>
                                <Rocket size={20} />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white italic font-kids">
                                {data?.logoText || school?.name || "Kiddo Academy"}
                            </span>
                        </>
                    )}
                </div>
                <p className="text-zinc-500 font-bold leading-relaxed">
                    {data?.description || "Nurturing intellectual mastery and global leadership for the next generation of pioneers."}
                </p>
                <div className="flex gap-4">
                    {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                        <a key={idx} href="#" className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all shadow-lg hover:-translate-y-1">
                            <Icon size={18} />
                        </a>
                    ))}
                </div>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-[12px] mb-8 pr-4 border-r-4 inline-block" style={{ borderRightColor: theme?.primary }}>Explore</h4>
            <ul className="space-y-4">
                {['Home', 'About', 'Programs', 'Gallery', 'Contact'].map((item) => (
                    <li key={item}>
                        <ScrollLink 
                            to={item.toLowerCase()} 
                            smooth={true} 
                            className="text-zinc-500 font-bold hover:text-white transition-colors cursor-pointer flex items-center gap-2 group"
                        >
                            <span className="w-0 h-1 bg-primary group-hover:w-3 transition-all rounded-full" style={{ backgroundColor: theme?.primary }} />
                            {item}
                        </ScrollLink>
                    </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-[0.2em] text-[12px] mb-8 pr-4 border-r-4 inline-block" style={{ borderRightColor: theme?.primary }}>Support</h4>
            <ul className="space-y-4">
                {['Admissions', 'Fees Structure', 'Privacy Policy', 'Terms of Use'].map((item) => (
                    <li key={item}>
                        <Link href="#" className="text-zinc-500 font-bold hover:text-white transition-colors cursor-pointer flex items-center gap-2 group">
                             <span className="w-0 h-1 bg-primary group-hover:w-3 transition-all rounded-full" style={{ backgroundColor: theme?.primary }} />
                            {item}
                        </Link>
                    </li>
                ))}
            </ul>
          </div>

          <div className="p-10 bg-zinc-800 rounded-[3rem] relative overflow-hidden group shadow-2xl border border-zinc-700">
                <div className="relative z-10 space-y-6">
                    <div className="text-white font-black text-2xl leading-tight">
                        {data?.ctaTitle || "Ready for an Adventure?"}
                    </div>
                    <button 
                        onClick={scrollToTop}
                        className="w-14 h-14 rounded-2.5xl bg-zinc-700 flex items-center justify-center text-white transition-all shadow-xl group/btn"
                        style={{ backgroundColor: theme?.primary }}
                    >
                        <Heart className="h-6 w-6 group-hover/btn:scale-125 transition-transform" fill="currentColor" />
                    </button>
                </div>
                {/* Decorative blob */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-0" />
          </div>
        </div>

        <div className="pt-12 border-t border-zinc-800 text-center">
            <p className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} {data?.logoText || school?.name || "Kiddo Academy"}. Made with <Heart size={10} className="inline-block text-red-500 mx-1" fill="currentColor" /> for small explorers.
            </p>
        </div>
      </div>
    </footer>
  );
};
