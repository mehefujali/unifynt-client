"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, GraduationCap, Users, Trophy,
  Mail, Phone, Star, Laptop, ShieldCheck,
  Globe, Facebook, Instagram, Twitter, PlayCircle, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { NoticeService } from "@/services/notice.service";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { FileText, BellRing, ArrowUpRight, ArrowRight, Loader2 } from "lucide-react";
import { InquiryService } from "@/services/inquiry.service";
import { toast } from "sonner";

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

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-zinc-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.header>
      {/* Spacer to push content below fixed header */}
      <div className="h-[73px] w-full" /> 

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

// --- 2. HERO (Dynamic Layouts) ---
export const Hero = ({ data, theme }: any) => {
  const layout = data?.layout || "type1";

  if (layout === "type2") {
    return (
      <section id="home" className="relative pt-32 pb-20 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden min-h-[90vh]">
        <div className="absolute inset-0 z-0">
          <img src={data?.heroImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"} alt="Hero" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
        </div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center flex flex-col items-center pt-20">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-8">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-white">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-white" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>
                Admissions Open 2026
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.1]">
              {data?.title || "Redefining"} <span style={{ color: theme?.primary || "#2563eb" }}>Excellence.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-2xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed">
              {data?.subtitle || "A world-class curriculum designed to nurture brilliant minds and future global leaders."}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
              <Link href={data?.ctaLink || "#"}>
                <Button size="lg" className="h-14 px-10 rounded-xl text-lg font-medium shadow-2xl hover:-translate-y-0.5 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
                  {data?.ctaText || "Start Journey"}
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-8 rounded-xl text-lg font-medium text-white border-white/30 hover:bg-white/10 group backdrop-blur-sm">
                <PlayCircle className="mr-2 h-6 w-6 text-white/70 group-hover:text-white transition-colors" /> Watch Video
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    );
  }

  if (layout === "type3") {
    return (
      <section id="home" className="relative pt-32 pb-20 flex flex-col lg:flex-row items-center justify-center bg-white overflow-hidden min-h-[90vh] px-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ '--tw-gradient-from': `${theme?.primary}10` } as any} />
        
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center relative z-10 pt-10">
          <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-8 text-left">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 shadow-sm text-xs font-bold uppercase tracking-widest text-zinc-500">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme?.primary || "#2563eb" }} /><span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme?.primary || "#2563eb" }} /></span>
                Admissions Open 2026
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
              {data?.title || "Redefining"} <br /><span style={{ color: theme?.primary || "#2563eb" }}>Excellence.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-500 max-w-xl font-normal leading-relaxed">
              {data?.subtitle || "A world-class curriculum designed to nurture brilliant minds and future global leaders."}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start gap-4 pt-4">
              <Link href={data?.ctaLink || "#"}>
                <Button size="lg" className="h-14 px-10 rounded-xl text-lg font-medium shadow-md hover:-translate-y-0.5 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#171717" }}>
                  {data?.ctaText || "Start Journey"}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative aspect-square lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <img src={data?.heroImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"} alt="Hero" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>
    );
  }

  // Default layout: type1 (Minimal Centered)
  return (
    <section id="home" className="relative pt-32 pb-20 flex flex-col items-center justify-center bg-white overflow-hidden">
      <div className="absolute inset-0 z-0 bg-slate-50/50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ '--tw-gradient-from': `${theme?.primary}10` } as any} />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
        <motion.div initial="hidden" animate="show" variants={staggerContainer} className="space-y-6">
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-bold uppercase tracking-widest text-slate-500">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme?.primary || "#2563eb" }} /><span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme?.primary || "#2563eb" }} /></span>
              Admissions Open 2026
            </div>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
            {data?.title || "Redefining"} <span style={{ color: theme?.primary || "#2563eb" }}>Excellence.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
            {data?.subtitle || "A world-class curriculum designed to nurture brilliant minds and future global leaders."}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link href={data?.ctaLink || "#"}>
              <Button size="lg" className="h-12 px-8 rounded-xl text-base font-medium shadow-md hover:-translate-y-0.5 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#171717" }}>
                {data?.ctaText || "Start Journey"}
              </Button>
            </Link>
            <Button variant="outline" className="h-12 px-6 rounded-xl text-base font-medium text-slate-600 border-slate-200 hover:bg-slate-50 group">
              <PlayCircle className="mr-2 h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" /> Watch Video
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// --- 2.5 NOTICE BOARD ---
export const NoticeBoard = ({ theme }: any) => {
  const { domain } = useParams();
  const limit = 5;

  const { data: noticesData, isLoading } = useQuery({
    queryKey: ["public-notices", domain],
    queryFn: () => NoticeService.getPublicNotices(domain as string, { page: 1, limit }),
    enabled: !!domain,
  });

  if (isLoading || !noticesData?.data || noticesData.data.length === 0) return null;

  return (
    <section className="py-24 px-6 bg-slate-50 relative z-20 border-t border-slate-200/60">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center transform -rotate-3 border border-slate-100">
              <BellRing className="h-7 w-7" style={{ color: theme?.primary || "#2563eb" }} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Official Notice Board</h2>
              <p className="text-slate-500 font-normal mt-1">Institutional announcements and updates</p>
            </div>
          </div>
          {noticesData.meta.total > limit && (
            <Link href={`/sites/${domain}/notices`} className="text-sm font-bold flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-slate-700 hover:text-slate-900">
              View Notice Archive <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {noticesData.data.map((notice: any) => (
            <a href={notice.link || undefined} target={notice.link ? "_blank" : undefined} rel={notice.link ? "noopener noreferrer" : undefined} key={notice.id} className={`group relative flex flex-col md:flex-row md:items-center gap-6 p-6 bg-white rounded-[2rem] border border-slate-200/60 transition-all duration-300 overflow-hidden ${notice.link ? 'hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] cursor-pointer' : 'cursor-default'}`}>

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${theme?.primary || '#2563eb'})` }} />

              {/* Date Block */}
              <div className="flex flex-col items-center justify-center p-5 bg-slate-50/80 rounded-[1.5rem] min-w-[110px] shrink-0 border border-slate-100 group-hover:bg-white group-hover:shadow-sm transition-all duration-300 relative z-10">
                <span className="text-3xl font-semibold tracking-tighter" style={{ color: theme?.primary || "#2563eb" }}>{format(new Date(notice.publishedAt), "dd")}</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-[0.2em] mt-1">{format(new Date(notice.publishedAt), "MMM, yy")}</span>
              </div>

              {/* Content */}
              <div className="flex-1 relative z-10">
                <h3 className={`text-xl md:text-2xl font-medium tracking-tight text-slate-900 mb-2 transition-colors line-clamp-2 ${notice.link ? 'group-hover:text-primary' : ''}`} style={notice.link ? { color: "currentColor", '--hover-color': theme?.primary } as React.CSSProperties : {}}>
                  {notice.title}
                </h3>
                <p className="text-slate-500 font-normal text-sm md:text-base line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
              </div>

              {/* Action Icon */}
              {notice.link && (
                <div className="hidden md:flex shrink-0 relative z-10 pl-4 border-l border-slate-100">
                  <div className="h-14 w-14 flex items-center justify-center rounded-[1.2rem] bg-slate-50 text-slate-400 group-hover:scale-110 transition-all duration-300" style={{ backgroundColor: theme?.primary || "#2563eb", color: "#fff" }}>
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                </div>
              )}

              {/* Mobile Action indicator */}
              {notice.link && (
                <div className="md:hidden flex items-center gap-2 text-sm font-bold mt-2" style={{ color: theme?.primary || "#2563eb" }}>
                  Open Link <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

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
            <h3 className="text-4xl font-medium tracking-tight text-zinc-900 mb-2">{stat.val}</h3>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{stat.label}</p>
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
          <h2 className="text-4xl lg:text-[4rem] font-normal tracking-tight leading-[1.1] text-zinc-900 mb-8 mt-10">
            {data?.title || "A legacy of"} <br /><span className="text-zinc-400">brilliance.</span>
          </h2>
          <p className="text-lg lg:text-2xl text-zinc-500 font-light leading-relaxed">
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
  <section className="py-24 px-4 lg:px-6 bg-zinc-50">
    <div className="max-w-7xl mx-auto rounded-[3rem] lg:rounded-[4rem] bg-white border border-zinc-100 p-8 lg:p-16 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full opacity-5 pointer-events-none" style={{ backgroundColor: theme?.primary || "#2563eb" }} />

      <div className="text-center mb-20 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4 text-zinc-900">{data?.title || "Beyond Academics"}</h2>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-light">Ecosystem built for holistic growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Bento Box 1 - Span 2 */}
        <div className="md:col-span-2 p-10 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors relative overflow-hidden group">
          <Laptop className="h-10 w-10 text-zinc-400 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-medium mb-3 text-zinc-900">{data?.item1 || "Digital Campus"}</h3>
          <p className="text-zinc-500 text-base font-light max-w-md">100% paperless workflows and interactive smart boards in every classroom.</p>
        </div>

        {/* Bento Box 2 */}
        <div className="p-10 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors group">
          <Trophy className="h-10 w-10 text-zinc-400 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-medium mb-3 text-zinc-900">{data?.item2 || "Elite Sports"}</h3>
          <p className="text-zinc-500 text-base font-light">FIFA-approved turf and Olympic swimming pool.</p>
        </div>

        {/* Bento Box 3 */}
        <div className="p-10 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors group">
          <ShieldCheck className="h-10 w-10 text-zinc-400 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-medium mb-3 text-zinc-900">{data?.item3 || "Safe Haven"}</h3>
          <p className="text-zinc-500 text-base font-light">AI-powered 24/7 security & tracking.</p>
        </div>

        {/* Bento Box 4 - Span 2 */}
        <div className="md:col-span-2 p-10 rounded-[2rem] bg-white border border-zinc-100 hover:border-zinc-200 shadow-sm transition-all flex items-center justify-between group cursor-pointer" style={{ borderColor: theme?.primary ? `${theme.primary}20` : undefined }}>
          <div>
            <Badge variant="outline" className="border-zinc-200 text-zinc-600 mb-6 font-medium">NEW</Badge>
            <h3 className="text-2xl font-medium mb-3 text-zinc-900">Global Exchange Program</h3>
            <p className="text-zinc-500 text-base font-light max-w-sm">Partnered with Ivy league institutions for student exchange.</p>
          </div>
          <div className="h-16 w-16 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all">
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
        <div className="max-w-2xl">
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-zinc-900 mb-4">{data?.title || "Academic Pathways"}</h2>
          <p className="text-lg text-zinc-500 font-light">{data?.description || "Structured progression from kindergarten to university preparation."}</p>
        </div>
        <Button variant="outline" className="rounded-full px-8 h-12 font-medium border-zinc-200">Download Brochure</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Early Years", desc: "Montessori & Reggio Emilia inspired approach for ages 3-6.", bg: "bg-white border-zinc-100" },
          { title: "Primary School", desc: "Building strong foundational skills in STEM and Arts.", bg: "bg-white border-zinc-100" },
          { title: "Senior Secondary", desc: "Rigorous curriculum preparing for global boards.", bg: "bg-white border-zinc-100" }
        ].map((prog, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className={`p-8 rounded-[2rem] ${prog.bg} border relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all`}
          >
            <div className="h-12 w-12 rounded-full bg-zinc-50 flex items-center justify-center mb-10 text-zinc-400 group-hover:text-zinc-900 transition-colors">
              <ArrowRight className="h-5 w-5 -rotate-45 group-hover:rotate-0 transition-transform" />
            </div>
            <h3 className="text-2xl font-medium text-zinc-900 mb-3">{prog.title}</h3>
            <p className="text-zinc-500 font-light text-base">{prog.desc}</p>
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

// --- 7.5 GALLERY (Bento-style Minimalist Image Grid) ---
export const Gallery = ({ data }: any) => (
  <section id="gallery" className="py-24 px-6 bg-zinc-50 border-t border-zinc-100">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-zinc-900 mb-4">{data?.title || "Campus Life"}</h2>
        <p className="text-lg text-zinc-500 font-light max-w-2xl mx-auto">{data?.description || "Explore our vibrant campus and state-of-the-art facilities."}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
        {data?.image1 && (
          <div className="md:col-span-2 md:row-span-2 rounded-[2rem] overflow-hidden relative group">
            <img src={data.image1} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
        {data?.image2 && (
          <div className="md:col-span-2 rounded-[2rem] overflow-hidden relative group">
            <img src={data.image2} alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
        {data?.image3 && (
          <div className="rounded-[2rem] overflow-hidden relative group">
            <img src={data.image3} alt="Gallery 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
        {data?.image4 && (
          <div className="rounded-[2rem] overflow-hidden relative group">
            <img src={data.image4} alt="Gallery 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
      </div>
    </div>
  </section>
);

// --- 7.6 FACULTY (Clean Banner) ---
export const Faculty = ({ data }: any) => (
  <section className="py-24 bg-white border-y border-zinc-100 flex items-center justify-center text-center px-6">
    <div className="max-w-3xl space-y-4">
      <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-zinc-900">{data?.title || "World-Class Faculty"}</h2>
      <p className="text-lg text-zinc-500 font-light leading-relaxed">{data?.description || "Learn from the brightest minds. Our faculty comprises industry experts and thought leaders..."}</p>
    </div>
  </section>
);

// --- 7.7 FAQ (Clean Info Banner) ---
export const Faq = ({ data }: any) => (
  <section className="py-24 bg-zinc-50 flex items-center justify-center text-center px-6">
    <div className="max-w-3xl space-y-4">
      <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-zinc-900">{data?.title || "Common Questions"}</h2>
      <p className="text-lg text-zinc-500 font-light leading-relaxed">{data?.description || "Find answers to queries regarding admissions and curriculum."}</p>
      <Button variant="outline" className="rounded-full px-8 h-12 mt-6 font-medium">Visit Help Center</Button>
    </div>
  </section>
);

// --- 8. CONTACT (Elegant Form & Info) ---
export const Contact = ({ data, theme, school }: any) => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all fields");
      return;
    }
    
    // Attempt to extract schoolId from the page. If it's the admin preview, use school.id. 
    // In actual public site, they might have the school ID somehow, maybe from 'school' prop
    const schoolIdToUse = school?.id || "fallback-school-id"; // Adjust according to site's context

    setIsSubmitting(true);
    try {
      await InquiryService.submitInquiry(schoolIdToUse, formData);
      toast.success("Message sent successfully! We'll be in touch.");
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <section id="contact" className="py-24 px-6 bg-white">
    <div className="max-w-6xl mx-auto rounded-[2rem] bg-zinc-50 border border-zinc-100 text-zinc-900 overflow-hidden flex flex-col lg:flex-row">
      <div className="lg:w-1/2 p-10 lg:p-16 flex flex-col justify-between relative bg-white border-r border-zinc-100">
        <div className="relative z-10">
          <Badge variant="outline" className="text-zinc-500 mb-6 font-medium border-zinc-200 bg-zinc-50">Admissions</Badge>
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4">{data?.title || "Let's Talk"}</h2>
          <p className="text-lg text-zinc-500 font-light max-w-sm mb-12">Connect with our admissions team to schedule a campus tour.</p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 text-zinc-500"><Phone className="h-4 w-4" /></div>
              <p className="text-lg font-medium">{data?.phone || "+1 (555) 000-0000"}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center bg-zinc-50 text-zinc-500"><Mail className="h-4 w-4" /></div>
              <p className="text-lg font-medium">{data?.email || "admissions@school.edu"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 p-10 lg:p-16 bg-zinc-50 text-zinc-900">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Full Name</label>
            <input 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border-b border-zinc-200 pb-2 text-lg font-medium outline-none focus:border-zinc-500 transition-colors bg-transparent text-zinc-900" 
              placeholder="John Doe" 
            />
          </div>
          <div className="space-y-2 pt-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Email Address</label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full border-b border-zinc-200 pb-2 text-lg font-medium outline-none focus:border-zinc-500 transition-colors bg-transparent text-zinc-900" 
              placeholder="john@example.com" 
            />
          </div>
          <div className="space-y-2 pt-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Message</label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full border-b border-zinc-200 pb-2 text-lg font-medium outline-none focus:border-zinc-500 transition-colors resize-none bg-transparent text-zinc-900" 
              rows={3} 
              placeholder="How can we help?" 
            />
          </div>
          <Button 
            disabled={isSubmitting}
            type="submit" 
            className="w-full h-12 rounded-xl mt-6 text-base font-medium flex items-center justify-center" 
            style={{ backgroundColor: theme?.primary || "#171717", color: "#fff" }}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  </section>
)};

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
