"use client";

import React from "react";
import { motion } from "framer-motion";
import { LandingHeader } from "@/components/landing/header";
import { LandingBottom } from "@/components/landing/bottom";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface LegalLayoutProps {
    title: string;
    description: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export const LegalLayout = ({ title, description, lastUpdated, children }: LegalLayoutProps) => {
    return (
        <main className="min-h-screen bg-white text-zinc-900 !light [color-scheme:light]">
            <LandingHeader />
            
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2B9EFF] opacity-[0.05] blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-4xl mx-auto relative z-10 pt-12">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-10 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <Link href="/" className="hover:text-[#2B9EFF] transition-colors flex items-center gap-1.5">
                            <Home size={12} />
                            Home
                        </Link>
                        <ChevronRight size={12} />
                        <span className="!text-zinc-900">{title}</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter !text-zinc-900 mb-6 leading-[0.9]">
                            {title}<span className="text-[#2B9EFF]">.</span>
                        </h1>
                        <p className="text-xl !text-zinc-500 font-medium max-w-2xl leading-relaxed mb-8">
                            {description}
                        </p>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            Last Updated: {lastUpdated}
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="pb-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
                        className="prose prose-zinc prose-lg lg:prose-xl max-w-none 
                        prose-headings:tracking-tight prose-headings:font-bold prose-headings:!text-zinc-900
                        prose-p:!text-zinc-600 prose-p:font-medium prose-p:leading-relaxed
                        prose-li:!text-zinc-600 prose-li:font-medium
                        prose-strong:!text-zinc-900 prose-strong:font-bold
                        prose-a:text-[#2B9EFF] prose-a:no-underline hover:prose-a:underline
                        border-t border-zinc-100 pt-16 !text-zinc-900"
                    >
                        {children}
                    </motion.div>
                </div>
            </section>

            <LandingBottom />
        </main>
    );
};
