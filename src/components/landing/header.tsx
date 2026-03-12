/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const LandingHeader = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isAuthenticated = !!user;

    const getDashboardRoute = () => {
        if (user?.role === "SUPER_ADMIN") return "/super-admin";
        if (user?.role === "STUDENT") return "/student";
        return "/admin";
    };

    const navLinks = [
        { label: "Features", url: "#features" },
        { label: "Solutions", url: "#solutions" },
        { label: "Resources", url: "#resources" },
        { label: "Pricing", url: "#pricing" },
    ];

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
                    scrolled 
                    ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 py-4" 
                    : "bg-transparent border-b border-transparent py-6"
                }`}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/unifynt-logo.png" alt="Unifynt Logo" className="h-10 w-auto group-hover:scale-105 transition-transform duration-500 ease-out" />
                        <span className="text-xl font-bold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors duration-300">Unifynt</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((item, i) => (
                            <Link key={i} href={item.url} className="text-sm font-semibold text-zinc-500 hover:text-zinc-950 transition-colors tracking-wide">
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href={getDashboardRoute()}>
                                <Button className="rounded-full px-8 h-12 font-bold bg-zinc-950 text-white hover:bg-zinc-800 transition-colors">
                                    Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-full px-6 h-12 font-bold text-zinc-600 hover:text-zinc-900">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="rounded-full px-8 h-12 font-bold bg-zinc-950 shadow-lg shadow-zinc-950/20 text-white hover:bg-zinc-800 transition-transform hover:scale-105">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        className="lg:hidden p-2 text-zinc-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </motion.header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[90] bg-white pt-24 px-6 flex flex-col lg:hidden"
                    >
                        <div className="flex flex-col gap-6 text-center">
                            {navLinks.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.url}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-semibold text-zinc-900 border-b border-zinc-100 pb-4"
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="mt-8 flex flex-col gap-4">
                                {isAuthenticated ? (
                                    <Link href={getDashboardRoute()} onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button className="w-full rounded-2xl h-14 font-bold text-lg bg-zinc-950 text-white">
                                            Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full rounded-2xl h-14 font-bold text-lg">
                                                Log In
                                            </Button>
                                        </Link>
                                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button className="w-full rounded-2xl h-14 font-bold text-lg bg-zinc-950 text-white">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
