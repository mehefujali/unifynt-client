"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, CalendarDays, Layers } from "lucide-react";

const tabs = [
    { name: "Sessions", href: "/admin/academics/sessions", icon: CalendarDays },
    { name: "Classes", href: "/admin/academics/classes", icon: BookOpen },
    { name: "Sections", href: "/admin/academics/sections", icon: Layers },
];

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-6 p-2">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Academic Configuration</h1>
                <p className="text-muted-foreground">
                    Manage academic years, classes, and sections structure.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-all",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                                )}
                            >
                                <Icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="min-h-[500px]">
                {children}
            </div>
        </div>
    );
}