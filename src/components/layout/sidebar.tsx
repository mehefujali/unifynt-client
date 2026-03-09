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
        <div className="flex flex-col mb-1.5">
            <Link
                href={item.href}
                onClick={handleGroupClick}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                    "group relative flex items-center rounded-lg transition-all duration-200 ease-in-out font-medium text-[14px] cursor-pointer outline-none",
                    isCollapsed
                        ? "justify-center h-10 w-10 mx-auto"
                        : "justify-between px-3 py-2.5",
                    isActive && !hasSubItems
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold"
                        : isActive && hasSubItems
                            ? "bg-transparent text-zinc-900 dark:text-zinc-50 font-semibold"
                            : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
            >
                {isActive && !isCollapsed && !hasSubItems && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-zinc-900 dark:bg-zinc-200 rounded-r-md" />
                )}

                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                    <Icon
                        className={cn(
                            "flex-shrink-0 transition-transform duration-200",
                            isCollapsed ? "h-[18px] w-[18px]" : "h-4 w-4",
                            isActive ? "text-zinc-900 dark:text-zinc-200" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                    {!isCollapsed && (
                        <span className="tracking-tight whitespace-nowrap text-sm">
                            {item.title}
                        </span>
                    )}
                </div>

                {hasSubItems && !isCollapsed && (
                    <ChevronRight
                        className={cn(
                            "h-4 w-4 transition-transform duration-200 ease-out",
                            isActive ? "text-zinc-900 dark:text-zinc-200" : "text-zinc-400",
                            isOpen && "rotate-90"
                        )}
                        strokeWidth={2}
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
                        <div className="flex flex-col gap-0.5 pl-[34px] pr-2 py-1 relative">
                            <div className="absolute left-[19px] top-0 bottom-2 w-px bg-zinc-200 dark:bg-zinc-800" />

                            {item.subItems!.map((sub, idx) => {
                                const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                                return (
                                    <Link
                                        key={idx}
                                        href={sub.href}
                                        className={cn(
                                            "relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-200 group/sub",
                                            isSubActive
                                                ? "text-zinc-900 dark:text-zinc-100 font-semibold bg-zinc-100/50 dark:bg-zinc-800/50"
                                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "absolute -left-[15px] top-1/2 -translate-y-1/2 w-2 h-px transition-all duration-200",
                                                isSubActive ? "bg-zinc-900 dark:bg-zinc-200" : "bg-zinc-200 dark:bg-zinc-800 group-hover/sub:bg-zinc-400"
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

    const profileRoute = useMemo(() => {
        if (!user?.role) return "#";
        if (user.role === "SUPER_ADMIN") return "/super-admin/user-profile";
        if (user.role === "SCHOOL_ADMIN") return "/admin/user-profile";
        return `/admin/user-profile`;
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

    const profileImage = user?.details?.profileImage || (user as any)?.profileImage || "";

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
                "hidden h-screen flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] transition-[width] duration-300 ease-in-out lg:flex sticky top-0 z-50 shrink-0",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-transform duration-200 hover:scale-105 focus:outline-none text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
                {isCollapsed ? (
                    <PanelLeft className="h-3.5 w-3.5" />
                ) : (
                    <PanelLeftClose className="h-3.5 w-3.5" />
                )}
            </button>

            <div
                className={cn(
                    "h-16 flex items-center flex-shrink-0 mt-2",
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
                            <span className="font-bold text-[18px] tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
                                Unifynt
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            <ScrollArea className="flex-1 py-4 custom-scrollbar overflow-hidden">
                <nav className="flex flex-col px-3">
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
                            <Lock className="h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-2" />
                            <p className="text-xs text-zinc-500 font-medium px-4 text-balance">
                                No modules available.
                            </p>
                        </div>
                    )}
                </nav>
            </ScrollArea>

            <div className="p-4 flex-shrink-0 border-t border-zinc-100 dark:border-zinc-900">
                <div
                    className={cn(
                        "flex items-center rounded-xl transition-all duration-200",
                        isCollapsed ? "justify-center flex-col gap-2" : "justify-between"
                    )}
                >
                    <Link
                        href={profileRoute}
                        className={cn(
                            "flex items-center overflow-hidden flex-1 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 p-2 rounded-lg transition-colors -ml-2",
                            isCollapsed ? "justify-center w-full p-0 hover:bg-transparent" : "gap-3"
                        )}
                        title="View Personal Profile"
                    >
                        <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                            <AvatarImage src={profileImage} alt={displayName} className="object-cover" />
                            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-300 font-semibold text-xs">
                                {getInitials(displayName)}
                            </AvatarFallback>
                        </Avatar>

                        {!isCollapsed && (
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[110px] leading-tight">
                                    {displayName}
                                </span>
                                <span className="text-[11px] font-medium text-zinc-500 truncate max-w-[110px]">
                                    {user?.role ? user.role.replace("_", " ") : "USER"}
                                </span>
                            </div>
                        )}
                    </Link>

                    <button
                        onClick={logout}
                        className={cn(
                            "flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors",
                            isCollapsed ? "h-9 w-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 mt-2" : "h-8 w-8 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}