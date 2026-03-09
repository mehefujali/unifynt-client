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

  return (
    <div className="p-8 space-y-10 pb-32">
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Brand Identity</h3>
          <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Configure institutional palette</p>
        </div>

        <div className="grid gap-4">
          {[
            { label: "Primary Color", key: "primary" },
            { label: "Secondary Color", key: "secondary" },
            { label: "Site Background", key: "background" },
            { label: "Typography Base", key: "textPrimary" }
          ].map((c) => (
            <div key={c.key} className="flex items-center justify-between p-4 rounded-2xl border bg-card shadow-sm">
              <div className="space-y-1">
                <Label className="font-black text-[10px] uppercase tracking-widest opacity-60">{c.label}</Label>
                <p className="font-mono text-[10px] font-bold uppercase">{theme[c.key]}</p>
              </div>
              <div className="relative h-12 w-12 group">
                <div className="absolute inset-0 rounded-xl border-2 border-white shadow-xl ring-1 ring-black/5" style={{ backgroundColor: theme[c.key] }} />
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
      </div>

      <Separator className="opacity-50" />

      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Architectural Font</Label>
        <div className="p-4 rounded-xl bg-zinc-50 font-black text-sm uppercase tracking-tighter border">
          Inter Global Sans (Standard)
        </div>
      </div>
    </div>
  );
}