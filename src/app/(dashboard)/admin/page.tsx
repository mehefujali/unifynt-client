/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  GraduationCap,
  CreditCard,
  Bell,
  Wallet,
  CalendarCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";

// --- Colors for Charts ---
const GENDER_COLORS = ["#3b82f6", "#ec4899", "#fbbf24"]; // Blue, Pink, Amber
const ATTENDANCE_COLORS = {
  PRESENT: "#22c55e", // Green
  ABSENT: "#ef4444", // Red
  LATE: "#f59e0b",   // Orange
  LEAVE: "#64748b",  // Slate
};

export default function SchoolAdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["schoolAdminStats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/school-admin");
      return res.data.data;
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Currency Formatter (Updated to INR & Indian Locale)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0, // No decimal points for cleaner look
    }).format(amount);
  };

  // Prepare Attendance Data for Bar Chart
  const attendanceData = stats.todaysAttendance.map((item: any) => ({
    status: item.status,
    count: item.count,
    fill: ATTENDANCE_COLORS[item.status as keyof typeof ATTENDANCE_COLORS] || "#cbd5e1",
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening in your school today.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon={GraduationCap}
          desc="Active Enrollments"
          trend="up"
        />
        <StatsCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={Users}
          desc="Faculty Members"
          trend="neutral"
        />
        <StatsCard
          title="Revenue Collected"
          value={formatCurrency(stats.financialOverview.totalCollected)}
          icon={Wallet}
          desc="This Academic Year"
          trend="up"
          className="text-emerald-600"
        />
        <StatsCard
          title="Fees Due"
          value={formatCurrency(stats.financialOverview.totalDue)}
          icon={CreditCard}
          desc="Pending Payments"
          trend="down"
          className="text-rose-600"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Chart 1: Today's Attendance (Bar Chart) */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Today&apos;s Attendance
            </CardTitle>
            <CardDescription>
              Real-time attendance status of students.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} barSize={50}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="status"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Gender Ratio (Pie Chart) */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Demographics
            </CardTitle>
            <CardDescription>Gender distribution across classes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.genderRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.genderRatio.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-bold">{stats.totalStudents}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Students</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent Notices */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notice Board
            </CardTitle>
            <CardDescription>Recent announcements published for the school.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentNotices.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.recentNotices.map((notice: any) => (
                  <div
                    key={notice.id}
                    className="flex flex-col space-y-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {new Date(notice.createdAt).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric'
                        })}
                      </span>
                      {notice.isPublic && (
                        <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Public</span>
                      )}
                    </div>
                    <h4 className="font-semibold leading-none truncate" title={notice.title}>
                      {notice.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[150px] items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                No recent notices found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatsCard({ title, value, icon: Icon, desc, trend, className }: any) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-full p-2 bg-secondary ${className?.includes('emerald') ? 'bg-emerald-100 dark:bg-emerald-900' : className?.includes('rose') ? 'bg-rose-100 dark:bg-rose-900' : ''}`}>
          <Icon className={`h-4 w-4 ${className || "text-foreground"}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
        <div className="flex items-center text-xs text-muted-foreground mt-1">
          {trend === "up" && <ArrowUpRight className="mr-1 h-3 w-3 text-emerald-500" />}
          {trend === "down" && <ArrowDownRight className="mr-1 h-3 w-3 text-rose-500" />}
          {desc}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] rounded-xl" />
        <Skeleton className="col-span-3 h-[400px] rounded-xl" />
      </div>
    </div>
  )
}