/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Users,
    GraduationCap,
    IndianRupee,
    CalendarCheck,
    BellRing,
    TrendingUp,
    Activity,
    School,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    Label,
} from "recharts";

import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COLOR_THEMES = {
    blue: { iconBg: "bg-blue-500/10 dark:bg-blue-500/20", iconText: "text-blue-600 dark:text-blue-400" },
    emerald: { iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20", iconText: "text-emerald-600 dark:text-emerald-400" },
    violet: { iconBg: "bg-violet-500/10 dark:bg-violet-500/20", iconText: "text-violet-600 dark:text-violet-400" },
    amber: { iconBg: "bg-amber-500/10 dark:bg-amber-500/20", iconText: "text-amber-600 dark:text-amber-400" },
    rose: { iconBg: "bg-rose-500/10 dark:bg-rose-500/20", iconText: "text-rose-600 dark:text-rose-400" },
};

const CHART_COLORS = {
    primary: "#3b82f6",
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
    muted: "#94a3b8"
};

const ATTENDANCE_COLORS = {
    PRESENT: CHART_COLORS.success,
    ABSENT: CHART_COLORS.danger,
    LATE: CHART_COLORS.warning,
    LEAVE: CHART_COLORS.primary,
};

const GENDER_COLORS = [CHART_COLORS.primary, CHART_COLORS.danger, CHART_COLORS.warning];

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, theme = "blue" }: any) => {
    const styles = COLOR_THEMES[theme as keyof typeof COLOR_THEMES];

    return (
        <Card className="relative overflow-hidden rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-all duration-300 hover:shadow-lg hover:bg-white/50 dark:hover:bg-white/5 hover:-translate-y-1">
            <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-60 pointer-events-none", styles.iconBg)} />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-[13px] font-bold text-slate-500 dark:text-slate-400">{title}</CardTitle>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-sm backdrop-blur-md", styles.iconBg, styles.iconText)}>
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">{value}</div>
                <div className="flex items-center gap-1.5 mt-2 w-fit px-2 py-0.5 rounded-full bg-white/60 dark:bg-white/10 text-[12px] font-bold text-slate-600 dark:text-slate-300 border border-black/5 dark:border-white/5 backdrop-blur-md">
                    {trend && <TrendingUp className={cn("h-3.5 w-3.5", styles.iconText)} />}
                    <span>{subtitle}</span>
                </div>
            </CardContent>
        </Card>
    );
};

const CustomTooltip = ({ active, payload, label, currency = false }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/60 dark:border-white/10 p-3 rounded-2xl shadow-xl text-sm ring-1 ring-black/5">
                <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label}</p>
                <p className="text-[13px] font-bold flex items-center gap-2" style={{ color: payload[0].fill }}>
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: payload[0].fill }} />
                    {currency ? `₹${payload[0].value.toLocaleString()}` : payload[0].value}
                    <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">{currency ? "" : "Students"}</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function SchoolAdminDashboard() {
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ["schoolAdminDashboard"],
        queryFn: async () => {
            const res = await api.get("/dashboard/school-admin");
            return res.data;
        },
    });

    if (isLoading) return <DashboardSkeleton />;
    if (isError || !response?.data) return <DashboardError />;

    const stats = response.data;

    const todaysAttendance = stats?.todaysAttendance || [];
    const attendanceData = todaysAttendance.map((item: any) => ({
        name: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
        value: item.count,
        fill: ATTENDANCE_COLORS[item.status as keyof typeof ATTENDANCE_COLORS] || CHART_COLORS.muted,
    }));

    const totalStudents = stats?.totalStudents || 0;
    const totalPresent = todaysAttendance.find((a: any) => a.status === "PRESENT")?.count || 0;
    const attendancePercentage = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

    const genderData = (stats?.genderRatio || []).map((item: any) => ({
        name: item.name.charAt(0) + item.name.slice(1).toLowerCase(),
        value: item.value,
    }));

    const totalCollected = stats?.financialOverview?.totalCollected || 0;
    const totalDue = stats?.financialOverview?.totalDue || 0;
    const totalBilled = totalCollected + totalDue;
    const collectionPercentage = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    const financialData = [
        { name: "Collected", value: totalCollected, fill: CHART_COLORS.success },
        { name: "Pending Dues", value: totalDue, fill: "#f43f5e" },
    ];

    const recentNotices = stats?.recentNotices || [];

    return (
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-[0.99] duration-700 ease-out">
            <div className="flex flex-col gap-1 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-white/10">
                        <School className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">Executive Dashboard</h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[14px] font-medium ml-[60px]">
                    Real-time operational insights for your institution.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Students"
                    value={totalStudents.toLocaleString()}
                    subtitle="Active Enrollments"
                    icon={Users}
                    trend={true}
                    theme="blue"
                />
                <MetricCard
                    title="Total Teachers"
                    value={(stats?.totalTeachers || 0).toLocaleString()}
                    subtitle="Current Faculty"
                    icon={GraduationCap}
                    trend={true}
                    theme="violet"
                />
                <MetricCard
                    title="Today's Attendance"
                    value={`${attendancePercentage}%`}
                    subtitle={`${totalPresent} students present`}
                    icon={CalendarCheck}
                    theme="emerald"
                />
                <MetricCard
                    title="Fee Collection"
                    value={`₹${(totalCollected / 1000).toFixed(1)}k`}
                    subtitle={`${collectionPercentage}% of total billed`}
                    icon={IndianRupee}
                    trend={true}
                    theme="amber"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white/50 dark:hover:bg-white/5">
                    <CardHeader className="bg-white/30 dark:bg-black/10 border-b border-black/5 dark:border-white/5 pb-4 backdrop-blur-xl">
                        <CardTitle className="font-extrabold text-[16px] flex items-center gap-2 text-slate-900 dark:text-white">
                            <div className="p-1.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                <Activity className="h-4 w-4" />
                            </div>
                            Daily Attendance Overview
                        </CardTitle>
                        <CardDescription className="text-[13px] font-medium text-slate-500">Current status of student presence.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[340px] w-full pt-6">
                        {attendanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" opacity={0.4} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "currentColor" }} className="text-slate-500" dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "currentColor" }} className="text-slate-500" dx={-10} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "currentColor", opacity: 0.05 }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45} animationDuration={1000} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No attendance data for today." />
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3 rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white/50 dark:hover:bg-white/5">
                    <CardHeader className="bg-white/30 dark:bg-black/10 border-b border-black/5 dark:border-white/5 pb-4 backdrop-blur-xl">
                        <CardTitle className="font-extrabold text-[16px] flex items-center gap-2 text-slate-900 dark:text-white">
                            <div className="p-1.5 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                                <Users className="h-4 w-4" />
                            </div>
                            Student Demographics
                        </CardTitle>
                        <CardDescription className="text-[13px] font-medium text-slate-500">Gender distribution ratio.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[340px] w-full flex items-center justify-center pt-6">
                        {genderData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={85}
                                        outerRadius={115}
                                        paddingAngle={4}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={8}
                                    >
                                        {genderData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                                        ))}
                                        <Label
                                            value={totalStudents}
                                            position="center"
                                            className="text-[32px] font-black fill-slate-900 dark:fill-white"
                                        />
                                        <Label
                                            value="Total"
                                            position="center"
                                            dy={28}
                                            className="text-[12px] font-bold uppercase tracking-widest fill-slate-500"
                                        />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '13px', fontWeight: 700 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState message="No gender data available." />
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3 rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white/50 dark:hover:bg-white/5">
                    <CardHeader className="bg-white/30 dark:bg-black/10 border-b border-black/5 dark:border-white/5 pb-4 backdrop-blur-xl">
                        <CardTitle className="font-extrabold text-[16px] flex items-center gap-2 text-slate-900 dark:text-white">
                            <div className="p-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                <IndianRupee className="h-4 w-4" />
                            </div>
                            Financial Health
                        </CardTitle>
                        <CardDescription className="text-[13px] font-medium text-slate-500">Collected fees vs pending dues.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px] w-full pt-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" opacity={0.4} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "currentColor" }} className="text-slate-500" tickFormatter={(value) => `₹${(value / 1000)}k`} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 800, fill: "currentColor" }} className="text-slate-700 dark:text-slate-300" width={100} />
                                <Tooltip content={<CustomTooltip currency={true} />} cursor={{ fill: "currentColor", opacity: 0.05 }} />
                                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32} animationDuration={1000}>
                                    {financialData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-4 rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-white/50 dark:hover:bg-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-xl">
                        <div className="flex flex-col gap-1">
                            <CardTitle className="font-extrabold text-[16px] flex items-center gap-2 text-slate-900 dark:text-white">
                                <div className="p-1.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                    <BellRing className="h-4 w-4" />
                                </div>
                                Notice Board
                            </CardTitle>
                        </div>
                        {recentNotices.length > 0 && (
                            <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-[11px] font-black tracking-widest uppercase shadow-sm border border-rose-500/20 backdrop-blur-md">
                                {recentNotices.length} New
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 h-[320px] overflow-y-auto custom-scrollbar">
                        {recentNotices.length > 0 ? (
                            <div className="divide-y divide-black/5 dark:divide-white/5">
                                {recentNotices.map((notice: any) => (
                                    <div key={notice.id} className="p-5 flex flex-col gap-2 hover:bg-white/60 dark:hover:bg-white/10 transition-colors border-l-[4px] border-l-transparent hover:border-l-rose-500 group">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-extrabold text-slate-900 dark:text-white text-[14px] leading-tight group-hover:text-primary transition-colors">{notice.title}</h4>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap ml-3 bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/10 px-2.5 py-1 rounded-md shadow-sm backdrop-blur-md">
                                                {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                            {notice.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState message="No recent notices published." icon={BellRing} />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const DashboardSkeleton = () => (
    <div className="flex flex-col gap-6 w-full">
        <div className="space-y-3 pb-4 border-b border-black/5 dark:border-white/5">
            <Skeleton className="h-10 w-[300px] rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-xl" />
            <Skeleton className="h-4 w-[200px] rounded-lg bg-white/40 dark:bg-white/5 backdrop-blur-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-[24px] bg-white/40 dark:bg-white/5 backdrop-blur-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Skeleton className="h-[400px] rounded-[24px] col-span-4 bg-white/40 dark:bg-white/5 backdrop-blur-xl" />
            <Skeleton className="h-[400px] rounded-[24px] col-span-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl" />
        </div>
    </div>
);

const DashboardError = () => (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="p-5 bg-red-500/10 rounded-3xl ring-1 ring-red-500/20 backdrop-blur-xl">
            <Activity className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">Failed to load dashboard</h2>
        <p className="text-slate-500 font-medium text-center">
            Could not connect to the server. Please try again later.
        </p>
    </div>
);

const EmptyState = ({ message, icon: Icon = Activity }: any) => (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-600">
        <div className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
            <Icon className="h-8 w-8 text-slate-400" />
        </div>
        <p className="font-bold text-[14px] text-slate-500">{message}</p>
    </div>
);