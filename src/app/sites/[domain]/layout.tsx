/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Metadata } from "next";
import { PublicSiteProvider } from "@/providers/public-site-provider";

async function getSiteData(domain: string) {
  // Use public domain for fetching if available, fallback to localhost for internal network
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

  try {
    const res = await fetch(`${apiUrl}/site-config/public/${domain}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data;
  } catch (err) {
    console.error("Error fetching site metadata:", err);
    return null;
  }
}

interface PageProps {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // 🟢 Await params for Next.js 15+ stability
  const resolvedParams = await params;
  const domain = resolvedParams?.domain;

  if (!domain) {
    return { title: "Invalid Domain" };
  }

  const cleanDomain = domain.toLowerCase();
  const siteData = await getSiteData(cleanDomain);

  if (!siteData) {
    return {
      title: "School Not Found",
      description: "The requested school portal was not found.",
    };
  }

  const { school, seo } = siteData;

  const title = (seo as any)?.metaTitle || school?.name || "School Website";
  const description = (seo as any)?.metaDescription || `Official portal of ${school?.name}.`;
  const keywords = (seo as any)?.metaKeywords || `school, education`;

  return {
    title: {
      absolute: title,
    },
    description: description,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      siteName: school?.name,
      images: [{ url: school?.logo || "/icon.png" }],
    },
    icons: {
      icon: school?.logo || "/icon.png",
    }
  };
}

export default async function PublicSiteLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  // Ensure params are loaded to avoid lifecycle issues
  await params;

  return (
    <PublicSiteProvider>
      {children}
    </PublicSiteProvider>
  );
}
