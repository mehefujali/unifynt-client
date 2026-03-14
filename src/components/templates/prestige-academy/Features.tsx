"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./shared";
import { Compass, Cpu, Target, Users } from "lucide-react";

export const Features = ({ data, theme }: SectionProps) => {
  const pillars = data?.items || [
    {
      title: "Global Leadership",
      description: "Cultivating cosmopolitan minds capable of navigating and leading in a complex international landscape.",
      icon: Globe
    },
    {
        title: "Scientific Mastery",
        description: "Advanced research facilities and a curriculum rooted in empirical inquiry and technological innovation.",
        icon: Cpu
    },
    {
        title: "Moral Integrity",
        description: "Ethics-first education that builds character and a profound sense of responsibility toward society.",
        icon: Target
    },
    {
        title: "Bespoke Mentorship",
        description: "Each scholar receives personalized guidance from world-class educators to unlock their unique potential.",
        icon: Users
    }
  ];

  const icons = [Compass, Cpu, Target, Users];

  return (
    <section id="features" className="py-32 bg-zinc-50">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        <div className="max-w-3xl mb-24">
            <motion.div 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={staggerContainer}
            >
                <motion.span variants={fadeIn} className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 block mb-6">Our Foundational Pillars</motion.span>
                <motion.h2 variants={fadeIn} className="text-5xl md:text-7xl font-black text-zinc-900 leading-tight">
                    Engineering Greatness. <br />
                    <span className="text-zinc-300">Section by Section.</span>
                </motion.h2>
            </motion.div>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-200 border border-zinc-200"
        >
          {pillars.map((item: any, idx: number) => {
            const Icon = icons[idx % icons.length];
            return (
              <motion.div
                key={idx}
                variants={fadeIn}
                className="bg-white p-12 hover:bg-zinc-900 transition-all duration-700 group cursor-pointer h-[500px] flex flex-col"
              >
                 <div className="mb-12 inline-flex items-center justify-center w-20 h-20 rounded-full border border-zinc-100 group-hover:border-zinc-800 group-hover:bg-zinc-800 transition-all">
                    <Icon className="h-8 w-8 text-zinc-900 group-hover:text-primary transition-colors" style={{ color: idx === 0 ? theme?.primary : undefined }} />
                 </div>
                 
                 <div className="mt-auto">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 group-hover:text-primary mb-4 transition-colors">Pillar 0{idx + 1}</div>
                    <h3 className="text-3xl font-black text-zinc-900 mb-6 group-hover:text-white transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-zinc-500 group-hover:text-zinc-400 leading-relaxed font-medium">
                        {item.description}
                    </p>
                 </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const Globe = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
);
