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
  ChevronRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CustomFormService } from "@/services/form.service";
import { SiteConfigService } from "@/services/site-config.service";

// ─── Field Type Definitions ───────────────────────────────────────────────────
const FIELD_PALETTE = [
  { group: "Basic",    items: [
    { type: "TEXT",      label: "Short Text",      icon: Type,        description: "Single line text" },
    { type: "TEXTAREA",  label: "Long Text",        icon: FileText,    description: "Multi-line paragraph" },
    { type: "NUMBER",    label: "Number",           icon: Hash,        description: "Numeric input" },
    { type: "EMAIL",     label: "Email",            icon: AtSign,      description: "Email address" },
    { type: "PHONE",     label: "Phone",            icon: Phone,       description: "Phone number" },
  ]},
  { group: "Choice",   items: [
    { type: "SELECT",    label: "Dropdown",         icon: ChevronDown, description: "Pick one from a list" },
    { type: "RADIO",     label: "Multiple Choice",  icon: CircleDot,   description: "Radio buttons" },
    { type: "CHECKBOX",  label: "Checkboxes",       icon: CheckSquare, description: "Tick all that apply" },
    { type: "RATING",    label: "Rating",           icon: Star,        description: "1–5 star rating" },
  ]},
  { group: "Advanced", items: [
    { type: "DATE",      label: "Date Picker",      icon: Calendar,    description: "Date / datetime" },
    { type: "FILE",      label: "File Upload",      icon: Upload,      description: "Attach a file" },
  ]},
  { group: "Layout",   items: [
    { type: "DIVIDER",   label: "Divider",          icon: Minus,       description: "Horizontal rule" },
    { type: "HEADING",   label: "Heading",          icon: Heading1,    description: "Section heading" },
  ]},
];

const ALL_TYPES = FIELD_PALETTE.flatMap((g) => g.items);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const newField = (type: string) => ({
  id: crypto.randomUUID(),
  type,
  label: ALL_TYPES.find((t) => t.type === type)?.label || "New Field",
  placeholder: "",
  required: false,
  options: [] as string[],
});

// ─── Sortable Field Row ────────────────────────────────────────────────────────
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
          ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/30"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab text-zinc-300 hover:text-zinc-500 focus:outline-none shrink-0">
        <GripVertical className="h-4 w-4" />
      </button>
      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", isSelected ? "bg-primary/15" : "bg-zinc-100 dark:bg-zinc-900")}>
        <Icon className={cn("h-3.5 w-3.5", isSelected ? "text-primary" : "text-zinc-500")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{field.label || "Untitled"}</p>
        <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{meta?.label || field.type}</p>
      </div>
      {field.required && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">req</span>}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-rose-500 ml-1 shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Field Preview ─────────────────────────────────────────────────────────────
function FieldPreview({ field }: { field: any }) {
  if (field.type === "DIVIDER") return <hr className="my-2 border-zinc-200 dark:border-zinc-700" />;
  if (field.type === "HEADING") return <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mt-2">{field.label}</h3>;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
        {field.label}
        {field.required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {(field.type === "TEXT" || field.type === "EMAIL" || field.type === "NUMBER" || field.type === "PHONE") && (
        <Input disabled placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`} className="h-9 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700" />
      )}
      {field.type === "TEXTAREA" && (
        <Textarea disabled placeholder={field.placeholder || "Type your answer..."} className="min-h-[80px] text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 resize-none" />
      )}
      {field.type === "SELECT" && (
        <Select disabled><SelectTrigger className="h-9 text-sm bg-zinc-50 dark:bg-zinc-900"><SelectValue placeholder="Select an option" /></SelectTrigger></Select>
      )}
      {field.type === "RADIO" && (
        <div className="space-y-1.5">
          {(field.options?.length ? field.options : ["Option 1", "Option 2"]).map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <span className="h-4 w-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600 flex-shrink-0" /> {opt}
            </label>
          ))}
        </div>
      )}
      {field.type === "CHECKBOX" && (
        <div className="space-y-1.5">
          {(field.options?.length ? field.options : ["Option 1", "Option 2"]).map((opt: string, i: number) => (
            <label key={i} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <span className="h-4 w-4 rounded border-2 border-zinc-300 dark:border-zinc-600 flex-shrink-0" /> {opt}
            </label>
          ))}
        </div>
      )}
      {field.type === "DATE" && <Input disabled type="date" className="h-9 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700" />}
      {field.type === "RATING" && (
        <div className="flex gap-1.5">{[1,2,3,4,5].map((n) => <Star key={n} className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />)}</div>
      )}
      {field.type === "FILE" && (
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-4 text-center text-xs text-zinc-400">Drop a file or click to upload</div>
      )}
    </div>
  );
}

// ─── Field Settings Panel ─────────────────────────────────────────────────────
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
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Field Label</label>
        <Input value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} className="h-9 text-sm" />
      </div>
      {!["DIVIDER", "HEADING", "RATING"].includes(field.type) && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Placeholder Text</label>
          <Input value={field.placeholder || ""} onChange={(e) => onChange({ ...field, placeholder: e.target.value })} className="h-9 text-sm" />
        </div>
      )}
      {hasOptions && (
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Options (one per line)</label>
          <Textarea value={optionsText} onChange={(e) => handleOptionsChange(e.target.value)} className="min-h-[120px] text-sm font-mono resize-none" />
        </div>
      )}
      {!["DIVIDER", "HEADING"].includes(field.type) && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Required</p>
            <p className="text-[10px] text-zinc-400">Respondents must fill this.</p>
          </div>
          <Switch checked={field.required} onCheckedChange={(v) => onChange({ ...field, required: v })} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function FormBuilderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "CLOSED">("DRAFT");
  const [fields, setFields] = useState<any[]>([{ ...newField("TEXT"), label: "Full Name", required: true }]);
  const [selectedId, setSelectedId] = useState<string | null>(fields[0]?.id || null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Slug is always auto-derived from title — not editable
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled-form";

  // load existing form for edit
  useQuery({
    queryKey: ["form-for-builder", editId],
    queryFn: () => CustomFormService.getFormBySlug(editId!),
    enabled: !!editId,
  });

  // Fetch all forms to find the one by id
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
        settings: {
          notifyAdmin: false,
          isMultipleStep: false,
          syncToGoogleSheet: false,
        },
      };
      return editId ? CustomFormService.updateForm(editId, payload) : CustomFormService.createForm(payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Form updated!" : "Form created!");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      router.push("/admin/forms");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to save form.");
    },
  });

  // DnD
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
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/forms")} className="h-8 w-8 rounded-lg">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Form"
            className="text-sm font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-none outline-none w-full placeholder:text-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status selector */}
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="h-8 w-36 rounded-lg text-xs font-semibold border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <StatusIcon className={cn("h-3 w-3", status === "PUBLISHED" ? "text-emerald-500" : status === "DRAFT" ? "text-amber-500" : "text-zinc-400")} />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
              <SelectItem value="PUBLISHED" className="text-xs">Published</SelectItem>
              <SelectItem value="CLOSED" className="text-xs">Closed</SelectItem>
            </SelectContent>
          </Select>

          {slug && status === "PUBLISHED" && (
            <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg text-xs gap-1.5 border-zinc-200" onClick={() => window.open(publicUrl, "_blank")}>
              <Eye className="h-3 w-3" /> Preview
            </Button>
          )}

          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="h-8 px-4 rounded-lg text-xs font-bold gap-1.5 shadow-md">
            {saveMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            {editId ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {/* ── 3-Panel Layout ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Field Palette */}
        <div className="w-56 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col overflow-y-auto shrink-0">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/60">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Field Types</p>
          </div>
          <div className="p-2 space-y-3">
            {FIELD_PALETTE.map((group) => (
              <div key={group.group}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 px-2 mb-1">{group.group}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.type}
                        onClick={() => addField(item.type)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
                      >
                        <div className="h-6 w-6 rounded-md bg-zinc-100 dark:bg-zinc-900 group-hover:bg-primary/10 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="h-3 w-3 text-zinc-500 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">{item.label}</p>
                        </div>
                        <Plus className="h-3 w-3 text-zinc-300 group-hover:text-primary ml-auto shrink-0 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Field List + Form Preview */}
        <div className="flex flex-1 overflow-hidden">

          {/* Field List / Builder Canvas */}
          <div className="w-72 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Fields ({fields.length})</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                    <div className="bg-white dark:bg-zinc-950 border border-primary rounded-xl p-3 shadow-2xl opacity-90">
                      <p className="text-xs font-semibold text-zinc-700">{fields.find((f) => f.id === activeId)?.label}</p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
              {fields.length === 0 && (
                <div className="text-center py-12 text-zinc-400">
                  <Plus className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Click a field type to add it</p>
                </div>
              )}
            </div>
          </div>

          {/* Live Form Preview */}
          <div className="flex-1 overflow-y-auto p-6 bg-zinc-100 dark:bg-zinc-900/30">
            <div className="max-w-lg mx-auto">
              <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title || "Untitled Form"}</h2>
                  {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
                </div>
                <div className="p-6 space-y-5">
                  {fields.length === 0 ? (
                    <p className="text-sm text-zinc-400 text-center py-8">Add fields from the left panel to see a preview.</p>
                  ) : (
                    fields.map((field) => (
                      <div
                        key={field.id}
                        onClick={() => setSelectedId(field.id)}
                        className={cn(
                          "p-3 rounded-xl cursor-pointer transition-all border-2",
                          selectedId === field.id
                            ? "border-primary/40 bg-primary/5"
                            : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                        )}
                      >
                        <FieldPreview field={field} />
                      </div>
                    ))
                  )}
                  {fields.length > 0 && (
                    <Button className="w-full rounded-xl mt-2" disabled>Submit</Button>
                  )}
                </div>
              </div>

              {/* Description + URL display */}
              <div className="mt-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Form description (optional)..."
                  className="h-8 text-sm"
                />
                {slug && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 flex-1 truncate">/{slug}</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 shrink-0" onClick={() => window.open(publicUrl, "_blank")}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Field Settings */}
        <div className="w-64 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/60 flex items-center gap-2">
            <Settings className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Field Settings</p>
          </div>
          {selectedField ? (
            <div className="flex-1 overflow-y-auto">
              <FieldSettingsPanel field={selectedField} onChange={updateField} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ChevronRight className="h-8 w-8 text-zinc-200 dark:text-zinc-800 mb-3" />
              <p className="text-xs text-zinc-400">Click a field to edit its settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-zinc-400">Loading builder...</div>}>
      <FormBuilderPageInner />
    </Suspense>
  );
}
