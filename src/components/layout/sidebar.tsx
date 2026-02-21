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

    // Check if any sub-item is currently active
    const isChildActive = hasSubItems
        ? item.subItems!.some(
            (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`)
        )
        : false;

    // ✅ Dashboard Bug Fix: Dashboard should only match exact path, not startsWith
    const isDashboardRoute =
        item.href === "/admin" ||
        item.href === "/super-admin" ||
        item.href === "/teacher" ||
        item.href === "/student";

    const isActive = hasSubItems
        ? isChildActive
        : isDashboardRoute
            ? pathname === item.href // Exact match for dashboard
            : pathname === item.href || pathname.startsWith(`${item.href}/`); // Partial match for other routes

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
                    "group relative flex items-center rounded-xl transition-all duration-300 ease-in-out font-medium text-[14px] overflow-hidden cursor-pointer",
                    isCollapsed
                        ? "justify-center h-12 w-12 mx-auto"
                        : "justify-between px-3 py-2.5",
                    isActive && !hasSubItems
                        ? "bg-primary/10 text-primary font-bold"
                        : isActive && hasSubItems
                            ? "text-primary bg-primary/5"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                )}

                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                    <Icon
                        className={cn(
                            "transition-colors duration-300 flex-shrink-0",
                            isCollapsed ? "h-6 w-6" : "h-5 w-5",
                            isActive
                                ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                : cn("text-muted-foreground/70 group-hover:text-foreground", item.color)
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                    />

                    {!isCollapsed && (
                        <span className={cn("tracking-wide whitespace-nowrap", !isActive && item.color)}>
                            {item.title}
                        </span>
                    )}
                </div>

                {hasSubItems && !isCollapsed && (
                    <ChevronRight
                        className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-300",
                            isOpen && "rotate-90 text-primary"
                        )}
                    />
                )}
            </Link>

            {hasSubItems && (
                <div
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        isOpen && !isCollapsed ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-1 pl-10 pr-3 pt-1 pb-2">
                            {item.subItems!.map((sub, idx) => {
                                const isSubActive = pathname === sub.href || pathname.startsWith(`${sub.href}/`);
                                return (
                                    <Link
                                        key={idx}
                                        href={sub.href}
                                        className={cn(
                                            "relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200",
                                            isSubActive
                                                ? "text-primary bg-primary/10 font-bold"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                                                isSubActive
                                                    ? "bg-primary scale-125 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                                                    : "bg-muted-foreground/40"
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

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted || isLoading) {
        return (
            <div className="hidden h-screen w-[260px] flex-shrink-0 flex-col items-center justify-center border-r border-border/40 bg-background lg:flex z-50">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    const userRole = user?.role ? (user.role.toUpperCase() as keyof typeof navItems) : null;
    const items = userRole ? navItems[userRole] : [];

    return (
        <aside
            className={cn(
                "hidden h-screen flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width] duration-300 ease-in-out lg:flex sticky top-0 z-50 flex-shrink-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.02)] relative",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3.5 top-7 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-border/50 bg-background shadow-md transition-all hover:bg-muted hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
                {isCollapsed ? (
                    <PanelLeft className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                    <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" />
                )}
            </button>

            <div
                className={cn(
                    "h-20 flex items-center border-b border-border/40 transition-all duration-300 flex-shrink-0",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}
            >
                <Link href="/" className="flex items-center gap-3 group overflow-hidden">
                    <div className="flex flex-shrink-0 items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300 ring-1 ring-primary/20">
                        <Command className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-300">
                            <span className="font-extrabold text-xl tracking-tight text-foreground leading-none">
                                Unifynt
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                                Workspace
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            <ScrollArea className="flex-1 py-4 custom-scrollbar overflow-hidden">
                <nav className="flex flex-col px-3">
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
                            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                                <Command className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                        </div>
                    )}
                </nav>
            </ScrollArea>

            <div className="p-3 border-t border-border/40 flex-shrink-0 bg-muted/5 transition-all duration-300">
                <div
                    className={cn(
                        "flex items-center rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md",
                        isCollapsed ? "justify-center p-2 flex-col gap-2" : "justify-between p-2.5"
                    )}
                >
                    <div
                        className={cn(
                            "flex items-center overflow-hidden",
                            isCollapsed ? "justify-center w-full" : "gap-3"
                        )}
                    >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 ring-1 ring-border shadow-inner">
                            <UserIcon className="h-4 w-4 text-primary" />
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col whitespace-nowrap animate-in fade-in duration-300">
                                <span className="text-sm font-extrabold text-foreground truncate max-w-[120px]">
                                    {user?.name || "Admin User"}
                                </span>
                                <span className="text-[11px] font-semibold text-muted-foreground truncate max-w-[120px]">
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
                            "text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors",
                            isCollapsed ? "h-9 w-9 rounded-full" : "h-8 w-8 rounded-lg"
                        )}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Log out</span>
                    </Button>
                </div>
            </div>
        </aside>
    );
}