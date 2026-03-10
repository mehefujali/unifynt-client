"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { NoticeService } from "@/services/notice.service";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";
import { format } from "date-fns";
import { LayoutTemplate, AlertCircle, Megaphone, MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function PublicNoticesPage() {
  const { domain } = useParams();
  const [liveTheme, setLiveTheme] = useState(DEFAULT_SITE_DATA.theme);
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: siteData } = useQuery({
    queryKey: ["public-site", domain],
    queryFn: () => SiteConfigService.getPublicSiteData(domain as string),
    enabled: !!domain,
  });

  const { data: noticesData, isLoading } = useQuery({
    queryKey: ["public-notices", domain, page],
    queryFn: () => NoticeService.getPublicNotices(domain as string, { page, limit }),
    enabled: !!domain,
  });

  useEffect(() => {
    if (siteData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveTheme({ ...DEFAULT_SITE_DATA.theme, ...(siteData.themeSettings || {}) });
    }
  }, [siteData]);

  const schoolName = siteData?.school?.name || "School Notice Board";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: liveTheme.background }}>
      {/* Header matching the login page theme logic */}
      <header 
        className="w-full shrink-0 flex items-center shadow-sm relative z-50 p-6 sm:p-8"
        style={{ backgroundColor: liveTheme.primary }}
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href={`/sites/${domain}/login`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Image src="/unifynt-logo.png" alt="Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-xl font-black uppercase tracking-tight text-white hidden sm:block">{schoolName}</span>
          </Link>
          <div className="flex bg-black/10 px-4 py-2 rounded-full font-bold text-white text-sm">
             Official Notice Board
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div 
        className="relative overflow-hidden pt-24 pb-32 flex-shrink-0"
        style={{ backgroundColor: `${liveTheme.primary}10` }}
      >
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-40 mix-blend-multiply pointer-events-none" />
         <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-6">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl mb-4 transform -rotate-2">
                <Megaphone className="w-10 h-10" style={{ color: liveTheme.primary }} />
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 drop-shadow-sm uppercase">Announcements & Notices</h1>
            <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                Stay up to date with the latest institutional alerts, critical schedules, and events.
            </p>
         </div>
      </div>

      {/* Content Grid */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-16 -mt-16 z-20 relative">
        {isLoading ? (
            <div className="flex justify-center items-center py-32 space-y-4 flex-col">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: liveTheme.primary }}></div>
                <p className="font-bold text-slate-400 tracking-widest uppercase text-sm">Loading Notices...</p>
            </div>
        ) : !noticesData?.data || noticesData.data.length === 0 ? (
            <Card className="border-0 shadow-2xl bg-white rounded-3xl overflow-hidden py-32 mt-12 text-center max-w-3xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-slate-50 p-6 rounded-full">
                        <LayoutTemplate className="w-16 h-16 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900">No active notices</h3>
                    <p className="text-slate-500 font-medium">There are currently no public announcements posted.</p>
                </CardContent>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {noticesData.data.map((notice: any) => (
                    <Card key={notice.id} className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 group rounded-3xl overflow-hidden flex flex-col bg-white">
                        {notice.link ? (
                            <a href={notice.link} target="_blank" rel="noopener noreferrer" className="flex flex-col flex-grow">
                                <CardContent className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-slate-600 bg-slate-100 flex items-center gap-1.5">
                                            <AlertCircle className="w-3 h-3" /> Published {format(new Date(notice.publishedAt), "MMM d, yyyy")}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer" style={{ color: "currentColor", '--hover-color': liveTheme.primary } as React.CSSProperties}>
                                        {notice.title} <span className="opacity-50 text-sm ml-1">↗</span>
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed text-[15px] font-medium whitespace-pre-line flex-grow line-clamp-4">
                                        {notice.content}
                                    </p>
                                </CardContent>
                            </a>
                        ) : (
                            <CardContent className="p-8 flex flex-col flex-grow">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-slate-600 bg-slate-100 flex items-center gap-1.5">
                                        <AlertCircle className="w-3 h-3" /> Published {format(new Date(notice.publishedAt), "MMM d, yyyy")}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black tracking-tight text-slate-900 leading-tight mb-4" style={{ color: "currentColor" }}>
                                    {notice.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-[15px] font-medium whitespace-pre-line flex-grow line-clamp-4">
                                    {notice.content}
                                </p>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>
        )}

        {/* Pagination */}
        {noticesData?.meta?.totalPage > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16 pb-8">
                <Button 
                    variant="outline" 
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="font-bold rounded-xl h-12 px-6 shadow-sm hover:bg-slate-50 border-slate-200"
                >
                    Previous
                </Button>
                <div className="font-bold px-4 text-slate-500">
                    Page {page} of {noticesData.meta.totalPage}
                </div>
                <Button 
                    onClick={() => setPage(page + 1)}
                    disabled={page === noticesData.meta.totalPage}
                    className="font-bold rounded-xl h-12 px-6 shadow-md text-white hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: liveTheme.primary }}
                >
                    Next Announcements
                </Button>
            </div>
        )}
      </main>

      {/* Trust Footer */}
      <footer className="w-full bg-slate-950 text-slate-400 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4 flex flex-col items-center md:items-start">
                <Image src="/unifynt-logo.png" alt="Unifynt" width={32} height={32} className="brightness-0 invert opacity-50" />
                <p className="text-sm font-medium w-full max-w-[250px]">
                    Powered by the Unifynt Enterprise Platform. Delivering secure digital experiences for educational institutions.
                </p>
            </div>
            {siteData?.school && (
                <>
                <div className="space-y-4 flex flex-col items-center md:items-start">
                    <h4 className="font-bold text-white uppercase tracking-widest text-sm">Contact Administration</h4>
                    <div className="space-y-3 font-medium text-sm">
                        <div className="flex items-center gap-3"><Phone className="w-4 h-4" /> {siteData.school.phone || "Not specified"}</div>
                        <div className="flex items-center gap-3"><Mail className="w-4 h-4" /> admin@{domain as string}.unifynt.com</div>
                    </div>
                </div>
                <div className="space-y-4 flex flex-col items-center md:items-start">
                    <h4 className="font-bold text-white uppercase tracking-widest text-sm">Institution Location</h4>
                    <div className="flex items-start gap-3 text-sm font-medium">
                        <MapPin className="w-4 h-4 mt-1 shrink-0" />
                        <span className="leading-relaxed">{siteData.school.address || "Address details not available at this time."}</span>
                    </div>
                </div>
                </>
            )}
        </div>
      </footer>
    </div>
  );
}
