"use client";

import { useEffect } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SubscriptionGuard from "@/components/layout/subscription-guard";
import PasskeyReminder from "@/components/dashboard/passkey-reminder";
import DashboardFooter from "@/components/layout/dashboard-footer";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    useEffect(() => {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]">
            <Sidebar />

            <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-transparent transition-all duration-300 ease-in-out">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                    <SubscriptionGuard>
                        <div className="w-full min-h-full animate-in fade-in duration-700 zoom-in-[0.98]">
                            {children}
                        </div>
                    </SubscriptionGuard>
                    <PasskeyReminder />
                </main>

                <DashboardFooter />
            </div>
        </div>
    );
}