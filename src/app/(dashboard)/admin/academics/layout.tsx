/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, CalendarDays, Layers, Library, Clock, CalendarX2 } from "lucide-react";
import { usePermission } from "@/hooks/use-permission";
import { PERMISSIONS } from "@/config/permissions";

const tabs = [
    {
        name: "Sessions",
        href: "/admin/academics/sessions",
        icon: CalendarDays,
        requiredPermission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.CLASS_CREATE, PERMISSIONS.CLASS_EDIT]
    },
    {
        name: "Periods",
        href: "/admin/academics/periods",
        icon: Clock,
        requiredPermission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.ROUTINE_CREATE, PERMISSIONS.ROUTINE_EDIT]
    },
    {
        name: "Classes",
        href: "/admin/academics/classes",
        icon: BookOpen,
        requiredPermission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.CLASS_CREATE, PERMISSIONS.CLASS_EDIT]
    },
    {
        name: "Sections",
        href: "/admin/academics/sections",
        icon: Layers,
        requiredPermission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.CLASS_CREATE, PERMISSIONS.CLASS_EDIT]
    },
    {
        name: "Subjects",
        href: "/admin/academics/subjects",
        icon: Library,
        requiredPermission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.SUBJECT_CREATE, PERMISSIONS.SUBJECT_EDIT]
    },
    {
        name: "Holidays",
        href: "/admin/academics/holidays",
        icon: CalendarX2,
        requiredPermission: [PERMISSIONS.ACADEMIC_VIEW],
    },
];

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { hasPermission } = usePermission();

    // Filter tabs based on user permissions
    const authorizedTabs = tabs.filter(tab => hasPermission(tab.requiredPermission));

    return (
        <div className="flex flex-col gap-6 p-8 min-h-screen animate-in fade-in duration-500 ease-out">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">Academic Configuration</h1>
                <p className="text-muted-foreground text-[14px] font-medium opacity-80">
                    Manage institutional structure, time slots, and academic calendars.
                </p>
            </div>

            {authorizedTabs.length > 0 && (
                <div className="bg-card backdrop-blur-sm border border-border p-1.5 rounded-2xl shadow-sm w-fit">
                    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar" aria-label="Tabs">
                        {authorizedTabs.map((tab) => {
                            const Icon = tab.icon as any;
                            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={cn(
                                        "flex items-center gap-2.5 py-2.5 px-5 text-sm font-bold transition-all duration-300 rounded-xl whitespace-nowrap",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-y-[-1px]"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-4.5 w-4.5 transition-colors",
                                            isActive ? "text-primary-foreground" : "text-muted-foreground/70"
                                        )}
                                    />
                                    {tab.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}

            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}