"use client";

import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
// @ts-ignore
import gjsPresetWebpage from "grapesjs-preset-webpage";
// @ts-ignore
import gjsBlocksBasic from "grapesjs-blocks-basic";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Globe } from "lucide-react";
import { toast } from "sonner";
import { SiteConfigService } from "@/services/site-config.service";
import { getEnterpriseTemplate } from "@/config/default-template";

// UPDATED INTERFACE to accept more school details
interface GrapesEditorProps {
  initialData: any;
  schoolName: string;
  schoolLogo?: string;
  subdomain?: string;
  address?: string; // New
  phone?: string;   // New
  email?: string;   // New
}

export default function GrapesEditor({
  initialData,
  schoolName,
  schoolLogo,
  subdomain,
  address,
  phone,
  email
}: GrapesEditorProps) {

  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const gjs = grapesjs.init({
      container: editorRef.current,
      height: "100%",
      width: "100%",
      storageManager: { type: 'none' },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '992px' },
          { name: 'Mobile', width: '320px', widthMedia: '575px' },
        ],
      },
      plugins: [gjsPresetWebpage, gjsBlocksBasic],
      pluginsOpts: {
        gjsPresetWebpage: {
          // ... options same as before
        },
      },
    });

    setEditor(gjs);

    if (initialData?.gjsComponents) {
      gjs.loadProjectData({
        components: initialData.gjsComponents,
        styles: initialData.gjsStyles,
        assets: initialData.gjsAssets
      });
      toast.info("Loaded saved website design.");
    } else {
      // Pass all dynamic data to the template generator
      const defaultTemplate = getEnterpriseTemplate({
        name: schoolName,
        logo: schoolLogo,
        address: address,
        phone: phone,
        email: email
      });
      gjs.setComponents(defaultTemplate);
      toast.success("Enterprise Template Loaded!");
    }

    return () => {
      gjs.destroy();
    };
  }, []); // Dependencies empty to run once on mount

  // ... handleSave function (same as before) ...
  const handleSave = async () => {
    if (!editor) return;
    setSaving(true);
    try {
      const components = editor.getComponents();
      const styles = editor.getStyle();
      const html = editor.getHtml();
      const css = editor.getCss();
      const assets = editor.getAssetManager().getAll();

      await SiteConfigService.saveBuilderData({
        gjsComponents: components,
        gjsStyles: styles,
        gjsHtml: html,
        gjsCss: css,
        gjsAssets: assets
      });
      toast.success("Website published successfully!");
    } catch (error) {
      toast.error("Failed to save website.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="bg-slate-900 text-white h-14 flex justify-between items-center px-4 border-b border-slate-700 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="font-bold text-sm tracking-tight text-white">Website Builder</h1>
            <span className="text-[10px] text-slate-400">{schoolName}</span>
          </div>
          <span className="text-[10px] bg-brand-gold text-brand-900 px-2 py-0.5 rounded font-bold">PRO</span>
        </div>

        <div className="flex items-center gap-2">
          {subdomain && (
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white h-8" onClick={() => window.open(`/school/${subdomain}`, '_blank')}>
              <Globe className="mr-2 h-4 w-4" /> Live Site
            </Button>
          )}
          <div className="h-6 w-px bg-slate-700 mx-1"></div>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs font-bold">
            {saving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
            PUBLISH
          </Button>
        </div>
      </div>
      <div className="flex-1 relative bg-gray-50">
        <div id="gjs" ref={editorRef} style={{ height: "100%", overflow: "hidden" }}></div>
      </div>
    </div>
  );
}