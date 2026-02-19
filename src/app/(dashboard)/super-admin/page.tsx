/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Building2,
    Users,
    GraduationCap,
    Activity,
    ArrowUpRight,
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
    PieChart,
    Pie,
    Cell,
} from "recharts";
import api from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function SuperAdminDashboard() {
    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ["superAdminStats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/super-admin");
            return res.data.data;
        },
    });

    if (isLoading || !stats) {
        return <div className="p-8 text-center font-bold text-lg">Loading dashboard analytics...</div>;
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500 font-bold text-lg">Failed to load dashboard data.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Schools"
                    value={stats.totalSchools}
                    icon={Building2}
                    desc={`${stats.activeSchools} Active / ${stats.inactiveSchools} Inactive`}
                />
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={GraduationCap}
                    desc="Across all institutions"
                />
                <StatsCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={Users}
                    desc="Registered educators"
                />
                <StatsCard
                    title="System Health"
                    value="99.9%"
                    icon={Activity}
                    desc="Uptime status"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Subscription Overview</CardTitle>
                        <CardDescription>
                            Distribution of schools across different pricing plans
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={stats.planDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="plan"
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
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Registrations</CardTitle>
                        <CardDescription>Newest schools joined the platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {stats.recentSchools.map((school: any) => (
                                <div key={school.id} className="flex items-center">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={school.logo} alt={school.name} />
                                        <AvatarFallback>{school.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{school.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {school.slug}.app.com
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        <Badge variant={school.isActive ? "default" : "destructive"} className="text-[10px]">
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

function StatsCard({ title, value, icon: Icon, desc }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </CardContent>
        </Card>
    );
}