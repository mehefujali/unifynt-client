"use client";
import React from "react";
import { SectionProps } from "./types";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { NoticeBoard } from "./NoticeBoard";
import { Stats } from "./Stats";
import { About } from "./About";
import { Features } from "./Features";
import { Academics } from "./Academics";
import { Gallery } from "./Gallery";
import { Testimonials } from "./Testimonials";
import { Contact } from "./Contact";
import { Footer } from "./Footer";

const SECTION_MAP: Record<string, React.ComponentType<SectionProps>> = {
    hero: Hero,
    noticeBoard: NoticeBoard,
    stats: Stats,
    about: About,
    features: Features,
    academics: Academics,
    gallery: Gallery,
    testimonials: Testimonials,
    contact: Contact,
};

interface TemplateProps {
    siteData: any; // Keep any for global site data for now as it's complex
    liveTheme: any;
    liveContent: Record<string, any>;
}

export default function ModernMinimalTemplate({ siteData, liveTheme, liveContent }: TemplateProps) {
    const school = siteData?.school || { name: 'School' };

    return (
        <div style={{ backgroundColor: "#FFFFFF" }} className="font-sans antialiased text-zinc-900 overflow-x-hidden">
            <Header data={liveContent.header} theme={liveTheme} school={school} />
            <main>
                {/* NoticeBoard usually comes before hero or after */}
                {Object.entries(liveContent).map(([sectionKey, sectionData]) => {
                    const Component = SECTION_MAP[sectionKey];
                    if (!Component || sectionData?.show === false) return null;
                    return <Component key={sectionKey} data={sectionData} theme={liveTheme} school={school} />;
                })}
            </main>
            <Footer data={liveContent.footer} theme={liveTheme} school={school} />
        </div>
    );
}

export {
    Header, Hero, NoticeBoard, Stats, About, Features,
    Academics, Gallery, Testimonials, Contact, Footer
};
