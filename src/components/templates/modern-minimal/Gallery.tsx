"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./shared";
import { Camera } from "lucide-react";

export const Gallery = ({ data, theme }: SectionProps) => {
  const items = data?.items || [
    { url: "https://images.unsplash.com/photo-1541339907198-e08759df9a13?q=80&w=2070", colSpan: "col-span-2", rowSpan: "row-span-2" },
    { url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070", colSpan: "col-span-2", rowSpan: "row-span-1" },
  ];

  return (
    <section id="gallery" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
               {data?.badge || "Visual Artifacts"}
            </motion.div>
                <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter">
                Campus <span className="text-zinc-300">Environment.</span>
                </motion.h2>
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                {data?.description || "Exploring Excellence"}
            </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-[800px]">
          {items.map((img: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 1 }}
              className={`relative overflow-hidden rounded-[2.5rem] bg-zinc-100 ${img.colSpan || 'col-span-1'} ${img.rowSpan || 'row-span-1'} cursor-pointer group`}
            >
              <img 
                src={img.url} 
                alt="Campus" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-zinc-900/10 group-hover:bg-zinc-900/30 transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
