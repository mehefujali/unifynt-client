"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { motion } from "framer-motion";
import { Users, GraduationCap, Globe, Trophy } from "lucide-react";

export const Stats = ({ data, theme }: SectionProps) => (
  <section className="relative z-20 -mt-24 px-6 mb-32">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
      >
        {[
          { label: "Global Students", val: data?.students || "2.5K+", icon: Users },
          { label: "Expert Faculty", val: data?.teachers || "150+", icon: GraduationCap },
          { label: "Campus Acres", val: data?.campus || "45+", icon: Globe },
          { label: "Awards Won", val: data?.awards || "200+", icon: Trophy }
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-[1.8rem] bg-white border border-zinc-100/50 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500">
            <div className="h-14 w-14 rounded-full bg-zinc-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ color: theme?.primary || "#171717" }}>
              <stat.icon className="h-6 w-6" />
            </div>
            <h3 className="text-4xl font-medium tracking-tight text-zinc-900 mb-2">{stat.val}</h3>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);
