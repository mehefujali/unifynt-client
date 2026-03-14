/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { fadeUp, staggerContainer } from "./shared";

export const About = ({ data, theme }: any) => (
  <section id="about" className="py-32 px-6">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative aspect-[3/4] lg:aspect-square rounded-[3rem] overflow-hidden"
      >
        <img src={data?.aboutImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"} className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000" alt="About" />
        <div className="absolute inset-0 border border-black/5 rounded-[3rem] pointer-events-none" />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="space-y-12"
      >
        <motion.div variants={fadeUp}>
          <h2 className="text-4xl lg:text-[4rem] font-normal tracking-tight leading-[1.1] text-zinc-900 mb-8 mt-10">
            {data?.title || "A legacy of"} <br /><span className="text-zinc-400">brilliance.</span>
          </h2>
          <p className="text-lg lg:text-2xl text-zinc-500 font-light leading-relaxed">
            {data?.description || "Providing unparalleled excellence in education, combining state-of-the-art infrastructure with compassionate mentoring."}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-8 pt-8">
          {["Innovative Pedagogy", "Global Alumni Network", "Olympic Standard Sports", "Advanced Research Labs"].map((p, i) => (
            <div key={i} className="flex flex-col gap-3">
              <CheckCircle2 className="h-6 w-6" style={{ color: theme?.primary || "#2563eb" }} />
              <span className="font-semibold text-zinc-900">{p}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);
