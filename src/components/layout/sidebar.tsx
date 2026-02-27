/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, NavItem } from "@/config/nav-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Command,
    Loader2,
    LogOut,
    User as UserIcon,
    PanelLeftClose,
    PanelLeft,
    ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const SidebarItemNode = ({
    item,
    pathname,
    isCollapsed,
    setIsCollapsed,
}: {
    item: NavItem;
    pathname: string;
    isCollapsed: boolean;
    setIsCollapsed: (val: boolean) => void;
}) => {
    const Icon = item.icon;
    const hasSubItems = !!item.subItems && item.subItems.length > 0;

    const isChildActive = hasSubItems
        ? item.subItems!.some(
            (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
        )
        : false;

    const isDashboardRoute =
        item.href === "/admin" ||
        item.href === "/super-admin" ||
        item.href === "/teacher" ||
        item.href === "/student";

    const isActive = hasSubItems
        ? isChildActive
        : isDashboardRoute
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

    const [isOpen, setIsOpen] = useState(isChildActive);

    useEffect(() => {
        if (isChildActive) setIsOpen(true);
    }, [isChildActive, pathname]);

    const handleGroupClick = (e: React.MouseEvent) => {
        if (hasSubItems) {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (isCollapsed) setIsCollapsed(false);
        }
    };

    return (
        <div className="flex flex-col mb-1">
            <Link
                href={item.href}
                onClick={handleGroupClick}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                    "group relative flex items-center rounded-xl transition-all duration-300 ease-out font-medium text-[14px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isCollapsed
                        ? "justify-center h-[46px] w-[46px] mx-auto"
                        : "justify-between px-3.5 py-3",
                    // --- Ultra Premium Active State ---
                    isActive && !hasSubItems
                        ? "bg-white dark:bg-white/10 text-primary font-bold shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-none ring-1 ring-black/[0.04] dark:ring-white/10"
                        : isActive && hasSubItems
                            ? "bg-transparent text-primary font-bold"
                            : "text-slate-500 hover:bg-slate-200/40 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                )}
            >
                {/* Glowing Active Indicator */}
                {isActive && !isCollapsed && !hasSubItems && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
                )}

                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3.5")}>
                    <Icon
                        className={cn(
                            "flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-110",
                            isCollapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
                            isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                    {!isCollapsed && (
                        <span className="tracking-tight whitespace-nowrap">
                            {item.title}
                        </span>
                    )}
                </div>

                {hasSubItems && !isCollapsed && (
                    <ChevronRight
                        className={cn(
                            "h-[14px] w-[14px] transition-transform duration-300 ease-out",
                            isActive ? "text-primary" : "text-slate-400",
                            isOpen && "rotate-90"
                        )}
                        strokeWidth={2.5}
                    />
                )}
            </Link>

            {/* Beautiful Sub-menu with clean dots instead of harsh lines */}
            {hasSubItems && (
                <div
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen && !isCollapsed ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-1 pl-[38px] pr-2 py-1 relative">
                            {/* Subtle curved left border approach */}
                            <div className="absolute left-[21px] top-0 bottom-3 w-px bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-800" />
                            
                            {item.subItems!.map((sub, idx) => {
                                const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                                return (
                                    <Link
                                        key={idx}
                                        href={sub.href}
                                        className={cn(
                                            "relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-200 group/sub",
                                            isSubActive
                                                ? "text-primary font-bold bg-primary/5 dark:bg-primary/10"
                                                : "text-slate-500 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/40 dark:hover:bg-slate-800/40"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "absolute -left-[18.5px] top-1/2 -translate-y-1/2 w-3 h-px transition-all duration-300",
                                                isSubActive ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                                            )}
                                        />
                                        <div
                                            className={cn(
                                                "absolute -left-[19.5px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full transition-all duration-300 z-10",
                                                isSubActive
                                                    ? "bg-primary scale-125 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                                                    : "bg-white dark:bg-[#09090b] border-[1.5px] border-slate-300 dark:border-slate-600 group-hover/sub:border-primary"
                                            )}
                                        />
                                        <span>{sub.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function Sidebar() {
    const pathname = usePathname();
    const { user, isLoading, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    if (!isMounted || isLoading) {
        return (
            <div className="hidden h-screen w-[260px] flex-shrink-0 flex-col items-center justify-center border-r border-slate-200/50 dark:border-slate-800/60 bg-[#fbfcff] dark:bg-[#0c0d12] lg:flex z-50">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            </div>
        );
    }

    const userRole = user?.role ? (user.role.toUpperCase() as keyof typeof navItems) : null;
    const items = userRole ? navItems[userRole] : [];

    return (
        <aside
            className={cn(
                // Premium Ultra-light blue tint in light mode, deep enterprise dark in dark mode
                "hidden h-screen flex-col border-r border-slate-200/60 dark:border-slate-800/60 bg-[#fbfcff] dark:bg-[#0c0d12] transition-[width] duration-300 ease-in-out lg:flex sticky top-0 z-50 flex-shrink-0",
                isCollapsed ? "w-[80px]" : "w-[270px]" // Slightly wider for that spacious feel
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-7 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-md focus:outline-none text-slate-400 hover:text-primary"
            >
                {isCollapsed ? (
                    <PanelLeft className="h-[14px] w-[14px]" />
                ) : (
                    <PanelLeftClose className="h-[14px] w-[14px]" />
                )}
            </button>

            {/* Brand Logo Area */}
            <div
                className={cn(
                    "h-20 flex items-center border-b border-slate-200/60 dark:border-slate-800/60 flex-shrink-0",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}
            >
                <Link href="/" className="flex items-center gap-3.5 overflow-hidden group">
                    <div className="flex flex-shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-b from-primary to-blue-700 text-white shadow-lg shadow-primary/30 group-hover:shadow-primary/50 group-hover:scale-105 transition-all duration-300 ring-1 ring-white/20">
                        <Command className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col whitespace-nowrap">
                            <span className="font-extrabold text-[22px] tracking-tight text-slate-900 dark:text-white leading-none">
                                Unifynt
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1.5 opacity-90">
                                Workspace
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation Menu */}
            <ScrollArea className="flex-1 py-6 custom-scrollbar overflow-hidden">
                <nav className="flex flex-col px-4 gap-0.5">
                    {items.length > 0 ? (
                        items.map((item, index) => (
                            <SidebarItemNode
                                key={index}
                                item={item}
                                pathname={pathname}
                                isCollapsed={isCollapsed}
                                setIsCollapsed={setIsCollapsed}
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center mt-10">
                            <Command className="h-6 w-6 text-slate-300 mx-auto opacity-50" />
                        </div>
                    )}
                </nav>
            </ScrollArea>

            {/* Premium Profile Widget */}
            <div className="p-4 flex-shrink-0 transition-all duration-300">
                <div
                    className={cn(
                        "flex items-center rounded-2xl bg-white dark:bg-white/5 p-2 transition-all duration-300 border border-slate-200/60 dark:border-slate-800/60 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] dark:hover:bg-white/10",
                        isCollapsed ? "justify-center flex-col gap-2" : "justify-between"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center overflow-hidden",
                            isCollapsed ? "justify-center w-full" : "gap-3.5"
                        )}
                    >
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10 group-hover:bg-blue-100 transition-colors">
                            <UserIcon className="h-[18px] w-[18px] text-primary" />
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate max-w-[110px] leading-tight">
                                    {user?.name || "Admin User"}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[110px] mt-0.5">
                                    {user?.email || "admin@unifynt.com"}
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className={cn(
                            "text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0 transition-colors",
                            isCollapsed ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg mr-1"
                        )}
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" strokeWidth={2.5} />
                    </Button>
                </div>
            </div>
        </aside>
    );
}