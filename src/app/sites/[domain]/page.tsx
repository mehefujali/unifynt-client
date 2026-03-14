/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";
import { Loader2 } from "lucide-react";

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
  const [localTemplateId, setLocalTemplateId] = useState<string | null>(null);

  // 🟢 Deep Merge Logic
  useEffect(() => {
    if (siteData) {
      const mergedTheme = { ...DEFAULT_SITE_DATA.theme, ...(siteData.themeSettings || {}) };

      const mergedContent: any = {};

      const orderedKeys = [
        "header", "hero", "noticeBoard", "stats", "about",
        "features", "academics", "gallery", "faculty",
        "testimonials", "faq", "contact", "footer"
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
      setLocalTemplateId(siteData?.school?.templateId || "enterprise");
    }
  }, [siteData]);

  useEffect(() => {
    if (!isPreview) return;
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "UPDATE_PREVIEW") {
        setLiveTheme(e.data.payload.themeSettings);
        setLiveContent(e.data.payload.content);
        if (e.data.payload.templateId) {
          setLocalTemplateId(e.data.payload.templateId);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPreview]);

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  // Select template based on school configuration or live preview
  const templateId = localTemplateId || siteData?.school?.templateId || "enterprise";
  const templateData = TEMPLATE_REGISTRY[templateId] || TEMPLATE_REGISTRY["enterprise"];
  const TemplateComponent = templateData.component;

  return (
    <TemplateComponent
      siteData={siteData}
      liveTheme={liveTheme}
      liveContent={liveContent}
    />
  );
}
