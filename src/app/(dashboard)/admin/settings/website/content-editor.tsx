/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Layout, Type, Image as ImageIcon, UploadCloud, Loader2,
  Link as LinkIcon, Globe, Plus, Trash2
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export function ContentEditor({ content, onChange }: any) {
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const updateField = (section: string, field: string, value: any) => {
    onChange({ ...content, [section]: { ...content[section], [field]: value } });
  };

  const handleImageUpload = async (section: string, field: string, file: File) => {
    try {
      setIsUploading(`${section}-${field}`);
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        updateField(section, field, res.data.data.url);
        toast.success("Asset uploaded successfully");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploading(null);
    }
  };

  if (!content) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40 mx-auto mb-2" />
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Loading content engine...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 pb-32">

      {/* Header */}
      <div className="px-2 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Content Modules</h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">
          Configure your institution&apos;s web presence
        </p>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {Object.entries(content).map(([secKey, secData]: [string, any]) => (
          <AccordionItem
            key={secKey}
            value={secKey}
            className="border border-border rounded-xl overflow-hidden bg-card shadow-sm"
          >
            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-all [&[data-state=open]]:bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                  {secKey === 'header' || secKey === 'footer'
                    ? <Globe className="h-3.5 w-3.5 text-primary" />
                    : <Layout className="h-3.5 w-3.5 text-primary" />
                  }
                </div>
                <span className="font-black text-[11px] uppercase tracking-widest text-foreground">
                  {secKey}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="border-t border-border bg-background">
              <div className="p-5 space-y-6">

                {/* Visibility Toggle */}
                {secKey !== 'header' && secKey !== 'footer' && (
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border border-dashed">
                    <div className="space-y-0.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">
                        Visibility
                      </Label>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">
                        Show this section on site
                      </p>
                    </div>
                    <Switch
                      checked={secData.show !== false}
                      onCheckedChange={(v) => updateField(secKey, "show", v)}
                    />
                  </div>
                )}

                {/* Fields */}
                <div className="grid gap-5">
                  {Object.entries(secData).map(([key, value]: [string, any]) => {
                    if (key === "show") return null;

                    const isImageField = (key.toLowerCase().includes("image") || key.toLowerCase() === "logo") && !key.toLowerCase().includes("text");
                    const isLinkField = key.toLowerCase().includes("link");

                    return (
                      <div key={key} className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          {isImageField
                            ? <ImageIcon className="h-3 w-3" />
                            : isLinkField
                            ? <LinkIcon className="h-3 w-3" />
                            : <Type className="h-3 w-3" />
                          }
                          {key.replace(/([A-Z])/g, ' $1')}
                        </Label>

                        {/* Array (links) */}
                        {Array.isArray(value) ? (
                          <div className="space-y-2 border border-border p-4 rounded-xl bg-muted/20">
                            {value.map((link: any, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={link.label}
                                  onChange={(e) => {
                                    const newLinks = [...value];
                                    newLinks[index].label = e.target.value;
                                    updateField(secKey, key, newLinks);
                                  }}
                                  className="h-9 text-xs bg-background border-border"
                                  placeholder="Label (e.g. About)"
                                />
                                <Input
                                  value={link.url}
                                  onChange={(e) => {
                                    const newLinks = [...value];
                                    newLinks[index].url = e.target.value;
                                    updateField(secKey, key, newLinks);
                                  }}
                                  className="h-9 text-xs font-mono text-primary bg-background border-border"
                                  placeholder="/about"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="h-9 w-9 shrink-0 rounded-lg"
                                  onClick={() => {
                                    const newLinks = value.filter((_: any, i: number) => i !== index);
                                    updateField(secKey, key, newLinks);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-dashed border-border text-[10px] font-black uppercase tracking-widest h-9 hover:bg-muted/30"
                              onClick={() => {
                                const newLinks = [...value, { label: "", url: "" }];
                                updateField(secKey, key, newLinks);
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 mr-2" />
                              Add Link
                            </Button>
                          </div>

                        /* Image upload */
                        ) : isImageField ? (
                          <div className="space-y-3">
                            {value && (
                              <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/20 group">
                                <img
                                  src={value}
                                  alt="Asset"
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            )}
                            <div className="relative">
                              <input
                                type="file"
                                className="hidden"
                                id={`upload-${secKey}-${key}`}
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(secKey, key, e.target.files[0])}
                              />
                              <Button
                                variant="outline"
                                className="w-full h-10 border-dashed border-border rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-muted/30 hover:border-primary/40 transition-all"
                                asChild
                                disabled={isUploading === `${secKey}-${key}`}
                              >
                                <label htmlFor={`upload-${secKey}-${key}`} className="cursor-pointer">
                                  {isUploading === `${secKey}-${key}`
                                    ? <Loader2 className="animate-spin mr-2 h-3.5 w-3.5" />
                                    : <UploadCloud className="mr-2 h-3.5 w-3.5" />
                                  }
                                  {value ? "Replace Asset" : "Upload Asset"}
                                </label>
                              </Button>
                            </div>
                          </div>

                        /* Textarea */
                        ) : key.toLowerCase().includes("description") || key.toLowerCase().includes("subtitle") || key.toLowerCase().includes("quote") ? (
                          <Textarea
                            value={value}
                            onChange={(e) => updateField(secKey, key, e.target.value)}
                            className="rounded-xl bg-background border-border focus-visible:ring-1 text-sm min-h-[100px] font-medium leading-relaxed"
                          />

                        /* Layout select */
                        ) : key === "layout" ? (
                          <select
                            value={value}
                            onChange={(e) => updateField(secKey, key, e.target.value)}
                            className="h-10 w-full px-3 rounded-xl bg-background border border-border text-foreground focus-visible:ring-1 font-semibold text-sm outline-none cursor-pointer"
                          >
                            <option value="type1">Layout 1: Minimal Centered</option>
                            <option value="type2">Layout 2: Background Image</option>
                            <option value="type3">Layout 3: Split Image/Text</option>
                          </select>

                        /* Text input */
                        ) : (
                          <Input
                            value={value}
                            onChange={(e) => updateField(secKey, key, e.target.value)}
                            className={`h-10 rounded-xl bg-background border-border focus-visible:ring-1 ${isLinkField ? 'font-mono text-xs text-primary' : 'font-medium text-sm'}`}
                            placeholder={isLinkField ? "https://your-link.com" : "Enter text content..."}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}