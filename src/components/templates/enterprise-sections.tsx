"use client";

import { motion } from "framer-motion";
import { 
  ArrowRight, CheckCircle2, GraduationCap, Users, Trophy, 
  BookOpen, Mail, Phone, MapPin, Star, Laptop, ShieldCheck, 
  Globe, Heart, Calendar, Award, ChevronRight, Facebook, 
  Instagram, Twitter, Youtube 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";

const fUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } };

export const Hero = ({ data, theme }: any) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
    <div className="absolute inset-0 z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[120px]" style={{ backgroundColor: theme?.primary || "#2563eb" }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[120px]" style={{ backgroundColor: theme?.secondary || "#0f172a" }} />
    </div>
    <div className="max-w-7xl mx-auto relative z-10 text-center">
      <motion.div initial="hidden" animate="show" transition={{ duration: 0.8 }} variants={fUp}>
        <Badge className="mb-8 px-6 py-2 rounded-full uppercase tracking-[0.3em] font-black text-[10px] shadow-xl border-0 text-white" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
          Global Standards • Future Leaders
        </Badge>
        <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter leading-[0.85] mb-10" style={{ color: theme?.secondary || "#0f172a" }}>
          {data?.title || "Redefining Excellence"}
        </h1>
        <p className="text-xl md:text-2xl opacity-60 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
          {data?.subtitle || "Nurturing young minds with innovation and tradition."}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href={data?.ctaLink || "#"}>
            <Button size="lg" className="h-16 px-12 rounded-2xl text-lg font-black shadow-2xl hover:scale-105 transition-all text-white border-0" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
              {data?.ctaText || "Get Started"} <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export const Stats = ({ data, theme }: any) => (
  <section className="py-24 px-6 border-y bg-zinc-50/50">
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
      {[
        { label: "Students", val: data?.students || "0", icon: Users },
        { label: "Faculty", val: data?.teachers || "0", icon: GraduationCap },
        { label: "Campus", val: data?.campus || "0", icon: Globe },
        { label: "Awards", val: data?.awards || "0", icon: Trophy }
      ].map((stat, i) => (
        <div key={i} className="space-y-3">
          <div className="p-3 rounded-2xl bg-white w-fit shadow-sm border mb-4">
            <stat.icon className="h-6 w-6" style={{ color: theme?.primary || "#2563eb" }} />
          </div>
          <h3 className="text-5xl font-black tracking-tight" style={{ color: theme?.secondary || "#0f172a" }}>{stat.val}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export const About = ({ data, theme }: any) => (
  <section id="about" className="py-32 lg:py-48 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
    <div className="relative">
      <div className="absolute -inset-6 bg-zinc-100 rounded-[4rem] -z-10" />
      <div className="aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl relative group">
        <img src={data?.aboutImage || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1"} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" alt="Legacy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 p-8 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/20 text-white">
          <h4 className="text-3xl font-black mb-1">Our Mission</h4>
          <p className="opacity-80 font-medium font-serif italic">Empowering minds, transforming futures.</p>
        </div>
      </div>
    </div>
    <div className="space-y-10">
      <Badge variant="outline" className="font-black border-zinc-200 uppercase tracking-widest text-[10px] py-1.5 px-5 rounded-full">Background</Badge>
      <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95]" style={{ color: theme?.secondary || "#0f172a" }}>{data?.title || "Our Legacy"}</h2>
      <p className="text-xl opacity-60 leading-relaxed font-medium">{data?.description || "Providing excellence in education."}</p>
      <div className="grid gap-6">
        {["Premium Global Curriculum", "AI Integrated Learning", "World-class Sports"].map(p => (
          <div key={p} className="flex items-center gap-4 group">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest opacity-80">{p}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const Features = ({ data, theme }: any) => (
  <section className="py-32 px-6 bg-zinc-950 text-white rounded-[4rem] mx-4 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20" style={{ backgroundColor: theme?.primary || "#2563eb" }} />
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-24 space-y-4">
        <h2 className="text-4xl lg:text-6xl font-black tracking-tight">{data?.title || "Why Us?"}</h2>
        <p className="opacity-50 text-xl max-w-2xl mx-auto">Providing unmatched infrastructure for modern learning.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { t: data?.item1 || "Smart Class", i: Laptop, d: "Interactive smart classrooms for immersive learning." },
          { t: data?.item2 || "Sports Hub", i: Trophy, d: "Professional sports facilities for physical excellence." },
          { t: data?.item3 || "Top Safety", i: ShieldCheck, d: "24/7 security and a safe nurturing environment." }
        ].map((feat, i) => (
          <div key={i} className="p-12 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-8 shadow-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
              <feat.i className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">{feat.t}</h3>
            <p className="opacity-40 leading-relaxed font-medium">{feat.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const Academics = ({ data, theme }: any) => (
  <section id="programs" className="py-32 lg:py-48 px-6 max-w-7xl mx-auto">
    <div className="flex flex-col lg:flex-row justify-between items-end gap-12 mb-24">
      <div className="max-w-3xl space-y-6">
        <Badge className="font-bold px-4 py-1">CURRICULUM</Badge>
        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter" style={{ color: theme?.secondary || "#0f172a" }}>{data?.title || "Our Programs"}</h2>
        <p className="text-xl opacity-60 font-medium">{data?.description || "Curated for global success."}</p>
      </div>
      <Button variant="outline" className="h-14 px-10 rounded-full font-black border-2">Explore Modules</Button>
    </div>
    <div className="grid md:grid-cols-3 gap-10">
      {[
        { title: "Foundation", icon: Heart, desc: "Play-based learning for the curious minds." },
        { title: "Intermediate", icon: BookOpen, desc: "Building analytical and creative skills." },
        { title: "Graduation", icon: Award, desc: "Preparing leaders for global universities." }
      ].map((lvl, i) => (
        <div key={i} className="group p-10 rounded-[3rem] border border-zinc-100 bg-white hover:shadow-2xl transition-all cursor-pointer">
          <div className="h-14 w-14 rounded-2xl bg-zinc-50 flex items-center justify-center mb-8 group-hover:bg-zinc-950 group-hover:text-white transition-all">
            <lvl.icon className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-black mb-4">{lvl.title}</h3>
          <p className="opacity-50 leading-relaxed mb-10 font-medium">{lvl.desc}</p>
          <div className="flex items-center text-xs font-black uppercase tracking-[0.2em]" style={{ color: theme?.primary || "#2563eb" }}>
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const Testimonials = ({ data, theme }: any) => (
  <section className="py-32 lg:py-48 px-6 bg-white">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
      <div className="space-y-10">
        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter" style={{ color: theme?.secondary || "#0f172a" }}>{data?.title || "Community Voice"}</h2>
        <div className="p-10 lg:p-16 rounded-[3.5rem] bg-zinc-50 border border-zinc-100 relative shadow-2xl">
          <Star className="h-12 w-12 text-yellow-400 absolute -top-6 -right-6 fill-current" />
          <p className="text-2xl lg:text-3xl font-medium leading-relaxed italic opacity-80 mb-10 font-serif">
            "{data?.quote || "The environment here is exceptional."}"
          </p>
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-zinc-200" />
            <div>
              <p className="font-black text-xl">{data?.author || "School Parent"}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Verified Review</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 relative">
        <div className="space-y-6 mt-12">
          <div className="aspect-square rounded-[2.5rem] bg-zinc-100" />
          <div className="aspect-video rounded-[2.5rem] bg-zinc-100" />
        </div>
        <div className="space-y-6">
          <div className="aspect-video rounded-[2.5rem] bg-zinc-100" />
          <div className="aspect-square rounded-[2.5rem] bg-zinc-100" />
        </div>
      </div>
    </div>
  </section>
);

export const Faculty = ({ data, theme }: any) => (
  <section className="py-32 px-6 bg-zinc-50">
    <div className="max-w-7xl mx-auto text-center mb-24">
      <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6" style={{ color: theme?.secondary || "#0f172a" }}>{data?.title || "Our Faculty"}</h2>
      <p className="text-xl opacity-60 font-medium max-w-2xl mx-auto">{data?.description || "Industry leading mentors."}</p>
    </div>
    <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-6 group">
          <div className="aspect-[3/4] rounded-[2.5rem] bg-zinc-200 overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-center">
            <h4 className="font-black text-xl">Faculty Member</h4>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Expert Educator</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const Contact = ({ data, theme, school }: any) => (
  <section id="contact" className="py-32 lg:py-48 px-6 bg-zinc-950 text-white rounded-[4rem] mb-4 mx-4 overflow-hidden relative">
    <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10" style={{ backgroundColor: theme?.primary || "#2563eb" }} />
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-start relative z-10">
      <div className="space-y-16">
        <h2 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.8]">{data?.title || "Get In Touch"}</h2>
        <div className="space-y-10">
          <div className="flex gap-8 items-start group">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/10 transition-all"><MapPin className="h-7 w-7 opacity-60" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-30 mb-2">Campus</p>
              <p className="text-xl font-bold max-w-sm leading-relaxed">{school?.address || "School Campus"}</p>
            </div>
          </div>
          <div className="flex gap-8 items-center group">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/10 transition-all"><Phone className="h-7 w-7 opacity-60" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-30 mb-2">Phone</p>
              <p className="text-xl font-bold">{data?.phone || "+000 000 000"}</p>
            </div>
          </div>
          <div className="flex gap-8 items-center group">
            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/10 transition-all"><Mail className="h-7 w-7 opacity-60" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-30 mb-2">Email</p>
              <p className="text-xl font-bold">{data?.email || "info@school.edu"}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-12 lg:p-16 rounded-[4rem] bg-white/5 border border-white/10 backdrop-blur-3xl space-y-10">
        <div className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input placeholder="Name" className="bg-white/5 border-white/10 h-16 px-8 rounded-2xl w-full outline-none focus:ring-2 transition-all" style={{ ['--tw-ring-color' as any]: theme?.primary || "#2563eb" }} />
            <input placeholder="Email" className="bg-white/5 border-white/10 h-16 px-8 rounded-2xl w-full outline-none focus:ring-2 transition-all" />
          </div>
          <textarea placeholder="Message" rows={5} className="bg-white/5 border-white/10 p-8 rounded-[2rem] w-full outline-none focus:ring-2 transition-all" />
          <Button className="w-full h-16 rounded-2xl font-black text-lg text-white shadow-2xl" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
            Submit Inquiry
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export const Header = ({ data, theme, school }: any) => (
  <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-2xl border-b border-black/5 h-20 flex items-center px-8">
    <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
      <div className="flex items-center gap-3">
        {data?.logoImage ? (
          <img src={data.logoImage} className="h-10 w-auto" alt="Logo" />
        ) : (
          <div className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
            {data?.logoText?.charAt(0) || school?.name?.charAt(0) || "S"}
          </div>
        )}
        <span className="text-xl font-black tracking-tighter" style={{ color: theme?.secondary || "#0f172a" }}>{data?.logoText || school?.name || "School"}</span>
      </div>
      <div className="hidden lg:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
        <a href="#" className="hover:opacity-100 transition-opacity">{data?.navItem1 || "Home"}</a>
        <a href="#about" className="hover:opacity-100 transition-opacity">{data?.navItem2 || "About"}</a>
        <a href="#programs" className="hover:opacity-100 transition-opacity">{data?.navItem3 || "Programs"}</a>
        <a href="#contact" className="hover:opacity-100 transition-opacity">{data?.navItem4 || "Contact"}</a>
      </div>
      <Link href={data?.ctaLink || "#"}>
        <Button size="sm" className="rounded-full px-8 font-black h-11 shadow-lg text-white border-0" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
          {data?.ctaText || "Apply"}
        </Button>
      </Link>
    </div>
  </nav>
);

export const Footer = ({ data, theme, school }: any) => (
  <footer className="pt-32 pb-16 px-12 bg-zinc-50 border-t">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-4 gap-20 pb-20 border-b border-zinc-200">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center font-black text-white shadow-xl" style={{ backgroundColor: theme?.primary || "#2563eb" }}>
              {school?.name?.charAt(0) || "S"}
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase">{school?.name || "School"}</span>
          </div>
          <p className="text-2xl font-medium leading-relaxed opacity-60 max-w-md">{data?.footerDesc || "Building the foundation for a better tomorrow."}</p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <div key={i} className="h-12 w-12 rounded-2xl border bg-white flex items-center justify-center hover:shadow-lg cursor-pointer transition-all"><Icon className="h-5 w-5 opacity-50" /></div>
            ))}
          </div>
        </div>
        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Navigate</h4>
          <div className="flex flex-col gap-4 font-black text-xs uppercase tracking-widest opacity-60">
            <a href="#">Governance</a><a href="#">Life at Campus</a><a href="#">News</a><a href="#">Resources</a>
          </div>
        </div>
        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Legal</h4>
          <div className="flex flex-col gap-4 font-black text-xs uppercase tracking-widest opacity-60">
            <a href="#">Privacy Policy</a><a href="#">Terms of Use</a><a href="#">Safety Protocols</a>
          </div>
        </div>
      </div>
      <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">{data?.copyrightText || "© 2026. All Rights Reserved."}</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Architecture by</span>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme?.primary || "#2563eb" }}>Unifynt Ecosystem</span>
        </div>
      </div>
    </div>
  </footer>
);