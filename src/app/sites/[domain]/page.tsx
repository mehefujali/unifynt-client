/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowRight, BookOpen, GraduationCap, Users, Monitor,
    Trophy, CheckCircle2, ChevronRight, Phone, Mail,
    MapPin, ShieldCheck, Globe, Award, Quote, Sparkles
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface SchoolLandingPageProps {
    params: Promise<{
        domain: string;
    }>;
}

// Enterprise Level Fallback Content (With 8 Sections)
const fallbackContent = {
    hero: {
        badgeText: "Admissions Open 2026-2027",
        titlePart1: "Empowering",
        titleHighlight: "Minds",
        titlePart2: ", Shaping Futures.",
        description: "Join a globally recognized community dedicated to academic rigor, moral integrity, and lifelong learning. Experience education without boundaries.",
        primaryButtonText: "Start Admission",
        primaryButtonLink: "/admission",
        secondaryButtonText: "Explore Campus",
        secondaryButtonLink: "#facilities",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
        stats: [
            { label: "Enrolled Students", value: "2,500+", icon: "users" },
            { label: "Passing Rate", value: "99.8%", icon: "graduation-cap" },
            { label: "Expert Faculty", value: "150+", icon: "book" },
        ]
    },
    affiliations: ["CBSE Affiliated", "ISO 9001:2015 Certified", "British Council ISA", "Microsoft Showcase School"],
    about: {
        title: "A Legacy of Excellence",
        subtitle: "Our Heritage",
        description: "Founded on the principles of discipline and advanced knowledge, our institution has been shaping the leaders of tomorrow for over two decades. We believe in holistic development that balances rigorous academics with rich extracurricular activities, preparing students for the global stage.",
        image1: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop",
        image2: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop"
    },
    academics: [
        { title: "Global Curriculum", desc: "Internationally recognized syllabus tailored for future leaders.", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-1", icon: "globe" },
        { title: "STEM Focus", desc: "Advanced robotics and coding labs.", colSpan: "col-span-1", rowSpan: "row-span-1 md:row-span-2", icon: "monitor" },
        { title: "Arts & Culture", desc: "Fostering creativity through music, drama, and fine arts.", colSpan: "col-span-1", rowSpan: "row-span-1", icon: "award" },
        { title: "Leadership Programs", desc: "Building character and management skills from an early age.", colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-1", icon: "shield" }
    ],
    facilities: [
        { title: "The Grand Library", description: "Over 50,000 resources and digital journals.", image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop" },
        { title: "Olympic Sports Complex", description: "Premium indoor and outdoor sporting facilities.", image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2000&auto=format&fit=crop" },
        { title: "Advanced Science Labs", description: "State-of-the-art physics, chemistry, and bio labs.", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=2000&auto=format&fit=crop" },
    ],
    testimonials: [
        { quote: "The holistic approach to education here has transformed my child. They are not just learning; they are growing into responsible global citizens.", author: "Sarah Jenkins", role: "Parent" },
        { quote: "The faculty's dedication and the world-class infrastructure provided me with the perfect launchpad for my Ivy League journey.", author: "David Chen", role: "Alumni, Harvard '24" }
    ],
    cta: {
        title: "Ready to Shape Your Child's Future?",
        description: "Join thousands of successful students who started their journey with us. Admissions are open for 2026.",
        buttonText: "Apply Now for 2026"
    },
    footer: {
        poweredBy: "Unifynt Premium"
    }
};

const fallbackTheme = {
    colors: { primary: "#0f172a", secondary: "#d4af37" },
    hiddenSections: [] as string[]
};

async function fetchSchoolData(domain: string) {
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api/v1').replace('localhost', '127.0.0.1');
    const url = `${baseUrl}/schools/domain/${domain}`;
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;
        const responseData = await res.json();
        return responseData.data;
    } catch (error) {
        return null;
    }
}

const getIcon = (iconName: string, color: string) => {
    const props = { className: "w-6 h-6", style: { color } };
    switch (iconName) {
        case 'users': return <Users {...props} />;
        case 'graduation-cap': return <GraduationCap {...props} />;
        case 'monitor': return <Monitor {...props} />;
        case 'globe': return <Globe {...props} />;
        case 'shield': return <ShieldCheck {...props} />;
        case 'award': return <Award {...props} />;
        case 'book': return <BookOpen {...props} />;
        case 'trophy': return <Trophy {...props} />;
        default: return <Sparkles {...props} />;
    }
};

export default async function SchoolLandingPage({ params }: SchoolLandingPageProps) {
    const resolvedParams = await params;
    const domain = decodeURIComponent(resolvedParams.domain);
    const school = await fetchSchoolData(domain);

    if (!school) return notFound();

    const rawContent = school.siteConfig?.content as any;
    const content = (rawContent && rawContent.hero) ? rawContent : fallbackContent;

    const rawTheme = school.siteConfig?.themeSettings as any;
    const theme = (rawTheme && rawTheme.colors) ? rawTheme : fallbackTheme;

    const hiddenSections = theme.hiddenSections || [];
    const pColor = theme.colors?.primary || fallbackTheme.colors.primary;
    const sColor = theme.colors?.secondary || fallbackTheme.colors.secondary;

    const getRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        // ⚠️ FIXED TYPE ERROR HERE: Used CSS Variables for dynamic tailwind selection color
        <div 
            className="min-h-screen bg-[#f8fafc] dark:bg-[#020817] flex flex-col font-sans selection:text-white selection:bg-[var(--theme-primary)]" 
            style={{ "--theme-primary": pColor } as React.CSSProperties}
        >

            {/* 1. HEADER (Ultra Glassmorphism) */}
            <header className="w-full bg-white/60 dark:bg-[#020817]/60 backdrop-blur-2xl sticky top-0 z-50 border-b border-slate-200/50 dark:border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        {school.logo ? (
                            <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3" style={{ backgroundColor: pColor }}>
                                {school.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{school.name}</span>
                    </div>

                    <nav className="hidden lg:flex items-center gap-10 font-medium text-[15px] text-slate-600 dark:text-slate-300">
                        <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
                        {!hiddenSections.includes('about') && <Link href="#about" className="hover:text-black dark:hover:text-white transition-colors">About Us</Link>}
                        {!hiddenSections.includes('academics') && <Link href="#academics" className="hover:text-black dark:hover:text-white transition-colors">Academics</Link>}
                        {!hiddenSections.includes('facilities') && <Link href="#facilities" className="hover:text-black dark:hover:text-white transition-colors">Campus</Link>}
                    </nav>

                    <div className="flex items-center gap-5">
                        <ModeToggle />
                        <Link
                            href={content.hero?.primaryButtonLink || "/admission"}
                            className="hidden md:flex text-white px-7 py-3 rounded-full text-sm font-bold transition-all hover:shadow-2xl hover:-translate-y-1 items-center gap-2"
                            style={{ backgroundColor: pColor, boxShadow: `0 10px 25px -5px ${getRgba(pColor, 0.4)}` }}
                        >
                            Apply Now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* 2. HERO SECTION (Mesh Gradient & Floating Elements) */}
                {!hiddenSections.includes('hero') && content.hero && (
                    <section className="relative w-full pt-28 pb-24 md:pt-40 md:pb-32 overflow-hidden">
                        {/* Elite Mesh Gradient Backgrounds */}
                        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 mix-blend-multiply dark:mix-blend-screen pointer-events-none animate-pulse" style={{ backgroundColor: pColor }}></div>
                        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 mix-blend-multiply dark:mix-blend-screen pointer-events-none" style={{ backgroundColor: sColor }}></div>

                        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
                            <div className="space-y-10 text-center lg:text-left">
                                <div
                                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest border backdrop-blur-md shadow-sm"
                                    style={{ color: pColor, borderColor: getRgba(pColor, 0.15), backgroundColor: getRgba(pColor, 0.03) }}
                                >
                                    <Sparkles className="w-4 h-4" style={{ color: sColor }} />
                                    {content.hero.badgeText}
                                </div>

                                <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black text-slate-900 dark:text-white leading-[1.05] tracking-tighter">
                                    {content.hero.titlePart1} <br />
                                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${pColor}, ${sColor})` }}>
                                        {content.hero.titleHighlight}
                                    </span><br />
                                    {content.hero.titlePart2}
                                </h1>

                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                    {content.hero.description?.replace('{schoolName}', school.name)}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-4">
                                    <Link
                                        href={content.hero.primaryButtonLink || "/admission"}
                                        className="text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 group"
                                        style={{ backgroundColor: pColor }}
                                    >
                                        {content.hero.primaryButtonText || "Apply"}
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                                    </Link>
                                    <Link
                                        href={content.hero.secondaryButtonLink || "#about"}
                                        className="bg-transparent text-slate-900 dark:text-white border-[1.5px] border-slate-300 dark:border-slate-700 px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                                    >
                                        {content.hero.secondaryButtonText || "Learn More"}
                                    </Link>
                                </div>
                            </div>

                            <div className="relative w-full max-w-lg mx-auto lg:max-w-none perspective-1000">
                                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative border-[0.5px] border-white/20 transform rotate-y-[-5deg] hover:rotate-y-0 transition-transform duration-700">
                                    <img src={content.hero.image} alt="Hero" className="object-cover w-full h-full scale-105 hover:scale-100 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/10 to-transparent"></div>

                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            {content.hero.stats?.slice(0, 2).map((stat: any, index: number) => (
                                                <div key={index} className="bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/10">
                                                    <div className="font-black text-4xl text-white mb-1">{stat.value}</div>
                                                    <div className="text-xs font-bold text-slate-300 uppercase tracking-widest">{stat.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 3. AFFILIATIONS / TRUST BANNER */}
                <section className="py-10 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-[#020817]/50 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {content.affiliations?.map((aff: string, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                                <ShieldCheck className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                                <span className="text-sm font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">{aff}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. ABOUT / LEGACY SECTION */}
                {!hiddenSections.includes('about') && (
                    <section id="about" className="py-32 bg-white dark:bg-[#020817]">
                        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                            <div className="relative h-[600px] hidden lg:block">
                                <img src={content.about?.image1 || fallbackContent.about.image1} className="absolute top-0 left-0 w-3/4 h-[400px] object-cover rounded-3xl shadow-2xl z-10 border-8 border-white dark:border-[#020817]" alt="About 1" />
                                <img src={content.about?.image2 || fallbackContent.about.image2} className="absolute bottom-0 right-0 w-2/3 h-[350px] object-cover rounded-3xl shadow-2xl z-20 border-8 border-white dark:border-[#020817]" alt="About 2" />
                            </div>
                            <div className="space-y-8">
                                <h4 className="font-black tracking-widest text-sm uppercase flex items-center gap-3" style={{ color: pColor }}>
                                    <span className="w-12 h-0.5" style={{ backgroundColor: pColor }}></span>
                                    {content.about?.subtitle || fallbackContent.about.subtitle}
                                </h4>
                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                                    {content.about?.title || fallbackContent.about.title}
                                </h2>
                                <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                                    {content.about?.description || fallbackContent.about.description}
                                </p>
                                <div className="pt-6 flex items-center gap-6">
                                    <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex-1">
                                        <h3 className="text-4xl font-black" style={{ color: pColor }}>25+</h3>
                                        <p className="text-sm font-bold text-slate-500 uppercase mt-2">Years of Excellence</p>
                                    </div>
                                    <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex-1">
                                        <h3 className="text-4xl font-black" style={{ color: pColor }}>10k+</h3>
                                        <p className="text-sm font-bold text-slate-500 uppercase mt-2">Global Alumni</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* 5. ACADEMICS (BENTO GRID) */}
                <section id="academics" className="py-32 bg-[#f8fafc] dark:bg-[#050b1a]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">Academic <br />Excellence.</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                            {(content.academics || fallbackContent.academics).map((item: any, i: number) => (
                                <div key={i} className={`${item.colSpan} ${item.rowSpan} rounded-3xl p-8 relative overflow-hidden group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 hover:shadow-2xl transition-all duration-500 flex flex-col justify-end`}>
                                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700" style={{ color: pColor }}>
                                        {getIcon(item.icon, pColor)}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 rounded-full mb-6 flex items-center justify-center bg-slate-50 dark:bg-slate-800 group-hover:-translate-y-2 transition-transform duration-500">
                                            {getIcon(item.icon, pColor)}
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 6. PREMIUM FACILITIES */}
                {!hiddenSections.includes('facilities') && (
                    <section id="facilities" className="py-32 bg-white dark:bg-[#020817]">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                                <div className="max-w-2xl">
                                    <h4 className="font-black tracking-widest text-sm uppercase mb-4" style={{ color: pColor }}>Infrastructure</h4>
                                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">World-Class Campus</h2>
                                </div>
                                <Button className="rounded-full px-8 py-6 font-bold" style={{ backgroundColor: pColor, color: '#fff' }}>View All Facilities</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {(content.facilities || fallbackContent.facilities).map((fac: any, i: number) => (
                                    <div key={i} className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer">
                                        <img src={fac.image} alt={fac.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/90 via-[#020817]/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <h3 className="text-2xl font-bold text-white mb-2">{fac.title}</h3>
                                            <p className="text-slate-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{fac.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* 7. TESTIMONIALS */}
                <section className="py-32 bg-[#f8fafc] dark:bg-[#050b1a] overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-16">Voices of Success</h2>
                        <div className="grid md:grid-cols-2 gap-10">
                            {(content.testimonials || fallbackContent.testimonials).map((t: any, i: number) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 text-left relative">
                                    <Quote className="w-16 h-16 absolute top-8 right-8 opacity-5" style={{ color: pColor }} />
                                    <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-10">&quot;{t.quote}&quot;</p>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">{t.author}</h4>
                                        <p className="text-sm font-bold uppercase tracking-wider" style={{ color: pColor }}>{t.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8. IMMERSIVE CTA */}
                <section className="py-32 relative overflow-hidden">
                    <div className="absolute inset-0 z-0" style={{ backgroundColor: pColor }}></div>
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                    <div className="max-w-5xl mx-auto px-6 relative z-10 text-center space-y-10">
                        <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                            {content.cta?.title || fallbackContent.cta.title}
                        </h2>
                        <p className="text-2xl text-white/80 max-w-3xl mx-auto font-medium">
                            {content.cta?.description || fallbackContent.cta.description}
                        </p>
                        <div className="pt-8">
                            <Link
                                href={content.hero?.primaryButtonLink || "/admission"}
                                className="inline-flex items-center gap-3 bg-white text-slate-900 px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl"
                            >
                                {content.cta?.buttonText || fallbackContent.cta.buttonText} <ChevronRight className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* 9. ENTERPRISE FOOTER */}
            <footer className="bg-white dark:bg-[#020817] pt-24 pb-12 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: pColor }}>
                                {school.name.charAt(0)}
                            </div>
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{school.name}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm text-lg font-medium leading-relaxed">
                            Empowering students to achieve their highest potential through world-class education and character development.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 uppercase text-sm tracking-widest">Explore</h4>
                        <ul className="space-y-5">
                            <li><Link href="#" className="text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">Campus Life</Link></li>
                            <li><Link href="#academics" className="text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">Academics</Link></li>
                            <li><Link href="/admission" className="text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white transition-colors">Admissions</Link></li>
                        </ul>
                    </div>
                    <div className="lg:col-span-2">
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 uppercase text-sm tracking-widest">Contact Office</h4>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-4 text-slate-500 font-medium">
                                <MapPin className="w-5 h-5 mt-0.5 shrink-0" style={{ color: pColor }} />
                                <span>Durgapur, Murshidabad<br />West Bengal, India</span>
                            </li>
                            <li className="flex items-center gap-4 text-slate-500 font-medium">
                                <Phone className="w-5 h-5" style={{ color: pColor }} />
                                +91 8391977901
                            </li>
                            <li className="flex items-center gap-4 text-slate-500 font-medium">
                                <Mail className="w-5 h-5" style={{ color: pColor }} />
                                {school.email || "mehefujalim@gmail.com"}
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-slate-500 font-medium text-sm">
                        &copy; {new Date().getFullYear()} {school.name}. All rights reserved.
                    </p>
                    <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                        Engineered with <span style={{ color: pColor }} className="font-black">{content.footer?.poweredBy || "Unifynt SaaS"}</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}

// Add this simple Button component at the end of the file or import it from your UI components if missing above
function Button({ children, className, style }: any) {
    return <button className={`hover:opacity-90 transition-opacity ${className}`} style={style}>{children}</button>;
}