/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ImageOff } from "lucide-react";

export default function TemplateSelection({ templates, activeId, onChange }: any) {
  if (!templates || templates.length === 0) {
    return (
      <div className="py-24 text-center border border-dashed rounded-xl bg-muted/10">
        <p className="text-muted-foreground font-medium">No templates available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {templates.map((template: any) => {
        const isActive = template.templateCode === activeId;
        return (
          <Card 
            key={template.id} 
            className={`relative cursor-pointer overflow-hidden transition-all duration-200 ${isActive ? 'ring-2 ring-primary border-primary shadow-md' : 'hover:border-primary/40 hover:shadow-sm'}`}
            onClick={() => onChange(template.templateCode)}
          >
            {isActive && (
              <div className="absolute top-3 right-3 z-10">
                <CheckCircle2 className="h-7 w-7 text-primary bg-background rounded-full shadow-sm" />
              </div>
            )}
            <div className="aspect-[16/10] w-full bg-muted/30 relative overflow-hidden border-b">
              {template.thumbnailUrl ? (
                <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <ImageOff className="h-8 w-8 opacity-20" />
                  <span className="text-sm font-medium opacity-50">No Preview</span>
                </div>
              )}
            </div>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-foreground">{template.name}</h3>
                {isActive && <Badge variant="default" className="shadow-none">Active</Badge>}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {template.description || "A professional template designed for modern educational institutions."}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}