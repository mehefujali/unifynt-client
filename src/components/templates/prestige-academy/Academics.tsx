"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./shared";
import { ArrowUpRight } from "lucide-react";

export const Academics = ({ data, theme }: SectionProps) => {
  const programs = data?.items || [
    {
      level: "Pre-Secondary",
      title: "Foundation of Curiosity",
      description: "Developing cognitive flexibility and communication skills through immersive experiential learning.",
       image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1500"
    },
    {
      level: "Middle Academy",
      title: "Logical Inquiry",
      description: "A focused transition into advanced mathematics, scientific methodologies, and critical literature analysis.",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1500"
    },
    {
      level: "Senior Diploma",
      title: "Global Citizenship",
      description: "Rigorous specialization and leadership training to prepare students for the world's most elite universities.",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1500"
    }
  ];

  return (
    <section id="academics" className="py-32 bg-white">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
            <motion.div 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={staggerContainer}
                className="max-w-2xl"
            >
                <motion.span variants={fadeIn} className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 block mb-6">Educational Pathways</motion.span>
                <motion.h2 variants={fadeIn} className="text-6xl md:text-8xl font-black text-zinc-900 tracking-tighter">Academic <br /> <span className="text-zinc-300">Architecture.</span></motion.h2>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                viewport={{ once: true }}
                className="pb-6"
            >
                <button className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-900 border-b-2 border-zinc-900 pb-2 hover:text-primary hover:border-primary transition-all">Download Prospectus</button>
            </motion.div>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="grid lg:grid-cols-3 gap-12"
        >
          {programs.map((program: any, idx: number) => (
            <motion.div
              key={idx}
              variants={fadeIn}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-8 shadow-2xl">
                <img 
                  src={program.image} 
                  alt={program.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-8 left-8">
                    <div className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                        {program.level}
                    </div>
                </div>
              </div>
              
              <div className="flex justify-between items-start pr-4">
                <div className="space-y-4">
                    <h3 className="text-3xl font-black text-zinc-900 leading-tight">
                        {program.title}
                    </h3>
                    <p className="text-zinc-500 font-medium leading-relaxed max-w-sm">
                        {program.description}
                    </p>
                </div>
                <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all transform group-hover:rotate-45">
                    <ArrowUpRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
