/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export type ThemePreset = {
  id: string;
  variant: string;
  category: string;
  mode: "light" | "dark";
  name: string;
  primary: string;
  sidebar: string;
  navbar: string;
  canvas: string;
  card?: string;
  description: string;
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: "standard-light", variant: "standard", category: "Core Essentials", mode: "light", name: "Standard (Light)", primary: "#0091ff", sidebar: "#FFFFFF", navbar: "#FFFFFF", canvas: "#F8FAFC", card: "#FFFFFF", description: "Classic clean enterprise" },
  { id: "standard-dark", variant: "standard", category: "Core Essentials", mode: "dark", name: "Standard (Dark)", primary: "#0091ff", sidebar: "#0F172A", navbar: "#0F172A", canvas: "#020617", card: "#0F172A", description: "High-contrast professional" },
  { id: "azure-light", variant: "azure", category: "Core Essentials", mode: "light", name: "Azure (Light)", primary: "#0078D4", sidebar: "#F3F9FF", navbar: "#FFFFFF", canvas: "#FAFCFF", card: "#FFFFFF", description: "Standard corporate blue" },
  { id: "azure-dark", variant: "azure", category: "Core Essentials", mode: "dark", name: "Azure (Dark)", primary: "#60A5FA", sidebar: "#0D1117", navbar: "#0D1117", canvas: "#05080F", card: "#161B22", description: "Midnight enterprise" },

  { id: "fintech-light", variant: "fintech", category: "Corporate & Finance", mode: "light", name: "Fintech (Light)", primary: "#635BFF", sidebar: "#F6F9FC", navbar: "#FFFFFF", canvas: "#FFFFFF", card: "#FFFFFF", description: "Modern financial interface" },
  { id: "fintech-dark", variant: "fintech", category: "Corporate & Finance", mode: "dark", name: "Fintech (Dark)", primary: "#958FFF", sidebar: "#0A2540", navbar: "#0A2540", canvas: "#061626", card: "#112B46", description: "Secure banking portal" },
  { id: "navy-light", variant: "navy", category: "Corporate & Finance", mode: "light", name: "Corporate (Light)", primary: "#0A2540", sidebar: "#FFFFFF", navbar: "#FFFFFF", canvas: "#F3F4F6", card: "#FFFFFF", description: "Trustworthy enterprise blue" },
  { id: "navy-dark", variant: "navy", category: "Corporate & Finance", mode: "dark", name: "Corporate (Dark)", primary: "#5BA4CF", sidebar: "#1A1E24", navbar: "#1A1E24", canvas: "#0F1115", card: "#232830", description: "Deep maritime administration" },
  { id: "slate-light", variant: "slate", category: "Corporate & Finance", mode: "light", name: "Slate (Light)", primary: "#64748B", sidebar: "#F8FAFC", navbar: "#FFFFFF", canvas: "#F1F5F9", card: "#FFFFFF", description: "Clean titanium finish" },
  { id: "slate-dark", variant: "slate", category: "Corporate & Finance", mode: "dark", name: "Slate (Dark)", primary: "#94A3B8", sidebar: "#1E293B", navbar: "#1E293B", canvas: "#0F172A", card: "#273548", description: "Stealth charcoal finish" },

  { id: "noir-light", variant: "noir", category: "Modern Minimalist", mode: "light", name: "Noir (Light)", primary: "#09090B", sidebar: "#FAFAFA", navbar: "#FAFAFA", canvas: "#FFFFFF", card: "#FFFFFF", description: "Ultra minimalist monochrome" },
  { id: "noir-dark", variant: "noir", category: "Modern Minimalist", mode: "dark", name: "Noir (Dark)", primary: "#FAFAFA", sidebar: "#0A0A0A", navbar: "#0A0A0A", canvas: "#000000", card: "#111111", description: "Pitch black high-contrast" },
  { id: "editorial-light", variant: "editorial", category: "Modern Minimalist", mode: "light", name: "Editorial (Light)", primary: "#37352F", sidebar: "#F7F7F5", navbar: "#FFFFFF", canvas: "#FFFFFF", card: "#FFFFFF", description: "Warm document focus" },
  { id: "editorial-dark", variant: "editorial", category: "Modern Minimalist", mode: "dark", name: "Editorial (Dark)", primary: "#FFFFF3", sidebar: "#202020", navbar: "#202020", canvas: "#191919", card: "#2A2A2A", description: "Soft charcoal reading mode" },
  { id: "ghost-light", variant: "ghost", category: "Modern Minimalist", mode: "light", name: "Ghost (Light)", primary: "#334155", sidebar: "#FFFFFF", navbar: "#FFFFFF", canvas: "#F8FAFC", card: "#FFFFFF", description: "Sophisticated grey palette" },
  { id: "ghost-dark", variant: "ghost", category: "Modern Minimalist", mode: "dark", name: "Ghost (Dark)", primary: "#CBD5E1", sidebar: "#111827", navbar: "#111827", canvas: "#030712", card: "#1F2937", description: "Matte stealth graphite" },

  { id: "linear-light", variant: "linear", category: "Developer & Tech", mode: "light", name: "Studio (Light)", primary: "#5E6AD2", sidebar: "#F4F5F8", navbar: "#FFFFFF", canvas: "#F9F9FB", card: "#FFFFFF", description: "Soft indigo modern studio" },
  { id: "linear-dark", variant: "linear", category: "Developer & Tech", mode: "dark", name: "Studio (Dark)", primary: "#ddceffff", sidebar: "#131416", navbar: "#131416", canvas: "#0E0F11", card: "#18191B", description: "Deep midnight developer focus" },
  { id: "github-light", variant: "github", category: "Developer & Tech", mode: "light", name: "DevOps (Light)", primary: "#0969DA", sidebar: "#F6F8FA", navbar: "#FFFFFF", canvas: "#FFFFFF", card: "#FFFFFF", description: "Standard repository view" },
  { id: "github-dark", variant: "github", category: "Developer & Tech", mode: "dark", name: "DevOps (Dark)", primary: "#58A6FF", sidebar: "#010409", navbar: "#010409", canvas: "#0D1117", card: "#161B22", description: "Hacker terminal mode" },
  { id: "cyber-light", variant: "cyber", category: "Developer & Tech", mode: "light", name: "Nexus AI (Light)", primary: "#00B8D4", sidebar: "#FFFFFF", navbar: "#FFFFFF", canvas: "#F4F7F8", card: "#FFFFFF", description: "Clean data science interface" },
  { id: "cyber-dark", variant: "cyber", category: "Developer & Tech", mode: "dark", name: "Nexus AI (Dark)", primary: "#00E5FF", sidebar: "#0A0C10", navbar: "#0A0C10", canvas: "#050505", card: "#11141A", description: "Cyber-teal AI workstation" },
  { id: "quantum-light", variant: "quantum", category: "Developer & Tech", mode: "light", name: "Quantum (Light)", primary: "#8B5CF6", sidebar: "#F8F9FA", navbar: "#FFFFFF", canvas: "#FDFDFE", card: "#FFFFFF", description: "Vibrant tech-forward violet" },
  { id: "quantum-dark", variant: "quantum", category: "Developer & Tech", mode: "dark", name: "Quantum (Dark)", primary: "#A78BFA", sidebar: "#130F23", navbar: "#130F23", canvas: "#0B0914", card: "#1C1635", description: "Deep void neon tech" },

  { id: "amethyst-light", variant: "amethyst", category: "Creative & Studio", mode: "light", name: "Amethyst (Light)", primary: "#9333EA", sidebar: "#FAF5FF", navbar: "#FFFFFF", canvas: "#FFFFFF", card: "#FFFFFF", description: "Regal lavender tones" },
  { id: "amethyst-dark", variant: "amethyst", category: "Creative & Studio", mode: "dark", name: "Amethyst (Dark)", primary: "#C084FC", sidebar: "#2E1065", navbar: "#2E1065", canvas: "#170833", card: "#3B0764", description: "Deep cosmic purple" },
  { id: "fuchsia-light", variant: "fuchsia", category: "Creative & Studio", mode: "light", name: "Orchid (Light)", primary: "#C026D3", sidebar: "#FDF4FF", navbar: "#FFFFFF", canvas: "#FFFFFF", card: "#FFFFFF", description: "Vibrant fuchsia energy" },
  { id: "fuchsia-dark", variant: "fuchsia", category: "Creative & Studio", mode: "dark", name: "Orchid (Dark)", primary: "#E879F9", sidebar: "#4A044E", navbar: "#4A044E", canvas: "#2A042B", card: "#5A0A5B", description: "Ultraviolet midnight" },
  { id: "solar-light", variant: "solar", category: "Creative & Studio", mode: "light", name: "Solar (Light)", primary: "#E54D2E", sidebar: "#FFF8F3", navbar: "#FFFFFF", canvas: "#FFFDFB", card: "#FFFFFF", description: "Warm high-contrast orange" },
  { id: "solar-dark", variant: "solar", category: "Creative & Studio", mode: "dark", name: "Solar (Dark)", primary: "#FF6347", sidebar: "#1C1008", navbar: "#1C1008", canvas: "#120A05", card: "#2A180C", description: "Sunset over dark mode" },

  { id: "emerald-light", variant: "emerald", category: "Nature & Earth", mode: "light", name: "Emerald (Light)", primary: "#10B981", sidebar: "#F0FDF4", navbar: "#FFFFFF", canvas: "#FAFEFB", card: "#FFFFFF", description: "Professional forest green" },
  { id: "emerald-dark", variant: "emerald", category: "Nature & Earth", mode: "dark", name: "Emerald (Dark)", primary: "#34D399", sidebar: "#064E3B", navbar: "#064E3B", canvas: "#022C22", card: "#065F46", description: "Amazon midnight green" },
  { id: "sage-light", variant: "sage", category: "Nature & Earth", mode: "light", name: "Sage (Light)", primary: "#4B5E55", sidebar: "#F9FAFA", navbar: "#FFFFFF", canvas: "#FFFFFF", card: "#FFFFFF", description: "Calming clinical tones" },
  { id: "sage-dark", variant: "sage", category: "Nature & Earth", mode: "dark", name: "Sage (Dark)", primary: "#A3B8AE", sidebar: "#1A1E1C", navbar: "#1A1E1C", canvas: "#111413", card: "#242A27", description: "Muted botanical workstation" },
  { id: "stone-light", variant: "stone", category: "Nature & Earth", mode: "light", name: "Stone (Light)", primary: "#92400E", sidebar: "#FFFBEB", navbar: "#FFFFFF", canvas: "#FFFDF5", card: "#FFFFFF", description: "Warm earthy tones" },
  { id: "stone-dark", variant: "stone", category: "Nature & Earth", mode: "dark", name: "Stone (Dark)", primary: "#FBBF24", sidebar: "#451A03", navbar: "#451A03", canvas: "#290F02", card: "#592205", description: "Desert twilight amber" },

  { id: "velvet-light", variant: "velvet", category: "Premium Luxury", mode: "light", name: "Velvet (Light)", primary: "#9F1239", sidebar: "#FFF1F2", navbar: "#FFFFFF", canvas: "#FFFFFF", card: "#FFFFFF", description: "Premium burgundy executive" },
  { id: "velvet-dark", variant: "velvet", category: "Premium Luxury", mode: "dark", name: "Velvet (Dark)", primary: "#FB7185", sidebar: "#4C0519", navbar: "#4C0519", canvas: "#2A040E", card: "#630B22", description: "Deep wine luxury command" },
  { id: "gold-light", variant: "gold", category: "Premium Luxury", mode: "light", name: "Gold (Light)", primary: "#B45309", sidebar: "#FEFCE8", navbar: "#FFFFFF", canvas: "#FFFEF5", card: "#FFFFFF", description: "Prestigious golden tint" },
  { id: "gold-dark", variant: "gold", category: "Premium Luxury", mode: "dark", name: "Gold (Dark)", primary: "#FDE047", sidebar: "#422006", navbar: "#422006", canvas: "#241103", card: "#5C2D08", description: "Imperial metallic gold" }
];

type ThemeColorContextType = {
  primaryColor: string | null;
  sidebarColor: string | null;
  navbarColor: string | null;
  canvasColor: string | null;
  currentThemeId: string;
  setPrimaryColor: (color: string | null) => void;
  setSidebarColor: (color: string | null) => void;
  setNavbarColor: (color: string | null) => void;
  setCanvasColor: (color: string | null) => void;
  setTheme: (themeId: string) => void;
  resetAll: () => void;
};

const ThemeColorContext = createContext<ThemeColorContextType | undefined>(undefined);

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor.startsWith("oklch")) return null;
  const hex = hexcolor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#09090b" : "#ffffff";
};

const getSurfaceColor = (hexcolor: string, amount: number) => {
  if (!hexcolor || hexcolor.startsWith("oklch")) return null;
  const hex = hexcolor.replace("#", "");
  if (hex.length !== 6) return hexcolor;

  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);

  const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 140;
  const multiplier = isDark ? 1 + amount : 1 - (amount * 0.7);

  r = Math.min(255, Math.max(0, Math.round(r * multiplier)));
  g = Math.min(255, Math.max(0, Math.round(g * multiplier)));
  b = Math.min(255, Math.max(0, Math.round(b * multiplier)));

  if (isDark && multiplier > 1) {
    r = Math.min(255, r + 5);
    g = Math.min(255, g + 5);
    b = Math.min(255, b + 5);
  }

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const shouldBeDarkMode = (hexcolor: string | null) => {
  if (!hexcolor) return false;
  if (hexcolor.startsWith("oklch")) return false;
  const hex = hexcolor.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 140;
};

export const ThemeColorProvider = ({ children }: { children: React.ReactNode }) => {
  const { setTheme: setNextTheme, resolvedTheme } = useTheme();

  const [primaryColor, setPrimaryColorState] = useState<string | null>(null);
  const [sidebarColor, setSidebarColorState] = useState<string | null>(null);
  const [navbarColor, setNavbarColorState] = useState<string | null>(null);
  const [canvasColor, setCanvasColorState] = useState<string | null>(null);
  const [currentThemeId, setCurrentThemeId] = useState<string>("standard-light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setPrimaryColorState(localStorage.getItem("unifynt-theme-primary"));
    setSidebarColorState(localStorage.getItem("unifynt-theme-sidebar"));
    setNavbarColorState(localStorage.getItem("unifynt-theme-navbar"));
    setCanvasColorState(localStorage.getItem("unifynt-theme-canvas"));
    setCurrentThemeId(localStorage.getItem("unifynt-active-theme") || "standard-light");
  }, []);

  const applyColor = (bgVariable: string, fgVariable: string | null, color: string | null, cardOverride?: string) => {
    if (typeof window === "undefined") return;

    if (!color) {
      document.documentElement.style.removeProperty(bgVariable);
      if (fgVariable) document.documentElement.style.removeProperty(fgVariable);
      return;
    }

    document.documentElement.style.setProperty(bgVariable, color);

    if (fgVariable) {
      const contrast = getContrastColor(color);
      if (contrast) {
        document.documentElement.style.setProperty(fgVariable, contrast);
      } else {
        document.documentElement.style.removeProperty(fgVariable);
      }
    }

    if (bgVariable === "--background") {
      const cardColor = cardOverride || getSurfaceColor(color!, 0.05);
      const popoverColor = cardOverride || getSurfaceColor(color!, 0.07);
      const mutedColor = cardOverride ? getSurfaceColor(cardOverride, 0.05) : getSurfaceColor(color!, 0.03);

      if (cardColor) document.documentElement.style.setProperty("--card", cardColor);
      if (popoverColor) document.documentElement.style.setProperty("--popover", popoverColor);
      if (mutedColor) {
        document.documentElement.style.setProperty("--muted", mutedColor);
        document.documentElement.style.setProperty("--secondary", mutedColor);
      }
    }
  };

  useEffect(() => {
    if (!isMounted || !resolvedTheme || primaryColor || sidebarColor || navbarColor || canvasColor) return;

    const currentPreset = THEME_PRESETS.find(p => p.id === currentThemeId);
    if (currentPreset && currentPreset.mode !== resolvedTheme) {
      const targetPreset = THEME_PRESETS.find(
        p => p.variant === currentPreset.variant && p.mode === resolvedTheme
      );
      if (targetPreset) {
        setCurrentThemeId(targetPreset.id);
        localStorage.setItem("unifynt-active-theme", targetPreset.id);
      }
    }
  }, [resolvedTheme, primaryColor, sidebarColor, navbarColor, canvasColor, currentThemeId, isMounted]);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    requestAnimationFrame(() => {
      const activePreset = THEME_PRESETS.find(p => p.id === currentThemeId);

      if (primaryColor) applyColor("--primary", null, primaryColor);
      else if (activePreset) applyColor("--primary", null, activePreset.primary);

      if (sidebarColor) applyColor("--sidebar", "--sidebar-foreground", sidebarColor);
      else if (activePreset) applyColor("--sidebar", "--sidebar-foreground", activePreset.sidebar);

      if (navbarColor) applyColor("--navbar", "--navbar-foreground", navbarColor);
      else if (activePreset) applyColor("--navbar", "--navbar-foreground", activePreset.navbar);

      if (canvasColor) applyColor("--background", null, canvasColor);
      else if (activePreset) applyColor("--background", null, activePreset.canvas, activePreset.card);
    });
  }, [primaryColor, sidebarColor, navbarColor, canvasColor, currentThemeId, isMounted]);

  const setTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    localStorage.setItem("unifynt-active-theme", themeId);

    const theme = THEME_PRESETS.find(t => t.id === themeId);
    if (theme) {
      setPrimaryColorState(null);
      setSidebarColorState(null);
      setNavbarColorState(null);
      setCanvasColorState(null);
      localStorage.removeItem("unifynt-theme-primary");
      localStorage.removeItem("unifynt-theme-sidebar");
      localStorage.removeItem("unifynt-theme-navbar");
      localStorage.removeItem("unifynt-theme-canvas");

      setNextTheme(theme.mode);
    }
  };

  const setPrimaryColor = (color: string | null) => {
    setPrimaryColorState(color);
    if (color) {
      localStorage.setItem("unifynt-theme-primary", color);
      applyColor("--primary", null, color);
    } else {
      localStorage.removeItem("unifynt-theme-primary");
      applyColor("--primary", null, null);
    }
  };

  const setSidebarColor = (color: string | null) => {
    setSidebarColorState(color);
    if (color) {
      localStorage.setItem("unifynt-theme-sidebar", color);
      applyColor("--sidebar", "--sidebar-foreground", color);
    } else {
      localStorage.removeItem("unifynt-theme-sidebar");
      applyColor("--sidebar", "--sidebar-foreground", null);
    }
  };

  const setNavbarColor = (color: string | null) => {
    setNavbarColorState(color);
    if (color) {
      localStorage.setItem("unifynt-theme-navbar", color);
      applyColor("--navbar", "--navbar-foreground", color);
    } else {
      localStorage.removeItem("unifynt-theme-navbar");
      applyColor("--navbar", "--navbar-foreground", null);
    }
  };

  const setCanvasColor = (color: string | null) => {
    setCanvasColorState(color);
    if (color) {
      localStorage.setItem("unifynt-theme-canvas", color);
      applyColor("--background", null, color);

      const isDark = shouldBeDarkMode(color);
      setNextTheme(isDark ? "dark" : "light");
    } else {
      localStorage.removeItem("unifynt-theme-canvas");
      applyColor("--background", null, null);
    }
  };

  const resetAll = () => {
    setPrimaryColor(null);
    setSidebarColor(null);
    setNavbarColor(null);
    setCanvasColor(null);
    setCurrentThemeId("standard-light");
    localStorage.setItem("unifynt-active-theme", "standard-light");
    setNextTheme("light");
  };

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeColorContext.Provider value={{
      primaryColor,
      sidebarColor,
      navbarColor,
      canvasColor,
      currentThemeId,
      setPrimaryColor,
      setSidebarColor,
      setNavbarColor,
      setCanvasColor,
      setTheme,
      resetAll
    }}>
      {children}
    </ThemeColorContext.Provider>
  );
};

export const useThemeColor = () => {
  const context = useContext(ThemeColorContext);
  if (context === undefined) {
    throw new Error("useThemeColor must be used within a ThemeColorProvider");
  }
  return context;
};