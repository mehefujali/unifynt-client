/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems, NavItem } from "@/config/nav-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Loader2,
    LogOut,
    PanelLeftClose,
    PanelLeft,
    ChevronRight,
    Lock,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                    "group relative flex items-center rounded-xl transition-all duration-300 ease-out font-medium text-[14px] cursor-pointer outline-none",
                    isCollapsed
                        ? "justify-center h-11.5 w-11.5 mx-auto"
                        : "justify-between px-3.5 py-3",
                    isActive && !hasSubItems
                        ? "bg-white/80 dark:bg-white/10 text-primary font-bold shadow-sm border border-white/60 dark:border-white/5 backdrop-blur-md"
                        : isActive && hasSubItems
                            ? "bg-transparent text-primary font-bold"
                            : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100"
                )}
            >
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

            {hasSubItems && (
                <div
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen && !isCollapsed ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-1 pl-[38px] pr-2 py-1 relative">
                            <div className="absolute left-[21px] top-0 bottom-3 w-px bg-gradient-to-b from-black/5 to-transparent dark:from-white/10" />

                            {item.subItems!.map((sub, idx) => {
                                const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                                return (
                                    <Link
                                        key={idx}
                                        href={sub.href}
                                        className={cn(
                                            "relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-200 group/sub",
                                            isSubActive
                                                ? "text-primary font-bold bg-primary/5 dark:bg-primary/10 backdrop-blur-sm"
                                                : "text-slate-500 font-medium hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/40 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "absolute -left-[18.5px] top-1/2 -translate-y-1/2 w-3 h-px transition-all duration-300",
                                                isSubActive ? "bg-primary" : "bg-black/10 dark:bg-white/10"
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setIsMounted(true), []);

    const userPermissions = useMemo(() => {
        return (user as any)?.permissions || [];
    }, [user]);

    const authorizedNavItems = useMemo(() => {
        if (!user?.role) return [];
        const role = user.role.toUpperCase() as keyof typeof navItems;
        const baseItems = navItems[role] || [];

        const checkPermission = (required?: string[]) => {
            if (!required || required.length === 0) return true;
            if (userPermissions.includes("*")) return true;
            return required.some((p) => userPermissions.includes(p));
        };

        return baseItems.reduce((acc: NavItem[], item) => {
            if (!checkPermission(item.requiredPermissions)) return acc;

            if (item.subItems) {
                const filteredSubItems = item.subItems.filter((sub) =>
                    checkPermission(sub.requiredPermissions)
                );

                if (item.subItems.length > 0 && filteredSubItems.length === 0) {
                    return acc;
                }

                acc.push({ ...item, subItems: filteredSubItems });
            } else {
                acc.push(item);
            }

            return acc;
        }, []);
    }, [user, userPermissions]);

    if (!isMounted || isLoading) {
        return (
            <div className="hidden h-screen w-65 shrink-0 flex-col items-center justify-center border-r border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-2xl lg:flex z-50">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            </div>
        );
    }

    // Determine user display name and profile image
    const displayName = user?.details?.firstName 
        ? `${user.details.firstName} ${user.details.lastName || ""}`.trim() 
        : user?.name || "Admin User";
        
    const profileImage = user?.details?.profileImage || (user as any)?.profileImage || "";
    
    // Function to get initials for avatar fallback
    const getInitials = (name: string) => {
        if (!name) return "UN";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <aside
            className={cn(
                "hidden h-screen flex-col border-r border-white/40 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-2xl supports-backdrop-filter:bg-white/30 transition-[width] duration-300 ease-in-out lg:flex sticky top-0 z-50 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none",
                isCollapsed ? "w-22" : "w-70"
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-7 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm transition-all duration-300 hover:scale-110 focus:outline-none text-slate-500 hover:text-primary"
            >
                {isCollapsed ? (
                    <PanelLeft className="h-[14px] w-[14px]" />
                ) : (
                    <PanelLeftClose className="h-[14px] w-[14px]" />
                )}
            </button>

            <div
                className={cn(
                    "h-20 flex items-center border-b border-black/5 dark:border-white/5 flex-shrink-0",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}
            >
                <Link href="/" className="flex items-center gap-1.5 overflow-hidden group">
                    <div className="relative flex items-center justify-center h-10 w-10 transition-all duration-300">
                        <Image
                            src="/unifynt-logo.png"
                            alt="Unifynt Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col whitespace-nowrap">
                            <span className="font-extrabold text-[22px] tracking-tight text-slate-900 dark:text-white leading-none">
                                Unifynt
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-90">
                                Workspace
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            <ScrollArea className="flex-1 py-6 custom-scrollbar overflow-hidden">
                <nav className="flex flex-col px-4 gap-0.5">
                    {authorizedNavItems.length > 0 ? (
                        authorizedNavItems.map((item, index) => (
                            <SidebarItemNode
                                key={index}
                                item={item}
                                pathname={pathname}
                                isCollapsed={isCollapsed}
                                setIsCollapsed={setIsCollapsed}
                            />
                        ))
                    ) : (
                        <div className="p-4 text-center mt-10 flex flex-col items-center justify-center gap-2">
                            <Lock className="h-8 w-8 text-slate-300 opacity-50 mb-2" />
                            <p className="text-xs text-slate-400 font-medium px-4 text-balance">
                                You do not have permission to view any modules.
                            </p>
                        </div>
                    )}
                </nav>
            </ScrollArea>

            <div className="p-4 flex-shrink-0">
                <div
                    className={cn(
                        "flex items-center rounded-2xl bg-white/60 dark:bg-white/5 p-2 border border-white/60 dark:border-white/10 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md",
                        isCollapsed ? "justify-center flex-col gap-2" : "justify-between"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center overflow-hidden",
                            isCollapsed ? "justify-center w-full" : "gap-3.5"
                        )}
                    >
                        <Avatar className="h-10 w-10 rounded-xl border border-black/5 dark:border-white/10 shadow-sm transition-transform duration-300 group-hover:scale-105">
                            <AvatarImage src={profileImage} alt={displayName} className="object-cover" />
                            <AvatarFallback className="bg-blue-50 dark:bg-blue-500/10 text-primary font-bold text-xs rounded-xl">
                                {getInitials(displayName)}
                            </AvatarFallback>
                        </Avatar>

                        {!isCollapsed && (
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate max-w-[110px] leading-tight">
                                    {displayName}
                                </span>
                                <span className="text-[11px] font-medium text-slate-500 truncate max-w-[110px] mt-0.5">
                                    {user?.role || "USER"}
                                </span>
                            </div>
                        )}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className={cn(
                            "text-slate-400 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-500/10 shrink-0 transition-colors backdrop-blur-sm",
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