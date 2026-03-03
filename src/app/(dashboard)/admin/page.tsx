/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Users, 
    TrendingUp, 
    GraduationCap, 
    Wallet, 
    Calendar,
    Bell,
    ArrowUpRight,
    PieChart,
    UserCheck,
    Clock,
    LayoutDashboard,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AdminDashboard() {
    const { data: response, isLoading } = useQuery({
        queryKey: ["adminStats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/school-admin");
            return res.data?.data;
        }
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-12 w-64 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-zinc-200/30 dark:bg-zinc-800/30 rounded-[32px]" />
                    ))}
                </div>
            </div>
        );
    }

    const { overview, todaysAttendance, classDistribution, recentNotices } = response || {};

    const stats = [
        { label: "Total Students", value: overview?.totalStudents, icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Active Teachers", value: overview?.totalTeachers, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Monthly Fees", value: `₹${overview?.totalCollected.toLocaleString()}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Dues Pending", value: `₹${overview?.totalDue.toLocaleString()}`, icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-500/10" },
    ];

    return (
        <div className="relative min-h-screen p-4 md:p-8 space-y-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 blur-[120px] rounded-full -z-10" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase italic">
                        Analytics
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Live Institution Monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md px-6 py-3 rounded-[24px] border border-white/20 dark:border-white/5 shadow-xl shadow-black/5">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-tighter">
                        {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="group relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 p-7 rounded-[35px] shadow-2xl shadow-black/5 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn("h-14 w-14 rounded-[22px] flex items-center justify-center shadow-inner", stat.bg)}>
                                <stat.icon className={cn("h-7 w-7", stat.color)} />
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center border border-white/20">
                                <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter tabular-nums">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[40px] shadow-2xl shadow-black/5 overflow-hidden">
                    <div className="px-8 py-7 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                            Attendance
                        </h2>
                    </div>
                    <div className="p-8 space-y-8">
                        {todaysAttendance?.length > 0 ? todaysAttendance.map((item: any) => (
                            <div key={item.status} className="space-y-3">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                                    <span className="text-zinc-500">{item.status}</span>
                                    <span className="text-zinc-900 dark:text-zinc-100">{item.count} Students</span>
                                </div>
                                <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden p-0.5">
                                    <div 
                                        className={cn("h-full rounded-full transition-all duration-1000", item.status === "PRESENT" ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-gradient-to-r from-rose-400 to-red-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]")}
                                        style={{ width: `${(item.count / (overview?.totalStudents || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                                <UserCheck className="h-12 w-12" />
                                <p className="text-[10px] font-black uppercase tracking-widest italic">No Data Collected</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[40px] shadow-2xl shadow-black/5 overflow-hidden">
                    <div className="px-8 py-7 border-b border-white/10 flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <PieChart className="h-4 w-4 text-blue-500" />
                            Class Enrollment
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 h-full">
                        {classDistribution?.map((c: any) => (
                            <div key={c.name} className="p-10 flex flex-col items-center justify-center text-center border-r border-b border-white/10 group hover:bg-white/20 transition-all">
                                <span className="text-4xl font-black text-zinc-900 dark:text-zinc-100 mb-2 group-hover:scale-110 transition-transform tabular-nums">{c.students}</span>
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Class {c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[45px] shadow-2xl shadow-black/10 overflow-hidden">
                    <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/10">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-4">
                            <Bell className="h-5 w-5 text-orange-400" />
                            Bulletin Board
                        </h2>
                        <button className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 group">
                            Full Archive <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                    <div className="p-2 divide-y divide-white/5">
                        {recentNotices?.length > 0 ? recentNotices.map((notice: any) => (
                            <div key={notice.id} className="mx-4 my-2 px-8 py-7 flex items-center justify-between hover:bg-white/20 dark:hover:bg-white/5 rounded-[30px] transition-all group cursor-pointer">
                                <div className="flex items-center gap-8">
                                    <div className="h-14 w-14 rounded-[20px] bg-zinc-900 dark:bg-white flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                                        <span className="text-[8px] font-black uppercase text-white/50 dark:text-black/50">{new Date(notice.createdAt).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-black text-white dark:text-black leading-none">{new Date(notice.createdAt).getDate()}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{notice.title}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-black/5 dark:bg-white/10 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter text-zinc-500">Official Release</span>
                                            <span className="text-[10px] font-bold text-zinc-400 tabular-nums">{new Date(notice.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-[18px] bg-white/50 dark:bg-white/5 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <ArrowUpRight className="h-5 w-5 text-zinc-500" />
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-[11px] font-black uppercase tracking-[0.3em] text-zinc-300">No Notifications</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}