"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, CalendarDays, Layers, Library } from "lucide-react"; // Library icon add kora hoyeche

const tabs = [
    { name: "Sessions", href: "/admin/academics/sessions", icon: CalendarDays },
    { name: "Classes", href: "/admin/academics/classes", icon: BookOpen },
    { name: "Sections", href: "/admin/academics/sections", icon: Layers },
    { name: "Subjects", href: "/admin/academics/subjects", icon: Library }, // 👈 Subjects tab ekhane add kora hoyeche
];

export default function AcademicsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col gap-6 p-2 animate-in fade-in duration-300">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Academic Configuration</h1>
                <p className="text-muted-foreground">
                    Manage academic years, classes, sections, and subjects structure.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-border/50">
                <nav className="-mb-px flex gap-8 overflow-x-auto no-scrollbar" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "group relative inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-all whitespace-nowrap",
                                    isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "mr-2 h-4 w-4 transition-colors",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Render Tab Contents */}
            <div className="min-h-[500px] mt-2">
                {children}
            </div>
        </div>
    );
}