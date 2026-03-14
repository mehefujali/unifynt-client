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
import { NoticeBoard } from "./NoticeBoard";

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

const PlayfulKidsTemplate = ({ siteData, liveTheme, liveContent }: TemplateProps) => {
  const school = siteData?.school || { name: 'School' };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20 antialiased overflow-x-hidden">
      <Header data={liveContent.header} theme={liveTheme} school={school} />
      
      <main>
        <Hero data={liveContent.hero} theme={liveTheme} school={school} />
        <NoticeBoard school={school} theme={liveTheme} />
        
        {Object.entries(liveContent).map(([sectionKey, sectionData]) => {
          const Component = SECTION_MAP[sectionKey];
          // Skip hero as it's manually placed for layout control
          if (!Component || sectionKey === 'hero' || sectionKey === 'header' || sectionKey === 'footer' || sectionData?.show === false) return null;
          return <Component key={sectionKey} data={sectionData} theme={liveTheme} school={school} />;
        })}
      </main>

      <Footer data={liveContent.footer} theme={liveTheme} school={school} />
    </div>
  );
};

export default PlayfulKidsTemplate;
