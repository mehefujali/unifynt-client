/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { bounceUp, staggerContainer, popIn } from "./shared";
import { Zap, ShieldCheck, Map, Users } from "lucide-react";

export const Features = ({ data, theme }: SectionProps) => {
  const features = data?.items || [
    { title: "Safe & Secure", desc: "A home away from home with 24/7 care.", icon: ShieldCheck, color: "#51CF66" },
    { title: "Creative Play", desc: "Learning through music, art, and dance.", icon: Zap, color: "#FCC419" },
    { title: "Smart Start", desc: "Modern curriculum for curious little minds.", icon: Map, color: "#FF6B6B" },
    { title: "Happy Friends", desc: "Building social skills and lifelong bonds.", icon: Users, color: "#4DABF7" },
  ];

  const icons = [ShieldCheck, Zap, Map, Users];

  return (
    <section id="features" className="py-32 bg-[#F8FAFF] relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl opacity-50" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.5 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="inline-block p-4 bg-white rounded-3xl shadow-lg border-4 border-dashed mb-4"
               style={{ borderColor: theme?.primary }}
            >
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    {data?.badge || "Why Kids Love Us"}
                </span>
            </motion.div>
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight"
            >
                {data?.titleLine1 || "Magic"} <span style={{ color: theme?.primary || '#FF6B6B' }}>{data?.titleLine2 || "Everywhere."}</span>
            </motion.h2>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature: any, idx: number) => {
            const IconComponent = icons[idx % icons.length] || Zap;
            return (
              <motion.div 
                key={idx}
                variants={bounceUp}
                className="group p-10 bg-white rounded-[3rem] border-4 border-transparent hover:border-zinc-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-3 flex flex-col items-center text-center relative overflow-hidden"
              >
                {/* Decorative background blob */}
                <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700" style={{ backgroundColor: theme?.primary }} />
                
                <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-xl transition-transform group-hover:rotate-12 group-hover:scale-110" style={{ backgroundColor: feature.color || theme?.primary }}>
                    <IconComponent className="h-10 w-10" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-4">{feature.title}</h3>
                <p className="text-zinc-500 font-bold leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
