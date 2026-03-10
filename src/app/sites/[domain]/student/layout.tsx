/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { SiteConfigService } from "@/services/site-config.service";
import StudentBottomNav from "./components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import SubscriptionGuard from "@/components/layout/subscription-guard";
import StudentHeader from "./components/header";

export default function StudentPortalLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: any;
}>) {
    const { user, isLoading: authLoading } = useAuth();
    const [siteData, setSiteData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSiteData = async () => {
            try {
                // Determine the correct subdomain
                let subdomain = params.domain;
                if (!subdomain) {
                    const host = window.location.hostname;
                    if (host !== "localhost" && host !== "unifynt.com") {
                        subdomain = host.split(".")[0];
                    }
                }
                if (subdomain) {
                    const data = await SiteConfigService.getPublicSiteData(subdomain);
                    setSiteData(data);
                }
            } catch (error) {
                console.error("Failed to load school config:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSiteData();
    }, [params.domain]);

    if (loading || authLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || user.role !== "STUDENT") {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-black mb-2">Access Denied</h2>
                <p className="text-zinc-500">You do not have permission to view the Student Portal.</p>
            </div>
        );
    }

    // Determine Theme Colors based on School Settings
    const primaryColor = siteData?.settings?.theme?.colors?.primary || "#3b82f6";

    return (
        <div 
            className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#020817]"
            style={{
                "--primary": primaryColor,
            } as React.CSSProperties}
        >
            <StudentHeader siteData={siteData} />

            <div className="flex flex-1 flex-col overflow-hidden w-full relative">
                <main className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6 custom-scrollbar w-full">
                    <SubscriptionGuard>
                        <div className="w-full h-full animate-in fade-in duration-700">
                            {children}
                        </div>
                    </SubscriptionGuard>
                </main>
            </div>
            
            <StudentBottomNav primaryColor={primaryColor} />
            
            <style jsx global>{`
                :root {
                  --primary: ${primaryColor} !important;
                }
            `}</style>
        </div>
    );
}
