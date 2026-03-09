/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, LayoutTemplate, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { SiteTemplateService } from "@/services/site-template.service";
import { SiteConfigService } from "@/services/site-config.service";
import { Badge } from "@/components/ui/badge";

export function TemplateSelection({ currentConfig }: { currentConfig: any }) {
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = useQuery({
    queryKey: ["active-site-templates"],
    queryFn: () => SiteTemplateService.getAllTemplates({ isActive: "true" }),
  });

  const mutation = useMutation({
    mutationFn: (templateCode: string) => SiteConfigService.updateMyConfig({ activeTemplateId: templateCode }),
    onSuccess: () => {
      toast.success("Architectural blueprint switched successfully");
      queryClient.invalidateQueries({ queryKey: ["site-config"] });
    },
  });

  if (isLoading) return <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" /></div>;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Site Blueprints</h3>
        <p className="text-[11px] font-bold text-muted-foreground mt-1">Choose a layout structure for your institution.</p>
      </div>

      <div className="grid gap-6">
        {templates?.map((template: any) => {
          const isActive = template.templateCode === currentConfig?.activeTemplate?.templateCode;
          return (
            <div
              key={template.id}
              className={`group relative rounded-3xl border-2 transition-all duration-500 overflow-hidden cursor-pointer ${isActive ? "border-primary shadow-2xl scale-[1.02]" : "border-transparent hover:border-primary/30"}`}
              onClick={() => !isActive && mutation.mutate(template.templateCode)}
            >
              <div className="aspect-[16/10] relative bg-muted">
                {template.thumbnailUrl && <Image src={template.thumbnailUrl} alt={template.name} fill className="object-cover" />}
                {isActive && (
                  <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge className="px-4 py-2 rounded-full font-black uppercase tracking-widest shadow-2xl animate-in zoom-in-50"><CheckCircle2 className="h-4 w-4 mr-2" /> Current blueprint</Badge>
                  </div>
                )}
              </div>
              <div className="p-5 bg-card border-t">
                <h4 className="font-black text-sm uppercase tracking-tight">{template.name}</h4>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase opacity-60 leading-relaxed line-clamp-2">{template.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}