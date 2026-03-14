"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { Button } from "@/components/ui/button";

export const Faq = ({ data }: SectionProps) => (
  <section className="py-24 bg-zinc-50 flex items-center justify-center text-center px-6">
    <div className="max-w-3xl space-y-4">
      <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-zinc-900">{data?.title || "Common Questions"}</h2>
      <p className="text-lg text-zinc-500 font-light leading-relaxed">{data?.description || "Find answers to queries regarding admissions and curriculum."}</p>
      <Button variant="outline" className="rounded-full px-8 h-12 mt-6 font-medium">Visit Help Center</Button>
    </div>
  </section>
);
