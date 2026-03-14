"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SectionProps } from "./types";


import { Facebook, Twitter, Instagram } from "lucide-react";

export const Footer = ({ data, school }: SectionProps) => (
  <footer className="pt-24 pb-12 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 pb-24 border-b border-zinc-200">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">{school?.name?.charAt(0) || "S"}</div>
            <span className="text-xl font-bold tracking-tight">{school?.name || "School"}</span>
          </div>
          <p className="text-zinc-500 font-light max-w-sm">{data?.footerDesc || "Nurturing global leaders since 1995. A premier educational institution committed to excellence."}</p>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 mb-6">{data?.exploreTitle || "Explore"}</h4>
          <div className="flex flex-col gap-4 text-zinc-500 font-medium">
            {(Array.isArray(data?.exploreLinks) ? data.exploreLinks : []).map((link: any, i: number) => (
              <a key={i} href={link.url} className="hover:text-zinc-900 transition-colors">{link.label}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 mb-6">{data?.legalTitle || "Legal"}</h4>
          <div className="flex flex-col gap-4 text-zinc-500 font-medium">
            {(Array.isArray(data?.legalLinks) ? data.legalLinks : []).map((link: any, i: number) => (
              <a key={i} href={link.url} className="hover:text-zinc-900 transition-colors">{link.label}</a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900 mb-6">{data?.socialTitle || "Social"}</h4>
          <div className="flex gap-4">
            {data?.facebook && (
              <a href={data.facebook} className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                <Facebook className="h-4 w-4" />
              </a>
            )}
            {data?.twitter && (
              <a href={data.twitter} className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                <Twitter className="h-4 w-4" />
              </a>
            )}
            {data?.instagram && (
              <a href={data.instagram} className="h-10 w-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-all">
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-400 text-sm font-medium">
        <p>{data?.copyrightText || `© ${new Date().getFullYear()} ${school?.name || "School"}. All rights reserved.`}</p>
        <p className="mt-4 md:mt-0">Powered by <span className="font-bold text-zinc-900">Unifynt</span></p>
      </div>
    </div>
  </footer>
);
