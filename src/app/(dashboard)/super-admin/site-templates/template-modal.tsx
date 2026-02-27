/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { SiteTemplateService } from "@/services/site-template.service";

export default function TemplateModal({ isOpen, onClose, template, onSuccess }: any) {
  const [formData, setFormData] = useState({
    templateCode: "",
    name: "",
    description: "",
    thumbnailUrl: "",
    defaultThemeSettings: "{}",
    defaultContent: "{}",
    isActive: true,
  });

  useEffect(() => {
    if (template) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        templateCode: template.templateCode,
        name: template.name,
        description: template.description || "",
        thumbnailUrl: template.thumbnailUrl || "",
        defaultThemeSettings: JSON.stringify(template.defaultThemeSettings, null, 2),
        defaultContent: JSON.stringify(template.defaultContent, null, 2),
        isActive: template.isActive === true || template.isActive === "true",
      });
    } else {
      setFormData({
        templateCode: "",
        name: "",
        description: "",
        thumbnailUrl: "",
        defaultThemeSettings: "{\n  \"colors\": {\n    \"primary\": \"#0f172a\",\n    \"secondary\": \"#d4af37\"\n  },\n  \"hiddenSections\": []\n}",
        defaultContent: "{\n  \"hero\": {\n    \"badgeText\": \"New Template\",\n    \"titlePart1\": \"Awesome\",\n    \"titleHighlight\": \"School\",\n    \"titlePart2\": \"Theme.\"\n  }\n}",
        isActive: true,
      });
    }
  }, [template, isOpen]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // JSON Parse test and Boolean conversion before sending to backend
      const payload = {
        ...data,
        defaultThemeSettings: JSON.parse(data.defaultThemeSettings),
        defaultContent: JSON.parse(data.defaultContent),
        // ⚠️ এই লাইনটি স্ট্রিং "true" কে আসল boolean true তে কনভার্ট করবে
        isActive: data.isActive === true || data.isActive === "true",
      };

      if (template?.id) {
        return await SiteTemplateService.updateTemplate(template.id, payload);
      } else {
        return await SiteTemplateService.createTemplate(payload);
      }
    },
    onSuccess: () => {
      toast.success(template ? "Template updated!" : "Template created!");
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong. Check JSON format.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      JSON.parse(formData.defaultThemeSettings);
      JSON.parse(formData.defaultContent);
      mutation.mutate(formData);
    } catch (err) {
      toast.error("Invalid JSON format in settings or content.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Add New Template"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Template Name <span className="text-red-500">*</span></Label>
              <Input 
                required 
                placeholder="e.g. Elite Ivy League"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Template Code (Unique) <span className="text-red-500">*</span></Label>
              <Input 
                required 
                disabled={!!template}
                placeholder="e.g. template_elite_01"
                value={formData.templateCode}
                onChange={(e) => setFormData({...formData, templateCode: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail URL</Label>
            <Input 
              placeholder="https://images.unsplash.com/..."
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              placeholder="Short description of this theme..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Theme Settings (JSON)</Label>
              <Textarea 
                className="font-mono text-xs h-48 bg-slate-950 text-green-400"
                value={formData.defaultThemeSettings}
                onChange={(e) => setFormData({...formData, defaultThemeSettings: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Content (JSON)</Label>
              <Textarea 
                className="font-mono text-xs h-48 bg-slate-950 text-blue-400"
                value={formData.defaultContent}
                onChange={(e) => setFormData({...formData, defaultContent: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch 
              checked={formData.isActive}
              onCheckedChange={(c) => setFormData({...formData, isActive: c})}
            />
            <Label>Active (Visible to schools)</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}