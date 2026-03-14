"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { bounceUp, staggerContainer } from "./shared";
import { Bell, Calendar, ChevronRight } from "lucide-react";
import api from "@/lib/axios";

export const NoticeBoard = ({ school, theme }: SectionProps) => {
  const { data: notices, isLoading } = useQuery({
    queryKey: ["school-notices", school?.subdomain],
    queryFn: async () => {
      if (!school?.subdomain) return [];
      const res = await api.get(`/notices/public/${school.subdomain}`);
      return res.data?.data || [];
    },
    enabled: !!school?.subdomain,
  });

  if (isLoading || !notices || notices.length === 0) return null;

  return (
    <section id="notices" className="py-24 bg-[#FFF9F0] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-white shadow-lg animate-bounce">
                <Bell size={20} />
              </div>
              <span className="text-[12px] font-black uppercase tracking-[0.4em] text-zinc-400">School News</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter">Small Talk, <span style={{ color: theme?.primary || '#FF6B6B' }}>Big News.</span></h2>
          </div>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="show" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {notices.map((notice: any, idx: number) => (
            <motion.div
              key={notice.id}
              variants={bounceUp}
              className="bg-white p-10 rounded-[3rem] border-b-8 shadow-xl hover:-translate-y-3 transition-all group flex flex-col h-full"
              style={{ borderBottomColor: idx % 2 === 0 ? theme?.primary : '#4DABF7' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="px-4 py-1.5 rounded-full bg-zinc-50 border-2 border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {notice.category || 'General'}
                </div>
                <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs ml-auto">
                    <Calendar size={12} />
                    {new Date(notice.createdAt).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-2xl font-black text-zinc-800 mb-6 group-hover:text-primary transition-colors flex-grow">
                {notice.title}
              </h3>

              <button className="flex items-center gap-2 text-[12px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors pt-6 border-t-4 border-dashed border-zinc-50 mt-auto">
                Read Story <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
