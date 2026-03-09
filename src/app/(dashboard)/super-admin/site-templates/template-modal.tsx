/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, LayoutTemplate, Code2, Plus } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageCropper from "@/components/ui/image-cropper";

import { SiteTemplateService } from "@/services/site-template.service";
import { siteTemplateSchema, SiteTemplateFormValues } from "./schema";

const DEFAULT_THEME = JSON.stringify({
  colors: { primary: "#2563eb", secondary: "#1e40af", background: "#ffffff", text: "#0f172a" },
  fonts: { heading: "Inter", body: "Roboto" },
  layout: { navbarStyle: "standard", footerStyle: "modern" }
}, null, 2);

const DEFAULT_CONTENT = JSON.stringify({
  hero: { title: "Welcome to Our School", subtitle: "Empowering students for a brighter tomorrow.", ctaText: "Apply Now", ctaLink: "/admission", show: true },
  about: { title: "About Us", content: "We are committed to excellence in education.", show: true },
  features: { title: "Why Choose Us?", items: [{ title: "Expert Teachers", description: "Learn from the best." }], show: true }
}, null, 2);

interface TemplateModalProps {
  template?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function TemplateModal({ template, open: controlledOpen, onOpenChange, trigger }: TemplateModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isEditing = !!template;
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;

  const queryClient = useQueryClient();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<SiteTemplateFormValues>({
    resolver: zodResolver(siteTemplateSchema) as any, // 🟢 Fix: Added 'as any' here
    defaultValues: {
      templateCode: "", name: "", description: "", isActive: true,
      defaultThemeSettingsString: DEFAULT_THEME,
      defaultContentString: DEFAULT_CONTENT,
    }
  });

  useEffect(() => {
    if (template && open) {
      reset({
        templateCode: template.templateCode,
        name: template.name,
        description: template.description || "",
        isActive: template.isActive,
        thumbnailUrl: template.thumbnailUrl,
        defaultThemeSettingsString: template.defaultThemeSettings ? JSON.stringify(template.defaultThemeSettings, null, 2) : DEFAULT_THEME,
        defaultContentString: template.defaultContent ? JSON.stringify(template.defaultContent, null, 2) : DEFAULT_CONTENT,
      });
    } else if (!template && open) {
      reset({
        templateCode: `template_${Math.random().toString(36).substring(2, 8)}`,
        name: "", description: "", isActive: true,
        defaultThemeSettingsString: DEFAULT_THEME,
        defaultContentString: DEFAULT_CONTENT,
      });
    }
  }, [template, open, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditing) return await SiteTemplateService.updateTemplate(template.id, data);
      return await SiteTemplateService.createTemplate(data);
    },
    onSuccess: () => {
      toast.success(`Template ${isEditing ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ["site-templates"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit: SubmitHandler<SiteTemplateFormValues> = (data) => {
    const formData = new FormData();
    const { thumbnailUrl, defaultThemeSettingsString, defaultContentString, ...restData } = data;
    const payload: any = { ...restData };
    
    if (defaultThemeSettingsString) payload.defaultThemeSettings = JSON.parse(defaultThemeSettingsString);
    if (defaultContentString) payload.defaultContent = JSON.parse(defaultContentString);
    if (typeof thumbnailUrl === "string" && thumbnailUrl.trim() !== "") {
      payload.thumbnailUrl = thumbnailUrl;
    }

    formData.append("data", JSON.stringify(payload));
    if (thumbnailUrl && typeof thumbnailUrl === "object" && 'size' in thumbnailUrl) {
      formData.append("thumbnailUrl", thumbnailUrl as Blob);
    }
    mutation.mutate(formData);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      {!trigger && !isEditing && (
        <SheetTrigger asChild>
          <Button className="font-bold shadow-md"><Plus className="mr-2 h-5 w-5" /> Onboard Template</Button>
        </SheetTrigger>
      )}

      <SheetContent className="sm:max-w-[700px] p-0 flex flex-col h-full border-l-0 shadow-2xl overflow-hidden bg-background">
        <div className="p-8 pb-4 border-b bg-muted/10 shrink-0">
          <SheetHeader>
            <SheetTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              <LayoutTemplate className="h-6 w-6 text-primary" />
              {isEditing ? "Edit Template Profile" : "Register New Template"}
            </SheetTitle>
            <SheetDescription className="font-medium">Define design constraints and default content structure.</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="template-form" onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/40 p-1 rounded-xl">
                <TabsTrigger value="basic" className="rounded-lg font-bold">Identity & Assets</TabsTrigger>
                <TabsTrigger value="json" className="rounded-lg font-bold">Data Architecture</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-8 animate-in fade-in-50 duration-300">
                <div className="flex justify-center">
                  <Controller
                    control={control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <ImageCropper
                        aspectRatio={16/9}
                        shape="rect"
                        label="Preview Image"
                        previewUrl={typeof field.value === "string" ? field.value : null}
                        onCrop={(file) => field.onChange(file)}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Template Display Name *</Label>
                    <Input {...register("name")} className={errors.name ? 'border-red-500' : ''} />
                    {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Access Token / Code *</Label>
                    <Input {...register("templateCode")} disabled={isEditing} className="bg-muted/50 font-mono font-bold" />
                    {errors.templateCode && <span className="text-xs text-red-500">{errors.templateCode.message}</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold">Internal Description</Label>
                  <Textarea {...register("description")} rows={3} className="resize-none" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-2xl bg-muted/5">
                  <div className="space-y-0.5">
                    <Label className="font-bold">Enable for Distribution</Label>
                    <p className="text-xs text-muted-foreground">Allow schools to select and activate this template.</p>
                  </div>
                  <Controller control={control} name="isActive" render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-8 animate-in fade-in-50 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Code2 className="h-4 w-4 text-primary" />
                    <Label className="font-black text-xs uppercase tracking-widest">Initial Theme Payload (JSON)</Label>
                  </div>
                  <Textarea 
                    {...register("defaultThemeSettingsString")} 
                    rows={10} 
                    className={`font-mono text-xs bg-zinc-950 text-emerald-400 p-6 rounded-2xl border-0 ring-1 ring-zinc-800 ${errors.defaultThemeSettingsString ? 'ring-red-500' : ''}`} 
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Code2 className="h-4 w-4 text-primary" />
                    <Label className="font-black text-xs uppercase tracking-widest">Initial Content Payload (JSON)</Label>
                  </div>
                  <Textarea 
                    {...register("defaultContentString")} 
                    rows={12} 
                    className={`font-mono text-xs bg-zinc-950 text-sky-400 p-6 rounded-2xl border-0 ring-1 ring-zinc-800 ${errors.defaultContentString ? 'ring-red-500' : ''}`} 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </div>

        <div className="p-6 border-t bg-background shrink-0 flex justify-end gap-3 z-10 relative">
          <Button variant="outline" onClick={() => setOpen(false)} className="font-bold">Cancel</Button>
          <Button type="submit" form="template-form" disabled={mutation.isPending} className="font-black px-10">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEditing ? "Apply Updates" : "Finalize Registration"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}