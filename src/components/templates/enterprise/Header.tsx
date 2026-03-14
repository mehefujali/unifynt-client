"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeaderProps {
    data: any;
    theme: any;
    school: any;
}

export const Header = ({ data, theme, school }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: data?.navItem1 || "Home", url: data?.navItem1Link || "#home" },
    { label: data?.navItem2 || "About", url: data?.navItem2Link || "#about" },
    { label: data?.navItem3 || "Academics", url: data?.navItem3Link || "#academics" },
    { label: data?.navItem4 || "Contact", url: data?.navItem4Link || "#contact" },
    ...(Array.isArray(data?.extraNavLinks) ? data.extraNavLinks : [])
  ].filter((item) => item.label);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-xl border-b border-zinc-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            {data?.logoImage ? (
              <img src={data.logoImage} className="h-10 w-auto hover:scale-105 transition-transform" alt="Logo" />
            ) : (
              <div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-black/10" style={{ backgroundColor: theme?.primary || "#171717" }}>
                {data?.logoText?.charAt(0) || school?.name?.charAt(0) || "S"}
              </div>
            )}
            <span className="text-xl font-bold tracking-tight text-zinc-900">{data?.logoText || school?.name || "School"}</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((item, i) => (
              <Link key={i} href={item.url} className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 transition-colors uppercase tracking-wider">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full px-6 h-12 font-bold hover:bg-zinc-100 transition-colors text-zinc-800">
                Portal Login
              </Button>
            </Link>
            <Link href={data?.ctaLink || "#"}>
              <Button className="rounded-full px-8 h-12 font-bold shadow-lg shadow-black/10 text-white border-0 transition-transform hover:scale-105" style={{ backgroundColor: theme?.primary || "#171717" }}>
                {data?.ctaText || "Apply Now"}
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 text-zinc-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>
      <div className="h-[73px] w-full" />

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
              <Link href="/login" className="mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-2xl h-14 font-bold text-lg border-2 border-zinc-200 text-zinc-800">
                  Portal Login
                </Button>
              </Link>
              <Link href={data?.ctaLink || "#"} className="mt-2" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full rounded-2xl h-14 font-bold text-lg text-white" style={{ backgroundColor: theme?.primary || "#171717" }}>
                  {data?.ctaText || "Apply Now"}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
