/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Users, TrendingUp, GraduationCap, Wallet, Bell,
    Clock, ShieldAlert, Lock, MoreHorizontal, UserCheck,
    BookOpen, CalendarDays
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

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const checkDark = () => document.documentElement.classList.contains("dark");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDark(checkDark());

        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        return () => {
            clearInterval(timer);
            observer.disconnect();
        };
    }, []);

    // Theme specific colors for Google Charts
    const textColor = isDark ? "#a1a1aa" : "#52525b"; // zinc-400 : zinc-600
    const gridColor = isDark ? "#27272a" : "#e4e4e7"; // zinc-800 : zinc-200
    const chartBg = "transparent";

    const { data: response, isLoading } = useQuery({
        queryKey: ["adminStats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/school-admin");
            return res.data?.data;
        }
    });

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 space-y-6 animate-pulse">
                <div className="h-10 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 h-[380px] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                    <div className="xl:col-span-1 h-[380px] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                </div>
            </div>
        );
    }

    const { overview, todaysAttendance, classDistribution, recentNotices } = response || {};

    const maxStudents = classDistribution?.length > 0
        ? Math.max(...classDistribution.map((c: any) => c.students || 0))
        : 1;

    // 🟢 Google Chart: Attendance (Donut Chart)
    const attendanceChartData = [
        ["Status", "Count"],
        ...(todaysAttendance?.length > 0
            ? todaysAttendance.map((item: any) => [item.status, item.count])
            : [["No Data", 1]])
    ];

    const getAttendanceColors = () => {
        if (!todaysAttendance || todaysAttendance.length === 0) return [gridColor];
        return todaysAttendance.map((item: any) => {
            if (item.status === 'PRESENT') return "#10b981"; // emerald-500
            if (item.status === 'ABSENT') return "#f43f5e"; // rose-500
            if (item.status === 'LATE') return "#f59e0b"; // amber-500
            return "#6366f1"; // fallback
        });
    }

    const attendanceOptions = {
        backgroundColor: "transparent",
        pieHole: 0.75,
        chartArea: { width: "85%", height: "80%" },
        legend: { position: "bottom", textStyle: { color: textColor, fontSize: 12, fontName: 'Inter, sans-serif', bold: true } },
        colors: getAttendanceColors(),
        pieSliceBorderColor: isDark ? "#09090b" : "#ffffff",
        pieSliceText: "none",
        animation: { startup: true, duration: 1200, easing: "out" },
        tooltip: { textStyle: { fontName: 'Inter, sans-serif' } },
    };

    // 🟢 Google Chart: Financial Overview (Donut Chart)
    const revenueChartData = [
        ["Type", "Amount"],
        ["Collected Fees", overview?.totalCollected || 0],
        ["Pending Dues", overview?.totalDue || 0],
    ];

    const revenueOptions = {
        backgroundColor: "transparent",
        pieHole: 0.75,
        chartArea: { width: "85%", height: "80%" },
        legend: { position: "bottom", alignment: "center", textStyle: { color: textColor, fontSize: 12, fontName: 'Inter, sans-serif', bold: true } },
        colors: ["#10b981", "#f43f5e"],
        pieSliceBorderColor: isDark ? "#09090b" : "#ffffff",
        pieSliceText: "none",
        animation: { startup: true, duration: 1200, easing: "out" },
        tooltip: { textStyle: { fontName: 'Inter, sans-serif' } },
    };

    const hour = currentTime.getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    // --- Clean Reusable Stat Card Component ---
    const StatCard = ({ title, value, icon: Icon, color, bg, isProtected = false, permission = "" }: any) => {
        const content = (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm flex flex-col justify-between group transition-all hover:shadow-md h-full">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
                    <div className={cn("p-2 rounded-lg border", bg)}>
                        <Icon className={cn("h-4 w-4", color)} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">{value}</h3>
                </div>
            </div>
        );

        if (isProtected) {
            return (
                <PermissionGate required={permission} fallback={
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-800 p-6 rounded-xl flex flex-col items-center justify-center text-center h-full opacity-70">
                        <Lock className="h-5 w-5 text-zinc-400 mb-2" />
                        <p className="text-xs font-semibold text-zinc-500">{title} Restricted</p>
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
                <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                    <div className="h-20 w-20 bg-rose-50 dark:bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Access Restricted</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm">
                        You don&apos;t have permission to view the administrative analytics dashboard.
                    </p>
                </div>
            }
        >
            <div className="p-4 md:p-8 space-y-6 bg-zinc-50/50 dark:bg-[#09090b] min-h-screen">

                {/* --- Clean Header Section --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {greeting}, Administrator
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Live institutional metrics and operations monitoring.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Live</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm text-xs font-medium text-zinc-600 dark:text-zinc-300 tabular-nums">
                            <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                            {format(currentTime, 'MMM dd, yyyy • hh:mm a')}
                        </div>
                    </div>
                </div>

                {/* --- Solid Stat Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Students"
                        value={overview?.totalStudents || 0}
                        icon={GraduationCap}
                        color="text-blue-600 dark:text-blue-400"
                        bg="bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20"
                    />
                    <StatCard
                        title="Active Teachers"
                        value={overview?.totalTeachers || 0}
                        icon={Users}
                        color="text-purple-600 dark:text-purple-400"
                        bg="bg-purple-50 border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20"
                    />
                    <StatCard
                        title="Collected Fees"
                        value={`₹${(overview?.totalCollected || 0).toLocaleString()}`}
                        icon={Wallet}
                        color="text-emerald-600 dark:text-emerald-400"
                        bg="bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                        isProtected permission={PERMISSIONS.FEE_VIEW}
                    />
                    <StatCard
                        title="Pending Dues"
                        value={`₹${(overview?.totalDue || 0).toLocaleString()}`}
                        icon={TrendingUp}
                        color="text-rose-600 dark:text-rose-400"
                        bg="bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20"
                        isProtected permission={PERMISSIONS.FEE_VIEW}
                    />
                </div>

                {/* --- Middle Section (Academics & Attendance) --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Class Enrollment Grid */}
                    <div className="xl:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm flex flex-col min-h-[380px]">
                        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-zinc-500" /> Enrollment Demographics
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Student distribution across all classes</p>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs hidden sm:flex"><MoreHorizontal className="h-4 w-4" /></Button>
                        </div>

                        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                            {classDistribution?.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
                                    {classDistribution.map((c: any, index: number) => {
                                        const percent = maxStudents > 0 ? (c.students / maxStudents) * 100 : 0;
                                        return (
                                            <div key={index} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate pr-2">
                                                        Class {c.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline gap-1.5 mb-3">
                                                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-none tabular-nums">
                                                        {c.students}
                                                    </span>
                                                    <span className="text-xs font-medium text-zinc-500">Stds</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-zinc-800 dark:bg-zinc-400 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-2 min-h-[200px]">
                                    <BookOpen className="h-8 w-8 text-zinc-400" />
                                    <p className="text-sm font-medium text-zinc-500">No class data found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Attendance Google Donut Chart */}
                    <div className="xl:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm flex flex-col min-h-[380px]">
                        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-zinc-500" /> Live Attendance
                            </h2>
                        </div>
                        <PermissionGate required={PERMISSIONS.ATTENDANCE_VIEW} fallback={
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 space-y-2">
                                <Lock className="h-8 w-8 text-zinc-400" />
                                <p className="text-sm font-medium text-zinc-500">View Restricted</p>
                            </div>
                        }>
                            <div className="p-5 pb-0">
                                <p className="text-xs text-zinc-500 mb-2">Today&apos;s campus presence</p>
                            </div>
                            <div className="flex-1 relative w-full h-[250px]">
                                <Chart
                                    chartType="PieChart"
                                    width="100%"
                                    height="100%"
                                    data={attendanceChartData}
                                    options={attendanceOptions}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                    <span className="text-3xl font-bold text-zinc-900 dark:text-white leading-none">
                                        {todaysAttendance?.find((a: any) => a.status === 'PRESENT')?.count || 0}
                                    </span>
                                    <span className="text-xs font-medium text-zinc-500 mt-1">Present</span>
                                </div>
                            </div>
                        </PermissionGate>
                    </div>
                </div>

                {/* --- Bottom Section (Finance & Notices) --- */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Finance Google Chart (Protected) */}
                    <PermissionGate required={PERMISSIONS.FEE_VIEW} fallback={
                        <div className="xl:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center p-12 opacity-70">
                            <Lock className="h-6 w-6 text-zinc-400 mb-2" />
                            <p className="text-sm font-medium text-zinc-500">Financial Reports Restricted</p>
                        </div>
                    }>
                        <div className="xl:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm flex flex-col min-h-[380px]">
                            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between shrink-0">
                                <div>
                                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-zinc-500" /> Financial Overview
                                    </h2>
                                    <p className="text-xs text-zinc-500 mt-1">Current month collection vs pending</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full flex items-center justify-center p-4">
                                {(overview?.totalCollected || overview?.totalDue) ? (
                                    <Chart
                                        chartType="PieChart"
                                        width="100%"
                                        height="300px"
                                        data={revenueChartData}
                                        options={revenueOptions}
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-zinc-400">No financial data available</div>
                                )}
                            </div>
                        </div>
                    </PermissionGate>

                    {/* Clean Bulletin Board */}
                    <div className="xl:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm flex flex-col h-[380px]">
                        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between shrink-0">
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Bell className="h-4 w-4 text-zinc-500" /> Notice Board
                            </h2>
                            <Button variant="outline" size="sm" className="h-7 text-xs">View All</Button>
                        </div>
                        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                            {recentNotices?.length > 0 ? recentNotices.map((notice: any) => (
                                <div key={notice.id} className="flex items-start gap-4 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-semibold uppercase leading-none mb-0.5">{format(new Date(notice.createdAt), 'MMM')}</span>
                                        <span className="text-sm font-bold leading-none">{format(new Date(notice.createdAt), 'dd')}</span>
                                    </div>
                                    <div className="space-y-1 flex-1 pr-1">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">{notice.title}</p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                            <Clock className="h-3 w-3" /> {format(new Date(notice.createdAt), 'hh:mm a')}
                                        </p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-2">
                                    <Bell className="h-8 w-8 text-zinc-400" />
                                    <p className="text-sm font-medium text-zinc-500">No active notices</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </PermissionGate>
    );
}