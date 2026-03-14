/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { bounceUp, staggerContainer, float } from "./shared";
import { Camera, Heart, Sparkles } from "lucide-react";

export const Gallery = ({ data, theme }: SectionProps) => {
  const items = data?.items || [
    { url: "https://images.unsplash.com/photo-1541339907198-e08759df9a13?q=80&w=2070", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070", colSpan: "col-span-1", rowSpan: "row-span-1" },
  ];

  return (
    <section id="gallery" className="py-32 bg-[#FFF9F0] relative overflow-hidden">
      {/* Decorative floating icons */}
      <motion.div variants={float} animate="animate" className="absolute top-20 right-[5%] text-pink-300 opacity-30">
        <Heart size={40} fill="currentColor" />
      </motion.div>
      <motion.div variants={float} animate="animate" className="absolute bottom-20 left-[5%] text-yellow-300 opacity-30">
        <Sparkles size={50} fill="currentColor" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
            <motion.div 
               initial="hidden" 
               whileInView="show" 
               viewport={{ once: true }} 
               variants={staggerContainer}
               className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white shadow-md mb-4"
            >
                <Camera className="h-4 w-4" style={{ color: theme?.primary }} />
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    {data?.badge || "Little Memories"}
                </span>
            </motion.div>
            <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter"
            >
                {data?.title || "Captured Joy."}
            </motion.h2>
            <motion.p 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-xl font-bold text-zinc-400 uppercase tracking-widest"
            >
                {data?.description || "Explore our wall of happiness"}
            </motion.p>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {items.map((img: any, idx: number) => (
            <motion.div
              key={idx}
              variants={bounceUp}
              className={`relative p-4 bg-white shadow-2xl rounded-sm hover:-translate-y-5 transition-transform duration-500 group cursor-pointer ${idx % 2 === 0 ? 'rotate-2' : '-rotate-2'}`}
            >
              <div className="relative aspect-square overflow-hidden mb-8">
                <img 
                  src={img.url} 
                  alt="Campus Memory" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="text-center pb-2">
                 <div className="h-4 w-3/4 mx-auto bg-zinc-50 rounded-full mb-2" />
                 <div className="h-2 w-1/2 mx-auto bg-zinc-50 rounded-full" />
              </div>

              {/* Tape deco */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-white/40 backdrop-blur-md border border-white/20 rotate-1 shadow-sm" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
