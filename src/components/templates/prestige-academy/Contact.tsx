/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { SectionProps } from "../playful-kids/types";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "./shared";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface School {
  id: string;
  name: string;
}

interface PrestigeContactProps extends SectionProps {
  school?: School;
}

export const Contact = ({ data, theme, school }: PrestigeContactProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school?.id) {
      toast.error("School information missing");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/inquiries/public/${school.id}`, formData);
      toast.success("Inquiry submitted successfully! We will contact you soon.");
      setFormData({ name: "", contact: "", message: "" });

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-zinc-950 text-white relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-[60%] h-full bg-zinc-900 -skew-x-12 translate-x-32 z-0" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-32">

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-16"
          >
            <div className="space-y-6">
              <motion.span variants={fadeIn} className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 block mb-6">Connect with Excellence</motion.span>
              <motion.h2 variants={fadeIn} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                Formalize Your <br /> <span className="text-primary italic" style={{ color: theme?.primary }}>Legitimacy.</span>
              </motion.h2>
            </div>

            <div className="space-y-10">
              {[
                { icon: MapPin, label: "Campus Location", value: "Heritage Blvd, 102 Ivy Lane, OXFORD" },
                { icon: Phone, label: "Administrative Inquiry", value: "+1 (800) LEGACY-EDU" },
                { icon: Mail, label: "Digital Correspondence", value: "admissions@prestige-academy.edu" }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeIn} className="flex gap-8 items-start group">
                  <div className="w-16 h-16 rounded-none bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500" style={{ backgroundColor: `rgba(255,255,255,0.05)` }}>
                    <item.icon size={24} className="text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{item.label}</span>
                    <p className="text-xl font-bold tracking-tight text-white/80">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="bg-white p-12 lg:p-20 shadow-4xl relative"
          >
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/20 blur-3xl" />

            <motion.h3 variants={fadeIn} className="text-4xl font-black text-zinc-900 mb-12 tracking-tight">Request an Invitation.</motion.h3>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <motion.div variants={fadeIn} className="grid md:grid-cols-2 gap-8">
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full bg-zinc-50 border-b-2 border-zinc-100 py-4 px-6 text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 outline-none transition-all font-bold"
                />
                <input
                  type="text"
                  name="contact"
                  required
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Contact Number / Email"
                  className="w-full bg-zinc-50 border-b-2 border-zinc-100 py-4 px-6 text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 outline-none transition-all font-bold"
                />
              </motion.div>
              <motion.div variants={fadeIn}>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your Message..."
                  rows={4}
                  className="w-full bg-zinc-50 border-b-2 border-zinc-100 py-4 px-6 text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 outline-none transition-all font-bold resize-none"
                />
              </motion.div>
              <motion.button
                type="submit"
                disabled={loading}
                variants={fadeIn}
                className="w-full bg-zinc-900 text-white py-6 text-[12px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group shadow-2xl"
                style={{ backgroundColor: theme?.primary || '#18181b' }}
              >
                {loading ? "Sending..." : "Submit Inquiry"} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
