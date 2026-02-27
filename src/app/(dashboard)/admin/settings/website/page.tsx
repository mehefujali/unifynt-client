/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, Loader2, LayoutTemplate, Palette, FileText, Globe } from "lucide-react";
import TemplateSelection from "./template-selection";
import ThemeEditor from "./theme-editor";
import ContentEditor from "./content-editor";
import { SiteConfigService } from "@/services/site-config.service";
import { SiteTemplateService } from "@/services/site-template.service";

const defaultThemeSettings = {
  colors: { primary: "#4f46e5", secondary: "#7c3aed" },
  hiddenSections: [] as string[],
};

const defaultSiteContent = {
  hero: {
    badgeText: "Admissions Open",
    titlePart1: "Empowering",
    titleHighlight: "Minds",
    titlePart2: ", Shaping Futures.",
    description: "Welcome to our school. We provide world-class education.",
    primaryButtonText: "Start Admission",
    primaryButtonLink: "/admission",
    secondaryButtonText: "Learn More",
    secondaryButtonLink: "#facilities",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop",
  },
  footer: {
    poweredBy: "Unifynt ERP"
  }
};

export default function WebsiteSettingsPage() {
  const [formData, setFormData] = useState({
    activeTemplateId: "template_modern_01",
    themeSettings: defaultThemeSettings,
    content: defaultSiteContent,
  });

  const { data: configRes, isLoading: configLoading } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => SiteConfigService.getMyConfig(),
  });

  const { data: templatesRes, isLoading: templatesLoading } = useQuery({
    queryKey: ["site-templates"],
    queryFn: () => SiteTemplateService.getAllTemplates(),
  });

  useEffect(() => {
    if (configRes) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        activeTemplateId: (configRes as any).activeTemplateId || "template_modern_01",
        themeSettings: (configRes as any).themeSettings || defaultThemeSettings,
        content: (configRes as any).content || defaultSiteContent,
      });
    }
  }, [configRes]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await SiteConfigService.updateConfig(data);
    },
    onSuccess: () => {
      toast.success("Website settings updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update settings");
    },
  });

  if (configLoading || templatesLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const templates = templatesRes || [];

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website Builder</h1>
          <p className="text-sm text-muted-foreground">Manage your public website appearance and content.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => window.open('/', '_blank')}>
            <Globe className="h-4 w-4" />
            Preview Site
          </Button>
          <Button 
            onClick={() => mutation.mutate(formData)}
            disabled={mutation.isPending}
            className="gap-2 shadow-sm"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="template" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-12 shadow-sm">
          <TabsTrigger value="template" className="gap-2 font-medium">
            <LayoutTemplate className="h-4 w-4"/> Templates
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2 font-medium">
            <Palette className="h-4 w-4"/> Theme Settings
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2 font-medium">
            <FileText className="h-4 w-4"/> Content Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="template" className="mt-0">
          <TemplateSelection 
            templates={templates} 
            activeId={formData.activeTemplateId} 
            onChange={(id: string) => setFormData({ ...formData, activeTemplateId: id })} 
          />
        </TabsContent>

        <TabsContent value="theme" className="mt-0">
          <ThemeEditor 
            theme={formData.themeSettings} 
            onChange={(theme: any) => setFormData({ ...formData, themeSettings: theme })} 
          />
        </TabsContent>

        <TabsContent value="content" className="mt-0">
          <ContentEditor 
            content={formData.content} 
            onChange={(content: any) => setFormData({ ...formData, content })} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}