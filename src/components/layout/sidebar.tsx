"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { Command } from "lucide-react";
import { navItems } from "@/config/av-items";
import { ScrollArea } from "../ui/scroll-area";


const CURRENT_ROLE = "SCHOOL_ADMIN";

export default function Sidebar() {
    const pathname = usePathname();
    const items = navItems[CURRENT_ROLE as keyof typeof navItems] || [];

    return (
        <div className="hidden border-r bg-gray-100/40 dark:bg-gray-800/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">

                {/* Logo Section */}
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Command className="h-5 w-5" />
                        </div>
                        <span className="">Unifynt ERP</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <ScrollArea className="flex-1 px-3 py-2">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {items.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
                                        isActive
                                            ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </ScrollArea>

                {/* Footer / Version Info */}
                <div className="mt-auto p-4">
                    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                        <h4 className="mb-1 text-sm font-semibold">Need Help?</h4>
                        <p className="text-xs text-muted-foreground">
                            Check our docs or contact support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}