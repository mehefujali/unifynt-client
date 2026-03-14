/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { bounceUp, staggerContainer } from "./shared";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Contact = ({ data, theme }: SectionProps) => {
  return (
    <section id="contact" className="py-32 bg-[#F8FAFF] relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-20 left-[5%] w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-[5%] w-48 h-48 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            <div className="space-y-6">
              <motion.div variants={bounceUp} className="inline-block px-4 py-2 rounded-2xl bg-white shadow-sm border-2 border-zinc-100 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                {data?.subtitle || "Get in Touch"}
              </motion.div>
              <motion.h2 variants={bounceUp} className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-tight">
                {data?.titleLine1 || "Say"} <span style={{ color: theme?.primary || '#FF6B6B' }}>{data?.titleLine2 || "Hello!"}</span>
              </motion.h2>
              <motion.p variants={bounceUp} className="text-xl font-bold text-zinc-500 leading-relaxed max-w-md">
                {data?.description || "Have questions? We'd love to hear from you and welcome you to our playful community."}
              </motion.p>
            </div>

            <div className="grid gap-6">
              {[
                { icon: Mail, label: "Email Us", val: data?.email || "hello@kiddo.edu", color: "#FF6B6B" },
                { icon: Phone, label: "Call Us", val: data?.phone || "+1 (555) 000-1234", color: "#4DABF7" },
                { icon: MapPin, label: "Visit Us", val: data?.address || "123 Fun Lane, Play City", color: "#51CF66" },
              ].map((item, idx) => (
                <motion.div key={idx} variants={bounceUp} className="flex items-center gap-6 p-6 bg-white rounded-[2.5rem] shadow-xl border-4 border-transparent hover:border-zinc-50 transition-all group">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: item.color }}>
                    <item.icon size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">{item.label}</div>
                    <div className="text-lg font-black text-zinc-800">{item.val}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-12 rounded-[4rem] shadow-3xl border-[12px] border-zinc-50"
          >
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-4">Full Name</label>
                  <Input
                    placeholder="Enter parent's name..."
                    className="h-16 rounded-[2rem] bg-zinc-50 border-0 focus-visible:ring-4 transition-all px-8 font-bold text-lg"
                    style={{ '--tw-ring-color': theme?.primary + '30' } as any}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-4">Email Address</label>
                  <Input
                    placeholder="hello@example.com"
                    className="h-16 rounded-[2rem] bg-zinc-50 border-0 focus-visible:ring-4 transition-all px-8 font-bold text-lg"
                    style={{ '--tw-ring-color': theme?.primary + '30' } as any}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-zinc-400 ml-4">Your Message</label>
                  <Textarea
                    placeholder="How can we help your little explorer?"
                    className="min-h-[160px] rounded-[2.5rem] bg-zinc-50 border-0 focus-visible:ring-4 transition-all p-8 font-bold text-lg resize-none"
                    style={{ '--tw-ring-color': theme?.primary + '30' } as any}
                  />
                </div>
              </div>
              <Button
                className="w-full h-20 rounded-[2.5rem] text-lg font-black uppercase tracking-[0.2em] shadow-xl hover:-translate-y-2 transition-all border-b-8 active:border-b-0 active:translate-y-2"
                style={{ backgroundColor: theme?.primary || '#FF6B6B', borderBottomColor: `rgba(0,0,0,0.2)` }}
              >
                Send Message <Send className="ml-3 h-5 w-5" />
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
