"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./shared";
import { Star } from "lucide-react";

export const Testimonials = ({ data, theme }: SectionProps) => {
  const items = data?.items || [
    { name: "Sarah Jenkins", role: "Alumni Parent", quote: "The level of academic rigor and personal attention my son received was transformative." },
    { name: "Dr. Robert Chen", role: "University Professor", quote: "Unifynt graduates enter our university with a maturity and hunger for learning that is rare." },
    { name: "Elena Rodriguez", role: "Head of Student Council", quote: "It's not just a school; it's a community that pushes you to be your best self every day." },
  ];

  return (
    <section className="py-32 bg-zinc-900 border-y border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">
               {data?.badge || "Community Voices"}
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-black text-white tracking-tight">
               {data?.titleLine1 || "Verified"} <span style={{ color: theme?.primary || '#fff' }}>{data?.titleLine2 || "Excellence."}</span>
            </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {items.map((item: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="relative p-12 bg-zinc-800/50 rounded-[2.5rem] border border-zinc-700/50 hover:bg-zinc-800 transition-colors duration-500"
            >
              <div className="flex gap-1 mb-8">
                {[1,2,3,4,5].map(s => (
                    <Star key={s} className="h-3 w-3 fill-current" style={{ color: theme?.primary || '#fff' }} />
                ))}
              </div>
              <p className="text-xl text-zinc-300 font-medium leading-relaxed italic mb-10">
                "{item.quote}"
              </p>
              <div>
                <div className="text-sm font-black text-white uppercase tracking-widest">{item.name}</div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">{item.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
