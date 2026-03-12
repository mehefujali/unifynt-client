/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft, Save, Eye, ExternalLink, GripVertical, Trash2, Plus, Settings,
  Type, FileText, Hash, AtSign, Phone, ChevronDown, CircleDot, CheckSquare,
  Calendar, Upload, Star, Minus, Heading1, Globe, Clock, Lock,
  ChevronRight, Loader2, Database, LayoutTemplate
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CustomFormService } from "@/services/form.service";
import { SiteConfigService } from "@/services/site-config.service";

// --- Field Type Definitions ---
const FIELD_PALETTE = [
  {
    group: "Base Units", items: [
      { type: "TEXT", label: "Short Text", icon: Type, description: "Single line intake" },
      { type: "TEXTAREA", label: "Long Text", icon: FileText, description: "Multi-line intake" },
      { type: "NUMBER", label: "Integer", icon: Hash, description: "Numeric intake" },
      { type: "EMAIL", label: "Electronic Mail", icon: AtSign, description: "Email intake" },
      { type: "PHONE", label: "Telephony", icon: Phone, description: "Phone intake" },
    ]
  },
  {
    group: "Selection Units", items: [
      { type: "SELECT", label: "Dropdown List", icon: ChevronDown, description: "Single pick selection" },
      { type: "RADIO", label: "Radio Select", icon: CircleDot, description: "Single pick radio" },
      { type: "CHECKBOX", label: "Multi Check", icon: CheckSquare, description: "Multiple pick selection" },
      { type: "RATING", label: "Metric Rating", icon: Star, description: "Linear numeric rating" },
    ]
  },
  {
    group: "Advanced Assets", items: [
      { type: "DATE", label: "Chronology", icon: Calendar, description: "Date intake unit" },
      { type: "FILE", label: "Object Upload", icon: Upload, description: "External file object" },
    ]
  },
  {
    group: "Structure", items: [
      { type: "DIVIDER", label: "Section Break", icon: Minus, description: "Unit separation" },
      { type: "HEADING", label: "Header Unit", icon: Heading1, description: "Identity header" },
    ]
  },
];

const ALL_TYPES = FIELD_PALETTE.flatMap((g) => g.items);

// --- Helpers ---
const newField = (type: string) => ({
  id: crypto.randomUUID(),
  type,
  label: ALL_TYPES.find((t) => t.type === type)?.label || "New Unit",
  placeholder: "",
  required: false,
  options: [] as string[],
});

// --- Sortable Field Row ---
function SortableField({ field, isSelected, onClick, onDelete }: {
  field: any; isSelected: boolean; onClick: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const meta = ALL_TYPES.find((t) => t.type === field.type);
  const Icon = meta?.icon || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150",
        isDragging ? "opacity-30" : "opacity-100",
        isSelected
          ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900/5 dark:bg-zinc-100/5 shadow-sm ring-1 ring-zinc-900/10 dark:ring-zinc-100/10"
          : "border-zinc-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 hover:border-zinc-400 dark:hover:border-zinc-600"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-zinc-300 hover:text-zinc-500 focus:outline-none shrink-0 transition-colors">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800", isSelected ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-50 dark:bg-zinc-800")}>
        <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-white dark:text-zinc-900" : "text-zinc-500")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-zinc-900 dark:text-zinc-100 truncate">{field.label || "Unnamed Unit"}</p>
        <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">{meta?.label || field.type}</p>
      </div>
      {field.required && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">REQ</span>}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-rose-600 ml-1 shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// --- Field Preview ---
function FieldPreview({ field }: { field: any }) {
  if (field.type === "DIVIDER") return <hr className="my-2 border-zinc-200 dark:border-zinc-800" />;
  if (field.type === "HEADING") return <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-2 uppercase tracking-wide">{field.label}</h3>;

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-tight text-zinc-500 dark:text-zinc-400">
        {field.label}
        {field.required && <span className="text-rose-500 ml-1 italic font-normal text-[9px]">Required</span>}
      </label>
      {(field.type === "TEXT" || field.type === "EMAIL" || field.type === "NUMBER" || field.type === "PHONE") && (
        <Input disabled placeholder={field.placeholder || `Awaiting input unit...`} className="h-9 text-xs bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border" />
      )}
      {field.type === "TEXTAREA" && (
        <Textarea disabled placeholder={field.placeholder || "Awaiting multi-line input..."} className="min-h-[80px] text-xs bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border resize-none" />
      )}
      {field.type === "SELECT" && (
        <Select disabled><SelectTrigger className="h-9 text-xs bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border"><SelectValue placeholder="Select internal unit" /></SelectTrigger></Select>
      )}
      {field.type === "RADIO" && (
        <div className="space-y-1.5 pt-1">
          {(field.options?.length ? field.options : ["Source Unit Alpha", "Source Unit Beta"]).map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <span className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700 flex-shrink-0" /> {opt}
            </label>
          ))}
        </div>
      )}
      {field.type === "CHECKBOX" && (
        <div className="space-y-1.5 pt-1">
          {(field.options?.length ? field.options : ["Asset Mapping 1", "Asset Mapping 2"]).map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <span className="h-4 w-4 rounded border border-zinc-300 dark:border-zinc-700 flex-shrink-0" /> {opt}
            </label>
          ))}
        </div>
      )}
      {field.type === "DATE" && <Input disabled type="date" className="h-9 text-xs bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border" />}
      {field.type === "RATING" && (
        <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className="h-6 w-6 text-zinc-200 dark:text-zinc-800" />)}</div>
      )}
      {field.type === "FILE" && (
        <div className="border-2 border-dashed border-zinc-200 dark:border-sidebar-border rounded-xl p-6 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50/50 dark:bg-sidebar/20">Awaiting Object Synchronisation</div>
      )}
    </div>
  );
}

// --- Field Settings Panel ---
function FieldSettingsPanel({ field, onChange }: { field: any; onChange: (updated: any) => void }) {
  const hasOptions = ["SELECT", "RADIO", "CHECKBOX"].includes(field.type);
  const [optionsText, setOptionsText] = useState(field.options?.join("\n") || "");

  const handleOptionsChange = (val: string) => {
    setOptionsText(val);
    onChange({ ...field, options: val.split("\n").map((s: string) => s.trim()).filter(Boolean) });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setOptionsText(field.options?.join("\n") || ""); }, [field.id]);

  return (
    <div className="space-y-5 p-5">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Unit Identity</label>
        <Input value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} className="h-10 text-xs font-bold border-zinc-200 dark:border-sidebar-border" />
      </div>
      {!["DIVIDER", "HEADING", "RATING"].includes(field.type) && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Visual Hint</label>
          <Input value={field.placeholder || ""} onChange={(e) => onChange({ ...field, placeholder: e.target.value })} className="h-10 text-xs font-bold border-zinc-200 dark:border-sidebar-border" />
        </div>
      )}
      {hasOptions && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Entry Variables (Line Separated)</label>
          <Textarea value={optionsText} onChange={(e) => handleOptionsChange(e.target.value)} className="min-h-[140px] text-xs font-bold resize-none border-zinc-200 dark:border-sidebar-border" />
        </div>
      )}
      {!["DIVIDER", "HEADING"].includes(field.type) && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-sidebar/50 border border-zinc-200 dark:border-sidebar-border transition-all">
          <div>
            <p className="text-[11px] font-black uppercase tracking-tight text-zinc-700 dark:text-zinc-300">Mandatory Unit</p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Strict intake required</p>
          </div>
          <Switch checked={field.required} onCheckedChange={(v) => onChange({ ...field, required: v })} />
        </div>
      )}
    </div>
  );
}

// --- Page ---
function FormBuilderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("NEW REGISTRY LAYER");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "CLOSED">("DRAFT");
  const [fields, setFields] = useState<any[]>([{ ...newField("TEXT"), label: "SUBJECT IDENTITY", required: true }]);
  const [selectedId, setSelectedId] = useState<string | null>(fields[0]?.id || null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled-registry";

  const { data: allFormsData } = useQuery({
    queryKey: ["forms-for-builder", editId],
    queryFn: () => CustomFormService.getAllForms({ page: 1, limit: 200 }),
    enabled: !!editId,
  });

  const initializedRef = useRef(false);
  useEffect(() => {
    if (editId && allFormsData?.data && !initializedRef.current) {
      const f = allFormsData.data.find((x: any) => x.id === editId);
      if (f) {
        initializedRef.current = true;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTitle(f.title);
        setDescription(f.description || "");
        setStatus(f.status);
        const loaded = (f.fields as any[]).map((field: any) => ({
          ...field,
          options: field.options || [],
          required: !!field.required,
          placeholder: field.placeholder || "",
        }));
        setFields(loaded);
        setSelectedId(loaded[0]?.id || null);
      }
    }
  }, [editId, allFormsData]);

  const { data: siteConfig } = useQuery({ queryKey: ["site-config"], queryFn: () => SiteConfigService.getMyConfig() });
  const schoolSubdomain = siteConfig?.data?.subdomain;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const protocol = rootDomain.includes("localhost") ? "http://" : "https://";
  const publicUrl = schoolSubdomain ? `${protocol}${schoolSubdomain}.${rootDomain}/f/${slug}` : `/f/${slug}`;

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title, description, slug, status,
        fields: fields.map((f) => ({ id: f.id, label: f.label, type: f.type, required: f.required, placeholder: f.placeholder || "", options: f.options || [] })),
        settings: { notifyAdmin: false, isMultipleStep: false, syncToGoogleSheet: false },
      };
      return editId ? CustomFormService.updateForm(editId, payload) : CustomFormService.createForm(payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Registry updated." : "Registry initialized.");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      router.push("/admin/forms");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Registry synchronization failed.");
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((prev) => {
        const oldIdx = prev.findIndex((f) => f.id === active.id);
        const newIdx = prev.findIndex((f) => f.id === over.id);
        return arrayMove(prev, oldIdx, newIdx);
      });
    }
  };

  const addField = (type: string) => {
    const f = newField(type);
    setFields((prev) => [...prev, f]);
    setSelectedId(f.id);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedId(null);
  };

  const updateField = useCallback((updated: any) => {
    setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  }, []);

  const selectedField = fields.find((f) => f.id === selectedId) || null;
  const STATUS_ICONS: any = { PUBLISHED: Globe, DRAFT: Clock, CLOSED: Lock };
  const StatusIcon = STATUS_ICONS[status];

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-background">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-5 h-14 bg-white dark:bg-sidebar border-b border-zinc-200 dark:border-sidebar-border shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/forms")} className="h-9 w-9 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value.toUpperCase())}
            placeholder="NEW REGISTRY LAYER"
            className="text-[13px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none w-full placeholder:text-zinc-300 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="h-9 w-36 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800 outline-none">
              <div className="flex items-center gap-1.5 pt-0.5">
                <StatusIcon className={cn("h-3 w-3", status === "PUBLISHED" ? "text-emerald-500" : status === "DRAFT" ? "text-amber-500" : "text-zinc-400")} />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 p-1">
              <SelectItem value="DRAFT" className="text-[10px] font-black uppercase tracking-widest py-2 cursor-pointer">Local Draft</SelectItem>
              <SelectItem value="PUBLISHED" className="text-[10px] font-black uppercase tracking-widest py-2 cursor-pointer">Live Deployment</SelectItem>
              <SelectItem value="CLOSED" className="text-[10px] font-black uppercase tracking-widest py-2 cursor-pointer">Restricted</SelectItem>
            </SelectContent>
          </Select>

          {slug && status === "PUBLISHED" && (
            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 transition-all" onClick={() => window.open(publicUrl, "_blank")}>
              <Eye className="h-3.5 w-3.5" /> Port
            </Button>
          )}

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all gap-2 shadow-lg shadow-zinc-900/10">
            {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {editId ? "Synchronize" : "Initialize"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Palette */}
        <div className="w-60 bg-white dark:bg-sidebar border-r border-zinc-200 dark:border-sidebar-border flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-50 dark:border-sidebar-border flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pt-0.5">Asset Inventory</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-4 custom-scrollbar">
            {FIELD_PALETTE.map((group) => (
              <div key={group.group}>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 px-2 pb-2 pl-3">{group.group}</p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={() => addField(item.type)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left bg-zinc-50/0 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all group"
                      >
                        <div className="h-7 w-7 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50 flex items-center justify-center shrink-0 transition-all">
                          <Icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-100">{item.label}</p>
                        </div>
                        <Plus className="h-3 w-3 text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 ml-auto shrink-0 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Center: List */}
          <div className="w-80 border-r border-zinc-200 dark:border-sidebar-border flex flex-col bg-slate-50 dark:bg-background/40 shrink-0">
            <div className="p-4 border-b border-zinc-200 dark:border-sidebar-border bg-white dark:bg-sidebar flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pt-0.5">Primary Schema</p>
              <span className="text-[9px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 uppercase">{fields.length} Units</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      isSelected={selectedId === field.id}
                      onClick={() => setSelectedId(field.id)}
                      onDelete={() => removeField(field.id)}
                    />
                  ))}
                </SortableContext>
                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-100 rounded-xl p-4 shadow-2xl transition-all scale-105">
                      <p className="text-[11px] font-black uppercase text-zinc-900 dark:text-zinc-100">{fields.find((f) => f.id === activeId)?.label}</p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
              {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4 opacity-50 border border-zinc-200 dark:border-zinc-700">
                    <Database className="h-6 w-6 text-zinc-400" />
                  </div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-loose">Initialize schema units from the asset inventory.</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Preview */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-background/20 custom-scrollbar">
            <div className="max-w-xl mx-auto">
              <div className="bg-white dark:bg-sidebar rounded-[24px] shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-sidebar-border overflow-hidden">
                <div className="h-2 bg-zinc-900 dark:bg-zinc-100" />
                <div className="p-8 border-b border-zinc-50 dark:border-zinc-800">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{title || "NEW REGISTRY LAYER"}</h2>
                  {description && <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-wide leading-relaxed">{description}</p>}
                </div>
                <div className="p-8 space-y-8">
                  {fields.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                      <LayoutTemplate className="h-10 w-10 text-zinc-100 dark:text-zinc-800 mx-auto" />
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Awaiting Schema Unit Deployment</p>
                    </div>
                  ) : (
                    fields.map((field) => (
                      <div
                        key={field.id}
                        onClick={() => setSelectedId(field.id)}
                        className={cn(
                          "p-4 rounded-2xl cursor-pointer transition-all border-2",
                          selectedId === field.id
                            ? "border-zinc-900/10 dark:border-zinc-100/10 bg-zinc-50/50 dark:bg-zinc-900/40"
                            : "border-transparent hover:border-zinc-100 dark:hover:border-zinc-800/40"
                        )}
                      >
                        <FieldPreview field={field} />
                      </div>
                    ))
                  )}
                  {fields.length > 0 && (
                    <Button className="w-full h-11 rounded-xl mt-4 font-black uppercase text-[11px] tracking-widest bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-xl shadow-zinc-900/10" disabled>Synchronize Object</Button>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-white dark:bg-sidebar rounded-2xl border border-zinc-200 dark:border-sidebar-border p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Registry Narrative</p>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter extended context narrative..."
                    className="h-10 text-xs font-bold border-zinc-100 dark:border-zinc-800"
                  />
                </div>
                {slug && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-all group">
                    <span className="text-[10px] font-black text-zinc-400 flex-1 truncate uppercase tracking-widest">Local Deployment Node: <span className="text-zinc-900 dark:text-zinc-100">/{slug}</span></span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900" onClick={() => window.open(publicUrl, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="w-64 bg-white dark:bg-sidebar border-l border-zinc-200 dark:border-sidebar-border flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-50 dark:border-zinc-800/60 flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pt-0.5">Unit Parameters</p>
          </div>
          {selectedField ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <FieldSettingsPanel field={selectedField} onChange={updateField} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
              <div className="h-10 w-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
                <ChevronRight className="h-5 w-5 text-zinc-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4">Identify a schema unit to modify parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 dark:bg-zinc-950 animate-pulse">Initializing Mapping Engine...</div>}>
      <FormBuilderPageInner />
    </Suspense>
  );
}
