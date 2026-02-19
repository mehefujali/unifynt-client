"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { SiteConfigService } from "@/services/site-config.service";
import { useAuth } from "@/hooks/use-auth";
import GrapesEditor from "./GrapesEditor";

export default function BuilderPage() {
    const { user } = useAuth();

    const { data: config, isLoading } = useQuery({
        queryKey: ["site-config"],
        queryFn: () => SiteConfigService.getSiteConfig(),
    });

    if (isLoading || !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-3 text-slate-600 font-medium">Loading Builder Studio...</span>
            </div>
        );
    }

    // School name default fallback
    const schoolName = config?.school?.name || user.school?.name || "My School";
    const schoolLogo = config?.school?.logo || null;

    return (
        <div className="absolute inset-0 z-50 bg-white">
            <GrapesEditor
                initialData={config}
                schoolName={schoolName}
                schoolLogo={schoolLogo}
            />
        </div>
    );
}