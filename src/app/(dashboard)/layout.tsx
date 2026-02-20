import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SubscriptionGuard from "@/components/layout/subscription-guard";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Sidebar: Controls its own width (260px to 80px) and animates.
        Because it's inside a flex container, it naturally pushes the content.
      */}
            <Sidebar />

            {/* Main Content Area: Uses flex-1 to auto-fill the remaining space.
        When Sidebar shrinks, this container instantly and smoothly expands!
      */}
            <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-muted/10 transition-all duration-300 ease-in-out">
                {/* Header will automatically match the width of this container */}
                <Header />

                {/* Scrollable Content */}
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