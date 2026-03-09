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

  // 🟢 Data Fetching (Without state update inside)
  const { data: config, isLoading } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => SiteConfigService.getMyConfig(),
  });

  // 🟢 Deep Merge Logic in useEffect (Fixes reload issue)
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
      setLocalContent(mergedContent);
    }
  }, [config]);

  const mutation = useMutation({
    mutationFn: (data: any) => SiteConfigService.updateMyConfig(data),
    onSuccess: () => {
      toast.success("Site architecture deployed successfully");
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    },
  });

  useEffect(() => {
    const iframe = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({
        type: 'UPDATE_PREVIEW',
        payload: { themeSettings: localTheme, content: localContent }
      }, '*');
    }
  }, [localTheme, localContent]);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 overflow-hidden bg-background">
      <div className="h-16 border-b px-6 flex items-center justify-between bg-card z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-xl"><MonitorSmartphone className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em]">Visual Engine</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Session: {user?.school?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-bold text-[10px] uppercase" asChild>
            <a href={`/sites/${user?.school?.subdomain}`} target="_blank"><ExternalLink className="h-3.5 w-3.5 mr-2" /> Live Preview</a>
          </Button>
          <Button size="sm" className="font-black px-8 shadow-xl uppercase text-[10px] tracking-widest" onClick={() => mutation.mutate({ themeSettings: localTheme, content: localContent })} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Publish Changes
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[420px] flex-shrink-0 border-r bg-background flex flex-col h-full z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="px-4 py-3 border-b bg-muted/20">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="template" className="text-[9px] font-black uppercase tracking-widest"><LayoutTemplate className="h-3.5 w-3.5 mr-1.5" /> Template</TabsTrigger>
                <TabsTrigger value="content" className="text-[9px] font-black uppercase tracking-widest"><MonitorSmartphone className="h-3.5 w-3.5 mr-1.5" /> Content</TabsTrigger>
                <TabsTrigger value="theme" className="text-[9px] font-black uppercase tracking-widest"><Palette className="h-3.5 w-3.5 mr-1.5" /> Styling</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50/30">
              <TabsContent value="template" className="m-0 p-0"><TemplateSelection currentConfig={config} /></TabsContent>
              <TabsContent value="content" className="m-0 p-0"><ContentEditor content={localContent} onChange={setLocalContent} /></TabsContent>
              <TabsContent value="theme" className="m-0 p-0"><ThemeEditor theme={localTheme} onChange={setLocalTheme} /></TabsContent>
            </div>
          </Tabs>
        </aside>
        <main className="flex-1 bg-zinc-100 p-8 flex items-center justify-center relative">
          <div className="w-full h-full max-w-[1400px] border-4 border-white rounded-[2.5rem] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col ring-1 ring-black/5">
            <div className="h-10 bg-zinc-50 border-b flex items-center px-6 gap-4 shrink-0">
               <div className="flex gap-1.5"><div className="h-2 w-2 rounded-full bg-zinc-300" /><div className="h-2 w-2 rounded-full bg-zinc-300" /><div className="h-2 w-2 rounded-full bg-zinc-300" /></div>
               <div className="flex-1 max-w-md bg-zinc-200/50 rounded-lg h-6 flex items-center px-4"><span className="text-[9px] font-bold text-muted-foreground uppercase truncate tracking-widest">https://{user?.school?.subdomain}.unifynt.com</span></div>
            </div>
            <iframe id="preview-frame" src={`/sites/${user?.school?.subdomain}?preview=true`} className="w-full h-full border-none" />
          </div>
        </main>
      </div>
    </div>
  );
}