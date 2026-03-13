"use client";

import { motion } from "framer-motion";
import { 
    CreditCard, 
    Building2, 
    MessageSquare, 
    ShieldCheck, 
    ArrowRight,
    CheckCircle2,
    Clock,
    Zap,
    Users2,
    LayoutDashboard,
    FileText,
    Calculator,
    BarChart3,
    Calendar,
    Settings,
    Globe,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
    {
        title: "Academic Excellence",
        description: "A powerhouse of tools designed to streamline the core of your institution: learning and results.",
        color: "blue",
        features: [
            { title: "Routine Builder", desc: "AI-assisted scheduling for classes and exams.", icon: <Clock size={20} /> },
            { title: "Advanced Exams", desc: "Grade-based or percentage-based evaluation systems.", icon: <FileText size={20} /> },
            { title: "Auto Promotion", desc: "Intelligent logic for moving students to the next grade.", icon: <Zap size={20} /> },
            { title: "Result Engine", desc: "Generate professional marksheets and analysis reports.", icon: <BarChart3 size={20} /> },
        ]
    },
    {
        title: "Student Management",
        description: "Effortlessly manage the complete student lifecycle from admission to alumni status.",
        color: "indigo",
        features: [
            { title: "Custom Admissions", desc: "Fully customizable digital admission forms.", icon: <LayoutDashboard size={20} /> },
            { title: "Smart Attendance", desc: "Biometric and manual tracking with instant alerts.", icon: <CheckCircle2 size={20} /> },
            { title: "Student Portals", desc: "Dedicated access for students to track progress.", icon: <Users size={20} /> },
            { title: "Guardian Connect", desc: "Keep parents informed with real-time updates.", icon: <Users2 size={20} /> },
        ]
    },
    {
        title: "Financial Infrastructure",
        description: "Powerful financial tools to manage billing, payroll, and auditing with 100% accuracy.",
        color: "emerald",
        features: [
            { title: "Fee Collection", desc: "High-performance engine for automated billing.", icon: <CreditCard size={20} /> },
            { title: "Smart Payroll", desc: "Manage salaries for teachers and staff with one click.", icon: <Calculator size={20} /> },
            { title: "Transaction Audit", desc: "Detailed ledgers and transparent auditing logs.", icon: <Settings size={20} /> },
            { title: "Online Payments", desc: "Seamless integration with popular payment gateways.", icon: <Globe size={20} /> },
        ]
    },
    {
        title: "Institutional Operations",
        description: "The operational hub to manage infrastructure, resources, and institutional lead tracking.",
        color: "amber",
        features: [
            { title: "Staff Directory", desc: "Complete management of teacher and staff profiles.", icon: <Users2 size={20} /> },
            { title: "Inventory Hub", desc: "Track campus assets, transport, and infrastructure.", icon: <Building2 size={20} /> },
            { title: "Holiday Planner", desc: "Academic calendar and holiday management.", icon: <Calendar size={20} /> },
            { title: "Inquiry Tracker", desc: "Capture and manage leads for potential admissions.", icon: <BarChart3 size={20} /> },
        ]
    },
    {
        title: "Communication Sync",
        description: "Stay connected with your entire ecosystem through real-time notifications and alerts.",
        color: "violet",
        features: [
            { title: "SMS & Email", desc: "Integrated marketing and alert engine.", icon: <MessageSquare size={20} /> },
            { title: "Socket Alerts", desc: "Instant real-time platform notifications.", icon: <Zap size={20} /> },
            { title: "Notice Board", desc: "Digital announcements for the whole institution.", icon: <FileText size={20} /> },
            { title: "Automated Reports", desc: "Schedule daily/weekly summary reports.", icon: <BarChart3 size={20} /> },
        ]
    },
    {
        title: "Enterprise Core",
        description: "Bank-grade security and advanced controls for total institutional oversight.",
        color: "rose",
        features: [
            { title: "Audit Logs", desc: "Every action tracked for total transparency.", icon: <ShieldCheck size={20} /> },
            { title: "Role Permissions", desc: "Granular access control for every user type.", icon: <Settings size={20} /> },
            { title: "Site Engine", desc: "Build your school's website from custom templates.", icon: <LayoutDashboard size={20} /> },
            { title: "Data Security", desc: "AES-256 encrypted data protection.", icon: <ShieldCheck size={20} /> },
        ]
    }
];

export function FeaturesClient() {
    return (
        <div className="bg-[#fafafa] min-h-screen pt-32 pb-24">
            {/* --- Hero Section --- */}
            <div className="max-w-7xl mx-auto px-6 text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 bg-white shadow-sm text-[10px] font-bold uppercase tracking-widest text-[#2B9EFF] mb-8"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2B9EFF] animate-pulse"></div>
                    The Unifynt Ecosystem
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-extrabold text-zinc-900 tracking-tighter leading-[1.05] mb-8"
                >
                    Designed for the future <br /> of education.
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-lg md:text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium"
                >
                    One unified platform to replace fragmented tools. Automate operations, gain intelligence, and scale your institution with confidence.
                </motion.p>
            </div>

            {/* --- Features Grid --- */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: idx * 0.1 }}
                            className="flex flex-col group"
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">{cat.title}</h2>
                                <p className="text-sm text-zinc-500 font-medium leading-relaxed">{cat.description}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {cat.features.map((feature, fIdx) => (
                                    <div 
                                        key={fIdx}
                                        className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-zinc-200 transition-all duration-500 flex items-start gap-5 group/item"
                                    >
                                        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-900 transition-colors duration-500 group-hover/item:bg-[#2B9EFF]/5 group-hover/item:text-[#2B9EFF] group-hover/item:border-[#2B9EFF]/20">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-zinc-800 tracking-tight mb-1">{feature.title}</h4>
                                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- Bottom CTA --- */}
            <div className="max-w-4xl mx-auto px-6 mt-32">
                <div className="p-12 md:p-16 rounded-[2.5rem] bg-zinc-950 text-white text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[#2B9EFF] opacity-5 blur-[100px] rounded-full -translate-y-1/2"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">Ready to see it in action?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <Button className="h-14 px-10 rounded-xl text-base font-bold bg-[#2B9EFF] text-white hover:bg-[#1a8ce8] border-none shadow-xl">
                                Start 7-Day Free Trial
                                <ArrowRight className="ml-2" size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
