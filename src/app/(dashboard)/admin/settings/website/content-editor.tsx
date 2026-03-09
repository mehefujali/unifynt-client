/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Layout, Type, Image as ImageIcon, UploadCloud, Loader2, Link as LinkIcon, Globe } from "lucide-react";
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
        toast.success("Asset deployed to Cloudinary");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(null);
    }
  };

  if (!content) return <div className="p-8 text-center animate-pulse font-black text-[10px] uppercase opacity-40">Architecting Content Engine...</div>;

  return (
    <div className="p-4 space-y-4 pb-32">
      <div className="px-2 mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Content Modules</h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Configure your enterprise presence</p>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {Object.entries(content).map(([secKey, secData]: [string, any]) => (
          <AccordionItem key={secKey} value={secKey} className="border rounded-[1.5rem] overflow-hidden bg-card shadow-sm border-zinc-100">
            <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-muted/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  {secKey === 'header' || secKey === 'footer' ? <Globe className="h-4 w-4 text-primary" /> : <Layout className="h-4 w-4 text-primary" />}
                </div>
                <span className="font-black text-[11px] uppercase tracking-[0.2em]">{secKey}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-6 space-y-8 border-t border-zinc-50">
              {secKey !== 'header' && secKey !== 'footer' && (
                <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest">Visibility</Label>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">Enable this block on site</p>
                  </div>
                  <Switch checked={secData.show !== false} onCheckedChange={(v) => updateField(secKey, "show", v)} />
                </div>
              )}

              <div className="grid gap-6">
                {Object.entries(secData).map(([key, value]: [string, any]) => {
                  if (key === "show") return null;

                  const isImageField = (key.toLowerCase().includes("image") || key.toLowerCase() === "logo") && !key.toLowerCase().includes("text");
                  const isLinkField = key.toLowerCase().includes("link");

                  return (
                    <div key={key} className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                        {isImageField ? <ImageIcon className="h-3 w-3" /> : isLinkField ? <LinkIcon className="h-3 w-3" /> : <Type className="h-3 w-3" />}
                        {key.replace(/([A-Z])/g, ' $1')}
                      </Label>

                      {isImageField ? (
                        <div className="space-y-4">
                          {value && (
                            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-zinc-100 group">
                              <img src={value} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
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
                              className="w-full h-12 border-2 border-dashed rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-primary/50" 
                              asChild
                              disabled={isUploading === `${secKey}-${key}`}
                            >
                              <label htmlFor={`upload-${secKey}-${key}`}>
                                {isUploading === `${secKey}-${key}` ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {value ? "Replace Asset" : "Upload Asset"}
                              </label>
                            </Button>
                          </div>
                        </div>
                      ) : key.toLowerCase().includes("description") || key.toLowerCase().includes("subtitle") || key.toLowerCase().includes("quote") ? (
                        <Textarea 
                          value={value} 
                          onChange={(e) => updateField(secKey, key, e.target.value)}
                          className="rounded-2xl bg-zinc-50 border-0 focus-visible:ring-1 text-sm min-h-[120px] font-medium leading-relaxed"
                        />
                      ) : (
                        <Input 
                          value={value} 
                          onChange={(e) => updateField(secKey, key, e.target.value)}
                          className={`h-12 rounded-xl bg-zinc-50 border-0 focus-visible:ring-1 ${isLinkField ? 'font-mono text-xs text-primary' : 'font-bold text-sm'}`}
                          placeholder={isLinkField ? "https://your-link.com" : "Enter text content..."}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}