"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/nav-items";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Sidebar() {
    const pathname = usePathname();
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="hidden h-screen w-[220px] items-center justify-center border-r bg-muted/40 md:flex lg:w-[280px]">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Role verification safely
    const userRole = user?.role ? (user.role.toUpperCase() as keyof typeof navItems) : null;
    const items = userRole ? navItems[userRole] : [];

    return (
        <div className="hidden h-screen border-r bg-muted/40 md:block sticky top-0">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Command className="h-5 w-5" />
                        </div>
                        <span>Unifynt ERP</span>
                    </Link>
                </div>

                <ScrollArea className="flex-1 px-3 py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
                        {items.length > 0 ? (
                            items.map((item, index) => {
                                const Icon = item.icon;

                                // 🔥 PROFESSIONAL ACTIVE ROUTE LOGIC
                                // 1. Calculate how many segments the href has (e.g., "/admin" = 1, "/admin/students" = 2)
                                const hrefSegments = item.href.split('/').filter(Boolean).length;

                                // 2. Decide matching strategy:
                                // - If segments <= 1 (e.g. Dashboard), require EXACT match.
                                // - If segments > 1 (e.g. Modules), allow PARTIAL match (startsWith).
                                const isActive = hrefSegments > 1
                                    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                                    : pathname === item.href;

                                return (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                                            isActive
                                                ? "bg-primary text-primary-foreground hover:text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-sm text-muted-foreground">No menu items found.</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Role: {user?.role || "Unknown"}
                                </p>
                            </div>
                        )}
                    </nav>
                </ScrollArea>

                <div className="mt-auto p-4">
                    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                        <h4 className="mb-1 text-sm font-semibold">
                            {user?.name || "Guest User"}
                        </h4>
                        <p className="truncate text-xs text-muted-foreground" title={user?.email}>
                            {user?.email || "No email"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}