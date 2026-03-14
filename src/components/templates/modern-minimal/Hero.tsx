/* eslint-disable react-hooks/static-components */
/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fadeUp, staggerContainer } from "./shared";
import { ArrowRight, Sparkles } from "lucide-react";

export const Hero = ({ data, theme }: SectionProps) => {
  const layout = data?.layout || "type3"; // type3 is current split layout

  // Content shared across layouts
  const Content = () => (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className={`space-y-8 ${layout === 'type1' || layout === 'type2' ? 'text-center max-w-4xl mx-auto' : ''}`}
    >
      <motion.div variants={fadeUp}>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/[0.03] border border-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] ${layout === 'type2' ? 'bg-white/10 border-white/20 text-white/70' : 'text-zinc-500'}`}>
          <Sparkles className="h-3 w-3" style={{ color: theme?.primary }} />
          {data?.badgeText || "Defining the future of education"}
        </div>
      </motion.div>

      <motion.h1
        variants={fadeUp}
        className={`text-6xl md:text-8xl font-black leading-[0.95] tracking-tighter ${layout === 'type2' ? 'text-white' : 'text-zinc-900'}`}
      >
        {data?.title || "Shape Your"} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-500 to-zinc-800" style={{ backgroundImage: `linear-gradient(to right, ${theme?.primary || '#000'}, ${layout === 'type2' ? '#fff' : '#666'})` }}>
          {data?.subtitle || "Legacy."}
        </span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className={`text-lg md:text-xl max-w-lg font-medium leading-relaxed ${layout === 'type1' || layout === 'type2' ? 'mx-auto' : ''} ${layout === 'type2' ? 'text-white/80' : 'text-zinc-500'}`}
      >
        {data?.description || "A premier institution dedicated to academic mastery, character development, and global leadership for the next generation."}
      </motion.p>

      <motion.div variants={fadeUp} className={`flex flex-wrap items-center gap-5 pt-4 ${layout === 'type1' || layout === 'type2' ? 'justify-center' : ''}`}>
        <Link href="#contact">
          <Button
            size="lg"
            className="h-14 px-10 rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-2xl hover:-translate-y-1 transition-all border-0"
            style={{ backgroundColor: theme?.primary || "#000000" }}
          >
            {data?.ctaText || "Enroll Today"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          className={`h-14 px-8 rounded-2xl text-[13px] font-black uppercase tracking-widest hover:bg-zinc-100 ${layout === 'type2' ? 'text-white border-white/20 hover:bg-white/10' : 'text-zinc-900'}`}
          asChild
        >
          <Link href={data?.secondaryCtaLink || "#"}>
            {data?.secondaryCtaText || "View Curriculum"}
          </Link>
        </Button>
      </motion.div>

      {(layout === 'type1' || layout === 'type3') && (
        <motion.div variants={fadeUp} className={`flex items-center gap-8 pt-8 border-t border-zinc-200 max-w-sm ${layout === 'type1' ? 'mx-auto' : ''}`}>
          <div>
            <div className="text-2xl font-black text-zinc-900">{data?.ratingValue || "4.9/5"}</div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{data?.ratingLabel || "Parent Rating"}</div>
          </div>
          <div className="w-px h-8 bg-zinc-200" />
          <div>
            <div className="text-2xl font-black text-zinc-900">{data?.successValue || "100%"}</div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{data?.successLabel || "Success Rate"}</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  if (layout === "type1") {
    // Layout 1: Minimal Centered
    return (
      <section className="relative min-h-[85vh] flex items-center pt-24 pb-20 overflow-hidden bg-white">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `radial-gradient(${theme?.primary} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <Content />
        </div>
      </section>
    );
  }

  if (layout === "type2") {
    // Layout 2: Background Image
    return (
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src={data?.heroImage || "https://images.unsplash.com/photo-1541339907198-e08759df9a13?q=80&w=2070"}
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[2px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <Content />
        </div>
      </section>
    );
  }

  // Default / Layout 3: Split
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden bg-[#fafafa]">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-100/50 -skew-x-12 transform translate-x-1/4 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <Content />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square lg:aspect-[4/5] overflow-hidden"
        >
          <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
            <img
              src={data?.heroImage || "https://images.unsplash.com/photo-1541339907198-e08759df9a13?q=80&w=2070"}
              alt="Hero"
              className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 via-transparent to-transparent" />
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-12 -left-6 bg-white p-6 rounded-2xl shadow-2xl border border-zinc-100 max-w-[220px] hidden md:block"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5" style={{ color: theme?.primary }} />
              </div>
              <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400 leading-tight">Elite <br /> Recognition</div>
            </div>
            <p className="text-sm font-bold text-zinc-900 leading-snug">{data?.awardText || "National Excellence Award Winner 2025"}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
