"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, GraduationCap, Users, Trophy,
  Mail, Phone, Star, Laptop, ShieldCheck,
  Globe, Facebook, Instagram, Twitter, PlayCircle, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// --- MOTION VARIANTS ---
const fadeUp: any = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
const staggerContainer: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

// --- 1. HEADER (Top-Aligned, Responsive) ---
export const Header = ({ data, theme, school }: any) => {
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
              <div className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white shadow-md shadow-black/10" style={{ backgroundColor: theme?.primary || "#171717" }}>
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

          <div className="hidden lg:block">
            <Link href={data?.ctaLink || "#"}>
              <Button className="rounded-full px-8 h-12 font-bold shadow-lg shadow-black/10 text-white border-0 transition-transform hover:scale-105" style={{ backgroundColor: theme?.primary || "#171717" }}>
                {data?.ctaText || "Apply Now"}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-zinc-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
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
              <Link href={data?.ctaLink || "#"} className="mt-4" onClick={() => setIsMobileMenuOpen(false)}>
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

// --- 2. HERO (Dynamic Mesh & Large Typography) ---
export const Hero = ({ data, theme }: any) => (
  <section id="home" className="relative min-h-[105vh] flex items-center justify-center overflow-hidden bg-[#FAFAFA] pt-20">
    {/* Dynamic Background */}
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[140px]"
        style={{ backgroundColor: theme?.primary || "#2563eb" }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[140px]"
        style={{ backgroundColor: theme?.secondary || "#7c3aed" }}
      />
    </div>

    <div className="max-w-6xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
      <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-10">
        <motion.div variants={fadeUp}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-black/5 backdrop-blur-md shadow-sm mb-4">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme?.primary || "#2563eb" }} /><span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: theme?.primary || "#2563eb" }} /></span>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">Admissions Open 2026</span>
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-[5rem] md:text-[8rem] lg:text-[140px] font-medium tracking-[-0.04em] leading-[0.85] text-zinc-900">
          {data?.title || "Redefining"} <br /><span className="italic font-serif" style={{ color: theme?.primary || "#2563eb" }}>Excellence.</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-xl md:text-3xl text-zinc-500 max-w-3xl mx-auto font-light leading-relaxed">
          {data?.subtitle || "A world-class curriculum designed to nurture brilliant minds and future global leaders."}
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-8">
          <Link href={data?.ctaLink || "#"}>
            <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#171717" }}>
              {data?.ctaText || "Start Journey"}
            </Button>
          </Link>
          <Button variant="ghost" className="h-16 px-8 rounded-full text-lg font-semibold hover:bg-zinc-100 group">
            <PlayCircle className="mr-3 h-6 w-6 text-zinc-400 group-hover:text-zinc-900 transition-colors" /> Watch Campus Tour
          </Button>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// --- 3. STATS (Floating Cards overlapping Hero) ---
export const Stats = ({ data, theme }: any) => (
  <section className="relative z-20 -mt-24 px-6 mb-32">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
      >
        {[
          { label: "Global Students", val: data?.students || "2.5K+", icon: Users },
          { label: "Expert Faculty", val: data?.teachers || "150+", icon: GraduationCap },
          { label: "Campus Acres", val: data?.campus || "45+", icon: Globe },
          { label: "Awards Won", val: data?.awards || "200+", icon: Trophy }
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-[1.8rem] bg-white border border-zinc-100/50 flex flex-col items-center text-center group hover:shadow-xl transition-all duration-500">
            <div className="h-14 w-14 rounded-full bg-zinc-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ color: theme?.primary || "#171717" }}>
              <stat.icon className="h-6 w-6" />
            </div>
            <h3 className="text-4xl font-semibold tracking-tight text-zinc-900 mb-2">{stat.val}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// --- 4. ABOUT (Split layout with enormous typography) ---
export const About = ({ data, theme }: any) => (
  <section id="about" className="py-32 px-6">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative aspect-[3/4] lg:aspect-square rounded-[3rem] overflow-hidden"
      >
        <img src={data?.aboutImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"} className="object-cover w-full h-full hover:scale-105 transition-transform duration-1000" alt="About" />
        <div className="absolute inset-0 border border-black/5 rounded-[3rem] pointer-events-none" />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="space-y-12"
      >
        <motion.div variants={fadeUp}>
          <h2 className="text-5xl lg:text-[5rem] font-medium tracking-[-0.03em] leading-[0.9] text-zinc-900 mb-8 mt-10">
            {data?.title || "A legacy of"} <br /><span className="text-zinc-400">brilliance.</span>
          </h2>
          <p className="text-xl lg:text-3xl text-zinc-500 font-light leading-relaxed">
            {data?.description || "Providing unparalleled excellence in education, combining state-of-the-art infrastructure with compassionate mentoring."}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-8 pt-8">
          {["Innovative Pedagogy", "Global Alumni Network", "Olympic Standard Sports", "Advanced Research Labs"].map((p, i) => (
            <div key={i} className="flex flex-col gap-3">
              <CheckCircle2 className="h-6 w-6" style={{ color: theme?.primary || "#2563eb" }} />
              <span className="font-semibold text-zinc-900">{p}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

// --- 5. FEATURES (Bento Box Grid) ---
export const Features = ({ data, theme }: any) => (
  <section className="py-32 px-4 lg:px-6">
    <div className="max-w-7xl mx-auto rounded-[3rem] lg:rounded-[4rem] bg-[#0A0A0A] p-8 lg:p-16 relative overflow-hidden text-white">
      {/* Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full opacity-30 pointer-events-none" style={{ backgroundColor: theme?.primary || "#2563eb" }} />

      <div className="text-center mb-20 relative z-10">
        <h2 className="text-5xl lg:text-7xl font-medium tracking-tight mb-6">{data?.title || "Beyond Academics"}</h2>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">Ecosystem built for holistic growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Bento Box 1 - Span 2 */}
        <div className="md:col-span-2 p-10 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors relative overflow-hidden group">
          <Laptop className="h-10 w-10 text-white/50 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-medium mb-3">{data?.item1 || "Digital Campus"}</h3>
          <p className="text-zinc-400 text-lg font-light max-w-md">100% paperless workflows and interactive smart boards in every classroom.</p>
          <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-white/5 rounded-full blur-[40px] group-hover:bg-white/10 transition-colors" />
        </div>

        {/* Bento Box 2 */}
        <div className="p-10 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors group">
          <Trophy className="h-10 w-10 text-white/50 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-medium mb-3">{data?.item2 || "Elite Sports"}</h3>
          <p className="text-zinc-400 text-lg font-light">FIFA-approved turf and Olympic swimming pool.</p>
        </div>

        {/* Bento Box 3 */}
        <div className="p-10 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors group">
          <ShieldCheck className="h-10 w-10 text-white/50 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-3xl font-medium mb-3">{data?.item3 || "Safe Haven"}</h3>
          <p className="text-zinc-400 text-lg font-light">AI-powered 24/7 security & tracking.</p>
        </div>

        {/* Bento Box 4 - Span 2 */}
        <div className="md:col-span-2 p-10 rounded-[2rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group cursor-pointer" style={{ borderColor: theme?.primary ? `${theme.primary}50` : undefined }}>
          <div>
            <Badge variant="outline" className="border-white/20 text-white mb-6">NEW</Badge>
            <h3 className="text-3xl font-medium mb-3">Global Exchange Program</h3>
            <p className="text-zinc-400 text-lg font-light max-w-sm">Partnered with Ivy league institutions for student exchange.</p>
          </div>
          <div className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            <ArrowRight className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// --- 6. ACADEMICS (Clean, Expandable Cards) ---
export const Academics = ({ data }: any) => (
  <section id="academics" className="py-32 px-6 bg-zinc-50 border-y border-zinc-200/50">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
        <div className="max-w-2xl">
          <h2 className="text-5xl lg:text-7xl font-medium tracking-tight text-zinc-900 mb-6">{data?.title || "Academic Pathways"}</h2>
          <p className="text-xl text-zinc-500 font-light">{data?.description || "Structured progression from kindergarten to university preparation."}</p>
        </div>
        <Button variant="outline" className="rounded-full px-8 h-12">Download Brochure</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Early Years", desc: "Montessori & Reggio Emilia inspired approach for ages 3-6.", bg: "bg-[#F3F4F6]" },
          { title: "Primary School", desc: "Building strong foundational skills in STEM and Arts.", bg: "bg-[#E5E7EB]" },
          { title: "Senior Secondary", desc: "Rigorous curriculum preparing for global boards.", bg: "bg-[#D1D5DB]" }
        ].map((prog, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10 }}
            className={`p-10 rounded-[2.5rem] ${prog.bg} border border-white relative overflow-hidden group cursor-pointer`}
          >
            <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-16 text-zinc-400 group-hover:text-zinc-900 transition-colors">
              <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
            <h3 className="text-3xl font-medium text-zinc-900 mb-4">{prog.title}</h3>
            <p className="text-zinc-600 font-light text-lg">{prog.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- 7. TESTIMONIALS (Single Hero Quote) ---
export const Testimonials = ({ data }: any) => (
  <section className="py-32 lg:py-48 px-6 text-center">
    <div className="max-w-5xl mx-auto space-y-16 flex flex-col items-center">
      <Star className="h-10 w-10 text-zinc-300 fill-current" />
      <h2 className="text-4xl lg:text-6xl font-medium leading-[1.2] tracking-tight text-zinc-900 font-serif italic">
        &quot;{data?.quote || "The commitment to each student's personal and academic growth is truly unmatched. It's not just a school, it's a family."}&quot;
      </h2>
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-zinc-200 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1544717302-de2939b7ef71" className="object-cover w-full h-full grayscale opacity-80" alt="Parent" />
        </div>
        <div>
          <p className="font-semibold text-lg text-zinc-900">{data?.author || "Sarah Jenkins"}</p>
          <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mt-1">Parent &bull; Class of &apos;26</p>
        </div>
      </div>
    </div>
  </section>
);

// --- 8. CONTACT (Elegant Form & Info) ---
export const Contact = ({ data, theme }: any) => (
  <section id="contact" className="py-32 px-6">
    <div className="max-w-7xl mx-auto rounded-[3rem] bg-zinc-900 text-white overflow-hidden flex flex-col lg:flex-row">
      <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-between relative bg-black/20">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <Badge className="bg-white/10 text-white hover:bg-white/20 border-0 mb-8">Admissions</Badge>
          <h2 className="text-5xl lg:text-7xl font-medium tracking-tight mb-8">{data?.title || "Let's Talk"}</h2>
          <p className="text-xl text-zinc-400 font-light max-w-sm mb-16">Connect with our admissions team to schedule a campus tour.</p>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center"><Phone className="h-5 w-5" /></div>
              <p className="text-xl font-medium">{data?.phone || "+1 (555) 000-0000"}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center"><Mail className="h-5 w-5" /></div>
              <p className="text-xl font-medium">{data?.email || "admissions@school.edu"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 p-12 lg:p-20 bg-white text-zinc-900">
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
            <input className="w-full border-b border-zinc-200 pb-2 text-xl font-medium outline-none focus:border-zinc-900 transition-colors" placeholder="John Doe" />
          </div>
          <div className="space-y-2 pt-6">
            <label className="text-sm font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
            <input className="w-full border-b border-zinc-200 pb-2 text-xl font-medium outline-none focus:border-zinc-900 transition-colors" placeholder="john@example.com" />
          </div>
          <div className="space-y-2 pt-6">
            <label className="text-sm font-bold uppercase tracking-widest text-zinc-400">Message</label>
            <textarea className="w-full border-b border-zinc-200 pb-2 text-xl font-medium outline-none focus:border-zinc-900 transition-colors resize-none" rows={3} placeholder="How can we help?" />
          </div>
          <Button className="w-full h-14 rounded-xl mt-8 text-lg font-bold" style={{ backgroundColor: theme?.primary || "#171717", color: "#fff" }}>
            Send Message
          </Button>
        </div>
      </div>
    </div>
  </section>
);

// --- 9. FOOTER (Minimal & Enterprise) ---
export const Footer = ({ data, school }: any) => (
  <footer className="pt-24 pb-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 pb-24 border-b border-zinc-200">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">{school?.name?.charAt(0) || "S"}</div>
            <span className="text-xl font-bold tracking-tight">{school?.name || "School"}</span>
          </div>
          <p className="text-zinc-500 font-light max-w-sm">{data?.footerDesc || "Nurturing global leaders since 1995. A premier educational institution committed to excellence."}</p>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 mb-6">{data?.exploreTitle || "Explore"}</h4>
          <div className="flex flex-col gap-4 text-zinc-500 font-medium">
            {(Array.isArray(data?.exploreLinks) ? data.exploreLinks : []).map((link: any, i: number) => (
              <a key={i} href={link.url} className="hover:text-zinc-900 transition-colors">{link.label}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 mb-6">{data?.legalTitle || "Legal"}</h4>
          <div className="flex flex-col gap-4 text-zinc-500 font-medium">
            {(Array.isArray(data?.legalLinks) ? data.legalLinks : []).map((link: any, i: number) => (
              <a key={i} href={link.url} className="hover:text-zinc-900 transition-colors">{link.label}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 mb-6">{data?.socialTitle || "Social"}</h4>
          <div className="flex gap-4">
            {data?.facebook && (
              <a href={data.facebook} className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {data?.twitter && (
              <a href={data.twitter} className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {data?.instagram && (
              <a href={data.instagram} className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-400 text-sm font-medium">
        <p>{data?.copyrightText || `© ${new Date().getFullYear()} ${school?.name || "School"}. All rights reserved.`}</p>
        <p className="mt-4 md:mt-0">Powered by <span className="font-bold text-zinc-900">Unifynt</span></p>
      </div>
    </div>
  </footer>
);
