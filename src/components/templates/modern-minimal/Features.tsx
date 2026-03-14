"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./shared";
import { CheckCircle2, Globe, Shield, Zap } from "lucide-react";

export const Features = ({ data, theme }: SectionProps) => {
  const items = data?.items || [
    { title: "Global Curriculum", desc: "Internationally recognized standards ensuring global competitiveness.", icon: Globe },
    { title: "Holistic Growth", desc: "Focus on character, leadership, and emotional intelligence.", icon: Shield },
    { title: "Smart Campus", desc: "State-of-the-art technology integrated into every classroom.", icon: Zap },
    { title: "Elite Faculty", desc: "Mentorship from world-class educators and industry experts.", icon: CheckCircle2 },
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="space-y-12">
                <div className="space-y-4">
                    <motion.div variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                        {data?.badge || "Operational Excellence"}
                    </motion.div>
                    <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter">
                        {data?.titleLine1 || "Why Choose"} <br />
                        <span className="text-zinc-300">{data?.titleLine2 || "The Academy."}</span>
                    </motion.h2>
                </div>
                
                <div className="space-y-8">
                    {items.map((item: any, idx: number) => {
                        const Icon = item.icon || Zap;
                        return (
                            <motion.div key={idx} variants={fadeUp} className="flex gap-6 group">
                                <div 
                                    className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 transition-all duration-500 group-hover:border-transparent group-hover:text-white"
                                    style={{ 
                                        '--hover-bg': theme?.primary || '#18181b'
                                    } as any}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = theme?.primary || '#18181b';
                                        e.currentTarget.style.borderColor = theme?.primary || '#18181b';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '';
                                        e.currentTarget.style.borderColor = '';
                                    }}
                                >
                                    <Icon className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                                </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">{item.title}</h3>
                                <p className="text-zinc-500 font-medium leading-relaxed max-w-sm">{item.desc}</p>
                            </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="relative hidden lg:block"
            >
                <div className="aspect-square bg-zinc-50 rounded-[4rem] flex items-center justify-center p-20 border border-zinc-100">
                    <div className="w-full h-full rounded-[3rem] overflow-hidden shadow-3xl">
                        <img src={data?.sideImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071"} alt="Student Collaboration" className="w-full h-full object-cover" />
                    </div>
                </div>
                {/* Floating Meta Tag */}
                <div className="absolute top-1/2 -right-12 -translate-y-1/2 bg-white px-8 py-5 rounded-3xl shadow-3xl border border-zinc-100 animate-bounce-slow">
                    <div className="text-3xl font-black text-zinc-900" style={{ color: theme?.primary }}>{data?.rankValue || "#1"}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{data?.rankLabel || "QS Ranked School"}</div>
                </div>
            </motion.div>
        </div>
      </div>
    </section>
  );
};
