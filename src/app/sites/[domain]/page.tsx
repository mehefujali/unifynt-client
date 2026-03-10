/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";
import { Header, Hero, NoticeBoard, Stats, About, Features, Academics, Gallery, Faculty, Testimonials, Faq, Contact, Footer } from "@/components/templates/enterprise-sections";
import { Loader2 } from "lucide-react";

// 🟢 Section Map Update
const SECTION_MAP: Record<string, any> = {
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

export default function EnterprisePublicSite() {
  const { domain } = useParams();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const { data: siteData, isLoading } = useQuery({
    queryKey: ["public-site", domain],
    queryFn: () => SiteConfigService.getPublicSiteData(domain as string),
    enabled: !!domain,
  });

  const [liveTheme, setLiveTheme] = useState(DEFAULT_SITE_DATA.theme);
  const [liveContent, setLiveContent] = useState<any>(DEFAULT_SITE_DATA.content);

  // 🟢 Deep Merge Logic
  useEffect(() => {
    if (siteData) {
      const mergedTheme = { ...DEFAULT_SITE_DATA.theme, ...(siteData.themeSettings || {}) };

      // Build the content object in the exact order we want to render
      const mergedContent: any = {};
      
      // We manually define the order
      const orderedKeys = [
        "header",
        "hero",
        "noticeBoard", // Notice board right under hero
        "stats",
        "about",
        "features",
        "academics",
        "gallery",
        "faculty",
        "testimonials",
        "faq",
        "contact",
        "footer"
      ];

      orderedKeys.forEach(key => {
        if (key === "noticeBoard") {
          mergedContent.noticeBoard = { show: true };
        } else if (DEFAULT_SITE_DATA.content[key as keyof typeof DEFAULT_SITE_DATA.content]) {
          mergedContent[key] = {
            ...(DEFAULT_SITE_DATA.content as any)[key],
            ...(siteData.content?.[key] || {})
          };
        }
      });
      
      // Include any other dynamic keys from siteData that weren't in the preset list
      if (siteData.content) {
        Object.keys(siteData.content).forEach(key => {
            if (!mergedContent[key]) {
                mergedContent[key] = siteData.content[key];
            }
        });
      }


      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLiveTheme(mergedTheme);
      setLiveContent(mergedContent);
    }
  }, [siteData]);

  useEffect(() => {
    if (!isPreview) return;
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "UPDATE_PREVIEW") {
        setLiveTheme(e.data.payload.themeSettings);
        setLiveContent(e.data.payload.content);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPreview]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  return (
    <div style={{ backgroundColor: liveTheme.background }}>
      <Header data={liveContent.header} theme={liveTheme} school={siteData?.school || { name: 'School' }} />
      <main>
        {Object.entries(liveContent).map(([sectionKey, sectionData]: [string, any]) => {
          const Component = SECTION_MAP[sectionKey];
          if (!Component || sectionData.show === false) return null;
          return <Component key={sectionKey} data={sectionData} theme={liveTheme} school={siteData?.school} />;
        })}
      </main>
      <Footer data={liveContent.footer} theme={liveTheme} school={siteData?.school || { name: 'School' }} />
    </div>
  );
}