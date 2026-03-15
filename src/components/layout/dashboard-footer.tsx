"use client";

import { useAuth } from "@/hooks/use-auth";
import { SchoolService } from "@/services/school.service";
import { useQuery } from "@tanstack/react-query";
import { Clock, HelpCircle, MapPin, Phone, Globe, MessageCircle, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { ReportModal } from "../dashboard/report-modal";

export default function DashboardFooter() {
    const { user } = useAuth();
    const [time, setTime] = useState("");
    
    const { data: schoolData } = useQuery({
        queryKey: ["my-school", user?.schoolId],
        queryFn: () => SchoolService.getSingleSchool(user?.schoolId as string),
        enabled: !!user?.schoolId,
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-sidebar-border/30 bg-background/50 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 shrink-0 select-none">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left: School Primary Info */}
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        <span className="text-[11px] font-extrabold text-slate-900 dark:text-zinc-100 uppercase tracking-widest truncate max-w-[200px]">
                            {schoolData?.name || "Unifynt Workspace"}
                        </span>
                    </div>

                    {schoolData?.address && (
                        <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
                            <MapPin className="h-3 w-3" />
                            <span className="text-[10px] font-bold truncate max-w-[250px]">{schoolData.address}</span>
                        </div>
                    )}
                </div>

                {/* Center: Support & Version */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-6">
                        {/* Support Links */}
                        <div className="flex items-center gap-4 bg-slate-900/[0.03] dark:bg-zinc-100/[0.04] px-4 py-1.5 rounded-full border border-sidebar-border/20">
                            <a href="https://unifynt.com/docs" target="_blank" rel="noreferrer" title="Help Documentation" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-wider">
                                <HelpCircle className="h-3.5 w-3.5" />
                                Docs
                            </a>
                            <div className="h-3 w-px bg-sidebar-border/40" />
                            <a href="https://wa.me/919239536545" target="_blank" rel="noreferrer" title="WhatsApp Support" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-emerald-500 transition-colors uppercase tracking-wider">
                                <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                                WhatsApp
                            </a>
                            <div className="h-3 w-px bg-sidebar-border/40" />
                            <a href="tel:+919239536545" title="Call Support" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-wider">
                                <Phone className="h-3 w-3 text-blue-500" />
                                Call
                            </a>
                            <div className="h-3 w-px bg-sidebar-border/40" />
                            <ReportModal>
                                <button title="Report Issue" className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-rose-500 transition-colors uppercase tracking-wider">
                                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                                    Report
                                </button>
                            </ReportModal>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-70">
                            <Globe className="h-3.5 w-3.5" />
                            v2.4.0
                        </div>
                    </div>
                </div>

                {/* Right: Live Clock & Legal */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-slate-900/[0.04] dark:bg-zinc-100/[0.05] border border-sidebar-border/40 px-3 py-1.5 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-[11px] font-black text-slate-800 dark:text-zinc-200 tabular-nums min-w-[75px] text-center">
                            {time || "00:00:00 AM"}
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 border-l border-sidebar-border/30">
                        © {currentYear} Unifynt
                    </div>
                </div>
            </div>
        </footer>
    );
}
