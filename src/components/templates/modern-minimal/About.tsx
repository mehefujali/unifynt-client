"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./shared";
import { Quote } from "lucide-react";

export const About = ({ data, theme }: SectionProps) => {
  return (
    <section id="about" className="py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="lg:col-span-7 space-y-10"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <span className="w-8 h-px bg-zinc-900" style={{ backgroundColor: theme?.primary }} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                {data?.badge || "Our Paradigm"}
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black text-zinc-900 leading-[1.1] tracking-tighter">
              {data?.titleLine1 || "A commitment to"} <br />
              <span className="text-zinc-300">{data?.titleLine2 || "intellectual rigor"}</span> <br />
              {data?.titleLine3 || "and moral clarity."}
            </motion.h2>

            <motion.div variants={fadeUp} className="relative pl-12">
              <Quote className="absolute left-0 top-0 h-8 w-8 text-zinc-100 -translate-y-2" />
              <p className="text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed italic">
                {data?.philosophy || "We believe that true education transends the classroom. It is about fostering a lifelong curiosity and the courage to lead with integrity in an ever-evolving global landscape."}
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-4">
                    {[1,2,3,4].map(idx => (
                        <div key={idx} className="w-12 h-12 rounded-full border-4 border-white bg-zinc-100 overflow-hidden shadow-sm">
                            <img src={`https://i.pravatar.cc/100?u=${idx}`} alt="Person" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <div>
                    <div className="text-sm font-black text-zinc-900">{data?.alumniLabel || "Elite Alumni Network"}</div>
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{data?.councilLabel || "Global Leadership Council"}</div>
                </div>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src={data?.image || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070"} 
                alt="Academy Philosophy" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Stats Overlay */}
            <div className="absolute -bottom-10 -left-10 bg-zinc-900 text-white p-10 rounded-[2rem] shadow-3xl hidden md:block border border-zinc-800">
                <div className="text-5xl font-black mb-1" style={{ color: theme?.primary }}>{data?.legacyValue || "50+"}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{data?.legacyLabel || "Years of Legacy"}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
