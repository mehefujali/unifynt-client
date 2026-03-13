import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { ThemeColorProvider } from "@/providers/theme-color-provider";
import { ThemeWrapper } from "@/components/theme-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScroll } from "@/components/providers/smooth-scroll";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Unifynt | #1 School Management Service & Advanced ERP Software",
    template: "%s | Unifynt",
  },
  description: "Experience the next generation of school management with Unifynt. Advanced ERP solution for modern educational institutions.",
  metadataBase: new URL("https://unifynt.com"),
  keywords: [
    "school management service", 
    "school management system", 
    "school ERP software India", 
    "best school management software", 
    "school administration system", 
    "cloud school ERP", 
    "student information system", 
    "fee management software", 
    "online school admission system", 
    "school management app", 
    "SaaS for schools", 
    "educational institution ERP",
    "automated school billing",
    "school office automation",
    "online result management system",
    "library management software",
    "student attendance tracker",
    "teacher management tool",
    "institution management platform",
    "affordable school software",
    "CBSE school management software",
    "ICSE school ERP",
    "state board school system",
    "private school management service",
    "digital school transformation",
    "school software for principals",
    "paperless school administration",
    "secure school data management",
    "school erp for west bengal",
    "best school software in kolkata",
    "WBBSE school management system",
    "WBCHSE ERP software",
    "primary school management app",
    "high school administration tool",
    "school ranking improvement software",
    "school branding and seo service",
    "cloud-based education erp india"
  ],
  authors: [{ name: "Unifynt Team", url: "https://unifynt.com" }],
  creator: "Unifynt",
  publisher: "Unifynt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/unifynt-logo.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://unifynt.com",
    siteName: "Unifynt School Management Service",
    title: "Unifynt - Transform Your School Management with Our Advanced ERP",
    description: "The complete digital infrastructure for schools. Manage everything from admissions to finances in one place.",
    images: [
      {
        url: "/unifynt-logo.png",
        width: 1200,
        height: 630,
        alt: "Unifynt - Best School Management Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unifynt | Advanced School Management ERP",
    description: "Empower your school with the most advanced management service. Streamline every operation efficiently.",
    images: ["/unifynt-logo.png"],
  },
  alternates: {
    canonical: "https://unifynt.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${bricolage.variable} ${outfit.variable} font-outfit antialiased`}
        suppressHydrationWarning 
      >
        <QueryProvider>
          <ThemeWrapper>
            <ThemeColorProvider>
              <SmoothScroll>
                {children}
              </SmoothScroll>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify([
                    {
                      "@context": "https://schema.org",
                      "@type": "SoftwareApplication",
                      "name": "Unifynt",
                      "applicationCategory": "EducationalApplication, BusinessApplication",
                      "operatingSystem": "Web, Android, iOS",
                      "description": "Unifynt is the most advanced school management service and ERP software. It streamlines admissions, fee collection, attendance, and all academic operations for schools.",
                      "url": "https://unifynt.com",
                      "author": {
                        "@type": "Organization",
                        "name": "Unifynt",
                        "url": "https://unifynt.com",
                        "logo": "https://unifynt.com/unifynt-logo.png"
                      },
                      "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "INR",
                        "availability": "https://schema.org/InStock"
                      },
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "reviewCount": "150"
                      }
                    },
                    {
                      "@context": "https://schema.org",
                      "@type": "Organization",
                      "name": "Unifynt",
                      "url": "https://unifynt.com",
                      "logo": "https://unifynt.com/unifynt-logo.png",
                      "sameAs": [
                        "https://twitter.com/unifynt",
                        "https://linkedin.com/company/unifynt"
                      ],
                      "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+91-XXXXXXXXXX",
                        "contactType": "customer service",
                        "areaServed": "IN",
                        "availableLanguage": ["en", "bn", "hi"]
                      }
                    }
                  ])
                }}
              />
              <Toaster position="top-center" richColors />
            </ThemeColorProvider>
          </ThemeWrapper>
        </QueryProvider>
      </body>
    </html>
  );
}