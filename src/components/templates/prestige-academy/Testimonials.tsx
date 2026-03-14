"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./shared";
import { Quote, Star } from "lucide-react";

export const Testimonials = ({ data, theme }: SectionProps) => {
  const reviews = data?.items || [
    {
      name: "Dr. Alistair Vance",
      role: "Parent & Researcher",
      content: "The academy's commitment to both intellectual rigor and personal growth is unparalleled. My son has evolved into a confident global citizen.",
      avatar: "https://i.pravatar.cc/150?u=vance"
    },
    {
      name: "Elena Rodriguez",
      role: "Class of 2018",
      content: "Prestige didn't just teach me subjects; it taught me how to bridge complex ideas. I felt fully prepared for my Ivy League journey.",
      avatar: "https://i.pravatar.cc/150?u=elena"
    },
    {
        name: "Marcus Thorne",
        role: "Edu-Consultant",
        content: "A benchmark for institutional excellence. Their blend of traditional heritage and modern tech is exactly what elite education needs.",
        avatar: "https://i.pravatar.cc/150?u=marcus"
    }
  ];

  return (
    <section id="testimonials" className="py-32 bg-white overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-24">
            
            <motion.div 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={staggerContainer}
                className="lg:col-span-4"
            >
                <motion.span variants={fadeIn} className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400 block mb-6">Voice of the Community</motion.span>
                <motion.h2 variants={fadeIn} className="text-5xl md:text-7xl font-black text-zinc-900 leading-tight mb-12">
                    Profiles of <br /> <span className="text-zinc-300 italic">Success.</span>
                </motion.h2>
                <motion.div variants={fadeIn} className="p-10 bg-zinc-50 border-l-8 border-zinc-900" style={{ borderLeftColor: theme?.primary }}>
                    <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" className="text-zinc-900" style={{ color: theme?.primary }} />)}
                    </div>
                    <p className="text-zinc-600 font-bold leading-relaxed mb-4">
                        Consistently ranked among the top 5% of global private institutions for curriculum innovation.
                    </p>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Global Education Index 2025</div>
                </motion.div>
            </motion.div>

            <motion.div 
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true }} 
                variants={staggerContainer}
                className="lg:col-span-8 grid md:grid-cols-2 gap-8"
            >
                {reviews.map((review: any, idx: number) => (
                    <motion.div
                        key={idx}
                        variants={fadeIn}
                        className={`p-12 border border-zinc-100 flex flex-col justify-between hover:shadow-3xl transition-all duration-700 bg-white ${idx === 1 ? 'md:mt-12' : ''}`}
                    >
                        <Quote className="text-zinc-100 h-16 w-16 mb-8" fill="currentColor" />
                        <p className="text-xl text-zinc-600 font-medium leading-relaxed mb-12 italic">
                            "{review.content}"
                        </p>
                        <div className="flex items-center gap-6 pt-8 border-t border-zinc-50">
                            <img src={review.avatar} alt={review.name} className="w-16 h-16 rounded-full border-4 border-white shadow-xl grayscale" />
                            <div>
                                <h4 className="text-lg font-black text-zinc-900">{review.name}</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{review.role}</p>
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
