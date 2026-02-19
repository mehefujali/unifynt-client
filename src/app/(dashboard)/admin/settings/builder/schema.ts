import {
  LayoutTemplate,
  BarChart3,
  List,
  Megaphone,
  Image as ImageIcon,
  PlayCircle,
  Users,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

export type SectionType =
  | "HERO"
  | "STATS"
  | "FEATURES"
  | "GALLERY"
  | "VIDEO"
  | "FACULTY"
  | "TESTIMONIAL"
  | "FAQ"
  | "CTA";

export const SECTION_DEFINITIONS = [
  {
    type: "HERO",
    label: "Hero Banner",
    icon: LayoutTemplate,
    desc: "Main landing banner with CTA",
  },
  {
    type: "STATS",
    label: "Statistics",
    icon: BarChart3,
    desc: "Key numbers and achievements",
  },
  {
    type: "FEATURES",
    label: "Features",
    icon: List,
    desc: "Grid of school facilities",
  },
  {
    type: "GALLERY",
    label: "Gallery",
    icon: ImageIcon,
    desc: "Photo grid layout",
  },
  {
    type: "VIDEO",
    label: "Video",
    icon: PlayCircle,
    desc: "YouTube/Vimeo embed",
  },
  { type: "FACULTY", label: "Faculty", icon: Users, desc: "Teacher profiles" },
  {
    type: "TESTIMONIAL",
    label: "Reviews",
    icon: MessageSquare,
    desc: "Parent testimonials",
  },
  { type: "FAQ", label: "FAQ", icon: HelpCircle, desc: "Questions & Answers" },
  {
    type: "CTA",
    label: "Call to Action",
    icon: Megaphone,
    desc: "Final application prompt",
  },
];

export const DEFAULT_THEME = {
  primaryColor: "#0f172a",
  secondaryColor: "#ea580c",
  fontFamily: "Inter",
  sections: [
    {
      id: "hero-default",
      type: "HERO",
      isVisible: true,
      title: "Empowering Future Leaders",
      subtitle: "Excellence in Education since 1995",
      content: { btnText: "Apply Now", btnLink: "/apply" },
      style: {
        paddingY: "lg",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        textAlign: "left",
      },
    },
  ],
};
