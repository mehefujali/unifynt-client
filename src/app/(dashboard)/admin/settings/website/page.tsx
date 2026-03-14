/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, MonitorSmartphone, Save, ExternalLink, LayoutTemplate, Palette } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";
import { ThemeEditor } from "./theme-editor";
import { ContentEditor } from "./content-editor";
import { TemplateSelection } from "./template-selection";

export default function WebsiteSettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("content");

  const [localTheme, setLocalTheme] = useState<any>(DEFAULT_SITE_DATA.theme);
  const [localContent, setLocalContent] = useState<any>(DEFAULT_SITE_DATA.content);
  const [localTemplateId, setLocalTemplateId] = useState<string>("enterprise");

  const { data: config, isLoading } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => SiteConfigService.getMyConfig(),
  });

  useEffect(() => {
    if (config) {
      const mergedTheme = { ...DEFAULT_SITE_DATA.theme, ...(config.themeSettings || {}) };
      const mergedContent = { ...DEFAULT_SITE_DATA.content } as any;
      if (config.content) {
        Object.keys(DEFAULT_SITE_DATA.content).forEach(key => {
          mergedContent[key] = {
            ...(DEFAULT_SITE_DATA.content as any)[key],
            ...(config.content[key] || {})
          };
        });
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTheme(mergedTheme);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalContent(mergedContent);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalTemplateId(config.templateId || config.activeTemplateId || "enterprise");
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: (data: any) => SiteConfigService.updateMyConfig(data),
    onSuccess: () => {
      toast.success("Site configuration published successfully");
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    },
  });

  useEffect(() => {
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_PREVIEW',
        payload: { 
          themeSettings: localTheme, 
          content: localContent,
          templateId: localTemplateId 
        }
      }, '*');
    }
  }, [localTheme, localContent, localTemplateId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Loading Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 overflow-hidden bg-background">

      {/* ── Top Bar ── */}
      <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card z-20 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <MonitorSmartphone className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-widest text-foreground">Website Builder</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
              {user?.school?.name || "Your School"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase tracking-widest border-border"
            asChild
          >
            <a href={`/sites/${user?.school?.subdomain}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5 mr-2" />
              Live Site
            </a>
          </Button>
          <Button
            size="sm"
            className="h-8 px-6 font-black text-[10px] uppercase tracking-widest shadow-sm"
            onClick={() => mutation.mutate({ 
              themeSettings: localTheme, 
              content: localContent,
              templateId: localTemplateId
            })}
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              : <Save className="mr-2 h-3.5 w-3.5" />
            }
            Publish
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Panel ── */}
        <aside className="w-[400px] flex-shrink-0 border-r border-border bg-background flex flex-col h-full z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">

            {/* Tab Headers */}
            <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg h-9">
                <TabsTrigger
                  value="template"
                  className="text-[9px] font-black uppercase tracking-widest rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                >
                  <LayoutTemplate className="h-3 w-3 mr-1" />
                  Template
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="text-[9px] font-black uppercase tracking-widest rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                >
                  <MonitorSmartphone className="h-3 w-3 mr-1" />
                  Content
                </TabsTrigger>
                <TabsTrigger
                  value="theme"
                  className="text-[9px] font-black uppercase tracking-widest rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                >
                  <Palette className="h-3 w-3 mr-1" />
                  Styling
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
              <TabsContent value="template" className="m-0 p-0">
                <TemplateSelection 
                    currentConfig={{ 
                      templateId: localTemplateId,
                      activeTemplateId: localTemplateId
                    }} 
                    onSelect={(id) => {
                        setLocalTemplateId(id);
                        setActiveTab("content");
                    }}
                />
              </TabsContent>
              <TabsContent value="content" className="m-0 p-0">
                <ContentEditor content={localContent} onChange={setLocalContent} />
              </TabsContent>
              <TabsContent value="theme" className="m-0 p-0">
                <ThemeEditor theme={localTheme} onChange={setLocalTheme} />
              </TabsContent>
            </div>
          </Tabs>
        </aside>

        {/* ── Preview Panel ── */}
        <main className="flex-1 bg-muted/40 p-6 flex items-center justify-center relative overflow-hidden">
          {/* Background subtle grid */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          <div className="relative w-full h-full max-w-[1400px] flex flex-col">
            {/* Browser chrome */}
            <div className="h-10 bg-card border border-border rounded-t-2xl flex items-center px-4 gap-3 shrink-0 shadow-sm">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              </div>
              <div className="flex-1 max-w-sm bg-muted border border-border rounded-md h-6 flex items-center px-3 gap-2 mx-auto">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase truncate tracking-wider">
                  https://{user?.school?.subdomain}.unifynt.com
                </span>
              </div>
            </div>
            {/* Iframe */}
            <div className="flex-1 border border-t-0 border-border rounded-b-2xl overflow-hidden shadow-xl">
              <iframe
                id="preview-frame"
                src={`/sites/${user?.school?.subdomain}?preview=true`}
                className="w-full h-full border-none bg-white"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}