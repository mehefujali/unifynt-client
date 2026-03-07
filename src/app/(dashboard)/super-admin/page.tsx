/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { 
    Building2, Users, CalendarDays, Gem, Activity, 
    CheckCircle2, Globe, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function SuperAdminDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const { data: response, isLoading } = useQuery({
        queryKey: ["superAdminStats"],
        queryFn: async () => {
            const res = await api.get("/dashboard/super-admin");
            return res.data?.data;
        }
    });

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 space-y-6 animate-pulse">
                <div className="h-10 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="h-[350px] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                    <div className="h-[350px] bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                </div>
            </div>
        );
    }

    const { overview, planDistribution, recentSchools, recentTransactions } = response || {};

    const maxPlanCount = planDistribution?.length > 0 
        ? Math.max(...planDistribution.map((p: any) => p.count || 0)) 
        : 1;

    const StatCard = ({ title, value, subtitle, icon: Icon }: any) => (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <Icon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                </div>
            </div>
            <div>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">{value}</h3>
                </div>
                {subtitle && <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Overview
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Global metrics and platform administration.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">System Operational</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm text-xs font-medium text-zinc-600 dark:text-zinc-300 tabular-nums">
                        <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                        {format(currentTime, 'MMM dd, yyyy • hh:mm a')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`₹${(overview?.totalRevenue || 0).toLocaleString()}`} 
                    subtitle="Lifetime platform collections"
                    icon={CreditCard} 
                />
                <StatCard 
                    title="Active Institutions" 
                    value={overview?.totalSchools || 0} 
                    subtitle={`${overview?.activeSchools || 0} Active • ${overview?.inactiveSchools || 0} Inactive`}
                    icon={Building2} 
                />
                <StatCard 
                    title="Total Users" 
                    value={(overview?.totalUsers || 0).toLocaleString()} 
                    subtitle="Registered accounts across all schools"
                    icon={Users} 
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm flex flex-col min-h-[350px]">
                    <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Gem className="h-4 w-4 text-zinc-500" /> Plan Distribution
                        </h2>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto custom-scrollbar space-y-5">
                        {planDistribution?.length > 0 ? (
                            planDistribution.map((plan: any, index: number) => {
                                const percent = maxPlanCount > 0 ? (plan.count / maxPlanCount) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{plan.name}</span>
                                                <span className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md">Up to {plan.limit}</span>
                                            </div>
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">{plan.count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-2">
                                <Gem className="h-8 w-8 text-zinc-400" />
                                <p className="text-sm text-zinc-500">No active plans found</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm flex flex-col min-h-[350px]">
                    <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-zinc-500" /> Recent Transactions
                        </h2>
                        <Button variant="outline" size="sm" className="h-7 text-xs">View All</Button>
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                        {recentTransactions?.length > 0 ? recentTransactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-none">{tx.school?.name}</p>
                                        <p className="text-xs text-zinc-500 mt-1">{tx.planType} • {format(new Date(tx.createdAt), 'MMM dd, hh:mm a')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">+₹{tx.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-2">
                                <Activity className="h-8 w-8 text-zinc-400" />
                                <p className="text-sm text-zinc-500">No transactions recorded</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm flex flex-col">
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Globe className="h-4 w-4 text-zinc-500" /> Recently Onboarded Institutions
                    </h2>
                </div>
                <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {recentSchools?.length > 0 ? recentSchools.map((school: any) => (
                            <div key={school.id} className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                        <Building2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                    <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-md">
                                        {format(new Date(school.createdAt), 'MMM dd')}
                                    </span>
                                </div>
                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate mb-1">{school.name}</h3>
                                <p className="text-xs text-zinc-500 truncate mb-3">{school.subdomain}.unifynt.com</p>
                                
                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                        {school.plan?.name || "Trial"}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-10 flex flex-col items-center justify-center text-center opacity-60">
                                <Globe className="h-8 w-8 text-zinc-400 mb-2" />
                                <p className="text-sm text-zinc-500">No institutions onboarded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}