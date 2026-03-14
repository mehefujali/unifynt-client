"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { ArrowUp, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export const Footer = ({ data, theme, school }: SectionProps) => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="py-24 bg-white border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="lg:col-span-1 space-y-8">
                <Link href="/" className="flex items-center gap-3">
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl"
                        style={{ backgroundColor: theme?.primary || "#000000" }}
                    >
                        {school?.name?.charAt(0) || "U"}
                    </div>
                    <span className="font-bold text-lg tracking-tight text-zinc-900">
                        {school?.name || "Unifynt Academy"}
                    </span>
                </Link>
                <p className="text-zinc-500 font-medium leading-relaxed">
                    {data?.description || "Nurturing intellectual mastery and global leadership for the next generation of pioneers."}
                </p>
                <div className="flex gap-4">
                    {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                        <Link key={idx} href="#" className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-white hover:shadow-lg transition-all">
                            <Icon className="h-4 w-4" />
                        </Link>
                    ))}
                </div>
            </div>

            <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Navigation</div>
                <ul className="space-y-4">
                    <li><Link href="#home" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Home</Link></li>
                    <li><Link href="#academics" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Programs</Link></li>
                    <li><Link href="#gallery" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Campus</Link></li>
                    <li><Link href="/admission" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Admissions</Link></li>
                </ul>
            </div>

            <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-8">Institutional</div>
                <ul className="space-y-4">
                    <li><Link href="#" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Careers</Link></li>
                    <li><Link href="#" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Code of Conduct</Link></li>
                    <li><Link href="#" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Press</Link></li>
                </ul>
            </div>

            <div className="p-8 bg-zinc-900 rounded-[2.5rem] relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                    <div className="text-white font-black text-2xl leading-tight">
                        {data?.ctaTitle || "Reach the Summit of Knowledge."}
                    </div>
                    <button 
                        onClick={scrollToTop}
                        className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                    >
                        <ArrowUp className="h-5 w-5" />
                    </button>
                </div>
                {/* Abstract Line Decor */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 border-[20px] border-white/5 rounded-full" />
            </div>
        </div>

        <div className="pt-12 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                &copy; {new Date().getFullYear()} {school?.name}. Built on Unifynt Core.
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">All Systems Operational</span>
            </div>
        </div>
      </div>
    </footer>
  );
};
