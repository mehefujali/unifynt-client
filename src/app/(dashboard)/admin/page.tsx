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

// --- Enterprise Minimal Color Palette ---
const COLOR_THEMES = {
  blue: { bg: "bg-blue-50/50 dark:bg-blue-500/5", border: "border-blue-100/50 dark:border-blue-500/20", iconBg: "bg-blue-100 dark:bg-blue-500/20", iconText: "text-blue-600 dark:text-blue-400" },
  emerald: { bg: "bg-emerald-50/50 dark:bg-emerald-500/5", border: "border-emerald-100/50 dark:border-emerald-500/20", iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconText: "text-emerald-600 dark:text-emerald-400" },
  violet: { bg: "bg-violet-50/50 dark:bg-violet-500/5", border: "border-violet-100/50 dark:border-violet-500/20", iconBg: "bg-violet-100 dark:bg-violet-500/20", iconText: "text-violet-600 dark:text-violet-400" },
  amber: { bg: "bg-amber-50/50 dark:bg-amber-500/5", border: "border-amber-100/50 dark:border-amber-500/20", iconBg: "bg-amber-100 dark:bg-amber-500/20", iconText: "text-amber-600 dark:text-amber-400" },
  rose: { bg: "bg-rose-50/50 dark:bg-rose-500/5", border: "border-rose-100/50 dark:border-rose-500/20", iconBg: "bg-rose-100 dark:bg-rose-500/20", iconText: "text-rose-600 dark:text-rose-400" },
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

// --- Custom Components ---

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, theme = "blue" }: any) => {
  const styles = COLOR_THEMES[theme as keyof typeof COLOR_THEMES];

  return (
    <Card className={cn("relative overflow-hidden border transition-all duration-300 hover:shadow-md", styles.border, styles.bg)}>
      {/* Subtle Glow Effect */}
      <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-60 pointer-events-none", styles.iconBg)} />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/5", styles.iconBg, styles.iconText)}>
          <Icon className="h-4 w-4" strokeWidth={2.5} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-muted-foreground">
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
      <div className="bg-white dark:bg-[#0f111a] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl text-sm ring-1 ring-black/5">
        <p className="font-bold text-slate-900 dark:text-white mb-1.5">{label}</p>
        <p className="text-[13px] font-bold flex items-center gap-2" style={{ color: payload[0].fill }}>
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill }} />
          {currency ? `₹${payload[0].value.toLocaleString()}` : payload[0].value}
          <span className="text-slate-500 dark:text-slate-400 font-medium ml-1">{currency ? "" : "Students"}</span>
        </p>
      </div>
    );
  }
  return null;
};

// --- Main Page Component ---
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
    { name: "Pending Dues", value: totalDue, fill:  "#f43f5e" },
  ];

  const recentNotices = stats?.recentNotices || [];

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-1 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl shadow-sm ring-1 ring-blue-200 dark:ring-blue-800">
            <School className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Executive Dashboard</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[13px] font-medium ml-12">
          Real-time operational insights for your institution.
        </p>
      </div>

      {/* Top Metrics Grid with Distinct Colorful Themes */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Charts Grid Row 1 */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-[#0c0d14] border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="font-bold text-[15px] flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Activity className="h-4 w-4" />
              </div>
              Daily Attendance Overview
            </CardTitle>
            <CardDescription className="text-xs">Current status of student presence.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] w-full pt-6">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No attendance data for today." />
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-[#0c0d14] border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="font-bold text-[15px] flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                <Users className="h-4 w-4" />
              </div>
              Student Demographics
            </CardTitle>
            <CardDescription className="text-xs">Gender distribution ratio.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] w-full flex items-center justify-center pt-6">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {genderData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                    <Label
                      value={totalStudents}
                      position="center"
                      className="text-[28px] font-black fill-slate-900 dark:fill-white"
                    />
                    <Label
                      value="Total"
                      position="center"
                      dy={24}
                      className="text-[11px] font-bold uppercase tracking-widest fill-slate-500"
                    />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No gender data available." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-[#0c0d14] border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <CardTitle className="font-bold text-[15px] flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <IndianRupee className="h-4 w-4" />
              </div>
              Financial Health
            </CardTitle>
            <CardDescription className="text-xs">Collected fees vs pending dues.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `₹${(value / 1000)}k`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: "hsl(var(--foreground))" }} width={90} />
                <Tooltip content={<CustomTooltip currency={true} />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24} animationDuration={1000}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Digital Notice Board */}
        <Card className="col-span-4 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0c0d14]">
            <div className="flex flex-col gap-1">
              <CardTitle className="font-bold text-[15px] flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                  <BellRing className="h-4 w-4" />
                </div>
                Notice Board
              </CardTitle>
            </div>
            {recentNotices.length > 0 && (
              <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-400 px-2 py-0.5 text-[10px] font-black tracking-widest uppercase shadow-none border-0">
                {recentNotices.length} New
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0 h-[300px] overflow-y-auto custom-scrollbar bg-white dark:bg-[#09090b]">
            {recentNotices.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentNotices.map((notice: any) => (
                  <div key={notice.id} className="p-4 flex flex-col gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-l-[3px] border-l-transparent hover:border-l-rose-500">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 dark:text-white text-[13px] leading-tight">{notice.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap ml-3 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">
                        {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
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

// --- Helpers ---

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-6 p-4 md:p-8 min-h-screen">
    <div className="space-y-2 pb-4 border-b border-border">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-1/5" />
    </div>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
    </div>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
      <Skeleton className="h-[380px] rounded-xl col-span-4" />
      <Skeleton className="h-[380px] rounded-xl col-span-3" />
    </div>
  </div>
);

const DashboardError = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl ring-1 ring-red-200 dark:ring-red-900/50">
      <Activity className="h-8 w-8 text-red-600 dark:text-red-400" />
    </div>
    <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Failed to load dashboard</h2>
    <p className="text-slate-500 text-sm font-medium text-center">
      Could not connect to the server. Please try again.
    </p>
  </div>
);

const EmptyState = ({ message, icon: Icon = Activity }: any) => (
  <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-600">
    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
       <Icon className="h-6 w-6" />
    </div>
    <p className="font-medium text-[13px]">{message}</p>
  </div>
);