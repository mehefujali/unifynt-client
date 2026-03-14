"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { BellRing, ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { NoticeService } from "@/services/notice.service";

export const NoticeBoard = ({ theme }: SectionProps) => {
  const { domain } = useParams();
  const limit = 5;

  const { data: noticesData, isLoading } = useQuery({
    queryKey: ["public-notices", domain],
    queryFn: () => NoticeService.getPublicNotices(domain as string, { page: 1, limit }),
    enabled: !!domain,
  });

  if (isLoading || !noticesData?.data || noticesData.data.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-slate-50 relative z-20 border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center transform -rotate-3 border border-slate-100">
              <BellRing className="h-7 w-7" style={{ color: theme?.primary || "#2563eb" }} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Official Notice Board</h2>
              <p className="text-slate-500 font-normal mt-1">Institutional announcements and updates</p>
            </div>
          </div>
          {noticesData.meta.total > limit && (
            <Link href={`/sites/${domain}/notices`} className="text-sm font-bold flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-slate-700 hover:text-slate-900">
              View Notice Archive <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {noticesData.data.map((notice: any) => (
            <a href={notice.link || undefined} target={notice.link ? "_blank" : undefined} rel={notice.link ? "noopener noreferrer" : undefined} key={notice.id} className={`group relative flex flex-col md:flex-row md:items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-200/60 transition-all duration-300 overflow-hidden ${notice.link ? 'hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] cursor-pointer' : 'cursor-default'}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${theme?.primary || '#2563eb'})` }} />

              <div className="flex flex-col items-center justify-center p-5 bg-slate-50/80 rounded-[1.5rem] min-w-[110px] shrink-0 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-300 relative z-10">
                <span className="text-3xl font-semibold tracking-tighter" style={{ color: theme?.primary || "#2563eb" }}>{format(new Date(notice.publishedAt), "dd")}</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em] mt-1">{format(new Date(notice.publishedAt), "MMM, yy")}</span>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className={`text-xl md:text-2xl font-medium tracking-tight text-slate-900 mb-2 transition-colors line-clamp-2 ${notice.link ? 'group-hover:text-primary' : ''}`} style={notice.link ? { color: "currentColor", '--hover-color': theme?.primary } as React.CSSProperties : {}}>
                  {notice.title}
                </h3>
                <p className="text-slate-500 font-normal text-sm md:text-base line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              {notice.link && (
                <div className="hidden md:flex shrink-0 relative z-10 pl-4 border-l border-slate-100">
                  <div className="h-14 w-14 flex items-center justify-center rounded-[1.2rem] bg-slate-50 text-slate-400 group-hover:scale-110 transition-all duration-300" style={{ backgroundColor: theme?.primary || "#2563eb", color: "#fff" }}>
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                </div>
              )}

              {notice.link && (
                <div className="md:hidden flex items-center gap-2 text-sm font-bold mt-2" style={{ color: theme?.primary || "#2563eb" }}>
                  Open Link <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
