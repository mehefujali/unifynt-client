"use client";
import React, { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Menu, X, Rocket } from "lucide-react";
import { SectionProps } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export const Header = ({ data, theme, school }: SectionProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: data?.navItem1 || "Home", to: "home" },
    { label: data?.navItem2 || "About", to: "about" },
    { label: data?.navItem3 || "Fun Facts", to: "stats" },
    { label: data?.navItem4 || "Programs", to: "academics" },
    { label: data?.navItem5 || "Gallery", to: "gallery" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "py-3 px-6" 
          : "py-6 px-10"
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto rounded-[2rem] transition-all duration-500 ${
          isScrolled 
            ? "bg-white/90 backdrop-blur-xl shadow-xl border-2 border-primary/10 px-8" 
            : "bg-transparent px-0"
        } h-20 flex items-center justify-between`}
      >
        <div className="flex items-center gap-3">
          {school?.logo ? (
            <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain bg-transparent" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white rotate-6 hover:rotate-0 transition-transform duration-300 shadow-lg" style={{ backgroundColor: theme?.primary || '#FF6B6B' }}>
                <Rocket className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-zinc-900 font-kids">
                {data?.logoText || school?.name || "Kiddo Academy"}
              </span>
            </>
          )}
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <ScrollLink
              key={item.to}
              to={item.to}
              spy={true}
              smooth={true}
              offset={-100}
              className="text-sm font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 cursor-pointer transition-colors relative group"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-1 rounded-full transition-all group-hover:w-full" style={{ backgroundColor: theme?.primary }} />
            </ScrollLink>
          ))}
          <Button 
            className="rounded-full px-8 font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all text-[11px] h-11"
            style={{ backgroundColor: theme?.primary || '#FF6B6B' }}
          >
            {data?.ctaText || "Join the Fun"}
          </Button>
        </div>

        <button className="md:hidden p-3 rounded-2xl bg-zinc-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="md:hidden absolute top-28 left-6 right-6 p-8 bg-white rounded-[2.5rem] shadow-2xl border-4 border-primary/20 z-50 overflow-hidden"
          >
             {/* Playful blobs in background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col gap-6 items-center">
              {navItems.map((item) => (
                <ScrollLink
                  key={item.to}
                  to={item.to}
                  spy={true}
                  smooth={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-widest text-zinc-700 hover:text-primary"
                >
                  {item.label}
                </ScrollLink>
              ))}
              <Button 
                className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-[12px] shadow-xl"
                style={{ backgroundColor: theme?.primary }}
              >
                {data?.ctaText || "Join the Fun"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
