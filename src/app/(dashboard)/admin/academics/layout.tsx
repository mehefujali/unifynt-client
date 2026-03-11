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
        // Using general ACADEMIC_VIEW or CLASS_CREATE as general academic access
        requiredPermission: [PERMISSIONS.ACADEMIC_VIEW, PERMISSIONS.CLASS_CREATE, PERMISSIONS.CLASS_EDIT]
    },
    { 
        name: "Periods", 
        href: "/admin/academics/periods", 
        icon: Clock,
        // Routine related permissions
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
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 ease-out">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">Academic Configuration</h1>
                <p className="text-muted-foreground text-[14px] font-medium">
                    Manage academic years, time slots, classes, sections, subjects, and school holidays.
                </p>
            </div>

            {authorizedTabs.length > 0 && (
                <div className="border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-md rounded-xl px-2">
                    <nav className="-mb-px flex gap-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
                        {authorizedTabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={cn(
                                        "group relative inline-flex items-center border-b-2 py-4 px-1 text-[13px] font-bold transition-all whitespace-nowrap",
                                        isActive
                                            ? "border-primary text-primary"
                                            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-200"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "mr-2 h-4 w-4 transition-colors",
                                            isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                                        )}
                                    />
                                    {tab.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}

            <div className="min-h-125">
                {children}
            </div>
        </div>
    );
}