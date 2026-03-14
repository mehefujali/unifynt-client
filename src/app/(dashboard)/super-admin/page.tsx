 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Building2, Users, CalendarDays, Gem, Activity,
    CheckCircle2, Globe, CreditCard, ShieldCheck, Loader2, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PasskeyReminder from "@/components/dashboard/passkey-reminder";

export default function SuperAdminDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ["superAdminStats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/super-admin");
            return res.data?.data;
        }
    });

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
                        <div className="h-4 w-64 bg-muted rounded-lg animate-pulse mt-2" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-card border border-border rounded-xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                    <div className="h-[400px] bg-card border border-border rounded-xl animate-pulse" />
                    <div className="h-[400px] bg-card border border-border rounded-xl animate-pulse" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 p-8 pt-6 flex flex-col items-center justify-center h-[80vh]">
                <ShieldCheck className="h-12 w-12 text-destructive opacity-50 mb-4" />
                <h3 className="text-lg font-bold">Analytics Engine Offline</h3>
                <p className="text-sm text-muted-foreground mt-1">Unable to stream dashboard metrics from the core server.</p>
                <Button variant="outline" className="mt-6 font-bold" onClick={() => window.location.reload()}>Reconnect</Button>
            </div>
        );
    }

    const { overview, planDistribution, recentSchools, recentTransactions } = response || {};

    const maxPlanCount = planDistribution?.length > 0
        ? Math.max(...planDistribution.map((p: any) => p.count || 0))
        : 1;

    const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
        <Card className="rounded-xl border border-border shadow-sm p-6 space-y-3 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
                <div className={cn("p-2 rounded-lg bg-muted/30 border border-border", color)}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold tracking-tight tabular-nums text-foreground">{value}</h3>
                {subtitle && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1 opacity-80">{subtitle}</p>}
            </div>
        </Card>
    );

    function Card({ children, className }: { children: React.ReactNode, className?: string }) {
        return <div className={cn("bg-card border border-border rounded-xl shadow-sm", className)}>{children}</div>;
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                    <p className="text-sm text-muted-foreground">
                        Global metrics and platform administration console.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">System Live</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Platform Revenue"
                    value={`₹${(overview?.totalRevenue || 0).toLocaleString()}`}
                    subtitle="Gross Lifetime Volume"
                    icon={CreditCard}
                    color="text-emerald-500"
                />
                <StatCard
                    title="Institutions"
                    value={overview?.totalSchools || 0}
                    subtitle={`${overview?.activeSchools || 0} Active • ${overview?.inactiveSchools || 0} Inactive`}
                    icon={Building2}
                    color="text-primary"
                />
                <StatCard
                    title="Global Users"
                    value={(overview?.totalUsers || 0).toLocaleString()}
                    subtitle="Verified Platform Identities"
                    icon={Users}
                    color="text-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="flex flex-col">
                    <div className="px-6 py-4 border-b border-border bg-muted/30">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Gem className="h-3.5 w-3.5" /> License Tier Distribution
                        </h2>
                    </div>
                    <div className="flex-1 p-6 space-y-6">
                        {planDistribution?.length > 0 ? (
                            planDistribution.map((plan: any, index: number) => {
                                const percent = maxPlanCount > 0 ? (plan.count / maxPlanCount) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground uppercase tracking-tight">{plan.name}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Up to {plan.limit} Users</span>
                                            </div>
                                            <span className="text-xl font-bold text-foreground tabular-nums">{plan.count}</span>
                                        </div>
                                        <Progress value={percent} className="h-1.5" />
                                    </div>
                                )
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <Gem className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">No tier data available</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity className="h-3.5 w-3.5" /> Recent Invoicing
                        </h2>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest">Analytics Feed</Button>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
                        {recentTransactions?.length > 0 ? recentTransactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/10">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{tx.school?.name}</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">{tx.planType} • {format(new Date(tx.createdAt), 'MMM dd, hh:mm a')}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-sm font-bold text-emerald-600 tabular-nums">+₹{tx.amount.toLocaleString()}</p>
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <Activity className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">No incoming transactions</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Card className="flex flex-col">
                <div className="px-6 py-4 border-b border-border bg-muted/30">
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Globe className="h-3.5 w-3.5" /> Recent Onboarding
                    </h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {recentSchools?.length > 0 ? recentSchools.map((school: any) => (
                            <div key={school.id} className="p-4 bg-muted/20 border border-border rounded-xl hover:bg-muted/30 transition-all cursor-default shadow-sm group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground bg-background border border-border px-2 py-0.5 rounded uppercase tracking-wider">
                                        {format(new Date(school.createdAt), 'MMM dd')}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold text-foreground truncate mb-0.5">{school.name}</h3>
                                <p className="text-[10px] font-medium text-muted-foreground truncate mb-4 italic">{school.subdomain}.unifynt.com</p>

                                <div className="pt-3 border-t border-border flex items-center justify-between">
                                    <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/20 bg-primary/5 text-primary">
                                        {school.plan?.name || "Trial"}
                                    </Badge>
                                    <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
                                <Globe className="h-8 w-8 text-muted-foreground/20 mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">No registrations detected</p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
            <PasskeyReminder />
        </div>
    );
}