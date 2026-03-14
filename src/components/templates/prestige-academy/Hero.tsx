/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeIn, staggerContainer, revealScale } from "./shared";
import { Play, ArrowRight } from "lucide-react";

export const Hero = ({ data, theme }: SectionProps) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 z-10" />
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          src={data?.heroImage || "https://images.unsplash.com/photo-1541339907198-e08759df9a13?q=80&w=2070"} 
          alt="Academy Architecture" 
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-12"
        >
          {/* Badge */}
          <motion.div variants={fadeIn} className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.4em] text-white/80">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme?.primary }} />
                ESTABLISHED 1982 • GLOBAL LEGACY
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={fadeIn}
            className="text-6xl md:text-[120px] font-black text-white leading-[0.85] tracking-[-0.04em] perspective-1000"
          >
            {data?.title || "ARCHITECTS OF"} <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-transparent opacity-90">
                {data?.subtitle || "TOMORROW"}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={fadeIn}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide"
          >
            {data?.description || "A world-class institution dedicated to nurturing elite intellects through a fusion of traditional values and pioneering innovation."}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeIn} className="flex flex-col md:flex-row items-center justify-center gap-8 pt-8">
            <Button 
              size="lg" 
              className="h-20 px-14 rounded-none text-[12px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-all w-full md:w-auto"
              style={{ backgroundColor: theme?.primary || "#C5A059" }}
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Enrollment <ArrowRight className="ml-3 h-4 w-4" />
            </Button>
            
            <button className="group flex items-center gap-4 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:text-primary transition-all">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary transition-colors bg-white/5 backdrop-blur-sm">
                    <Play size={20} fill="currentColor" />
                </div>
                Legacy Film
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-12 left-12 hidden lg:flex items-center gap-8">
            <div className="w-px h-24 bg-white/10" />
            <div className="flex flex-col gap-2">
                <span className="text-white font-black text-2xl tracking-tighter">Gold Standard</span>
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-[0.3em]">Accredited Education</span>
            </div>
      </div>

      <div className="absolute bottom-12 right-12 hidden lg:flex items-center gap-4 text-white/20 font-black text-[80px] leading-none select-none">
        01
      </div>
    </section>
  );
};
