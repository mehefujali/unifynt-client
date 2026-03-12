/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LayoutTemplate, Trash2, Edit, AlertCircle, Plus, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteTemplateService } from "@/services/site-template.service";
import { TemplateModal } from "./template-modal";
import { cn } from "@/lib/utils";

export default function SiteTemplatesPage() {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading, isError } = useQuery({
    queryKey: ["site-templates"],
    queryFn: () => SiteTemplateService.getAllTemplates(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SiteTemplateService.deleteTemplate(id),
    onSuccess: () => {
      toast.success("Template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["site-templates"] });
    },
    onError: () => toast.error("Failed to delete template"),
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground font-medium text-center">Loading templates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Registry Sync Issue</h3>
              <p className="text-sm text-muted-foreground">Unable to fetch website template configurations.</p>
            </div>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["site-templates"] })}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Site Templates</h2>
          <p className="text-sm text-muted-foreground">
            Manage website themes and CMS configurations for institutions.
          </p>
        </div>
        <TemplateModal 
          trigger={
            <Button className="h-10">
              <Plus className="mr-2 h-4 w-4" /> Add Template
            </Button>
          }
        />
      </div>

      <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <LayoutTemplate className="h-4 w-4" />
          <span>{templates.length} Registered Templates</span>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-xl bg-muted/20">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <LayoutTemplate className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider">No templates found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-6">Start by provisioning a new website template.</p>
          <TemplateModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template: any) => (
            <div key={template.id} className="group flex flex-col rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden border-b-4 border-b-transparent hover:border-b-primary/40">
              <div className="aspect-[16/10] relative bg-muted/40 border-b border-border overflow-hidden">
                {template.thumbnailUrl ? (
                  <Image src={template.thumbnailUrl} alt={template.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                    <LayoutTemplate className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className={cn(
                    "font-bold text-[10px] uppercase tracking-wider backdrop-blur-md",
                    template.isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted/50 text-muted-foreground border-border"
                  )}>
                    {template.isActive ? "Active" : "Draft"}
                  </Badge>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground text-sm truncate uppercase tracking-tight">{template.name}</h3>
                    <Badge variant="secondary" className="font-mono text-[9px] h-4 shrink-0 px-1 border-border">{template.templateCode}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
                    {template.description || "Administrative configuration for school CMS fronts."}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 pt-3 border-t border-border mt-auto">
                  <TemplateModal 
                    template={template} 
                    trigger={
                      <Button variant="outline" size="sm" className="flex-1 font-bold h-8 rounded-lg text-[10px] uppercase tracking-wider">
                        <Edit className="h-3 w-3 mr-2" /> Modify
                      </Button>
                    } 
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" 
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}