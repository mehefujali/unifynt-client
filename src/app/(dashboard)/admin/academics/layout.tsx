"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, CalendarDays, Layers, Library, Clock } from "lucide-react";

const tabs = [
    { name: "Sessions", href: "/admin/academics/sessions", icon: CalendarDays },
    { name: "Periods", href: "/admin/academics/periods", icon: Clock },
    { name: "Classes", href: "/admin/academics/classes", icon: BookOpen },
    { name: "Sections", href: "/admin/academics/sections", icon: Layers },
    { name: "Subjects", href: "/admin/academics/subjects", icon: Library },
];

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 ease-out">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">Academic Configuration</h1>
                <p className="text-muted-foreground text-[14px] font-medium">
                    Manage academic years, time slots, classes, sections, and subjects structure.
                </p>
            </div>

            <div className="border-b border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-md rounded-xl px-2">
                <nav className="-mb-px flex gap-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
                    {tabs.map((tab) => {
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

            <div className="min-h-125">
                {children}
            </div>
        </div>
    );
}