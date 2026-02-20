import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SubscriptionGuard from "@/components/layout/subscription-guard";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[260px_1fr]">
            <Sidebar />
            <div className="flex flex-col h-screen overflow-hidden bg-background">
                <Header />
                <main className="flex-1 overflow-y-auto bg-muted/20 p-4 lg:p-8 custom-scrollbar">
                    <SubscriptionGuard>
                        {children}
                    </SubscriptionGuard>
                </main>
            </div>
        </div>
    );
}