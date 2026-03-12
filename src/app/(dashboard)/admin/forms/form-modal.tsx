/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Plus, Trash2, Type, FileText, CalendarDays, List, Link as LinkIcon, Mail, LayoutPanelTop, FileSpreadsheet, Database } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { CustomFormService } from "@/services/form.service";
import { customFormSchema, CustomFormValues } from "./schema";
import { cn } from "@/lib/utils";

interface FormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any | null;
}

const FIELD_TYPES = [
    { value: "TEXT", label: "Short Text", icon: Type },
    { value: "TEXTAREA", label: "Long Text", icon: FileText },
    { value: "NUMBER", label: "Integer Unit", icon: Type },
    { value: "EMAIL", label: "Electronic Mail", icon: Type },
    { value: "SELECT", label: "Dropdown List", icon: List },
    { value: "RADIO", label: "Radio Select", icon: List },
    { value: "CHECKBOX", label: "Checkboxes", icon: List },
    { value: "DATE", label: "Chronology", icon: CalendarDays },
    { value: "FILE", label: "Object Upload", icon: FileText },
] as const;

export function FormModal({ isOpen, onClose, initialData }: FormModalProps) {
    const queryClient = useQueryClient();
    const isEdit = !!initialData;
    const [activeTab, setActiveTab] = useState("general");
    const [isSlugManual, setIsSlugManual] = useState(false);

    const { data: googleStatus } = useQuery({
        queryKey: ["googleStatus"],
        queryFn: () => CustomFormService.checkGoogleStatus(),
        enabled: isOpen,
    });

    const isGoogleConnected = googleStatus?.data?.isConnected || false;

    const form = useForm<CustomFormValues>({
        resolver: zodResolver(customFormSchema),
        defaultValues: {
            title: "", description: "", slug: "", status: "DRAFT",
            fields: [{ id: crypto.randomUUID(), label: "Identity Label", type: "TEXT", required: true, optionsString: "" }],
            settings: { limit: null, expiryDate: "", notifyAdmin: false, isMultipleStep: false, syncToGoogleSheet: false },
        },
    });

    const { control, reset, setValue, handleSubmit } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "fields" });
    const titleValue = useWatch({ control, name: "title" });

    useEffect(() => {
        if (!isEdit && !isSlugManual && titleValue) {
            const generatedSlug = titleValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setValue("slug", generatedSlug, { shouldValidate: true });
        }
    }, [titleValue, isEdit, isSlugManual, setValue]);

    useEffect(() => {
        if (isOpen) {
            setActiveTab("general");
            setIsSlugManual(false);
            if (initialData) {
                reset({
                    title: initialData.title, description: initialData.description || "", slug: initialData.slug, status: initialData.status,
                    fields: initialData.fields.map((f: any) => ({
                        id: f.id, label: f.label, type: f.type, required: !!f.required, placeholder: f.placeholder || "", optionsString: f.options ? f.options.join(", ") : "",
                    })),
                    settings: {
                        limit: initialData.settings?.limit || null, expiryDate: initialData.settings?.expiryDate || "",
                        notifyAdmin: !!initialData.settings?.notifyAdmin, isMultipleStep: !!initialData.settings?.isMultipleStep, syncToGoogleSheet: !!initialData.settings?.syncToGoogleSheet,
                    },
                });
            } else {
                reset({
                    title: "", description: "", slug: "", status: "DRAFT",
                    fields: [{ id: crypto.randomUUID(), label: "Identity Label", type: "TEXT", required: true, optionsString: "" }],
                    settings: { limit: null, expiryDate: "", notifyAdmin: false, isMultipleStep: false, syncToGoogleSheet: false },
                });
            }
        }
    }, [initialData, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: CustomFormValues) => {
            const payload = {
                ...data,
                fields: data.fields.map(f => ({
                    id: f.id, label: f.label, type: f.type, required: f.required, placeholder: f.placeholder,
                    options: f.optionsString ? f.optionsString.split(",").map(s => s.trim()).filter(Boolean) : [],
                })),
                settings: {
                    limit: data.settings.limit || null, expiryDate: data.settings.expiryDate || null,
                    notifyAdmin: data.settings.notifyAdmin, isMultipleStep: data.settings.isMultipleStep, syncToGoogleSheet: data.settings.syncToGoogleSheet,
                }
            };
            return isEdit && initialData?.id ? CustomFormService.updateForm(initialData.id, payload) : CustomFormService.createForm(payload);
        },
        onSuccess: () => {
            toast.success(`Registry ${isEdit ? "updated" : "initialized"} successfully.`);
            queryClient.invalidateQueries({ queryKey: ["forms"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Registry synchronization failed.");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-sidebar border-zinc-200 dark:border-sidebar-border p-0 rounded-2xl shadow-2xl">
                <DialogHeader className="p-6 border-b border-zinc-200 dark:border-sidebar-border bg-zinc-50/50 dark:bg-sidebar/50 shrink-0">
                    <DialogTitle className="text-[14px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <Database className="h-5 w-5 text-zinc-400" />
                        {isEdit ? "Configuration Matrix Update" : "Initialize New Registry Layer"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col flex-1 overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="px-6 pt-3 border-b border-zinc-200 dark:border-sidebar-border shrink-0 bg-white dark:bg-sidebar">
                                <TabsList className="bg-transparent gap-6 h-10 w-full justify-start">
                                    <TabsTrigger value="general" className="data-[state=active]:bg-zinc-50 dark:data-[state=active]:bg-zinc-900 data-[state=active]:border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-800 rounded-lg px-5 text-[10px] font-black uppercase tracking-widest transition-all">Identity</TabsTrigger>
                                    <TabsTrigger value="builder" className="data-[state=active]:bg-zinc-50 dark:data-[state=active]:bg-zinc-900 data-[state=active]:border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-800 rounded-lg px-5 text-[10px] font-black uppercase tracking-widest transition-all">Core Schema</TabsTrigger>
                                    <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-50 dark:data-[state=active]:bg-zinc-900 data-[state=active]:border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-800 rounded-lg px-5 text-[10px] font-black uppercase tracking-widest transition-all">System Parms</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white dark:bg-zinc-950">
                                <TabsContent value="general" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={control} name="title" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Registry Meta-Title</FormLabel>
                                                <FormControl><Input placeholder="e.g. STUDENT_INTAKE_SURVEY" className="h-11 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="slug" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 font-bold"><LinkIcon className="h-3 w-3" /> Technical Node (Slug)</FormLabel>
                                                <FormControl><Input placeholder="e.g. student-intake" className="h-11 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-mono" {...field} onChange={(e) => { field.onChange(e); setIsSlugManual(true); }} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={control} name="description" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Narrative Context</FormLabel>
                                            <FormControl><Textarea placeholder="Extended system instructions..." className="min-h-[120px] rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 resize-none leading-relaxed" {...field} value={field.value || ""} /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={control} name="status" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Layer Deployment Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-11 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 p-1">
                                                    <SelectItem value="DRAFT" className="text-[10px] font-black uppercase tracking-widest py-2">Restricted Draft</SelectItem>
                                                    <SelectItem value="PUBLISHED" className="text-[10px] font-black uppercase tracking-widest py-2">Public Deployment</SelectItem>
                                                    <SelectItem value="CLOSED" className="text-[10px] font-black uppercase tracking-widest py-2">Suspended / Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                </TabsContent>

                                <TabsContent value="builder" className="m-0 space-y-6">
                                    <div className="space-y-5">
                                        {fields.map((item, index) => {
                                            const fieldType = form.watch(`fields.${index}.type`);
                                            const showOptions = ["SELECT", "RADIO", "CHECKBOX"].includes(fieldType);

                                            return (
                                                <div key={item.id} className="relative bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 group transition-all">
                                                    <div className="absolute -left-2 -top-2 h-7 w-7 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg flex items-center justify-center font-black text-[10px] shadow-lg">
                                                        {index + 1}
                                                    </div>
                                                    {fields.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute right-3 top-3 h-8 w-8 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-2">
                                                        <div className="md:col-span-5 space-y-2">
                                                            <FormField control={control} name={`fields.${index}.label`} render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Unit ID Label</FormLabel><FormControl><Input className="h-10 text-xs font-bold bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" {...field} /></FormControl></FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="md:col-span-4 space-y-2">
                                                            <FormField control={control} name={`fields.${index}.type`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Primitive Type</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-10 text-xs font-bold bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800 p-1">
                                                                            {FIELD_TYPES.map(ft => (<SelectItem key={ft.value} value={ft.value} className="text-[10px] font-black uppercase tracking-widest py-2"><div className="flex items-center gap-2"><ft.icon className="h-3.5 w-3.5 text-zinc-400" /> {ft.label}</div></SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="md:col-span-3 flex items-end pb-1.5 pl-2">
                                                            <FormField control={control} name={`fields.${index}.required`} render={({ field }) => (
                                                                <FormItem className="flex items-center space-x-3 space-y-0 bg-white dark:bg-zinc-950/40 px-3 py-2 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
                                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer">Strict</FormLabel>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                                                        <FormField control={control} name={`fields.${index}.placeholder`} render={({ field }) => (
                                                            <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Prompt / Hint</FormLabel><FormControl><Input className="h-10 text-xs font-bold bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" {...field} value={field.value || ""} /></FormControl></FormItem>
                                                        )} />
                                                        {showOptions && (
                                                            <FormField control={control} name={`fields.${index}.optionsString`} render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Entry Matrix (Separator: COMMA)</FormLabel><FormControl><Input className="h-10 text-xs font-bold bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 font-mono" {...field} value={field.value || ""} /></FormControl></FormItem>
                                                            )} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), label: "NEW_UNIT", type: "TEXT", required: false, optionsString: "" })} className="w-full h-11 rounded-xl border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                                        <Plus className="h-4 w-4 mr-2" /> Append Unit
                                    </Button>
                                </TabsContent>

                                <TabsContent value="settings" className="m-0 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={control} name="settings.limit" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Capture Threshold</FormLabel>
                                                <FormControl><Input type="number" placeholder="INF" className="h-11 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} value={field.value || ""} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="settings.expiryDate" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Registry Lifespan (Expiry)</FormLabel>
                                                <FormControl><Input type="datetime-local" className="h-11 rounded-xl text-xs font-bold bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800" {...field} value={field.value || ""} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={control} name="settings.notifyAdmin" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 flex items-center gap-2 font-bold"><Mail className="h-4 w-4 text-zinc-400" /> Intake Alerts</FormLabel>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="settings.isMultipleStep" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/20">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-[11px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 flex items-center gap-2 font-bold"><LayoutPanelTop className="h-4 w-4 text-zinc-400" /> Paged Intake</FormLabel>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <FormField control={control} name="settings.syncToGoogleSheet" render={({ field }) => (
                                        <FormItem className={cn("flex flex-row items-center justify-between p-5 rounded-2xl border transition-all", isGoogleConnected ? "border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/20")}>
                                            <div className="space-y-1">
                                                <FormLabel className={cn("text-[11px] font-black uppercase tracking-widest flex items-center gap-2", isGoogleConnected ? "text-inherit" : "text-zinc-700 dark:text-zinc-300")}>
                                                    <FileSpreadsheet className={cn("h-4 w-4", isGoogleConnected ? "text-inherit" : "text-zinc-400")} />
                                                    External Mapping (Google Sheets)
                                                </FormLabel>
                                                <p className={cn("text-[10px] font-bold uppercase tracking-tight max-w-[400px]", isGoogleConnected ? "opacity-60" : "text-zinc-500")}>
                                                    {isGoogleConnected ? "Automatic object synchronization protocol active." : "Requires established Google Cloud authentication."}
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!isGoogleConnected} className={isGoogleConnected ? "data-[state=checked]:bg-white dark:data-[state=checked]:bg-zinc-900" : ""} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </TabsContent>
                            </div>

                            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                                <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending} className="h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">Cancel</Button>
                                <Button type="submit" disabled={mutation.isPending} className="h-10 px-8 text-[10px] font-black uppercase tracking-widest rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all shadow-lg shadow-zinc-900/10">
                                    {mutation.isPending ? "Synchronizing..." : "Initialize Registry"}
                                </Button>
                            </div>
                        </Tabs>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}