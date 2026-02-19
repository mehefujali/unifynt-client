/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Trophy, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteConfigService } from "@/services/site-config.service";

export default async function SchoolLandingPage({ params }: { params: { schoolId: string } }) {
    let config;
    try {
        const res = await SiteConfigService.getPublicConfig(params.schoolId);
        config = res.data;
    } catch (error) {
        return notFound();
    }

    const primaryColor = config.primaryColor || "#0F172A";
    const secondaryColor = config.secondaryColor || "#EA580C";
    // Fallback to sections if exists, otherwise empty array
    const sections = Array.isArray(config.features) ? config.features : [];

    return (
        <div className="min-h-screen bg-white" style={{ "--primary": primaryColor, "--secondary": secondaryColor } as React.CSSProperties}>

            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-2xl" style={{ color: primaryColor }}>School Portal</div>
                    <Link href={`/admission/${params.schoolId}`}>
                        <Button style={{ backgroundColor: secondaryColor }}>Apply Now</Button>
                    </Link>
                </div>
            </header>

            {/* Dynamic Section Renderer */}
            <main>
                {sections.map((section: any, index: number) => {
                    if (!section.isVisible) return null;

                    // --- HERO SECTION ---
                    if (section.type === "HERO") {
                        return (
                            <section key={index} className="relative py-24 lg:py-32 flex items-center justify-center text-center text-white overflow-hidden bg-gray-900">
                                <div
                                    className="absolute inset-0 z-0 bg-cover bg-center opacity-50"
                                    style={{ backgroundImage: `url(${section.content?.image || '/placeholder-school.jpg'})` }}
                                />
                                <div className="relative z-10 container px-4 space-y-6">
                                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{section.title}</h1>
                                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">{section.subtitle}</p>
                                </div>
                            </section>
                        );
                    }

                    // --- STATS SECTION ---
                    if (section.type === "STATS") {
                        return (
                            <section key={index} className="py-16 bg-gray-50">
                                <div className="container px-4">
                                    <div className="text-center mb-12">
                                        <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>{section.title}</h2>
                                        <p className="text-gray-600">{section.subtitle}</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {[1, 2, 3].map((i) => (
                                            section.content[`stat${i}Value`] && (
                                                <div key={i} className="p-6 bg-white rounded-xl shadow-sm border text-center hover:shadow-md transition-shadow">
                                                    <div className="text-4xl font-bold mb-2" style={{ color: secondaryColor }}>
                                                        {section.content[`stat${i}Value`]}
                                                    </div>
                                                    <div className="text-gray-600 font-medium">{section.content[`stat${i}Label`]}</div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );
                    }

                    // --- CTA SECTION ---
                    if (section.type === "CTA") {
                        return (
                            <section key={index} className="py-20 text-white text-center" style={{ backgroundColor: primaryColor }}>
                                <div className="container px-4 space-y-8">
                                    <h2 className="text-3xl md:text-4xl font-bold">{section.title}</h2>
                                    <p className="text-white/80 max-w-2xl mx-auto text-lg">{section.subtitle}</p>
                                    <Link href={section.content?.btnLink || "#"}>
                                        <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bold text-lg px-8">
                                            {section.content?.btnText || "Learn More"} <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </section>
                        );
                    }

                    // --- FEATURES SECTION ---
                    if (section.type === "FEATURES") {
                        return (
                            <section key={index} className="py-20">
                                <div className="container px-4">
                                    <div className="text-center mb-16">
                                        <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>{section.title}</h2>
                                        <p className="text-gray-600 mt-2">{section.subtitle}</p>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-8">
                                        <div className="p-6 border rounded-lg hover:border-primary transition-colors">
                                            <Trophy className="h-10 w-10 mb-4" style={{ color: secondaryColor }} />
                                            <h3 className="text-xl font-bold mb-2">Excellence</h3>
                                            <p className="text-gray-600">We strive for the best results.</p>
                                        </div>
                                        <div className="p-6 border rounded-lg hover:border-primary transition-colors">
                                            <Users className="h-10 w-10 mb-4" style={{ color: secondaryColor }} />
                                            <h3 className="text-xl font-bold mb-2">Community</h3>
                                            <p className="text-gray-600">Building strong relationships.</p>
                                        </div>
                                        <div className="p-6 border rounded-lg hover:border-primary transition-colors">
                                            <BookOpen className="h-10 w-10 mb-4" style={{ color: secondaryColor }} />
                                            <h3 className="text-xl font-bold mb-2">Learning</h3>
                                            <p className="text-gray-600">Innovative teaching methods.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )
                    }

                    return null;
                })}
            </main>

            {/* Footer */}
            <footer className="py-8 bg-gray-900 text-white/50 text-center text-sm">
                &copy; {new Date().getFullYear()} All rights reserved.
            </footer>
        </div>
    );
}