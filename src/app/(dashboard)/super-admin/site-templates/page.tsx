"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, LayoutTemplate, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteTemplateService } from "@/services/site-template.service";
import TemplateModal from "./template-modal";

export default function SuperAdminTemplatesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: templatesRes, isLoading, refetch } = useQuery({
    queryKey: ["all-site-templates"],
    queryFn: () => SiteTemplateService.getAllTemplates(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  // ⚠️ Fixed Type Error: directly using templatesRes instead of templatesRes.data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templates: any[] = Array.isArray(templatesRes) ? templatesRes : [];

  return (
    <div className="space-y-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Templates</h1>
          <p className="text-sm text-muted-foreground">Manage website templates for schools.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="py-24 text-center border border-dashed rounded-xl bg-muted/10">
          <p className="text-muted-foreground font-medium">No templates found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="relative overflow-hidden group hover:shadow-md transition-all">
              <div className="aspect-[16/10] w-full bg-muted/30 relative border-b overflow-hidden">
                {template.thumbnailUrl ? (
                  <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <LayoutTemplate className="h-8 w-8 opacity-20" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Active" : "Draft"}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{template.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground mt-1">Code: {template.templateCode}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {template.description}
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TemplateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        template={selectedTemplate}
        onSuccess={refetch}
      />
    </div>
  );
}