/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";
import { Header, Footer } from "@/components/templates/enterprise";
import DynamicAdmissionForm from "@/components/admission/DynamicAdmissionForm";
import { Loader2 } from "lucide-react";

export default function AdmissionPage() {
    const { domain } = useParams();

    // Fetch site data via API (Safe for production)
    const { data: siteData, isLoading, isError } = useQuery({
        queryKey: ["public-site", domain],
        queryFn: () => SiteConfigService.getPublicSiteData(domain as string),
        enabled: !!domain,
    });

    useEffect(() => {
        console.log("AdmissionPage mounted for domain:", domain);
        return () => console.log("AdmissionPage unmounted");
    }, [domain]);

    const [liveTheme, setLiveTheme] = useState(DEFAULT_SITE_DATA.theme);
    const [liveContent, setLiveContent] = useState<any>(DEFAULT_SITE_DATA.content);

    useEffect(() => {
        if (siteData) {
            const mergedTheme = { ...DEFAULT_SITE_DATA.theme, ...(siteData.themeSettings || {}) };
            const mergedContent = { ...DEFAULT_SITE_DATA.content } as any;

            if (siteData.content) {
                Object.keys(DEFAULT_SITE_DATA.content).forEach(key => {
                    mergedContent[key] = {
                        ...(DEFAULT_SITE_DATA.content as any)[key],
                        ...(siteData.content[key] || {})
                    };
                });
            }


            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLiveTheme(mergedTheme);
            setLiveContent(mergedContent);
        }
    }, [siteData]);

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary h-12 w-12 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Admission Engine...</p>
            </div>
        );
    }

    if (isError || !siteData?.school) {
        return notFound();
    }

    const school = siteData.school;

    return (
        <div style={{ backgroundColor: liveTheme.background }} className="min-h-screen flex flex-col font-sans transition-colors duration-300">
            <Header data={liveContent.header} theme={liveTheme} school={school} />

            <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 relative">
                {/* Visual Background Decoration */}
                <div
                    className="absolute top-0 left-0 w-full h-[500px] opacity-10 -z-10 transition-all duration-1000"
                    style={{ background: `linear-gradient(to bottom, ${liveTheme.primary}, transparent)` }}
                ></div>

                <div className="max-w-4xl mx-auto mb-12 text-center">
                    <div
                        className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm border"
                        style={{ backgroundColor: `${liveTheme.primary}10`, color: liveTheme.primary, borderColor: `${liveTheme.primary}30` }}
                    >
                        Admission Portal Active
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6" style={{ color: liveTheme.textPrimary || '#000' }}>
                        Join Our Academic Community
                    </h1>
                    <div className="h-1 w-20 mx-auto mb-8 rounded-full" style={{ backgroundColor: liveTheme.primary }}></div>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed font-medium opacity-70" style={{ color: liveTheme.textPrimary || '#000' }}>
                        Ready to start your journey with {school.name}? Complete the official application form below. Our admissions team will review your submission promptly.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <DynamicAdmissionForm schoolId={school.id} />
                </div>
            </main>

            <Footer data={liveContent.footer} theme={liveTheme} school={school} />
        </div>
    );
}