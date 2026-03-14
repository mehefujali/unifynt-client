/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { bounceUp, staggerContainer, popIn } from "./shared";
import { Music, Palette, BookOpen, Smile } from "lucide-react";

export const About = ({ data, theme }: SectionProps) => {
  const qualities = [
    { icon: Palette, color: "#FF6B6B", label: "Creative Arts" },
    { icon: Music, color: "#4DABF7", label: "Happy Music" },
    { icon: BookOpen, color: "#51CF66", label: "Story Time" },
    { icon: Smile, color: "#FCC419", label: "Joyful Play" },
  ];

  return (
    <section id="about" className="py-32 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="relative"
          >
             {/* Large Fun Circle Frame */}
             <div className="aspect-square relative flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-[12px] border-dashed rounded-full" 
                  style={{ borderColor: `${theme?.primary}30` }}
                />
                
                <div className="w-[85%] h-[85%] rounded-full overflow-hidden border-8 border-white shadow-3xl relative z-10">
                   <img 
                    src={data?.aboutImage || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1500"} 
                    alt="Classroom Play" 
                    className="w-full h-full object-cover"
                   />
                </div>

                {/* Decorative Elements */}
                <motion.div variants={popIn} className="absolute -top-4 -right-4 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center p-6 shadow-xl rotate-12 z-20">
                    <span className="text-[14px] font-black text-white text-center uppercase tracking-widest leading-none">Best <br /> Place <br /> To Grow!</span>
                </motion.div>
             </div>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="space-y-10"
          >
            <motion.div variants={bounceUp} className="flex items-center gap-4">
               <span className="h-12 w-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: theme?.primary }}>
                 <Smile strokeWidth={3} />
               </span>
               <span className="text-[14px] font-black uppercase tracking-[0.3em] text-zinc-400">
                 {data?.badge || "Our Philosophy"}
               </span>
            </motion.div>

            <motion.h2 variants={bounceUp} className="text-5xl md:text-7xl font-black text-zinc-900 leading-tight">
              {data?.titleLine1 || "Creating Happy"} <br />
              <span style={{ color: theme?.primary || '#FF6B6B' }}>{data?.titleLine2 || "Beginnings."}</span>
            </motion.h2>

            <motion.p variants={bounceUp} className="text-xl font-bold text-zinc-500 leading-relaxed italic">
              " {data?.philosophy || "We believe that every child is a unique star, and our mission is to provide the light and space for them to shine as brightly as possible through play and discovery."} "
            </motion.p>

            <div className="grid grid-cols-2 gap-6 pt-6">
                {qualities.map((item, idx) => (
                    <motion.div 
                        key={idx}
                        variants={bounceUp}
                        className="flex items-center gap-4 p-5 rounded-[2rem] bg-zinc-50 border-2 border-transparent hover:border-zinc-100 transition-all group"
                    >
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: item.color }}>
                            <item.icon className="h-7 w-7" strokeWidth={2.5} />
                        </div>
                        <span className="text-[13px] font-black uppercase tracking-widest text-zinc-700">{item.label}</span>
                    </motion.div>
                ))}
            </div>
            
            <motion.div variants={bounceUp} className="pt-8">
                <div className="flex items-center gap-6">
                    <div className="text-6xl font-black text-zinc-900" style={{ color: theme?.primary }}>{data?.legacyValue || "30+"}</div>
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 flex flex-col">
                        <span>{data?.legacyLabel || "Years of Raising"}</span>
                        <span>{data?.alumniLabel || "Little Leaders"}</span>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
