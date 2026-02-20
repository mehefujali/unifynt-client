/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/nav-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, Loader2, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="hidden h-screen w-[260px] flex-col items-center justify-center border-r border-border/60 bg-card shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] lg:flex">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    const userRole = user?.role ? (user.role.toUpperCase() as keyof typeof navItems) : null;
    const items = userRole ? navItems[userRole] : [];

    return (
        <aside className="hidden h-screen flex-col border-r border-border/60 bg-card shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all lg:flex w-[260px] sticky top-0">
            <div className="h-20 flex items-center px-6 border-b border-border/40 bg-card/50 backdrop-blur-sm">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                        <Command className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-extrabold text-xl tracking-tight text-foreground leading-none">Unifynt</span>
                        <span className="text-[11px] font-bold text-primary uppercase tracking-widest mt-1">Workspace</span>
                    </div>
                </Link>
            </div>

            <ScrollArea className="flex-1 px-4 py-6 custom-scrollbar">
                <nav className="flex flex-col gap-1.5">
                    {items.length > 0 ? (
                        items.map((item, index) => {
                            const Icon = item.icon;

                            const hrefSegments = item.href.split('/').filter(Boolean).length;
                            const isActive = hrefSegments > 1
                                ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                                : pathname === item.href;

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "group relative flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-300 ease-in-out font-medium text-[14px]",
                                        isActive
                                            ? "bg-primary/10 text-primary font-bold ring-1 ring-primary/20"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Icon className={cn(
                                            "h-5 w-5 transition-colors duration-300",
                                            isActive
                                                ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                                : cn("text-muted-foreground/70 group-hover:text-foreground", (item as any).color)
                                        )} strokeWidth={isActive ? 2.5 : 2} />

                                        <span className={cn("tracking-wide", !isActive && (item as any).color)}>
                                            {item.title}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                    )}
                                </Link>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center mt-10">
                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                <Command className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">No menu items</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Role: {user?.role || "Unknown"}
                            </p>
                        </div>
                    )}
                </nav>
            </ScrollArea>

            <div className="p-4 border-t border-border/40 bg-muted/10">
                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-background">
                            <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-sm font-bold text-foreground truncate">
                                {user?.name || "Guest User"}
                            </span>
                            <span className="text-[11px] font-medium text-muted-foreground truncate" title={user?.email}>
                                {user?.email || "No email"}
                            </span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0">
                        <LogOut className="h-4 w-4" />
                        <span className="sr-only">Log out</span>
                    </Button>
                </div>
            </div>
        </aside>
    );
}