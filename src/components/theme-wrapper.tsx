"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // Routes that are allowed to have dark mode/theme persistence
    const dashboardRoutes = [
        "/admin",
        "/super-admin",
        "/dashboard",
        "/student",
        "/teacher",
        "/staff",
        "/parent",
        "/accountant",
        "/profile",
        "/settings"
    ];

    // Check if the current path is part of the dashboard/internal app
    const isDashboard = dashboardRoutes.some(route => pathname?.startsWith(route));

    // Force light theme for public/marketing and auth pages
    // If it's a dashboard route, we allow the user's preference (or system default)
    const forcedTheme = isDashboard ? undefined : "light";

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={isDashboard}
            disableTransitionOnChange
            forcedTheme={forcedTheme}
        >
            {children}
        </ThemeProvider>
    );
}
