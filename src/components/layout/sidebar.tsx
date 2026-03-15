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
        <div className="flex flex-col mb-1 group px-1">
            <Link
                href={item.href}
                onClick={handleGroupClick}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                    "group relative flex items-center rounded-xl transition-all duration-300 ease-in-out font-semibold text-[13.5px] cursor-pointer outline-none select-none my-0.5",
                    isCollapsed
                        ? "justify-center h-11 w-11 mx-auto"
                        : "justify-between px-3.5 py-3",
                    isActive && !hasSubItems
                        ? "bg-slate-900/5 dark:bg-zinc-100/10 text-slate-900 dark:text-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                        : isActive && hasSubItems
                            ? "bg-transparent text-slate-800 dark:text-zinc-200"
                            : "text-slate-500 hover:bg-slate-900/[0.03] dark:hover:bg-zinc-100/[0.05] hover:text-slate-900 dark:hover:text-zinc-100"
                )}
            >
                {isActive && !isCollapsed && !hasSubItems && (
                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-900 dark:bg-zinc-100 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]" />
                )}

                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3.5")}>
                    <div className={cn(
                        "flex items-center justify-center rounded-lg transition-all duration-300",
                        isCollapsed ? "h-8 w-8" : "",
                        isActive ? "scale-110" : "group-hover:scale-110"
                    )}>
                        <Icon
                            className={cn(
                                "flex-shrink-0 transition-colors duration-300",
                                isCollapsed ? "h-5 w-5" : "h-[18px] w-[18px]",
                                isActive ? "text-slate-900 dark:text-zinc-100" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-zinc-300"
                            )}
                            strokeWidth={isActive ? 2.5 : 2}
                        />
                    </div>
                    {!isCollapsed && (
                        <span className="tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.title}
                        </span>
                    )}
                </div>

                {hasSubItems && !isCollapsed && (
                    <ChevronRight
                        className={cn(
                            "h-3.5 w-3.5 transition-transform duration-300 ease-in-out",
                            isActive ? "text-slate-900 dark:text-zinc-100" : "text-slate-400",
                            isOpen && "rotate-90"
                        )}
                        strokeWidth={2.5}
                    />
                )}
            </Link>

            {hasSubItems && (
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isOpen && !isCollapsed ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                    )}
                >
                    <div className="flex flex-col gap-1 pl-11 pr-2 py-1 relative">
                        <div className="absolute left-[22px] top-0 bottom-4 w-px bg-slate-200 dark:bg-zinc-800" />

                        {item.subItems!.map((sub, idx) => {
                            const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                            return (
                                <Link
                                    key={idx}
                                    href={sub.href}
                                    className={cn(
                                        "relative flex items-center px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                                        isSubActive
                                            ? "text-slate-900 dark:text-zinc-100 bg-slate-900/[0.04] dark:bg-zinc-100/[0.06] shadow-sm"
                                            : "text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-900/[0.02] dark:hover:bg-zinc-100/[0.03]"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute -left-[19px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-slate-200 dark:border-zinc-800 transition-all duration-200",
                                            isSubActive ? "bg-slate-900 dark:bg-zinc-100 border-transparent scale-100" : "bg-white dark:bg-zinc-950 scale-75 group-hover:scale-100"
                                        )}
                                    />
                                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">{sub.title}</span>
                                </Link>
                            );
                        })}
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

    const profileRoute = useMemo(() => {
        if (!user?.role) return "#";
        if (user.role === "SUPER_ADMIN") return "/super-admin/profile";
        return `/admin/profile`;
    }, [user]);

    if (!isMounted || isLoading) {
        return (
            <div className="hidden h-screen w-64 shrink-0 flex-col items-center justify-center border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 lg:flex z-50">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
            </div>
        );
    }

    const displayName = user?.details?.firstName
        ? `${user.details.firstName} ${user.details.lastName || ""}`.trim()
        : user?.name || "Admin User";

    const profileImage = user?.details?.profilePicture || user?.details?.profileImage || (user as any)?.profileImage || (user as any)?.profilePicture || "";

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
                "hidden h-screen flex-col border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl transition-[width] duration-300 ease-in-out lg:flex sticky top-0 z-50 shrink-0 shadow-[0_0_20px_rgba(0,0,0,0.02)]",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-7 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md transition-all duration-300 hover:scale-110 focus:outline-none text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 group"
            >
                {isCollapsed ? (
                    <PanelLeft className="h-3 w-3 group-hover:scale-110 transition-transform" />
                ) : (
                    <PanelLeftClose className="h-3 w-3 group-hover:scale-110 transition-transform" />
                )}
            </button>

            <div
                className={cn(
                    "flex items-center flex-shrink-0 border-b border-sidebar-border/50 h-[72px] sm:h-[80px] transition-all",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}
            >
                <Link href="/" className="flex items-center gap-2 overflow-hidden group">
                    <div className="relative flex items-center justify-center h-8 w-8">
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
                            <span className="font-bold text-[18px] tracking-tight text-sidebar-foreground leading-none">
                                Unifynt
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            <ScrollArea className="flex-1 py-6 custom-scrollbar overflow-hidden">
                <nav className="flex flex-col px-3 space-y-1">
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
                            <Lock className="h-8 w-8 text-zinc-200 dark:text-zinc-800 mb-2" />
                            <p className="text-xs text-zinc-400 font-medium px-4 text-balance italic">
                                Access Restricted
                            </p>
                        </div>
                    )}
                </nav>
            </ScrollArea>

            <div className="mt-auto p-4 flex-shrink-0">
                <div
                    className={cn(
                        "flex items-center p-2 gap-3 transition-all duration-300",
                        isCollapsed ? "flex-col bg-transparent" : "rounded-2xl bg-slate-900/[0.03] dark:bg-zinc-100/[0.04] border border-sidebar-border/30 shadow-sm"
                    )}
                >
                    <Link
                        href={profileRoute}
                        className={cn(
                            "flex items-center flex-1 overflow-hidden group cursor-pointer transition-all active:scale-[0.98]",
                            isCollapsed ? "justify-center" : "gap-3"
                        )}
                        title="View Personal Profile"
                    >
                        <Avatar className={cn(
                            "transition-all duration-300 border-2 border-white dark:border-zinc-900 shadow-sm",
                            isCollapsed ? "h-11 w-11" : "h-9 w-9"
                        )}>
                            <AvatarImage src={profileImage} alt={displayName} className="object-cover" />
                            <AvatarFallback className="bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 font-bold text-xs">
                                {getInitials(displayName)}
                            </AvatarFallback>
                        </Avatar>

                        {!isCollapsed && (
                            <div className="flex flex-col whitespace-nowrap overflow-hidden">
                                <span className="text-[13px] font-bold text-slate-900 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">
                                    {displayName}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                                    {user?.role ? user.role.replace("_", " ") : "USER"}
                                </span>
                            </div>
                        )}
                    </Link>

                    {!isCollapsed && (
                        <button
                            onClick={logout}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all active:scale-95"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}

                    {isCollapsed && (
                        <button
                            onClick={logout}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900/[0.05] dark:bg-zinc-100/[0.05] text-slate-400 hover:text-rose-500 transition-all hover:scale-110"
                            title="Logout"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}