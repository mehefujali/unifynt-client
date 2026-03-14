/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import EnterpriseTemplate from "./enterprise";
import ModernMinimalTemplate from "./modern-minimal";
import PlayfulKidsTemplate from "./playful-kids";
import { SectionProps } from "./enterprise/types";

/**
 * Template Metadata Interface
 */
export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  component: React.ComponentType<TemplateProps>;
}

/**
 * TEMPLATE_REGISTRY
 * Central authority for all site templates.
 */
export const TEMPLATE_REGISTRY: Record<string, TemplateMetadata> = {
  enterprise: {
    id: "enterprise",
    name: "Enterprise Clean",
    description:
      "A professional, minimalist design with smooth animations and deep-blue accents. Perfect for large institutions.",
    thumbnail: "/templates/enterprise-thumb.jpg", // You should put a screenshot here
    component: EnterpriseTemplate,
  },
  "modern-minimal": {
    id: "modern-minimal",
    name: "Modern Zen",
    description:
      "A high-end, typography-first design with wide whitespace and sharp animations. Ideal for elite modern schools.",
    thumbnail: "/templates/modern-minimal-thumb.jpg",
    component: ModernMinimalTemplate,
  },
  "playful-kids": {
    id: "playful-kids",
    name: "Adventure Kids",
    description:
      "A vibrant, bouncy, and colorful design with bubbly shapes and fun animations. Perfect for kindergartens and play schools.",
    thumbnail: "/templates/playful-kids-thumb.jpg",
    component: PlayfulKidsTemplate,
  },
  "prestige-academy": {
    id: "prestige-academy",
    name: "Prestige Academy",
    description:
      "A high-contrast, cinematic design for elite institutions. Features monumental typography and a premium academic heritage aesthetic.",
    thumbnail: "/templates/prestige-academy-thumb.jpg",
    component: React.lazy(() => import("./prestige-academy")),
  },
};

export interface TemplateProps {
  siteData: any;
  liveTheme: any;
  liveContent: any;
}
