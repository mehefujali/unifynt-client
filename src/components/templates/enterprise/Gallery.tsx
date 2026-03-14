"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


export const Gallery = ({ data }: SectionProps) => (
  <section id="gallery" className="py-24 px-6 bg-zinc-50 border-t border-zinc-100">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-4xl font-medium tracking-tight text-zinc-900 mb-4">{data?.title || "Campus Life"}</h2>
        <p className="text-lg text-zinc-500 font-light max-w-2xl mx-auto">{data?.description || "Explore our vibrant campus and state-of-the-art facilities."}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
        {data?.image1 && (
          <div className="md:col-span-2 md:row-span-2 rounded-[2rem] overflow-hidden relative group">
            <img src={data.image1} alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
        {data?.image2 && (
          <div className="md:col-span-2 rounded-[2rem] overflow-hidden relative group">
            <img src={data.image2} alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
        {data?.image3 && (
          <div className="rounded-[2rem] overflow-hidden relative group">
            <img src={data.image3} alt="Gallery 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
        {data?.image4 && (
          <div className="rounded-[2rem] overflow-hidden relative group">
            <img src={data.image4} alt="Gallery 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        )}
      </div>
    </div>
  </section>
);
