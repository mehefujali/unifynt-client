/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Laptop, Trophy, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Features = ({ data, theme }: any) => (
  <section className="py-24 px-4 lg:px-6 bg-zinc-50">
    <div className="max-w-7xl mx-auto rounded-[3rem] lg:rounded-[4rem] bg-white border border-zinc-100 p-8 lg:p-16 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full opacity-5 pointer-events-none" style={{ backgroundColor: theme?.primary || "#2563eb" }} />

      <div className="text-center mb-20 relative z-10">
        <h2 className="text-4xl lg:text-5xl font-medium tracking-tight mb-4 text-zinc-900">{data?.title || "Beyond Academics"}</h2>
        <p className="text-lg text-zinc-500 max-w-2xl mx-auto font-light">Ecosystem built for holistic growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-2 p-10 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors relative overflow-hidden group">
          <Laptop className="h-10 w-10 text-zinc-400 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-medium mb-3 text-zinc-900">{data?.item1 || "Digital Campus"}</h3>
          <p className="text-zinc-500 text-base font-light max-w-md">100% paperless workflows and interactive smart boards in every classroom.</p>
        </div>

        <div className="p-10 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors group">
          <Trophy className="h-10 w-10 text-zinc-400 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-medium mb-3 text-zinc-900">{data?.item2 || "Elite Sports"}</h3>
          <p className="text-zinc-500 text-base font-light">FIFA-approved turf and Olympic swimming pool.</p>
        </div>

        <div className="p-10 rounded-[2rem] bg-zinc-50 border border-zinc-100 hover:border-zinc-200 transition-colors group">
          <ShieldCheck className="h-10 w-10 text-zinc-400 mb-8 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-medium mb-3 text-zinc-900">{data?.item3 || "Safe Haven"}</h3>
          <p className="text-zinc-500 text-base font-light">AI-powered 24/7 security & tracking.</p>
        </div>

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
