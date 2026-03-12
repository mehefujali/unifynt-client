"use client";

import { usePathname, useRouter } from "next/navigation";
import {
    CalendarClock, 
    BookOpen
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RoutineLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Determine current tab based on pathname
    const currentTab = pathname.includes("/overrides") ? "overrides" : "template";

    const handleTabChange = (value: string) => {
        if (value === "overrides") {
            router.push("/admin/routine/overrides");
        } else {
            router.push("/admin/routine/template");
        }
    };

    return (
        <div className="p-0">
            {/* Common Header if needed, but we have per-page headers for better control */}
            
            <div className="px-4 md:px-8 pt-8 bg-transparent">
                 {/* Shared Tabs Navigation */}
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-0 gap-4">
                        <TabsList className="h-12 p-1.5 rounded-2xl bg-zinc-100 dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border gap-1 shadow-inner">
                            <TabsTrigger
                                value="overrides"
                                className="h-9 px-6 rounded-xl text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 transition-all gap-2"
                            >
                                <CalendarClock className="h-4 w-4" />
                                Daily Overrides
                            </TabsTrigger>
                            <TabsTrigger
                                value="template"
                                className="h-9 px-6 rounded-xl text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 transition-all gap-2"
                            >
                                <BookOpen className="h-4 w-4" />
                                Weekly Template
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </Tabs>
            </div>

            <main className="bg-transparent">{children}</main>
        </div>
    );
}
