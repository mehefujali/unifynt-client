/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle2 } from "lucide-react";
import { TEMPLATE_REGISTRY } from "@/components/templates/registry";

interface TemplateSelectionProps {
  currentConfig: any;
  onSelect: (id: string) => void;
}

export function TemplateSelection({ currentConfig, onSelect }: TemplateSelectionProps) {
  const templates = Object.values(TEMPLATE_REGISTRY);

  return (
    <div className="p-6 space-y-8">
      <div>
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Templates Gallery</h3>
        <p className="text-[11px] font-bold text-muted-foreground mt-1">Select a visual foundation for your public presence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-1 pb-10">
        {templates.map((template) => {
          const isActive = template.id === currentConfig?.templateId || template.id === currentConfig?.activeTemplateId;
          
          return (
            <div
              key={template.id}
              className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden cursor-pointer ${
                isActive 
                  ? "border-primary shadow-lg ring-1 ring-primary/20" 
                  : "border-border/50 hover:border-primary/40 bg-zinc-900/5 hover:bg-white hover:shadow-md"
              }`}
              onClick={() => onSelect(template.id)}
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                 {/* Premium Blueprint Background */}
                 <div className={`absolute inset-0 transition-colors duration-700 ${isActive ? 'bg-primary/5' : 'bg-zinc-50 group-hover:bg-zinc-100'}`}>
                    <div className="absolute inset-x-4 top-4 bottom-0 bg-white rounded-t-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="h-2 border-b border-zinc-100 bg-zinc-50 flex items-center px-1.5 gap-0.5">
                            <div className="w-1 h-1 rounded-full bg-zinc-200" />
                            <div className="w-1 h-1 rounded-full bg-zinc-200" />
                        </div>
                        <div className="p-2 space-y-1.5">
                            <div className="h-1.5 w-2/3 bg-zinc-100 rounded-full" />
                            <div className="h-1 w-1/3 bg-zinc-50 rounded-full" />
                            <div className="grid grid-cols-3 gap-1 pt-1">
                                <div className="h-6 bg-zinc-50 rounded border border-dashed border-zinc-200" />
                                <div className="h-6 bg-zinc-50 rounded border border-dashed border-zinc-200" />
                                <div className="h-6 bg-zinc-50 rounded border border-dashed border-zinc-200" />
                            </div>
                        </div>
                    </div>
                 </div>

                {isActive && (
                  <div className="absolute inset-0 bg-primary/5 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <div className="bg-primary text-white px-4 py-1.5 rounded-full font-black text-[8px] uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3" /> Selected
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-black text-[10px] uppercase tracking-wider ${isActive ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-900'}`}>{template.name}</h4>
                    {isActive && (
                        <span className="flex h-1.5 w-1.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                        </span>
                    )}
                </div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight leading-[1.3] line-clamp-1">
                    {template.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}