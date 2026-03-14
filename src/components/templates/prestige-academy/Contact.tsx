"use client";
import React from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./shared";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

export const Contact = ({ data, theme }: SectionProps) => {
  return (
    <section id="contact" className="py-32 bg-zinc-950 text-white relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-[60%] h-full bg-zinc-900 -skew-x-12 translate-x-32 z-0" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-32">
          
          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="space-y-6">
                <motion.span variants={fadeIn} className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 block mb-6">Connect with Excellence</motion.span>
                <motion.h2 variants={fadeIn} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                    Formalize Your <br /> <span className="text-primary italic" style={{ color: theme?.primary }}>Legitimacy.</span>
                </motion.h2>
            </div>

            <div className="space-y-10">
                {[
                    { icon: MapPin, label: "Campus Location", value: "Heritage Blvd, 102 Ivy Lane, OXFORD" },
                    { icon: Phone, label: "Administrative Inquiry", value: "+1 (800) LEGACY-EDU" },
                    { icon: Mail, label: "Digital Correspondence", value: "admissions@prestige-academy.edu" }
                ].map((item, idx) => (
                    <motion.div key={idx} variants={fadeIn} className="flex gap-8 items-start group">
                        <div className="w-16 h-16 rounded-none bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500" style={{ backgroundColor: `rgba(255,255,255,0.05)` }}>
                            <item.icon size={24} className="text-white/40 group-hover:text-white transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{item.label}</span>
                            <p className="text-xl font-bold tracking-tight text-white/80">{item.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="bg-white p-12 lg:p-20 shadow-4xl relative"
          >
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-3xl" />
            
            <motion.h3 variants={fadeIn} className="text-4xl font-black text-zinc-900 mb-12 tracking-tight">Request an Invitation.</motion.h3>
            
            <form className="space-y-8">
              <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-8">
                <input type="text" placeholder="Full Scholar Name" className="w-full bg-zinc-50 border-b-2 border-zinc-100 py-4 px-6 text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 outline-none transition-all font-bold" />
                <input type="email" placeholder="Guardian Email Address" className="w-full bg-zinc-50 border-b-2 border-zinc-100 py-4 px-6 text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 outline-none transition-all font-bold" />
              </motion.div>
              <motion.div variants={fadeIn}>
                <select className="w-full bg-zinc-50 border-b-2 border-zinc-100 py-4 px-6 text-zinc-400 focus:text-zinc-900 focus:border-zinc-900 outline-none transition-all font-bold appearance-none">
                    <option>Select Prospective Level</option>
                    <option>Senior Diploma (Class 10-12)</option>
                    <option>Middle Academy (Class 6-9)</option>
                </select>
              </motion.div>
              <motion.div variants={fadeIn}>
                <textarea placeholder="Tell us about the candidate's ambitions..." rows={4} className="w-full bg-zinc-50 border-b-2 border-zinc-100 py-4 px-6 text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 outline-none transition-all font-bold resize-none" />
              </motion.div>
              <motion.button 
                variants={fadeIn}
                className="w-full bg-zinc-900 text-white py-6 text-[12px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 group shadow-2xl"
                style={{ backgroundColor: theme?.primary || '#18181b' }}
              >
                Submit Application <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
