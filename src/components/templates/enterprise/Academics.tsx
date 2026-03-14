"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Academics = ({ data }: SectionProps) => (
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
