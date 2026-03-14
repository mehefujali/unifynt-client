"use client";
import React from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { About } from "./About";
import { Features } from "./Features";
import { Academics } from "./Academics";
import { Gallery } from "./Gallery";
import { Testimonials } from "./Testimonials";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { NoticeBoard } from "../playful-kids/NoticeBoard"; // Shared component

interface TemplateProps {
  siteData: any;
  liveTheme: any;
  liveContent: Record<string, any>;
}

const SECTION_MAP: Record<string, any> = {
  hero: Hero,
  about: About,
  features: Features,
  academics: Academics,
  gallery: Gallery,
  testimonials: Testimonials,
  contact: Contact,
};

const PrestigeAcademyTemplate = ({ siteData, liveTheme, liveContent }: TemplateProps) => {
  const school = siteData?.school || { name: 'Academy' };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-zinc-900 selection:text-white antialiased overflow-x-hidden">
      <Header data={liveContent.header} theme={liveTheme} school={school} />
      
      <main>
        <Hero data={liveContent.hero} theme={liveTheme} school={school} />
        
        {/* Notice Board with a custom theme for this template */}
        <div className="bg-zinc-950">
            <NoticeBoard school={school} theme={{ ...liveTheme, primary: '#C5A059' }} />
        </div>
        
        {Object.entries(liveContent).map(([sectionKey, sectionData]) => {
          const Component = SECTION_MAP[sectionKey];
          // Skip manually placed sections
          if (!Component || sectionKey === 'hero' || sectionKey === 'header' || sectionKey === 'footer' || sectionData?.show === false) return null;
          return <Component key={sectionKey} data={sectionData} theme={liveTheme} school={school} />;
        })}
      </main>

      <Footer data={liveContent.footer} theme={liveTheme} school={school} />
    </div>
  );
};

export default PrestigeAcademyTemplate;
