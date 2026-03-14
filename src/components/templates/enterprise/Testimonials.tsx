"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { Star } from "lucide-react";

export const Testimonials = ({ data }: SectionProps) => (
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
