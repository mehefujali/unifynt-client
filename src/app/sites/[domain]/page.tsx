import { prisma } from "@/app/config/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Users } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface SchoolLandingPageProps {
    params: Promise<{
        domain: string;
    }>;
}

export default async function SchoolLandingPage({ params }: SchoolLandingPageProps) {
    const resolvedParams = await params;
    const domain = decodeURIComponent(resolvedParams.domain);

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
            {/* Navbar */}
            <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {school.logo ? (
                            <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain" />
                        ) : (
                            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                                {school.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{school.name}</span>
                    </div>
                    <nav className="hidden md:flex gap-8 font-medium text-slate-600 dark:text-slate-300">
                        <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
                        <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</Link>
                        <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Academics</Link>
                        <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <ModeToggle />
                        <Link
                            href={`/admission`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Apply Now <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow">
                <section className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl -z-10"></div>

                    <div className="flex-1 space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium text-sm border border-indigo-100 dark:border-indigo-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Admissions Open for 2026-2027
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                            Empowering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Minds</span>,<br /> Shaping Futures.
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto md:mx-0">
                            Welcome to {school.name}. We provide world-class education with state-of-the-art facilities to help your child achieve excellence in every aspect of life.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                            <Link href={`/admission`} className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                                Start Admission
                            </Link>
                            <Link href="#features" className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-800 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
                                Learn More
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 relative w-full">
                        <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop"
                                alt="Students happy"
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <div className="flex gap-4">
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                        <Users className="w-8 h-8 mb-2 text-indigo-300" />
                                        <div className="font-bold text-2xl">1000+</div>
                                        <div className="text-sm text-slate-300">Enrolled Students</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                                        <GraduationCap className="w-8 h-8 mb-2 text-violet-300" />
                                        <div className="font-bold text-2xl">100%</div>
                                        <div className="text-sm text-slate-300">Passing Rate</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 dark:bg-black text-slate-400 py-12 text-center border-t border-slate-800">
                <p>&copy; {new Date().getFullYear()} {school.name}. All rights reserved.</p>
                <p className="text-sm mt-2">Powered by Unifynt ERP</p>
            </footer>
        </div>
    );
}