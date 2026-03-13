"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

/**
 * Global Profile Redirector
 * This page serves as a landing zone for generic profile links (e.g. from automated notifications).
 * It detects the user's role and redirects them to the correct dashboard profile page.
 */
export default function ProfileRedirectPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            const target = user.role === "SUPER_ADMIN" ? "/super-admin/profile" : "/admin/profile";
            router.replace(target);
        } else if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10" />
                </div>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                Redirecting to Secure Profile...
            </p>
        </div>
    );
}
