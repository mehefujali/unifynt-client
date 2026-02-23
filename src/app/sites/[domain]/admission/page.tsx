import { prisma } from "@/app/config/db";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ModeToggle } from "@/components/mode-toggle";
import DynamicAdmissionForm from "@/components/admission/DynamicAdmissionForm";

interface AdmissionPageProps {
    params: Promise<{
        domain: string;
    }>;
}

export default async function AdmissionPage({ params }: AdmissionPageProps) {
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
            <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                        {school.logo ? (
                            <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain" />
                        ) : (
                            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                                {school.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{school.name}</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            Back to Home
                        </Link>
                        <ModeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 dark:from-indigo-900/20 to-transparent -z-10"></div>

                <div className="max-w-4xl mx-auto mb-10 text-center">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold text-sm border border-indigo-100 dark:border-indigo-500/20 tracking-wide">
                        Admissions Open
                    </div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl mb-4">
                        Application for Admission
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Join {school.name} for the upcoming academic session. Please complete the application form below with accurate information to initiate your admission process.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <DynamicAdmissionForm schoolId={school.id} />
                </div>
            </main>

            <footer className="bg-white dark:bg-slate-900 py-8 text-center border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} {school.name}. All rights reserved.
                </p>
            </footer>
        </div>
    );
}