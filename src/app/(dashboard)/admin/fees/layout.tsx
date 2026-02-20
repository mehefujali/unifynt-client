"use client";

import { Wallet, Settings, ReceiptText, Banknote, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FeesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview", href: "/admin/fees", icon: LayoutDashboard },
        { name: "Fee Masters", href: "/admin/fees/masters", icon: Settings },
        { name: "Invoices", href: "/admin/fees/invoices", icon: ReceiptText },
        { name: "Collection POS", href: "/admin/fees/collection", icon: Banknote },
    ];

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full pb-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col gap-1 pb-4 border-b border-border/40">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <Wallet className="h-6 w-6 text-primary" />
                    Fees & Billing Operations
                </h1>
                <p className="text-sm font-medium text-muted-foreground ml-8">
                    Manage fee structures, generate bulk invoices, and collect payments efficiently.
                </p>
            </div>

            {/* Modern Navigation Tabs */}
            <div className="flex overflow-x-auto p-1 bg-muted/30 border border-border/50 rounded-xl h-12 w-fit">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-6 rounded-lg font-bold text-sm transition-all",
                                isActive
                                    ? "bg-card shadow-sm text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="mt-2">
                {children}
            </div>
        </div>
    );
}