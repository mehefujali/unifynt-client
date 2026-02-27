import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SubscriptionGuard from "@/components/layout/subscription-guard";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-[#09090b]">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area - Clean, Flat, Professional Slate Background */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-[#fafafa] dark:bg-[#09090b] transition-all duration-300 ease-in-out">
                <Header />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                    <SubscriptionGuard>
                        <div className="mx-auto max-w-[1600px] h-full animate-in fade-in duration-500">
                            {children}
                        </div>
                    </SubscriptionGuard>
                </main>
            </div>
        </div>
    );
}