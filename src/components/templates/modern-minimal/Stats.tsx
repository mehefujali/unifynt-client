"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./shared";

export const Stats = ({ data, theme }: SectionProps) => {
  const stats = data?.items || [
    { label: "Graduation Rate", value: "98%", sub: "Top 1% Nationwide" },
    { label: "Faculty Scholars", value: "120+", sub: "PhD & Master Holders" },
    { label: "Student Nationalities", value: "25+", sub: "Global Perspective" },
    { label: "Research Projects", value: "500+", sub: "Innovation Driven" },
  ];

  return (
    <section className="py-32 bg-zinc-900 overflow-hidden relative">
      {/* Abstract Background */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: `radial-gradient(circle at 2px 2px, ${theme?.primary || '#fff'} 1px, transparent 0)`, backgroundSize: '40px 40px' }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-16"
        >
          {stats.map((stat, idx) => (
            <motion.div key={idx} variants={fadeUp} className="group">
              <div 
                className="text-6xl md:text-7xl font-black tracking-tighter mb-4 transition-colors duration-500"
                style={{ color: theme?.primary || '#ffffff' }}
              >
                {stat.value}
              </div>
              <div 
                className="h-px w-12 group-hover:w-full transition-all duration-700 mb-6" 
                style={{ backgroundColor: theme?.primary || '#ffffff' }} 
              />
              <div className="space-y-1">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white">
                    {stat.label}
                </div>
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    {stat.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
