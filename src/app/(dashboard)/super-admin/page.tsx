/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Building2,
    Users,
    GraduationCap,
    Activity,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import api from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Enterprise Color Themes for Super Admin ---
const THEMES = {
  indigo: { bg: "bg-indigo-50/50 dark:bg-indigo-500/5", border: "border-indigo-100/50 dark:border-indigo-500/20", iconBg: "bg-indigo-100 dark:bg-indigo-500/20", iconText: "text-indigo-600 dark:text-indigo-400" },
  blue: { bg: "bg-blue-50/50 dark:bg-blue-500/5", border: "border-blue-100/50 dark:border-blue-500/20", iconBg: "bg-blue-100 dark:bg-blue-500/20", iconText: "text-blue-600 dark:text-blue-400" },
  violet: { bg: "bg-violet-50/50 dark:bg-violet-500/5", border: "border-violet-100/50 dark:border-violet-500/20", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconText: "text-violet-600 dark:text-violet-400" },
  emerald: { bg: "bg-emerald-50/50 dark:bg-emerald-500/5", border: "border-emerald-100/50 dark:border-emerald-500/20", iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconText: "text-emerald-600 dark:text-emerald-400" },
};

function StatsCard({ title, value, icon: Icon, desc, theme = "indigo" }: any) {
    const styles = THEMES[theme as keyof typeof THEMES];
    
    return (
        <Card className={cn("relative overflow-hidden border transition-all duration-300 hover:shadow-md", styles.border, styles.bg)}>
            <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-60 pointer-events-none", styles.iconBg)} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/5", styles.iconBg, styles.iconText)}>
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
                <p className="mt-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", styles.iconBg.replace('bg-', 'bg-').replace('/20', ''))} />
                    {desc}
                </p>
            </CardContent>
        </Card>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-sm ring-1 ring-black/5">
                <p className="font-bold text-slate-900 dark:text-white mb-1.5 capitalize">{label} Plan</p>
                <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {payload[0].value} <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">Schools</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function SuperAdminDashboard() {
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ["superAdminStats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/super-admin");
            return res.data.data;
        },
    });

    if (isLoading || !stats) {
        return <div className="p-8 flex items-center justify-center h-[50vh] text-slate-500 font-bold text-[15px] animate-pulse">Loading SaaS analytics...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500 font-bold text-[15px]">Failed to load dashboard data.</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-800">
                        <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Global SaaS Overview</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium ml-12">
                    Monitor platform usage, subscriptions, and global metrics.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Schools"
                    value={stats.totalSchools}
                    icon={Building2}
                    desc={`${stats.activeSchools} Active / ${stats.inactiveSchools} Inactive`}
                    theme="indigo"
                />
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={GraduationCap}
                    desc="Across all institutions"
                    theme="blue"
                />
                <StatsCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={Users}
                    desc="Registered educators"
                    theme="violet"
                />
                <StatsCard
                    title="System Health"
                    value="99.9%"
                    icon={Activity}
                    desc="Uptime status"
                    theme="emerald"
                />
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-[#0c0d14] border-b border-slate-100 dark:border-slate-800/60 pb-4">
                        <CardTitle className="font-bold text-[15px] flex items-center gap-2">
                           <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <Activity className="h-4 w-4" />
                            </div>
                            Subscription Overview
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Distribution of schools across different pricing plans
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.planDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                <XAxis
                                    dataKey="plan"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dx={-10}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
                                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1000} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-[#0c0d14] border-b border-slate-100 dark:border-slate-800/60 pb-4">
                        <CardTitle className="font-bold text-[15px] flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Building2 className="h-4 w-4" />
                            </div>
                            Recent Registrations
                        </CardTitle>
                        <CardDescription className="text-xs">Newest schools joined the platform</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 h-[340px] overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {stats.recentSchools.map((school: any) => (
                                <div key={school.id} className="p-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <AvatarImage src={school.logo} alt={school.name} className="object-cover" />
                                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-900/50 dark:text-indigo-400">
                                            {school.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-0.5 flex-1 overflow-hidden">
                                        <p className="text-[13px] font-bold leading-tight text-slate-900 dark:text-white truncate">{school.name}</p>
                                        <p className="text-[11px] font-medium text-slate-500 truncate">
                                            {school.slug}.yourdomain.com
                                        </p>
                                    </div>
                                    <div className="ml-3 font-medium">
                                        <Badge 
                                            variant={school.isActive ? "secondary" : "destructive"} 
                                            className={cn(
                                                "text-[9px] font-black tracking-widest uppercase border-0 shadow-none px-2",
                                                school.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""
                                            )}
                                        >
                                            {school.plan}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}