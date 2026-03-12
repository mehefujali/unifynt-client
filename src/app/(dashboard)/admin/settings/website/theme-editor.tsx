"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ThemeEditor({ theme, onChange }: any) {
  if (!theme) return null;

  const updateTheme = (key: string, val: string) => {
    onChange({ ...theme, [key]: val });
  };

  const colorFields = [
    { label: "Primary Color", key: "primary", desc: "Main brand accent" },
    { label: "Secondary Color", key: "secondary", desc: "Supporting accent" },
    { label: "Site Background", key: "background", desc: "Page background" },
    { label: "Typography Base", key: "textPrimary", desc: "Primary text color" },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">

      {/* Section Header */}
      <div className="space-y-1">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Brand Identity</h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase">
          Configure your institution&apos;s visual palette
        </p>
      </div>

      {/* Color Pickers */}
      <div className="space-y-3">
        {colorFields.map((c) => (
          <div
            key={c.key}
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm hover:bg-muted/30 transition-colors"
          >
            <div className="space-y-0.5">
              <Label className="font-black text-[10px] uppercase tracking-widest text-foreground">
                {c.label}
              </Label>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{c.desc}</p>
              <p className="font-mono text-[10px] font-bold text-primary mt-1">{theme[c.key]}</p>
            </div>

            <div className="relative h-11 w-11 group cursor-pointer shrink-0">
              <div
                className="absolute inset-0 rounded-lg border-2 border-border shadow-md ring-1 ring-black/5 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: theme[c.key] }}
              />
              <Input
                type="color"
                value={theme[c.key]}
                onChange={(e) => updateTheme(c.key, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>

      <Separator className="opacity-30" />

      {/* Font Info */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Typography System
        </Label>
        <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-black text-sm text-foreground">Inter</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Sans — Standard</p>
          </div>
          <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-md">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Active</span>
          </div>
        </div>
      </div>

    </div>
  );
}