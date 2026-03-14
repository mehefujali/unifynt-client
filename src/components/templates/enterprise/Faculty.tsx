"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


export const Faculty = ({ data }: SectionProps) => (
  <section className="py-24 bg-white border-y border-zinc-100 flex items-center justify-center text-center px-6">
    <div className="max-w-3xl space-y-4">
      <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-zinc-900">{data?.title || "World-Class Faculty"}</h2>
      <p className="text-lg text-zinc-500 font-light leading-relaxed">{data?.description || "Learn from the brightest minds. Our faculty comprises industry experts and thought leaders..."}</p>
    </div>
  </section>
);
