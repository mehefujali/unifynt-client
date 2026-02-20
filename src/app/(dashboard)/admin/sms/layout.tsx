"use client";

import { MessageSquare, Send, Banknote, History, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SmsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview Analytics", href: "/admin/sms", icon: BarChart3 },
        { name: "Compose Campaign", href: "/admin/sms/compose", icon: Send },
        { name: "Top-up Credits", href: "/admin/sms/recharge", icon: Banknote },
        { name: "Usage Ledger", href: "/admin/sms/history", icon: History },
    ];

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10 animate-in fade-in duration-500">
            {/* --- Module Header --- */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border/40">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    SMS Communication Center
                </h1>
                <p className="text-sm font-medium text-muted-foreground ml-8">
                    Manage your school&apos;s SMS campaigns, track delivery rates, and securely top-up credits.
                </p>
            </div>

            {/* --- Enterprise Tab Navigation --- */}
            <div className="flex overflow-x-auto p-1 bg-muted/30 border border-border/50 rounded-xl h-12 w-fit custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-6 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
                                isActive
                                    ? "bg-card shadow-sm text-primary ring-1 ring-border/50"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* --- Page Content Container --- */}
            <div className="mt-2">
                {children}
            </div>
        </div>
    );
}