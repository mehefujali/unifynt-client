/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { bounceUp, staggerContainer } from "./shared";
import { Quote, Star } from "lucide-react";

export const Testimonials = ({ data, theme }: SectionProps) => {
  const items = data?.items || [
    { name: "Sarah Jenkins", role: "Alumni Parent", quote: "The level of academic rigor and personal attention my son received was transformative." },
    { name: "Dr. Robert Chen", role: "University Professor", quote: "Unifynt graduates enter our university with a maturity and hunger for learning that is rare." },
  ];

  return (
    <section id="testimonials" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/3 space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-100 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500"
            >
              <Quote size={14} fill="currentColor" />
              {data?.badge || "Testimonials"}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter leading-tight"
            >
              {data?.titleLine1 || "Happy"} <br />
              <span style={{ color: theme?.primary || '#FF6B6B' }}>{data?.titleLine2 || "Parents."}</span>
            </motion.h2>
            <p className="text-xl font-bold text-zinc-400 capitalize italic">
              {data?.description || "Read what our community has to say about our little academy."}
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="lg:w-2/3 grid sm:grid-cols-1 md:grid-cols-2 gap-8"
          >
            {items.map((item: any, idx: number) => (
              <motion.div
                key={idx}
                variants={bounceUp}
                className="p-10 bg-zinc-50 rounded-[3rem] border-4 border-transparent hover:border-zinc-200 hover:bg-white transition-all shadow-xl group"
              >
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={14} className="text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-xl font-black text-zinc-800 leading-relaxed mb-8 italic">
                  &quot;{item.quote}&quot;
                </p>

                <div className="flex items-center gap-4 pt-6 border-t-4 border-dashed border-zinc-100">
                  <div className="w-16 h-16 rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                    <img src={`https://i.pravatar.cc/150?u=${idx + 20}`} alt={item.name} />
                  </div>
                  <div>
                    <div className="text-lg font-black text-zinc-900 leading-none mb-1">{item.name}</div>
                    <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{item.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
