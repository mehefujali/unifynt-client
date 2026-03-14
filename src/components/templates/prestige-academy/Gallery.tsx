"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./shared";

export const Gallery = ({ data, theme }: SectionProps) => {
  const images = data?.items || [
    { url: "https://images.unsplash.com/photo-1523050337456-5d47e171e626?q=80&w=1500", size: 'large' },
    { url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=1500", size: 'small' },
    { url: "https://images.unsplash.com/photo-1541339907198-e08759df9a13?q=80&w=1500", size: 'small' },
    { url: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?q=80&w=1500", size: 'medium' },
    { url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1500", size: 'medium' },
  ];

  return (
    <section id="gallery" className="py-32 bg-zinc-950 text-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-24 gap-12">
            <motion.div 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={staggerContainer}
            >
                <motion.span variants={fadeIn} className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 block mb-6">Visual Exhibition</motion.span>
                <motion.h2 variants={fadeIn} className="text-6xl md:text-8xl font-black tracking-tighter">The Academy <br /> <span className="opacity-30">In Focus.</span></motion.h2>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                viewport={{ once: true }}
                className="max-w-xs text-white/40 text-sm font-medium leading-relaxed"
            >
                Experience the atmosphere of elite learning through our curated photographic journey.
            </motion.div>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-8 h-[1000px]"
        >
          {images.map((img: any, idx: number) => (
            <motion.div
              key={idx}
              variants={fadeIn}
              className={`relative overflow-hidden group border border-white/10 ${
                img.size === 'large' ? 'col-span-2 row-span-2' : 
                img.size === 'medium' ? 'col-span-1 row-span-1' : ''
              }`}
            >
              <img 
                src={img.url} 
                alt="Academy Life" 
                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary" style={{ color: theme?.primary }}>Exhibition {idx + 1}</span>
                    <h4 className="text-xl font-bold mt-2">Elite Campus Life</h4>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
