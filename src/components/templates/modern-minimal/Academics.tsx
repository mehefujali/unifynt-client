"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./shared";
import { ArrowRight, BookOpen } from "lucide-react";

export const Academics = ({ data, theme }: SectionProps) => {
  const levels = data?.levels || [
    { name: "Primary School", years: "Year 1 - Year 6", desc: "Foundational mastery in core subjects with a focus on cognitive development and creative exploration." },
    { name: "Middle School", years: "Year 7 - Year 9", desc: "Advanced analytical skills and the introduction of specialized fields of study." },
    { name: "High School", years: "Year 10 - Year 12", desc: "Rigorous academic preparation for premier global universities and career paths." },
  ];

  return (
    <section id="academics" className="py-32 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-24">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
            <motion.div variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
               {data?.badge || "Educational Framework"}
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tighter">
              {data?.titleLine1 || "Academic"} <span className="text-zinc-300">{data?.titleLine2 || "Progression."}</span>
            </motion.h2>
          </motion.div>
        </div>

        <div className="space-y-4">
          {levels.map((level: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.8 }}
              className="group relative bg-white p-10 md:p-16 rounded-[2.5rem] border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-2xl hover:border-transparent transition-all duration-700"
            >
              <div className="space-y-4 max-w-xl">
                <div className="flex items-center gap-4">
                    <span 
                        className="text-4xl font-extrabold transition-colors duration-500"
                        style={{ color: theme?.primary ? `${theme.primary}20` : '#f4f4f5' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = theme?.primary || '#18181b';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme?.primary ? `${theme.primary}20` : '#f4f4f5';
                        }}
                    >
                        0{idx + 1}
                    </span>
                    <h3 className="text-3xl font-black text-zinc-900">{level.name}</h3>
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {level.years}
                </div>
                <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                    {level.desc}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{data?.ratingLabel || "Excellence Rating"}</div>
                    <div className="text-xl font-bold text-zinc-900">{data?.ratingValue || "Tier 1"}</div>
                </div>
                <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: theme?.primary || "#000" }}
                >
                    <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Hover Image Preview (Optional / Decoration) */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-0 pointer-events-none group-hover:opacity-[0.03] transition-opacity duration-1000">
                <BookOpen className="w-full h-full p-12 text-zinc-900" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
