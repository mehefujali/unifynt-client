"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { useState } from "react";
import { Phone, Mail, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InquiryService } from "@/services/inquiry.service";
import { toast } from "sonner";

export const Contact = ({ data, theme, school }: SectionProps) => {
  const [formData, setFormData] = useState({ name: "", contact: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      toast.error("Please fill out all fields");
      return;
    }

    const schoolIdToUse = school?.id || "fallback-school-id";

    setIsSubmitting(true);
    try {
      await InquiryService.submitInquiry(schoolIdToUse, formData);
      toast.success("Message sent successfully! We'll be in touch.");
      setFormData({ name: "", contact: "", message: "" });
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
                placeholder=""
              />
            </div>
            <div className="space-y-2 pt-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Email or Mobile Number</label>
              <input
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                className="w-full border-b border-zinc-200 pb-2 text-lg font-medium outline-none focus:border-zinc-500 transition-colors bg-transparent text-zinc-900"
              />
            </div>
            <div className="space-y-2 pt-4">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full border-b border-zinc-200 pb-2 text-lg font-medium outline-none focus:border-zinc-500 transition-colors resize-none bg-transparent text-zinc-900"
                rows={3}
                placeholder=""
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
  )
};
