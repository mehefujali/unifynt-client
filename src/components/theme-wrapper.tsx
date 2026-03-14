"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    // Routes that are allowed to have dark mode/theme persistence
    const themeAllowedRoutes = [
        "/admin",
        "/super-admin",
        "/dashboard",
        "/student",
        "/teacher",
        "/staff",
        "/parent",
        "/accountant",
        "/profile",
        "/settings",
        "/login",
        "/register"
    ];

    // Check if the current path is part of the allowed routes
    const isThemeAllowed = themeAllowedRoutes.some(route => pathname?.startsWith(route));

    // Force light theme ONLY for marketing/public/template pages
    const forcedTheme = isThemeAllowed ? undefined : "light";

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={isThemeAllowed}
            disableTransitionOnChange
            forcedTheme={forcedTheme}
        >
            {children}
        </ThemeProvider>
    );
}
