"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, ArrowRight, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SchoolService } from "@/services/school.service";

export default function SubscriptionGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading: isAuthLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    const { data: school, isLoading: isSchoolLoading } = useQuery({
        queryKey: ["school", user?.schoolId],
        queryFn: () => SchoolService.getSingleSchool(user?.schoolId as string),
        enabled: !!user?.schoolId && user?.role === "SCHOOL_ADMIN",
    });

    if (!isMounted || isAuthLoading) {
        return <>{children}</>;
    }

    if (
        user?.role === "SUPER_ADMIN" ||
        pathname.startsWith("/admin/billing") ||
        pathname.startsWith("/super-admin")
    ) {
        return <>{children}</>;
    }

    let isExpired = false;
    if (school) {
        if (!school.isActive) {
            isExpired = true;
        } else if (school.subscriptionEnd) {
            const expiryDate = new Date(school.subscriptionEnd);
            expiryDate.setHours(23, 59, 59, 999);
            isExpired = expiryDate.getTime() < new Date().getTime();
        } else {
            isExpired = true;
        }
    }

    const showBlockerModal = !isSchoolLoading && isExpired;

    return (
        <>
            <div className={showBlockerModal ? "pointer-events-none blur-sm select-none transition-all duration-500" : ""}>
                {children}
            </div>

            <Dialog open={showBlockerModal} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border/60 shadow-2xl outline-none [&>button]:hidden">
                    <div className="bg-red-50 dark:bg-red-950/20 px-6 py-8 flex flex-col items-center text-center border-b border-border/50">
                        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-5 ring-8 ring-red-50 dark:ring-red-950/10">
                            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-2xl font-extrabold tracking-tight text-foreground">Action Required</DialogTitle>
                        <DialogDescription className="text-sm mt-2.5 text-muted-foreground font-medium max-w-[95%] leading-relaxed">
                            Your workspace subscription has expired or is inactive. You have temporarily lost access to dashboard features.
                        </DialogDescription>
                    </div>

                    <div className="p-6 bg-card space-y-6">
                        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-muted/40 border border-border/50">
                            <CreditCard className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div className="text-sm">
                                <p className="font-bold text-foreground mb-1">Restore your access instantly</p>
                                <p className="text-muted-foreground leading-snug">Renew your subscription to regain full control over your institution&apos;s management tools.</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                size="lg"
                                className="w-full h-12 text-md font-bold shadow-lg transition-all"
                                onClick={() => router.push('/admin/billing')}
                            >
                                Go to Billing & Upgrade <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full h-11 text-muted-foreground font-semibold hover:text-foreground"
                                onClick={() => {
                                    localStorage.removeItem('accessToken');
                                    router.push('/login');
                                }}
                            >
                                Log out securely
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}