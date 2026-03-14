/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { bounceUp, staggerContainer } from "./shared";
import { GraduationCap, BookOpen, Star } from "lucide-react";

export const Academics = ({ data, theme }: SectionProps) => {
  const levels = data?.levels || [
    { name: "Kindergarten", years: "Ages 3-5", desc: "Foundational mastery in core subjects." },
    { name: "Primary School", years: "Ages 6-11", desc: "Rigorous academic preparation." },
  ];

  const icons = [Star, BookOpen, GraduationCap];
  const borderColors = ["#FF6B6B", "#4DABF7", "#51CF66"];

  return (
    <section id="academics" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-400 fill-current animate-pulse" />
              <motion.div variants={bounceUp} className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400">
                {data?.badge || "Educational Journey"}
              </motion.div>
            </div>
            <motion.h2 variants={bounceUp} className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter">
              {data?.titleLine1 || "Step by"} <span style={{ color: theme?.primary || '#FF6B6B' }}>{data?.titleLine2 || "Step."}</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-50 p-8 rounded-[2.5rem] border-4 border-dashed border-zinc-200"
          >
            <div className="text-3xl font-black text-zinc-900 mb-1">{data?.ratingValue || "Mastery"}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-tight">Academic <br /> Excellence</div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid gap-8"
        >
          {levels.map((level: any, idx: number) => {
            const Icon = icons[idx % icons.length];
            const borderColor = borderColors[idx % borderColors.length];
            return (
              <motion.div
                key={idx}
                variants={bounceUp}
                className="group flex flex-col md:flex-row items-center gap-10 p-10 bg-zinc-50 rounded-[4rem] border-b-8 hover:bg-white hover:border-zinc-200 shadow-xl hover:shadow-2xl transition-all cursor-pointer overflow-hidden relative"
                style={{ borderBottomColor: borderColor }}
              >
                {/* Progress Number */}
                <div className="absolute top-6 right-10 text-8xl font-black opacity-[0.03] select-none">0{idx + 1}</div>

                <div className="w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: borderColor }}>
                  <Icon size={40} strokeWidth={2.5} />
                </div>

                <div className="flex-grow space-y-4 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-3xl font-black text-zinc-900">{level.name}</h3>
                    <span className="px-4 py-1.5 rounded-full bg-white border-2 border-zinc-100 text-[11px] font-black uppercase tracking-widest text-zinc-400 self-center">
                      {data?.yearsLabel || "Duration"}: {level.years}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-zinc-500 max-w-2xl leading-relaxed">{level.desc}</p>
                </div>

                <Button
                  variant="link"
                  className="h-auto p-0 font-black uppercase tracking-[0.2em] text-[11px] group-hover:translate-x-3 transition-transform"
                  style={{ color: borderColor }}
                >
                  LEARN MORE →
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
