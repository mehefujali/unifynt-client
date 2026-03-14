"use client";
import React, { useState, useEffect } from "react";
import { SectionProps } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const Header = ({ data, theme, school }: SectionProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: data?.navItem1 || "Home", href: data?.navItem1Link || "#" },
    { name: data?.navItem2 || "About", href: data?.navItem2Link || "#" },
    { name: data?.navItem3 || "Programs", href: data?.navItem3Link || "#" },
    { name: data?.navItem4 || "Contact", href: data?.navItem4Link || "#" },
    ...(data?.extraNavLinks || []).map((l: any) => ({ name: l.label, href: l.url })),
  ];

  const logoText = data?.logoText || school?.name || "Unifynt";
  const logoImage = data?.logoImage;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "py-3 bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm" 
            : "py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            {logoImage ? (
              <img src={logoImage} alt={logoText} className="h-10 w-auto object-contain" />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-105"
                style={{ backgroundColor: theme?.primary || "#000000" }}
              >
                {logoText.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg tracking-tight text-zinc-900">
              {logoText}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="text-[13px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#contact">
                <Button 
                    className="rounded-full px-6 h-10 text-[12px] font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all"
                    style={{ backgroundColor: theme?.primary || "#000000" }}
                >
                    {data?.ctaText || "Apply Now"} <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="font-bold text-xl">{logoText}</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-8 h-8 text-zinc-900" />
              </button>
            </div>
            <div className="flex flex-col gap-8">
              {navLinks.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-bold tracking-tight text-zinc-900"
                >
                  {link.name}
                </Link>
              ))}
              <Link href={data?.ctaLink || "/admission"} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full h-14 text-lg font-bold rounded-2xl" style={{ backgroundColor: theme?.primary || "#000000" }}>
                  {data?.ctaText || "Start Admission"}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[80px]" /> {/* Spacer */}
    </>
  );
};
