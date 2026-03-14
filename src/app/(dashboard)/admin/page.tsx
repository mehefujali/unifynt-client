/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Users, TrendingUp, GraduationCap, Wallet, Bell,
    Clock, Lock, UserCheck,
    BookOpen, CalendarDays, Activity,
    ArrowUpRight, Fingerprint, ShieldAlert, Briefcase
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
import { useThemeColor } from "@/providers/theme-color-provider";
import PasskeyReminder from "@/components/dashboard/passkey-reminder";

export default function AdminDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isDark, setIsDark] = useState(false);
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { currentThemeId } = useThemeColor();

    const isEnhanced = currentThemeId !== "standard";

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

    const { data: response, isLoading, isError, error } = useQuery({
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
        // If it's a 403 Forbidden (no permission), we want to proceed to render the PermissionGate fallback instead of showing an error screen
        const isForbidden = (error as any)?.response?.status === 403;

        if (!isForbidden) {
            return (
                <div className="flex-1 p-8 pt-6 flex flex-col items-center justify-center h-[80vh]">
                    <ShieldAlert className="h-12 w-12 text-destructive opacity-50 mb-4" />
                    <h3 className="text-lg font-bold">Campus Hub Offline</h3>
                    <p className="text-sm text-muted-foreground mt-1">Unable to stream administrative metrics from the core server.</p>
                    <Button variant="outline" className="mt-6 font-bold" onClick={() => queryClient.invalidateQueries({ queryKey: ["adminStats"] })}>Reconnect</Button>
                </div>
            );
        }
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
            <div className={cn(
                "rounded-xl p-6 space-y-3 transition-all h-full flex flex-col justify-center relative overflow-hidden group",
                isEnhanced 
                    ? "bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20" 
                    : "bg-card border border-border shadow-sm hover:shadow-md"
            )}>
                {/* Decorative Metallic Shine - Only for enhanced themes */}
                {isEnhanced && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-primary/10 transition-colors" />
                )}
                
                <div className="flex items-center justify-between relative z-10">
                    <p className={cn(
                        "font-bold text-muted-foreground uppercase tracking-wider",
                        isEnhanced ? "text-[10px] tracking-[0.2em]" : "text-[11px]"
                    )}>{title}</p>
                    <div className={cn(
                        "p-2 rounded-lg border border-border transition-all",
                        isEnhanced ? "p-2 rounded-lg bg-muted/40 group-hover:bg-primary/5 group-hover:border-primary/20" : "bg-muted/30",
                        color
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className={cn(
                        "font-bold tracking-tight tabular-nums text-foreground",
                        isEnhanced ? "text-2xl font-black tracking-tight" : "text-3xl"
                    )}>{value}</h3>
                    {isEnhanced && (
                        <div className="h-1 w-12 bg-primary/20 rounded-full mt-2 group-hover:w-20 transition-all duration-500" />
                    )}
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
            <div className={cn(
                "flex flex-col overflow-hidden transition-all duration-300",
                isEnhanced 
                    ? "bg-card border border-border/60 shadow-sm rounded-xl" 
                    : "bg-card border border-border rounded-xl shadow-sm",
                className
            )}>
                <div className={cn(
                    "px-6 border-b border-border/40 flex items-center justify-between",
                    isEnhanced ? "py-4 bg-muted/20" : "py-4 bg-muted/30"
                )}>
                    <h2 className={cn(
                        "font-bold uppercase flex items-center gap-2",
                        isEnhanced ? "text-[10px] font-black tracking-[0.2em] text-muted-foreground" : "text-[11px] tracking-widest text-muted-foreground"
                    )}>
                        {Icon && <Icon className={cn("h-3.5 w-3.5", isEnhanced ? "h-4 w-4 text-primary" : "font-bold")} />} {title}
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
                <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {greeting}, {displayName}
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            Welcome to your administrative workspace. Access your assigned modules via the portal menu.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                <Fingerprint className="h-5 w-5" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Institutional ID</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground tabular-nums">{(user as any)?.details?.employeeId || "UN-0000"}</h3>
                            <p className="text-xs text-muted-foreground font-medium">Your unique employee identifier.</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:border-indigo-500/20 transition-all">
                            <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                <Briefcase className="h-5 w-5" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Assigned Dept</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{(user as any)?.details?.department || "General Administration"}</h3>
                            <p className="text-xs text-muted-foreground font-medium">Module access based on department.</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                <Activity className="h-5 w-5" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Security Lock</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">Active</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">Account protected by verification.</p>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 space-y-2 hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-3 text-muted-foreground mb-4">
                                <CalendarDays className="h-5 w-5" />
                                <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Session Date</span>
                            </div>
                            <h3 className="text-xl font-bold text-foreground tabular-nums">{format(currentTime, 'MMM dd, yyyy')}</h3>
                            <p className="text-xs text-muted-foreground font-medium">{format(currentTime, 'EEEE')}</p>
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl border border-dashed border-border bg-muted/5 flex flex-col items-center justify-center text-center space-y-3">
                        <Lock className="h-8 w-8 text-muted-foreground opacity-20" />
                        <div className="space-y-1">
                            <h4 className="font-bold text-sm text-foreground">Restricted Dashboard View</h4>
                            <p className="text-xs text-muted-foreground max-w-sm font-medium">
                                Technical performance metrics and financial streams are restricted based on your role privileges. 
                                Please use the sidebar to access your operational tools.
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex-1 space-y-8 p-8 pt-6 animate-in fade-in duration-500">
                <AnnouncementModal />

                {/* header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {greeting}, {displayName}
                        </h2>
                        <p className="text-muted-foreground text-sm font-medium">
                            Operational overview of institutional metrics and performance indicators.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-xl shadow-sm text-xs font-bold text-muted-foreground tabular-nums uppercase tracking-widest">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {format(currentTime, 'MMM dd, yyyy')}
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
            <PasskeyReminder />
        </PermissionGate>
    );
}