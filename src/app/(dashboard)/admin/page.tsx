/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Users, TrendingUp, GraduationCap, Wallet, Bell,
    Clock, Lock, MoreHorizontal, UserCheck,
    BookOpen, CalendarDays, Sparkles, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Chart } from "react-google-charts";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function AdminDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDark, setIsDark] = useState(false);
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const checkDark = () => document.documentElement.classList.contains("dark");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDark(checkDark());

        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        try {
            const token = localStorage.getItem("accessToken");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload?.email) {
                    const namePart = payload.email.split('@')[0];
                    setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
                }
            }
        } catch {
            setUserName("");
        }

        return () => {
            clearInterval(timer);
            observer.disconnect();
        };
    }, []);

    const textColor = isDark ? "#a1a1aa" : "#52525b";
    const gridColor = isDark ? "#27272a" : "#e4e4e7";

    const { data: response, isLoading } = useQuery({
        queryKey: ["adminStats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/school-admin");
            return res.data?.data;
        }
    });

    const hour = currentTime.getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 space-y-6 animate-pulse">
                <div className="h-10 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-36 bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 h-[420px] bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
                    <div className="xl:col-span-1 h-[420px] bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
                </div>
            </div>
        );
    }

    const { overview, todaysAttendance, classDistribution, recentNotices } = response || {};

    const maxStudents = classDistribution?.length > 0
        ? Math.max(...classDistribution.map((c: any) => c.students || 0))
        : 1;

    const attendanceChartData = [
        ["Status", "Count"],
        ...(todaysAttendance?.length > 0
            ? todaysAttendance.map((item: any) => [item.status, item.count])
            : [["No Data", 1]])
    ];

    const getAttendanceColors = () => {
        if (!todaysAttendance || todaysAttendance.length === 0) return [gridColor];
        return todaysAttendance.map((item: any) => {
            if (item.status === 'PRESENT') return "#10b981"; // Emerald
            if (item.status === 'ABSENT') return "#f43f5e"; // Rose
            if (item.status === 'LATE') return "#f59e0b"; // Amber
            return "#8b5cf6"; // Violet
        });
    }

    const attendanceOptions = {
        backgroundColor: "transparent",
        pieHole: 0.75,
        chartArea: { width: "85%", height: "80%" },
        legend: { position: "bottom", textStyle: { color: textColor, fontSize: 13, fontName: 'Inter, sans-serif', bold: true } },
        colors: getAttendanceColors(),
        pieSliceBorderColor: isDark ? "#09090b" : "#ffffff",
        pieSliceText: "none",
        animation: { startup: true, duration: 1200, easing: "out" },
        tooltip: { textStyle: { fontName: 'Inter, sans-serif' } },
    };

    const revenueChartData = [
        ["Type", "Amount"],
        ["Collected Fees", overview?.totalCollected || 0],
        ["Pending Dues", overview?.totalDue || 0],
    ];

    const revenueOptions = {
        backgroundColor: "transparent",
        pieHole: 0.75,
        chartArea: { width: "85%", height: "80%" },
        legend: { position: "bottom", alignment: "center", textStyle: { color: textColor, fontSize: 13, fontName: 'Inter, sans-serif', bold: true } },
        colors: ["#10b981", "#f43f5e"],
        pieSliceBorderColor: isDark ? "#09090b" : "#ffffff",
        pieSliceText: "none",
        animation: { startup: true, duration: 1200, easing: "out" },
        tooltip: { textStyle: { fontName: 'Inter, sans-serif' } },
    };

    const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, isProtected = false, permission = "" }: any) => {
        const content = (
            <div className={cn(
                "relative overflow-hidden p-6 rounded-3xl border bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60",
                "shadow-sm hover:shadow-xl transition-all duration-500 group border-zinc-200/50 dark:border-zinc-800/50 flex flex-col justify-between h-full"
            )}>
                <div className={cn(
                    "absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500",
                    gradientClass
                )} />
                <div className="relative z-10 flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{title}</p>
                    <div className={cn("p-3 rounded-2xl shadow-sm bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800", colorClass)}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums group-hover:scale-105 origin-left transition-transform duration-500">{value}</h3>
                </div>
            </div>
        );

        if (isProtected) {
            return (
                <PermissionGate required={permission} fallback={
                    <div className="bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md border border-dashed border-zinc-300 dark:border-zinc-800 p-6 rounded-3xl flex flex-col items-center justify-center text-center h-full opacity-60">
                        <Lock className="h-6 w-6 text-zinc-400 mb-3" />
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{title} Restricted</p>
                    </div>
                }>
                    {content}
                </PermissionGate>
            );
        }
        return content;
    };

    return (
        <PermissionGate
            required={PERMISSIONS.DASHBOARD_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 animate-in fade-in zoom-in duration-700">
                    <div className="relative mb-8">
                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative h-24 w-24 bg-gradient-to-tr from-primary to-primary/60 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 rotate-3">
                            <Sparkles className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
                        {greeting}{userName ? `, ${userName}` : "!"}
                    </h1>

                    <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10 max-w-lg mx-auto font-medium leading-relaxed">
                        Welcome to your unified workspace. Navigate through the sidebar menu to access your daily tools, classes, and tasks.
                    </p>

                    <div className="flex items-center gap-4 px-6 py-4 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            <CalendarDays className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 mb-0.5">Today&apos;s Date</p>
                            <p className="font-bold text-zinc-700 dark:text-zinc-200">
                                {format(currentTime, 'EEEE, MMMM do, yyyy')}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="p-4 md:p-8 space-y-8 bg-zinc-50/30 dark:bg-zinc-950/20 min-h-screen">

                {/* header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-3">
                            <Activity className="h-3.5 w-3.5" /> Workspace Active
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                            {greeting}, Administrator
                        </h1>
                        <p className="text-sm font-medium text-zinc-500 mt-2 max-w-xl">
                            Here&apos;s what&apos;s happening in your institution today. Monitor live metrics, track attendance, and overview financial statuses in real-time.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm w-full sm:w-auto">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">Live Sync</span>
                        </div>
                        <div className="flex w-full sm:w-auto items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-sm text-xs font-bold text-zinc-600 dark:text-zinc-300 tabular-nums">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            {format(currentTime, 'MMM dd, yyyy • hh:mm a')}
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Students"
                        value={overview?.totalStudents || 0}
                        icon={GraduationCap}
                        colorClass="text-blue-500 dark:text-blue-400 shadow-blue-500/20"
                        gradientClass="bg-blue-500"
                    />
                    <StatCard
                        title="Active Teachers"
                        value={overview?.totalTeachers || 0}
                        icon={Users}
                        colorClass="text-purple-500 dark:text-purple-400 shadow-purple-500/20"
                        gradientClass="bg-purple-500"
                    />
                    <StatCard
                        title="Collected Fees"
                        value={`₹${(overview?.totalCollected || 0).toLocaleString()}`}
                        icon={Wallet}
                        colorClass="text-emerald-500 dark:text-emerald-400 shadow-emerald-500/20"
                        gradientClass="bg-emerald-500"
                        isProtected permission={PERMISSIONS.FEE_VIEW}
                    />
                    <StatCard
                        title="Pending Dues"
                        value={`₹${(overview?.totalDue || 0).toLocaleString()}`}
                        icon={TrendingUp}
                        colorClass="text-rose-500 dark:text-rose-400 shadow-rose-500/20"
                        gradientClass="bg-rose-500"
                        isProtected permission={PERMISSIONS.FEE_VIEW}
                    />
                </div>

                {/* Main Charts Level 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Class Distribution */}
                    <div className="lg:col-span-2 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-sm flex flex-col min-h-[420px] overflow-hidden">
                        <div className="p-6 border-b border-zinc-100/50 dark:border-zinc-800/30 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50">
                            <div>
                                <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-xl text-primary"><BookOpen className="h-4 w-4" /></div>
                                    Enrollment Demographics
                                </h2>
                                <p className="text-sm font-medium text-zinc-500 mt-1">Student distribution across all registered classes</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hidden sm:flex"><MoreHorizontal className="h-5 w-5 text-zinc-500" /></Button>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            {classDistribution?.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                                    {classDistribution.map((c: any, index: number) => {
                                        const percent = maxStudents > 0 ? (c.students / maxStudents) * 100 : 0;
                                        return (
                                            <div key={index} className="group p-5 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-primary transition-colors pr-2">
                                                        Class {c.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-1.5 mb-4">
                                                    <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-none tabular-nums">
                                                        {c.students}
                                                    </span>
                                                    <span className="text-xs font-bold text-zinc-400">Stds</span>
                                                </div>
                                                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary/80 dark:bg-primary rounded-full transition-all duration-1000 ease-out group-hover:bg-primary"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-3 min-h-[250px]">
                                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"><BookOpen className="h-8 w-8 text-zinc-400" /></div>
                                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">No class data found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance */}
                    <div className="lg:col-span-1 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-sm flex flex-col min-h-[420px] overflow-hidden">
                        <div className="p-6 border-b border-zinc-100/50 dark:border-zinc-800/30 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50">
                            <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500 dark:text-blue-400"><UserCheck className="h-4 w-4" /></div>
                                Live Attendance
                            </h2>
                        </div>
                        <PermissionGate required={PERMISSIONS.ATTENDANCE_VIEW} fallback={
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 space-y-3 p-8">
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"><Lock className="h-8 w-8 text-zinc-400" /></div>
                                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">View Restricted</p>
                            </div>
                        }>
                            <div className="p-6 pb-0">
                                <p className="text-sm font-medium text-zinc-500 mb-2">Today&apos;s campus presence breakdown</p>
                            </div>
                            <div className="flex-1 relative w-full h-[280px] p-2">
                                <Chart
                                    chartType="PieChart"
                                    width="100%"
                                    height="100%"
                                    data={attendanceChartData}
                                    options={attendanceOptions}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                    <span className="text-4xl font-black text-zinc-900 dark:text-white leading-none tracking-tight">
                                        {todaysAttendance?.find((a: any) => a.status === 'PRESENT')?.count || 0}
                                    </span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">Present</span>
                                </div>
                            </div>
                        </PermissionGate>
                    </div>
                </div>

                {/* Main Charts Level 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Financial Overview */}
                    <div className="lg:col-span-2">
                        <PermissionGate required={PERMISSIONS.FEE_VIEW} fallback={
                            <div className="bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-md border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center p-12 opacity-70 h-full min-h-[420px]">
                                <div className="p-4 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-2xl mb-3"><Lock className="h-8 w-8 text-zinc-500" /></div>
                                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Financial Reports Restricted</p>
                            </div>
                        }>
                            <div className="bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-sm flex flex-col h-full min-h-[420px] overflow-hidden">
                                <div className="p-6 border-b border-zinc-100/50 dark:border-zinc-800/30 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50">
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400"><Wallet className="h-4 w-4" /></div>
                                            Financial Overview
                                        </h2>
                                        <p className="text-sm font-medium text-zinc-500 mt-1">Current month collection vs pending dues</p>
                                    </div>
                                </div>
                                <div className="flex-1 w-full flex items-center justify-center p-6">
                                    {(overview?.totalCollected || overview?.totalDue) ? (
                                        <div className="w-full h-full max-h-[320px]">
                                            <Chart
                                                chartType="PieChart"
                                                width="100%"
                                                height="100%"
                                                data={revenueChartData}
                                                options={revenueOptions}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"><Wallet className="h-8 w-8 text-zinc-400" /></div>
                                            <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No financial data</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </PermissionGate>
                    </div>

                    {/* Notice Board */}
                    <div className="lg:col-span-1 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-sm flex flex-col h-full min-h-[420px] overflow-hidden">
                        <div className="p-6 border-b border-zinc-100/50 dark:border-zinc-800/30 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50">
                            <h2 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400"><Bell className="h-4 w-4" /></div>
                                Notice Board
                            </h2>
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">View All</Button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3">
                            {recentNotices?.length > 0 ? recentNotices.map((notice: any) => (
                                <div key={notice.id} className="group flex items-start gap-4 p-4 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-white dark:hover:bg-zinc-900 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/50 hover:shadow-md">
                                    <div className="h-12 w-12 shrink-0 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-zinc-700 dark:text-zinc-300 flex flex-col items-center justify-center group-hover:border-primary/30 group-hover:text-primary transition-colors">
                                        <span className="text-[10px] font-black uppercase leading-none mb-1 opacity-70">{format(new Date(notice.createdAt), 'MMM')}</span>
                                        <span className="text-lg font-black leading-none">{format(new Date(notice.createdAt), 'dd')}</span>
                                    </div>
                                    <div className="space-y-1.5 flex-1 pr-1">
                                        <p className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-primary transition-colors">{notice.title}</p>
                                        <p className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 opacity-80">
                                            <Clock className="h-3.5 w-3.5" /> {format(new Date(notice.createdAt), 'hh:mm a')}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-3 min-h-[250px]">
                                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"><Bell className="h-8 w-8 text-zinc-400" /></div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No active notices</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </PermissionGate>
    );
}