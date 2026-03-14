/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { staggerContainer, bounceUp, float } from "./shared";
import { Star, Heart, Cloud, Sun } from "lucide-react";

export const Hero = ({ data, theme }: SectionProps) => {
  const ratingAvatars = data?.ratingAvatars || [
    { url: "https://i.pravatar.cc/150?u=11" },
    { url: "https://i.pravatar.cc/150?u=12" },
    { url: "https://i.pravatar.cc/150?u=13" },
    { url: "https://i.pravatar.cc/150?u=14" },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-[#FFF9F0]">
      {/* Playful Floating Elements */}
      <motion.div variants={float} animate="animate" className="absolute top-40 left-[10%] text-yellow-400 opacity-20">
        <Sun size={120} strokeWidth={3} />
      </motion.div>
      <motion.div variants={float} animate="animate" className="absolute top-60 right-[15%] text-blue-300 opacity-20">
        <Cloud size={100} strokeWidth={3} />
      </motion.div>
      <motion.div variants={float} animate="animate" className="absolute bottom-40 left-[15%] text-pink-400 opacity-20">
        <Heart size={60} fill="currentColor" />
      </motion.div>
      <motion.div variants={float} animate="animate" className="absolute top-[20%] right-[10%] text-purple-400 opacity-20">
        <Star size={80} fill="currentColor" />
      </motion.div>

      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-primary/5 rounded-bl-[10rem] -z-0" style={{ backgroundColor: `${theme?.primary}10` }} />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-100/30 rounded-tr-[10rem] -z-0" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
        <motion.div
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="space-y-10"
        >
          <motion.div variants={bounceUp}>
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border-4 font-black uppercase tracking-widest text-[12px]" style={{ borderColor: theme?.primary, color: theme?.primary, backgroundColor: 'white' }}>
              <Star className="h-4 w-4" fill="currentColor" />
              {data?.badgeText || "Where Learning is an Adventure!"}
            </div>
          </motion.div>

          <motion.h1
            variants={bounceUp}
            className="text-7xl md:text-9xl font-black text-zinc-900 leading-[0.9] tracking-tight"
          >
            {data?.title || "Let's Explore"} <br />
            <span style={{ color: theme?.primary || '#FF6B6B' }}>
              {data?.subtitle || "Together!"}
            </span>
          </motion.h1>

          <motion.p
            variants={bounceUp}
            className="text-xl md:text-2xl text-zinc-600 max-w-lg font-bold leading-relaxed"
          >
            {data?.description || "Providing a playful, nurturing environment where every child's curiosity leads to brilliant discoveries."}
          </motion.p>

          <motion.div variants={bounceUp} className="flex flex-wrap items-center gap-6 pt-4">
            <Button
              size="lg"
              className="h-20 px-12 rounded-3xl text-[16px] font-black uppercase tracking-[0.1em] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.15)] hover:-translate-y-2 transition-all border-b-8 active:border-b-0 active:translate-y-2"
              style={{ backgroundColor: theme?.primary || "#FF6B6B", borderBottomColor: `rgba(0,0,0,0.2)` }}
            >
              {data?.ctaText || "Enroll Your Child"}
            </Button>
            <Button variant="ghost" className="h-20 px-10 rounded-3xl text-[16px] font-black uppercase tracking-widest text-zinc-800 hover:bg-zinc-100 flex items-center gap-3 decoration-4 underline-offset-8 transition-all">
              {data?.secondaryCtaText || "Explore Campus"}
            </Button>
          </motion.div>

          <motion.div variants={bounceUp} className="flex items-center gap-6 pt-8">
            <div className="flex -space-x-4">
              {ratingAvatars.map((avatar: any, idx: number) => (
                <div key={idx} className="w-14 h-14 rounded-full border-4 border-white overflow-hidden shadow-md bg-zinc-100">
                  <img src={avatar.url} alt="Student" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div>
              <div className="text-xl font-black text-zinc-900">{data?.ratingValue || "500+"}</div>
              <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{data?.ratingLabel || "Happy Small Explorers"}</div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="relative"
        >
          {/* Main Hero Image Container */}
          <div className="relative aspect-square lg:aspect-[5/6] w-full">
            {/* Decorative Frame */}
            <div className="absolute inset-0 border-8 border-white rounded-[4rem] rotate-3 shadow-2xl z-0" />
            <div className="absolute inset-0 border-8 border-primary rounded-[4rem] -rotate-3 z-0" style={{ borderColor: theme?.primary }} />

            <div className="absolute inset-4 rounded-[3.5rem] overflow-hidden shadow-2xl z-10">
              <img
                src={data?.heroImage || "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1500"}
                alt="Happy Kids Learning"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Info Card */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[2rem] shadow-3xl border-4 z-20 max-w-[240px]"
              style={{ borderColor: theme?.primary }}
            >
              <div className="text-4xl font-black text-zinc-900 mb-1" style={{ color: theme?.primary }}>{data?.successValue || "100%"}</div>
              <div className="text-[12px] font-black uppercase tracking-widest text-zinc-400 leading-tight">Fun Learning <br /> Guaranteed!</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-40">
          <path d="M321.39,56.44c13.27-2.61,26.54-5.22,39.81-7.82,13.27-2.61,26.54-5.22,39.81-7.83,13.27,2.61,26.54,5.22,39.81,7.82,13.27,2.61,26.54,5.22,39.81,7.83,13.27-2.61,26.54-5.22,39.81-7.83L1200,120H0V0C0,0,160.69,72.05,321.39,56.44Z" fill="white" />
        </svg>
      </div>
    </section>
  );
};
