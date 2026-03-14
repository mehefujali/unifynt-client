"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeUp, staggerContainer } from "./shared";

export const Hero = ({ data, theme }: SectionProps) => {
  const layout = data?.layout || "type1";

  if (layout === "type2") {
    return (
      <section id="home" className="relative pt-32 pb-20 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden min-h-[90vh]">
        <div className="absolute inset-0 z-0">
          <img src={data?.heroImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"} alt="Hero" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center flex flex-col items-center pt-20">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-8">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-white">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-white" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>
                Admissions Open 2026
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.1]">
              {data?.title || "Redefining"} <span style={{ color: theme?.primary || "#2563eb" }}>Excellence.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-2xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed">
              {data?.subtitle || "A world-class curriculum designed to nurture brilliant minds and future global leaders."}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
              <Link href={data?.ctaLink || "#"}>
                <Button size="lg" className="h-14 px-10 rounded-xl text-lg font-medium shadow-2xl hover:-translate-y-0.5 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
                  {data?.ctaText || "Start Journey"}
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-8 rounded-xl text-lg font-medium text-white border-white/30 hover:bg-white/10 group backdrop-blur-sm">
                <PlayCircle className="mr-2 h-6 w-6 text-white/70 group-hover:text-white transition-colors" /> Watch Video
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (layout === "type3") {
    return (
      <section id="home" className="relative pt-32 pb-20 flex flex-col lg:flex-row items-center justify-center bg-white overflow-hidden min-h-[90vh] px-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ '--tw-gradient-from': `${theme?.primary}10` } as any} />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10 pt-10">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-8 text-left">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 shadow-sm text-xs font-bold uppercase tracking-widest text-zinc-500">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme?.primary || "#2563eb" }} /><span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme?.primary || "#2563eb" }} /></span>
                Admissions Open 2026
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
              {data?.title || "Redefining"} <br /><span style={{ color: theme?.primary || "#2563eb" }}>Excellence.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-500 max-w-xl font-normal leading-relaxed">
              {data?.subtitle || "A world-class curriculum designed to nurture brilliant minds and future global leaders."}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-4 pt-4">
              <Link href={data?.ctaLink || "#"}>
                <Button size="lg" className="h-14 px-10 rounded-xl text-lg font-medium shadow-md hover:-translate-y-0.5 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#171717" }}>
                  {data?.ctaText || "Start Journey"}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <img src={data?.heroImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"} alt="Hero" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>
    );
  }

  // Default layout: type1 (Minimal Centered)
  return (
    <section id="home" className="relative pt-32 pb-20 flex flex-col items-center justify-center bg-white overflow-hidden">
      <div className="absolute inset-0 z-0 bg-slate-50/50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ '--tw-gradient-from': `${theme?.primary}10` } as any} />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme?.primary || "#2563eb" }} /><span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme?.primary || "#2563eb" }} /></span>
              Admissions Open 2026
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
            {data?.title || "Redefining"} <span style={{ color: theme?.primary || "#2563eb" }}>Excellence.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
            {data?.subtitle || "A world-class curriculum designed to nurture brilliant minds and future global leaders."}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href={data?.ctaLink || "#"}>
              <Button size="lg" className="h-12 px-8 rounded-xl text-base font-medium shadow-md hover:-translate-y-0.5 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#171717" }}>
                {data?.ctaText || "Start Journey"}
              </Button>
            </Link>
            <Button variant="outline" className="h-12 px-6 rounded-xl text-base font-medium text-slate-600 border-slate-200 hover:bg-slate-50 group">
              <PlayCircle className="mr-2 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" /> Watch Video
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
