"use client";
import React, { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Menu, X, Shield, Globe, ShoppingBag } from "lucide-react";
import { SectionProps } from "../playful-kids/types"; // Reusing types for consistency
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export const Header = ({ data, theme, school }: SectionProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: data?.navItem1 || "Academy", to: "home" },
    { label: data?.navItem2 || "Heritage", to: "about" },
    { label: data?.navItem3 || "Programs", to: "academics" },
    { label: data?.navItem4 || "Excellence", to: "gallery" },
    { label: data?.navItem5 || "Contact", to: "contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-2xl border-b border-zinc-200 py-4 shadow-sm" 
          : "bg-transparent py-8"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
             {school?.logo ? (
                <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain" />
              ) : (
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="p-3 bg-zinc-900 rounded-sm text-white transition-transform group-hover:bg-primary shadow-xl" style={{ backgroundColor: isScrolled ? '#18181b' : theme?.primary }}>
                        <Shield size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className={`text-xl font-black uppercase tracking-[0.2em] leading-none ${isScrolled ? 'text-zinc-900' : 'text-white'}`}>
                            {data?.logoText || school?.name || "Prestige"}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.4em] mt-1 ${isScrolled ? 'text-zinc-400' : 'text-white/50'}`}>
                            Academy Excellence
                        </span>
                    </div>
                </div>
              )}
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          {navItems.map((item) => (
            <ScrollLink
              key={item.to}
              to={item.to}
              spy={true}
              smooth={true}
              offset={-100}
              className={`text-[11px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all relative group ${
                isScrolled ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/70 hover:text-white'
              }`}
            >
              {item.label}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" style={{ backgroundColor: theme?.primary }} />
            </ScrollLink>
          ))}
        </div>

        {/* CTA Section */}
        <div className="hidden lg:flex items-center gap-6">
           <button className={`p-2 transition-colors ${isScrolled ? 'text-zinc-400 hover:text-zinc-900' : 'text-white/50 hover:text-white'}`}>
                <Globe size={20} />
           </button>
           <Button 
            className="rounded-none px-10 h-14 text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all"
            style={{ backgroundColor: theme?.primary || '#18181b' }}
          >
            {data?.ctaText || "Apply for 2025"}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button 
            className={`lg:hidden p-3 rounded-md ${isScrolled ? 'bg-zinc-100 text-zinc-900' : 'bg-white/10 text-white'}`} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 bg-white z-[60] flex flex-col p-12 lg:hidden"
          >
            <div className="flex justify-between items-center mb-20">
                 <Shield size={32} />
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-4 bg-zinc-100 rounded-full">
                    <X size={24} />
                 </button>
            </div>
            
            <div className="flex flex-col gap-10">
              {navItems.map((item, idx) => (
                <ScrollLink
                  key={item.to}
                  to={item.to}
                  spy={true}
                  smooth={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-4xl font-black uppercase tracking-tight text-zinc-900 border-b border-zinc-100 pb-6 flex justify-between items-center group"
                >
                  <span className="group-hover:translate-x-4 transition-transform">{item.label}</span>
                  <span className="text-zinc-200 group-hover:text-primary transition-colors">0{idx + 1}</span>
                </ScrollLink>
              ))}
            </div>

            <div className="mt-auto">
                <Button 
                    className="w-full rounded-none h-20 text-xs font-black uppercase tracking-widest"
                    style={{ backgroundColor: theme?.primary }}
                >
                    Online Admission
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
