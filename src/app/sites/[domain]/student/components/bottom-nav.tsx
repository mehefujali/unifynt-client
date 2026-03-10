"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/config/nav-items";
import { cn } from "@/lib/utils";

export default function StudentBottomNav({ primaryColor }: { primaryColor: string }) {
  const pathname = usePathname();
  const studentNavItems = navItems["STUDENT"] || [];

  return (
    <div 
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-zinc-200/50 dark:border-zinc-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]" 
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {studentNavItems.map((item, index) => {
          const Icon = item.icon;
          // Determine active path relative to the domain structure
          // Pathname will be `/sites/school/student` or `/sites/school/student/routine`
          const activeSuffix = item.href === "/student" ? "" : item.href.replace("/student", "");
          const isActive = activeSuffix === "" 
             ? pathname.endsWith("/student") 
             : pathname.includes(activeSuffix);
          
          return (
            <Link
              key={index}
              href={item.href} // The router handles /student -> /sites/school/student
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all",
                isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              <div 
                className={cn(
                  "p-1.5 rounded-xl transition-all duration-300 flex items-center justify-center", 
                  isActive ? " shadow-sm -translate-y-1" : "bg-transparent"
                )}
                style={isActive ? { backgroundColor: `${primaryColor}20` } : {}}
              >
                <Icon 
                    className={cn("h-[22px] w-[22px] transition-colors")} 
                    strokeWidth={isActive ? 2.5 : 2}
                    style={isActive ? { color: primaryColor } : {}} 
                />
              </div>
              <span 
                className={cn(
                  "text-[10px] uppercase tracking-wider transition-all duration-300",
                  isActive ? "font-black translate-y-0.5" : "font-bold"
                )}
                style={isActive ? { color: primaryColor } : {}}
              >
                {item.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
