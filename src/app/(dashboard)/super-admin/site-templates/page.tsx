/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LayoutTemplate, Trash2, Edit, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteTemplateService } from "@/services/site-template.service";
import { TemplateModal } from "./template-modal";

export default function SiteTemplatesPage() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <LayoutTemplate className="h-8 w-8 text-primary" /> Site Templates
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage website themes and CMS configurations for schools.
          </p>
        </div>
        <TemplateModal />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-muted/5">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-bold">No templates found</h3>
          <p className="text-sm text-muted-foreground mb-6">Start by creating a new website template.</p>
          <TemplateModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template: any) => (
            <div key={template.id} className="group flex flex-col rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="aspect-video relative bg-muted/20 border-b">
                {template.thumbnailUrl ? (
                  <Image src={template.thumbnailUrl} alt={template.name} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                    <LayoutTemplate className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={template.isActive ? "default" : "secondary"} className="shadow-sm">
                    {template.isActive ? "Active" : "Draft"}
                  </Badge>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-lg leading-tight truncate">{template.name}</h3>
                  <Badge variant="outline" className="font-mono text-[10px] shrink-0">{template.templateCode}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                  {template.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-2 pt-4 border-t mt-auto">
                  <TemplateModal 
                    template={template} 
                    trigger={<Button variant="outline" size="sm" className="flex-1 font-semibold"><Edit className="h-4 w-4 mr-2" /> Edit</Button>} 
                  />
                  <Button variant="outline" size="icon" className="shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-4 w-4" />
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