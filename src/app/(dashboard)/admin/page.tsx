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

// --- Enterprise Minimal Color Palette (Works in both Dark & Light Mode) ---
const COLORS = {
  primary: "#3b82f6",   // Blue
  success: "#22c55e",   // Green
  warning: "#f59e0b",   // Amber
  danger: "#ef4444",   // Red
  neutral: "#8b5cf6",   // Purple
  muted: "#64748b",   // Slate
};

const ATTENDANCE_COLORS = {
  PRESENT: COLORS.success,
  ABSENT: COLORS.danger,
  LATE: COLORS.warning,
  LEAVE: COLORS.primary,
};

const GENDER_COLORS = [COLORS.primary, COLORS.danger, COLORS.warning];

// --- Custom Components ---

const MetricCard = ({ title, value, subtitle, icon: Icon, trend }: any) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" strokeWidth={2.5} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-muted-foreground">
          {trend && <TrendingUp className="h-3 w-3 text-green-500" />}
          <span>{subtitle}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomTooltip = ({ active, payload, label, currency = false }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg text-sm">
        <p className="font-bold text-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold" style={{ color: payload[0].fill }}>
          {currency ? `₹${payload[0].value.toLocaleString()}` : payload[0].value}
          <span className="text-muted-foreground font-normal ml-1">{currency ? "" : "Count"}</span>
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

  // Safe Data Processing with Fallbacks
  const todaysAttendance = stats?.todaysAttendance || [];
  const attendanceData = todaysAttendance.map((item: any) => ({
    name: item.status.charAt(0) + item.status.slice(1).toLowerCase(),
    value: item.count,
    fill: ATTENDANCE_COLORS[item.status as keyof typeof ATTENDANCE_COLORS] || COLORS.muted,
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
    { name: "Collected", value: totalCollected, fill: COLORS.success },
    { name: "Pending Dues", value: totalDue, fill: COLORS.danger },
  ];

  const recentNotices = stats?.recentNotices || [];

  return (
    <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-1 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <School className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Executive Dashboard</h1>
        </div>
        <p className="text-muted-foreground text-sm font-medium ml-10">
          Real-time operational insights for your institution.
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Students"
          value={totalStudents.toLocaleString()}
          subtitle="Active Enrollments"
          icon={Users}
          trend={true}
        />
        <MetricCard
          title="Total Teachers"
          value={(stats?.totalTeachers || 0).toLocaleString()}
          subtitle="Current Faculty"
          icon={GraduationCap}
          trend={true}
        />
        <MetricCard
          title="Today's Attendance"
          value={`${attendancePercentage}%`}
          subtitle={`${totalPresent} students present`}
          icon={CalendarCheck}
        />
        <MetricCard
          title="Fee Collection"
          value={`₹${(totalCollected / 1000).toFixed(1)}k`}
          subtitle={`${collectionPercentage}% of total billed`}
          icon={IndianRupee}
          trend={true}
        />
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Attendance Bar Chart */}
        <Card className="col-span-4 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="font-bold text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Daily Attendance Overview
            </CardTitle>
            <CardDescription>Current status of student presence.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] w-full pt-4">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No attendance data for today." />
            )}
          </CardContent>
        </Card>

        {/* Gender Donut Chart */}
        <Card className="col-span-3 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="font-bold text-base">Student Demographics</CardTitle>
            <CardDescription>Gender distribution ratio.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] w-full flex items-center justify-center">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {genderData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                    <Label
                      value={totalStudents}
                      position="center"
                      className="text-2xl font-extrabold fill-foreground"
                    />
                    <Label
                      value="Total"
                      position="center"
                      dy={20}
                      className="text-xs font-medium fill-muted-foreground"
                    />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No gender data available." />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Financial Horizontal Bar Chart */}
        <Card className="col-span-3 shadow-sm border-border">
          <CardHeader>
            <CardTitle className="font-bold text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              Financial Health
            </CardTitle>
            <CardDescription>Collected fees vs pending dues.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(value) => `₹${(value / 1000)}k`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: "hsl(var(--foreground))" }} width={80} />
                <Tooltip content={<CustomTooltip currency={true} />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30} animationDuration={1000}>
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Digital Notice Board */}
        <Card className="col-span-4 shadow-sm border-border overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-muted/30">
            <div className="flex flex-col gap-1">
              <CardTitle className="font-bold text-base flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                Notice Board
              </CardTitle>
            </div>
            {recentNotices.length > 0 && (
              <Badge variant="secondary" className="px-2 py-0.5 text-xs font-semibold">
                {recentNotices.length} New
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-0 h-[280px] overflow-y-auto custom-scrollbar bg-background">
            {recentNotices.length > 0 ? (
              <div className="divide-y divide-border">
                {recentNotices.map((notice: any) => (
                  <div key={notice.id} className="p-4 flex flex-col gap-1.5 hover:bg-muted/40 transition-colors border-l-2 border-l-transparent hover:border-l-primary">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-foreground text-sm leading-tight">{notice.title}</h4>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
  <div className="flex flex-col gap-8 p-8 min-h-screen">
    <div className="space-y-2 pb-4 border-b">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-4 w-1/5" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <Skeleton className="h-[380px] rounded-xl col-span-4" />
      <Skeleton className="h-[380px] rounded-xl col-span-3" />
    </div>
  </div>
);

const DashboardError = () => (
  <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
    <div className="p-4 bg-destructive/10 rounded-full">
      <Activity className="h-8 w-8 text-destructive" />
    </div>
    <h2 className="text-xl font-bold text-destructive">Failed to load dashboard</h2>
    <p className="text-muted-foreground text-sm font-medium text-center">
      Could not connect to the server. Please try again.
    </p>
  </div>
);

const EmptyState = ({ message, icon: Icon = Activity }: any) => (
  <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
    <Icon className="h-8 w-8 opacity-40" />
    <p className="font-medium text-sm">{message}</p>
  </div>
);