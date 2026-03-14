"use client";
import React from "react";
import { SectionProps } from "./types";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { InquiryService } from "@/services/inquiry.service";

export const Contact = ({ data, theme, school }: SectionProps) => {
  const [formData, setFormData] = React.useState({ name: "", contact: "", message: "" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      toast.error("Please fill out all fields");
      return;
    }

    const schoolId = school?.id;
    if (!schoolId) {
        toast.error("Institution identification missing");
        return;
    }

    setIsSubmitting(true);
    try {
      await InquiryService.submitInquiry(schoolId, formData);
      toast.success("Message sent successfully!");
      setFormData({ name: "", contact: "", message: "" });
    } catch (err) {
      toast.error("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-[3.5rem] p-10 md:p-24 shadow-2xl border border-zinc-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-zinc-50 rounded-bl-[10rem] -z-0 opacity-50" />
            
            <div className="grid lg:grid-cols-2 gap-20 relative z-10">
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="space-y-12">
                    <div className="space-y-4">
                        <motion.div variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                            Admissions Concierge
                        </motion.div>
                        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter">
                            Begin Your <br />
                            <span className="text-zinc-300">Journey Today.</span>
                        </motion.h2>
                    </div>

                    <div className="space-y-8">
                        <motion.div variants={fadeUp} className="flex gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Electronic Mail</div>
                                <div className="text-lg font-bold text-zinc-900">{school?.email || "admissions@academy.com"}</div>
                            </div>
                        </motion.div>
                        <motion.div variants={fadeUp} className="flex gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Telephonic Inquiry</div>
                                <div className="text-lg font-bold text-zinc-900">{school?.phone || "+1 (555) 000-0000"}</div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Name</label>
                            <Input 
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter your full name" 
                                className="h-14 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 text-xs font-bold" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Contact (Email or Phone)</label>
                            <Input 
                                value={formData.contact}
                                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                                placeholder="Email or Mobile Number" 
                                className="h-14 rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 text-xs font-bold" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Message</label>
                            <Textarea 
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="How can we help you?" 
                                className="min-h-[150px] rounded-2xl bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 text-xs font-medium" 
                                style={{ "--tw-ring-color": theme?.primary || "#000000" } as React.CSSProperties}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full h-14 rounded-2xl text-[13px] font-black uppercase tracking-widest text-white shadow-xl hover:-translate-y-1 transition-all border-0 relative overflow-hidden group"
                            style={{ backgroundColor: theme?.primary || "#000000" }}
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Send Inquiry <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                            
                            {/* Subtle pulse effect */}
                            <span className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
};
