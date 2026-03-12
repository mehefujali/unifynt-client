/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Users, TrendingUp, GraduationCap, Wallet, Bell,
    Clock, Lock, MoreHorizontal, UserCheck,
    BookOpen, CalendarDays, Activity, ShieldCheck,
    ArrowUpRight, Target, ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Chart } from "react-google-charts";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { AnnouncementModal } from "@/components/dashboard/announcement-modal";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDark, setIsDark] = useState(false);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        const checkDark = () => document.documentElement.classList.contains("dark");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsDark(checkDark());

        const observer = new MutationObserver(() => setIsDark(checkDark()));
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        return () => {
            clearInterval(timer);
            observer.disconnect();
        };
    }, []);

    const displayName = user?.details?.firstName
        ? `${user.details.firstName} ${user.details.lastName || ""}`.trim()
        : user?.name || "";

    const textColor = isDark ? "#a1a1aa" : "#71717a";
    const gridColor = isDark ? "#27272a" : "#f1f5f9";

    const { data: response, isLoading, isError } = useQuery({
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
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
                        <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
                    <div className="xl:col-span-2 h-[400px] bg-card border border-border rounded-xl animate-pulse" />
                    <div className="xl:col-span-1 h-[400px] bg-card border border-border rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 p-8 pt-6 flex flex-col items-center justify-center h-[80vh]">
                <ShieldCheck className="h-12 w-12 text-destructive opacity-50 mb-4" />
                <h3 className="text-lg font-bold">Campus Hub Offline</h3>
                <p className="text-sm text-muted-foreground mt-1">Unable to stream administrative metrics from the core server.</p>
                <Button variant="outline" className="mt-6 font-bold" onClick={() => queryClient.invalidateQueries({ queryKey: ["adminStats"] })}>Reconnect</Button>
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
            return "#6366f1"; // Indigo
        });
    }

    const commonPieOptions = {
        backgroundColor: "transparent",
        pieHole: 0.8,
        chartArea: { width: "90%", height: "80%" },
        legend: {
            position: "bottom",
            alignment: "center",
            textStyle: { color: textColor, fontSize: 11, fontName: 'Inter', bold: true }
        },
        pieSliceBorderColor: "transparent",
        pieSliceText: "none",
        animation: { startup: true, duration: 800, easing: "out" },
        tooltip: { textStyle: { fontName: 'Inter', fontSize: 12 } },
    };

    const attendanceOptions = {
        ...commonPieOptions,
        colors: getAttendanceColors(),
    };

    const revenueChartData = [
        ["Type", "Amount"],
        ["Collected", overview?.totalCollected || 0],
        ["Due", overview?.totalDue || 0],
    ];

    const revenueOptions = {
        ...commonPieOptions,
        colors: ["#10b981", "#cbd5e1"],
    };

    const StatCard = ({ title, value, icon: Icon, color, isProtected = false, permission = "" }: any) => {
        const card = (
            <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-3 transition-all hover:shadow-md h-full flex flex-col justify-center">
                <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className={cn("p-2 rounded-lg bg-muted/30 border border-border", color)}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</h3>
                </div>
            </div>
        );

        if (isProtected) {
            return (
                <PermissionGate required={permission} fallback={
                    <div className="bg-muted/10 border border-dashed border-border p-6 rounded-xl flex flex-col items-center justify-center text-center h-full opacity-60">
                        <Lock className="h-4 w-4 text-muted-foreground mb-2" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Access Restricted</p>
                    </div>
                }>
                    {card}
                </PermissionGate>
            );
        }
        return card;
    };

    function DashboardCard({ title, icon: Icon, children, className, action }: any) {
        return (
            <div className={cn("bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden", className)}>
                <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        {Icon && <Icon className="h-3.5 w-3.5 font-bold" />} {title}
                    </h2>
                    {action}
                </div>
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <PermissionGate
            required={PERMISSIONS.DASHBOARD_VIEW}
            fallback={
                <div className="flex-1 p-8 pt-6 flex flex-col items-center justify-center min-h-[80vh]">
                    <div className="max-w-md text-center space-y-6">
                        <div className="mx-auto h-20 w-20 bg-muted rounded-2xl flex items-center justify-center border border-border">
                            <Activity className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">{greeting}, {displayName}!</h1>
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                Welcome to the Unifynt Platform. Your workspace is ready. Use the sidebar to navigate to your assigned administrative modules.
                            </p>
                        </div>
                        <div className="p-4 bg-muted/30 border border-border rounded-xl inline-flex items-center gap-3">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold tabular-nums text-muted-foreground">
                                {format(currentTime, 'EEEE, MMM dd, yyyy')}
                            </span>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex-1 space-y-6 p-8 pt-6">
                <AnnouncementModal />

                {/* header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider py-0.5 border-primary/20 bg-primary/5 text-primary">
                                System Active
                            </Badge>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            {greeting}, {displayName}
                        </h2>
                        <p className="text-sm text-muted-foreground font-medium">
                            Global overview of your institution&apos;s operational and financial health.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-card border border-border p-1.5 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border text-[11px] font-bold text-muted-foreground tabular-nums uppercase tracking-tight">
                            <CalendarDays className="h-3.5 w-3.5 text-primary" />
                            {format(currentTime, 'MMM dd, yyyy • hh:mm a')}
                        </div>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Enrollment"
                        value={overview?.totalStudents || 0}
                        icon={GraduationCap}
                        color="text-primary"
                    />
                    <StatCard
                        title="Faculty"
                        value={overview?.totalTeachers || 0}
                        icon={Users}
                        color="text-indigo-500"
                    />
                    <StatCard
                        title="Collections"
                        value={`₹${(overview?.totalCollected || 0).toLocaleString()}`}
                        icon={Wallet}
                        color="text-emerald-500"
                        isProtected permission={PERMISSIONS.FEE_VIEW}
                    />
                    <StatCard
                        title="Outstanding"
                        value={`₹${(overview?.totalDue || 0).toLocaleString()}`}
                        icon={TrendingUp}
                        color="text-rose-500"
                        isProtected permission={PERMISSIONS.FEE_VIEW}
                    />
                </div>

                {/* Distribution & Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Class Distribution" icon={BookOpen} className="lg:col-span-2">
                        <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
                            {classDistribution?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {classDistribution.map((c: any, index: number) => {
                                        const percent = maxStudents > 0 ? (c.students / maxStudents) * 100 : 0;
                                        return (
                                            <div key={index} className="space-y-2 group">
                                                <div className="flex justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">Class {c.name}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">Roster Capacity</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xl font-bold text-foreground tabular-nums">{c.students}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">Students</span>
                                                    </div>
                                                </div>
                                                <Progress value={percent} className="h-1.5" />
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <BookOpen className="h-12 w-12 mb-3" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No enrollment data</p>
                                </div>
                            )}
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Daily Presence" icon={UserCheck}>
                        <PermissionGate required={PERMISSIONS.ATTENDANCE_VIEW} fallback={
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                <Lock className="h-8 w-8 mb-3" />
                                <p className="text-xs font-bold uppercase tracking-widest leading-loose">Attendance Ledger<br />Restricted</p>
                            </div>
                        }>
                            <div className="h-[400px] relative flex flex-col">
                                <div className="flex-1 relative mt-4">
                                    <Chart
                                        chartType="PieChart"
                                        width="100%"
                                        height="100%"
                                        data={attendanceChartData}
                                        options={attendanceOptions}
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                                        <span className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                                            {todaysAttendance?.find((a: any) => a.status === 'PRESENT')?.count || 0}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">On Campus</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/20 border-t border-border mt-auto">
                                    <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest">Live Attendance Stream</p>
                                </div>
                            </div>
                        </PermissionGate>
                    </DashboardCard>
                </div>

                {/* Financials & Notices */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Revenue Stream" icon={Wallet} className="lg:col-span-2">
                        <PermissionGate required={PERMISSIONS.FEE_VIEW} fallback={
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                                <Lock className="h-10 w-10 mb-3" />
                                <p className="text-xs font-bold uppercase tracking-widest">Financial Analytics Restricted</p>
                            </div>
                        }>
                            <div className="h-[360px] flex items-center justify-center">
                                {(overview?.totalCollected || overview?.totalDue) ? (
                                    <Chart
                                        chartType="PieChart"
                                        width="100%"
                                        height="100%"
                                        data={revenueChartData}
                                        options={revenueOptions}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <Wallet className="h-12 w-12 mb-3" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No collection history</p>
                                    </div>
                                )}
                            </div>
                        </PermissionGate>
                    </DashboardCard>

                    <DashboardCard
                        title="Internal Notices"
                        icon={Bell}
                        action={<Button variant="ghost" size="sm" className="h-6 text-[9px] font-bold uppercase tracking-widest px-2">Registry</Button>}
                    >
                        <div className="p-2 space-y-1 h-[360px] overflow-y-auto custom-scrollbar">
                            {recentNotices?.length > 0 ? recentNotices.map((notice: any) => (
                                <div key={notice.id} className="group flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-all cursor-pointer border border-transparent hover:border-border/50">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-background border border-border flex flex-col items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                        <span className="text-[8px] font-bold uppercase leading-none mb-1 opacity-70">{format(new Date(notice.createdAt), 'MMM')}</span>
                                        <span className="text-sm font-black leading-none">{format(new Date(notice.createdAt), 'dd')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">{notice.title}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Clock className="h-3 w-3 text-muted-foreground opacity-60" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(notice.createdAt), 'hh:mm a')}</span>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity mt-1" />
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                    <Bell className="h-10 w-10 mb-3" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">Empty Bulletin</p>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </PermissionGate>
    );
}