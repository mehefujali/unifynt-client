"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import React from "react";

export default function PublicSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="light"
      enableSystem={false}
    >
      <div className="light bg-white text-slate-900 min-h-screen">
        {children}
      </div>
    </NextThemesProvider>
  );
}
