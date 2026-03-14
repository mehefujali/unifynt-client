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

  const handleImageUpload = async (section: string, field: string, file: File, arrayIndex?: number, arrayKey?: string) => {
    try {
      const uploadId = arrayKey ? `${section}-${arrayKey}-${arrayIndex}` : `${section}-${field}`;
      setIsUploading(uploadId);
      
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      
      if (res.data.success) {
        if (arrayKey !== undefined && arrayIndex !== undefined) {
          const newValue = [...content[section][arrayKey]];
          newValue[arrayIndex] = { ...newValue[arrayIndex], [field]: res.data.data.url };
          updateField(section, arrayKey, newValue);
        } else {
          updateField(section, field, res.data.data.url);
        }
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

  const isImageKey = (key: string) => {
    const k = key.toLowerCase();
    return (k.includes("image") || k.includes("logo") || k === "url" || k.includes("photo") || k.includes("avatar")) && !k.includes("text") && !k.includes("link");
  };

  return (
    <div className="p-4 space-y-3 pb-32">
      <div className="px-2 pb-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Content Modules</h3>
        <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">
          A-Z dynamic site management
        </p>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {Object.entries(content).map(([secKey, secData]: [string, any]) => {
          if (secKey === 'noticeBoard') return null;
          return (
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

                  <div className="grid gap-5">
                    {Object.entries(secData).map(([key, value]: [string, any]) => {
                      if (key === "show") return null;

                      const isImageField = isImageKey(key);
                      const isLinkField = key.toLowerCase().includes("link");

                      return (
                        <div key={key} className="space-y-2 relative group">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            {isImageField
                              ? <ImageIcon className="h-3 w-3" />
                              : isLinkField
                              ? <LinkIcon className="h-3 w-3" />
                              : <Type className="h-3 w-3" />
                            }
                            {key.replace(/([A-Z])/g, ' $1')}
                            
                            {!['title', 'subtitle', 'description', 'heroImage', 'logoText', 'ctaText', 'ctaLink', 'items', 'levels'].includes(key) && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                onClick={() => {
                                  const newSecData = { ...secData };
                                  delete newSecData[key];
                                  onChange({ ...content, [secKey]: newSecData });
                                }}
                              >
                                <Trash2 className="h-2.5 w-2.5 text-destructive" />
                              </Button>
                            )}
                          </Label>

                          {Array.isArray(value) ? (
                            <div className="space-y-4 border border-border p-4 rounded-xl bg-muted/20">
                              {value.map((item: any, index: number) => (
                                <div key={index} className="space-y-3 p-4 bg-background rounded-xl border border-border relative group shadow-sm">
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                                    onClick={() => {
                                      const newValue = value.filter((_: any, i: number) => i !== index);
                                      updateField(secKey, key, newValue);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                  <div className="grid gap-3">
                                    {Object.keys(item).map((itemKey) => {
                                      const isItemImage = isImageKey(itemKey);
                                      const isLongText = itemKey.toLowerCase().includes("desc") || itemKey.toLowerCase().includes("quote");
                                      
                                      return (
                                        <div key={itemKey} className="space-y-1">
                                          <Label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                            {itemKey.replace(/([A-Z])/g, ' $1')}
                                          </Label>
                                          
                                          {isItemImage ? (
                                            <div className="space-y-2">
                                              {item[itemKey] && (
                                                <div className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted/20 mb-2">
                                                  <img src={item[itemKey]} alt="Item" className="object-cover w-full h-full" />
                                                </div>
                                              )}
                                              <input
                                                type="file"
                                                className="hidden"
                                                id={`upload-item-${secKey}-${key}-${index}-${itemKey}`}
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(secKey, itemKey, e.target.files[0], index, key)}
                                              />
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full h-8 border-dashed text-[9px] font-black uppercase tracking-widest rounded-lg"
                                                asChild
                                                disabled={isUploading === `${secKey}-${key}-${index}`}
                                              >
                                                <label htmlFor={`upload-item-${secKey}-${key}-${index}-${itemKey}`} className="cursor-pointer">
                                                  {isUploading === `${secKey}-${key}-${index}` ? <Loader2 className="animate-spin h-3 w-3 mr-1" /> : <UploadCloud className="h-3 w-3 mr-1" />}
                                                  {item[itemKey] ? "Change" : "Upload"}
                                                </label>
                                              </Button>
                                            </div>
                                          ) : isLongText ? (
                                            <Textarea
                                              value={item[itemKey]}
                                              onChange={(e) => {
                                                const newValue = [...value];
                                                newValue[index] = { ...newValue[index], [itemKey]: e.target.value };
                                                updateField(secKey, key, newValue);
                                              }}
                                              className="min-h-[60px] text-xs bg-muted/10 border-border rounded-lg resize-none"
                                            />
                                          ) : (
                                            <Input
                                              value={item[itemKey]}
                                              onChange={(e) => {
                                                const newValue = [...value];
                                                newValue[index] = { ...newValue[index], [itemKey]: e.target.value };
                                                updateField(secKey, key, newValue);
                                              }}
                                              className="h-8 text-xs bg-muted/10 border-border rounded-lg"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full border-dashed border-border text-[10px] font-black uppercase tracking-widest h-10 hover:bg-white hover:border-primary/50 transition-all rounded-xl"
                                onClick={() => {
                                  const baseStructure = value.length > 0 ? { ...value[0] } : { label: "", url: "" };
                                  Object.keys(baseStructure).forEach(k => baseStructure[k] = "");
                                  updateField(secKey, key, [...value, baseStructure]);
                                }}
                              >
                                <Plus className="h-3.5 w-3.5 mr-2" />
                                Add New Item
                              </Button>
                            </div>
                          ) : isImageField ? (
                            <div className="space-y-3">
                              {value && (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted/20 group">
                                  <img src={value} alt="Asset" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
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
                                    {isUploading === `${secKey}-${key}` ? <Loader2 className="animate-spin mr-2 h-3.5 w-3.5" /> : <UploadCloud className="mr-2 h-3.5 w-3.5" />}
                                    {value ? "Replace Asset" : "Upload Asset"}
                                  </label>
                                </Button>
                              </div>
                            </div>
                          ) : key.toLowerCase().includes("description") || key.toLowerCase().includes("subtitle") || key.toLowerCase().includes("quote") || key.toLowerCase().includes("philosophy") ? (
                            <Textarea
                              value={value}
                              onChange={(e) => updateField(secKey, key, e.target.value)}
                              className="rounded-xl bg-background border-border focus-visible:ring-1 text-sm min-h-[100px] font-medium leading-relaxed"
                            />
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

                    <div className="pt-4 border-t border-border border-dashed">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all border border-dashed border-border"
                        onClick={() => {
                          const fieldName = prompt("Enter Field Name (e.g., extraText):");
                          if (fieldName) {
                            updateField(secKey, fieldName.replace(/\s+/g, ''), "New Content Value");
                          }
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        Add Custom Field to {secKey}
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}