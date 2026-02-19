import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SubscriptionGuard from "@/components/layout/subscription-guard";


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar />
            <div className="flex flex-col">
                <Header />
                <main className="flex-1 p-4 lg:p-6 bg-slate-50/50 dark:bg-slate-900/50">
                    <SubscriptionGuard>
                        {children}
                    </SubscriptionGuard>
                </main>
            </div>
        </div>
    );
}