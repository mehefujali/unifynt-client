"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Receipt, ShieldAlert, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { SchoolService } from "@/services/school.service";

export default function BillingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuth();

    const { data: school } = useQuery({
        queryKey: ["school", user?.schoolId],
        queryFn: () => SchoolService.getSingleSchool(user?.schoolId as string),
        enabled: !!user?.schoolId,
    });

    let isExpired = false;
    if (school?.subscriptionEnd) {
        const expiryDate = new Date(school.subscriptionEnd);
        expiryDate.setHours(23, 59, 59, 999);
        isExpired = expiryDate.getTime() < new Date().getTime();
    }

    const navItems = [
        {
            name: "Plan & Renewal",
            href: "/admin/billing",
            icon: LayoutDashboard,
        },
        {
            name: "Transaction History",
            href: "/admin/billing/history",
            icon: Receipt,
        },
    ];

    return (
        <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-card p-6 md:p-8 rounded-2xl border shadow-sm gap-4">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                        <CreditCard className="h-8 w-8" />
                    </div>
                    <div className="space-y-1.5">
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Billing & Subscription
                        </h1>
                        <p className="text-base text-muted-foreground font-medium">
                            Manage your institution&apos;s active plan, limits, and billing history securely.
                        </p>
                    </div>
                </div>
            </div>

            {isExpired && (
                <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-5 rounded-r-xl flex items-start md:items-center gap-4 text-red-700 dark:text-red-400 shadow-sm transition-all animate-in fade-in slide-in-from-top-4">
                    <ShieldAlert className="h-7 w-7 shrink-0 animate-pulse mt-1 md:mt-0" />
                    <div className="flex-1">
                        <h3 className="font-bold text-lg tracking-tight">Subscription Expired</h3>
                        <p className="text-sm mt-0.5 leading-relaxed">
                            Your dashboard access is restricted. Please select a plan below and complete the payment to restore full functionality instantly.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-6 border-b border-border/60 px-2 overflow-x-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap",
                                isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
        </div>
    );
}