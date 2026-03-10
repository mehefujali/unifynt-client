/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from "next/navigation";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";
import { Header, Footer } from "@/components/templates/enterprise-sections";
import DynamicAdmissionForm from "@/components/admission/DynamicAdmissionForm";
import { prisma } from "@/app/config/db";

interface AdmissionPageProps {
    params: Promise<{
        domain: string;
    }>;
}

export default async function AdmissionPage({ params }: AdmissionPageProps) {
    const resolvedParams = await params;
    const domain = decodeURIComponent(resolvedParams.domain);

    // Fetch school to ensure it exists and get ID for the form
    const school = await prisma.school.findFirst({
        where: {
            OR: [
                { subdomain: domain },
                { slug: domain }
            ],
            isActive: true,
        }
    });

    if (!school) {
        return notFound();
    }

    // Fetch site config for Header/Footer styling
    let siteData = null;
    try {
        siteData = await SiteConfigService.getPublicSiteData(domain);
    } catch (e) {
        siteData = null;
    }

    const liveTheme = siteData?.themeSettings ? { ...DEFAULT_SITE_DATA.theme, ...siteData.themeSettings } : DEFAULT_SITE_DATA.theme;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const liveContent = { ...DEFAULT_SITE_DATA.content } as any;
    
    if (siteData?.content) {
        Object.keys(DEFAULT_SITE_DATA.content).forEach(key => {
            liveContent[key] = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(DEFAULT_SITE_DATA.content as any)[key],
                ...(siteData?.content[key] || {})
            };
        });
    }

    return (
        <div style={{ backgroundColor: liveTheme.background }} className="min-h-screen flex flex-col font-sans transition-colors duration-300">
            <Header data={liveContent.header} theme={liveTheme} school={siteData?.school || school} />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute top-0 left-0 w-full h-96 opacity-20 -z-10" style={{ background: `linear-gradient(to bottom, ${liveTheme.primary}, transparent)` }}></div>

                <div className="max-w-4xl mx-auto mb-10 text-center">
                    <div 
                        className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full font-semibold text-sm tracking-wide"
                        style={{ backgroundColor: `${liveTheme.primary}20`, color: liveTheme.primary, borderColor: `${liveTheme.primary}40`, borderWidth: '1px' }}    
                    >
                        Admissions Open
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4" style={{ color: liveTheme.text }}>
                        Application for Admission
                    </h1>
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: liveTheme.text, opacity: 0.8 }}>
                        Join {school.name} for the upcoming academic session. Please complete the application form below with accurate information to initiate your admission process.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <DynamicAdmissionForm schoolId={school.id} />
                </div>
            </main>

            <Footer data={liveContent.footer} theme={liveTheme} school={siteData?.school || school} />
        </div>
    );
}