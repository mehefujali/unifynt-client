"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./shared";
import { Quote } from "lucide-react";

export const About = ({ data, theme }: SectionProps) => {
  return (
    <section id="about" className="py-32 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          
          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="relative"
          >
            <div className="absolute -top-12 -left-12 w-48 h-48 border-[20px] border-zinc-50 z-0" />
            <motion.div variants={fadeIn} className="relative z-10 aspect-[4/5] overflow-hidden shadow-3xl">
              <img 
                src={data?.aboutImage || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1500"} 
                alt="Academy Excellence" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </motion.div>
            
            {/* Floating Experience Box */}
            <motion.div 
              variants={fadeIn}
              className="absolute -bottom-12 -right-12 bg-zinc-900 p-12 text-white shadow-3xl hidden md:block"
              style={{ backgroundColor: theme?.primary || '#18181b' }}
            >
              <div className="text-6xl font-black mb-2 leading-none">40+</div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Years of Intellectual <br /> Leadership</div>
            </motion.div>
          </motion.div>

          <div className="space-y-12">
            <motion.div 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }} 
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="flex items-center gap-4 mb-8">
                <div className="w-12 h-px bg-zinc-200" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 font-kids">Defining Excellence Since 1982</span>
              </motion.div>

              <motion.h2 variants={fadeIn} className="text-5xl md:text-7xl font-black text-zinc-900 leading-[1.1] mb-10">
                {data?.title || "Bridging Tradition with Tomorrow."}
              </motion.h2>

              <motion.div variants={fadeIn} className="relative pl-12 border-l-4 border-zinc-100 italic text-2xl text-zinc-500 font-medium leading-relaxed mb-12">
                <Quote className="absolute -left-2 -top-4 text-zinc-100 h-16 w-16 -z-10" fill="currentColor" />
                {data?.quote || "Education is not the learning of facts, but the training of the mind to think."}
              </motion.div>

              <motion.p variants={fadeIn} className="text-lg text-zinc-600 leading-relaxed max-w-xl font-medium">
                {data?.description || "In a world of constant evolution, we provide an anchor of timeless values. Our methodology focuses on deep critical thinking, global awareness, and the relentless pursuit of mastery in every discipline."}
              </motion.p>
            </motion.div>

            <motion.div 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={staggerContainer}
                className="grid grid-cols-2 gap-12 pt-8"
            >
                {[
                    { label: "Faculty Members", value: "85+" },
                    { label: "Alumni Network", value: "12k+" }
                ].map((stat, idx) => (
                    <motion.div key={idx} variants={fadeIn}>
                        <div className="text-4xl font-black text-zinc-900 mb-2" style={{ color: theme?.primary }}>{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
