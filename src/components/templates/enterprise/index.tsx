"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { NoticeBoard } from "./NoticeBoard";
import { Stats } from "./Stats";
import { About } from "./About";
import { Features } from "./Features";
import { Academics } from "./Academics";
import { Gallery } from "./Gallery";
import { Faculty } from "./Faculty";
import { Testimonials } from "./Testimonials";
import { Faq } from "./Faq";
import { Contact } from "./Contact";
import { Footer } from "./Footer";

import { SectionProps } from "./types";

const SECTION_MAP: Record<string, React.ComponentType<SectionProps>> = {
    hero: Hero,
    noticeBoard: NoticeBoard,
    stats: Stats,
    about: About,
    features: Features,
    academics: Academics,
    gallery: Gallery,
    faculty: Faculty,
    testimonials: Testimonials,
    faq: Faq,
    contact: Contact,
};

interface EnterpriseTemplateProps {
    siteData: any;
    liveTheme: any;
    liveContent: Record<string, any>;
}

export default function EnterpriseTemplate({ siteData, liveTheme, liveContent }: EnterpriseTemplateProps) {
    const school = siteData?.school || { name: 'School' };

    // Ensure liveContent exists to avoid errors
    const content = liveContent || {};

    return (
        <div style={{ backgroundColor: liveTheme?.background || "#FFFFFF" }}>
            <Header data={content.header} theme={liveTheme} school={school} />
            <main>
                {Object.entries(content).map(([sectionKey, sectionData]) => {
                    const Component = SECTION_MAP[sectionKey];
                    if (!Component || sectionData?.show === false) return null;
                    return <Component key={sectionKey} data={sectionData} theme={liveTheme} school={school} />;
                })}
            </main>
            <Footer data={content.footer} theme={liveTheme} school={school} />
        </div>
    );
}

// Export individual components for direct use if needed (e.g. for preview)
export {
    Header, Hero, NoticeBoard, Stats, About, Features,
    Academics, Gallery, Faculty, Testimonials, Faq,
    Contact, Footer
};
