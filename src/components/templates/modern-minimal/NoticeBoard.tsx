"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { NoticeService } from "@/services/notice.service";
import Link from "next/link";
import { Bell, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { SectionProps } from "./types";
import { fadeUp, staggerContainer } from "./shared";

export const NoticeBoard = ({ theme }: SectionProps) => {
  const params = useParams();
  const domain = params?.domain as string;
  const limit = 4;

  const { data: noticesData, isLoading } = useQuery({
    queryKey: ["public-notices", domain],
    queryFn: () => NoticeService.getPublicNotices(domain, { page: 1, limit }),
    enabled: !!domain && domain !== 'undefined',
  });

  if (isLoading || !noticesData?.data || noticesData.data.length === 0) return null;

  const notices = noticesData.data;

  return (
    <section id="notices" className="py-24 bg-white border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
               <div className="h-1 w-12 bg-zinc-200" /> Official Notices
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
              Institutional <span className="text-zinc-400">Directives.</span>
            </motion.h2>
          </motion.div>
          {noticesData.meta.total > limit && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <Link 
                href={`/sites/${domain}/notices`}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                View Archive <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {notices.map((notice: any, idx: number) => (
            <a 
              href={notice.link || "#"}
              target={notice.link ? "_blank" : undefined}
              key={notice.id || idx}
              className="group relative p-8 bg-[#fafafa] rounded-3xl border border-transparent hover:border-zinc-200 hover:bg-white hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] transition-all duration-500 cursor-pointer overflow-hidden block"
            >
              <div className="flex justify-between items-start mb-12">
                <div className="p-3 rounded-2xl bg-white shadow-sm border border-zinc-100 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors duration-500">
                  <Bell className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-zinc-200 text-zinc-400">
                    {notice.category || "General"}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <Calendar className="h-3.5 w-3.5" />
                  {notice.publishedAt ? format(new Date(notice.publishedAt), "MMM dd, yyyy") : "Recently"}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 leading-tight group-hover:translate-x-1 transition-transform duration-500 line-clamp-2">
                  {notice.title}
                </h3>
              </div>

              <div 
                className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700"
                style={{ backgroundColor: theme?.primary || "#000" }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
