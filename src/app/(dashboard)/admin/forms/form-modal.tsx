/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Plus, Trash2, Settings, LayoutTemplate, Type, FileText, CalendarDays, CheckSquare, List, Link as LinkIcon, Mail, LayoutPanelTop, FileSpreadsheet, AlertCircle } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
    { value: "NUMBER", label: "Number", icon: Type },
    { value: "EMAIL", label: "Email Address", icon: Type },
    { value: "SELECT", label: "Dropdown", icon: List },
    { value: "RADIO", label: "Multiple Choice", icon: CheckSquare },
    { value: "CHECKBOX", label: "Checkboxes", icon: CheckSquare },
    { value: "DATE", label: "Date Picker", icon: CalendarDays },
    { value: "FILE", label: "File Upload", icon: FileText },
    { value: "SIGNATURE", label: "Signature", icon: Type },
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
            title: "",
            description: "",
            slug: "",
            status: "DRAFT",
            fields: [{ id: crypto.randomUUID(), label: "Full Name", type: "TEXT", required: true, optionsString: "" }],
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
                    title: initialData.title,
                    description: initialData.description || "",
                    slug: initialData.slug,
                    status: initialData.status,
                    fields: initialData.fields.map((f: any) => ({
                        id: f.id,
                        label: f.label,
                        type: f.type,
                        required: !!f.required,
                        placeholder: f.placeholder || "",
                        optionsString: f.options ? f.options.join(", ") : "",
                    })),
                    settings: {
                        limit: initialData.settings?.limit || null,
                        expiryDate: initialData.settings?.expiryDate || "",
                        notifyAdmin: !!initialData.settings?.notifyAdmin,
                        isMultipleStep: !!initialData.settings?.isMultipleStep,
                        syncToGoogleSheet: !!initialData.settings?.syncToGoogleSheet,
                    },
                });
            } else {
                reset({
                    title: "", description: "", slug: "", status: "DRAFT",
                    fields: [{ id: crypto.randomUUID(), label: "Full Name", type: "TEXT", required: true, optionsString: "" }],
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
                    id: f.id,
                    label: f.label,
                    type: f.type,
                    required: f.required,
                    placeholder: f.placeholder,
                    options: f.optionsString ? f.optionsString.split(",").map(s => s.trim()).filter(Boolean) : [],
                })),
                settings: {
                    limit: data.settings.limit || null,
                    expiryDate: data.settings.expiryDate || null,
                    notifyAdmin: data.settings.notifyAdmin,
                    isMultipleStep: data.settings.isMultipleStep,
                    syncToGoogleSheet: data.settings.syncToGoogleSheet,
                }
            };
            return isEdit && initialData?.id ? CustomFormService.updateForm(initialData.id, payload) : CustomFormService.createForm(payload);
        },
        onSuccess: () => {
            toast.success(`Form ${isEdit ? "updated" : "created"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["forms"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Something went wrong");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col border-white/20 dark:border-white/10 shadow-2xl bg-slate-50 dark:bg-slate-950 p-0 rounded-[32px]">
                <DialogHeader className="p-6 border-b border-black/5 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shrink-0">
                    <DialogTitle className="text-[22px] font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm"><LayoutTemplate className="h-5 w-5" /></div>
                        {isEdit ? "Update Form Structure" : "Form Builder Studio"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col flex-1 overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="px-6 pt-4 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
                                <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl h-12 mb-4">
                                    <TabsTrigger value="general" className="rounded-lg font-bold text-[13px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">General Details</TabsTrigger>
                                    <TabsTrigger value="builder" className="rounded-lg font-bold text-[13px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Field Builder</TabsTrigger>
                                    <TabsTrigger value="settings" className="rounded-lg font-bold text-[13px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm">Advanced Settings</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50 dark:bg-slate-950/50">
                                <TabsContent value="general" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={control} name="title" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Form Title</FormLabel>
                                                <FormControl><Input placeholder="e.g. Teacher Recruitment" className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20" {...field} /></FormControl>
                                                <FormMessage className="text-[11px]" />
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="slug" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2"><LinkIcon className="h-3 w-3" /> URL Slug</FormLabel>
                                                <FormControl><Input placeholder="e.g. teacher-recruitment" className="h-12 rounded-2xl font-bold bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20" {...field} onChange={(e) => { field.onChange(e); setIsSlugManual(true); }} /></FormControl>
                                                <FormMessage className="text-[11px]" />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={control} name="description" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Description</FormLabel>
                                            <FormControl><Textarea placeholder="Instructions..." className="min-h-[120px] rounded-2xl font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 resize-none" {...field} value={field.value || ""} /></FormControl>
                                            <FormMessage className="text-[11px]" />
                                        </FormItem>
                                    )} />
                                    <FormField control={control} name="status" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Publication Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-12 rounded-2xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20"><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                                                <SelectContent className="rounded-2xl">
                                                    <SelectItem value="DRAFT" className="font-bold">Draft (Hidden)</SelectItem>
                                                    <SelectItem value="PUBLISHED" className="font-bold text-emerald-600 dark:text-emerald-400">Published (Public)</SelectItem>
                                                    <SelectItem value="CLOSED" className="font-bold text-red-600 dark:text-red-400">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-[11px]" />
                                        </FormItem>
                                    )} />
                                </TabsContent>

                                <TabsContent value="builder" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="space-y-5">
                                        {fields.map((item, index) => {
                                            const fieldType = form.watch(`fields.${index}.type`);
                                            const showOptions = ["SELECT", "RADIO", "CHECKBOX"].includes(fieldType);

                                            return (
                                                <div key={item.id} className="relative bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm group">
                                                    <div className="absolute -left-3 -top-3 h-8 w-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center font-black text-[13px] shadow-lg">
                                                        {index + 1}
                                                    </div>
                                                    {fields.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute right-4 top-4 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-2">
                                                        <div className="lg:col-span-5 space-y-3">
                                                            <FormField control={control} name={`fields.${index}.label`} render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[11px] font-black uppercase tracking-wider text-slate-500">Field Label</FormLabel><FormControl><Input placeholder="e.g. Full Name" className="h-10 rounded-xl font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" {...field} /></FormControl></FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="lg:col-span-4 space-y-3">
                                                            <FormField control={control} name={`fields.${index}.type`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[11px] font-black uppercase tracking-wider text-slate-500">Input Type</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-10 rounded-xl font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent className="rounded-xl max-h-[250px]">
                                                                            {FIELD_TYPES.map(ft => (<SelectItem key={ft.value} value={ft.value} className="font-semibold"><div className="flex items-center gap-2"><ft.icon className="h-3.5 w-3.5 opacity-50" /> {ft.label}</div></SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="lg:col-span-3 space-y-3 flex flex-col justify-end pb-2">
                                                            <FormField control={control} name={`fields.${index}.required`} render={({ field }) => (
                                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                                    <FormLabel className="text-[13px] font-bold cursor-pointer">Required</FormLabel>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                        <FormField control={control} name={`fields.${index}.placeholder`} render={({ field }) => (
                                                            <FormItem><FormLabel className="text-[11px] font-black uppercase tracking-wider text-slate-500">Placeholder</FormLabel><FormControl><Input placeholder="Optional" className="h-10 rounded-xl font-medium bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" {...field} value={field.value || ""} /></FormControl></FormItem>
                                                        )} />
                                                        {showOptions && (
                                                            <FormField control={control} name={`fields.${index}.optionsString`} render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[11px] font-black uppercase tracking-wider text-slate-500">Options (Comma separated)</FormLabel><FormControl><Input placeholder="e.g. Option 1, Option 2" className="h-10 rounded-xl font-bold bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50" {...field} value={field.value || ""} /></FormControl></FormItem>
                                                            )} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), label: "New Field", type: "TEXT", required: false, optionsString: "" })} className="w-full h-14 rounded-[20px] border-2 border-dashed border-slate-300 dark:border-slate-700 font-black text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                                        <Plus className="h-5 w-5 mr-2 stroke-[3]" /> Add New Field
                                    </Button>
                                </TabsContent>

                                <TabsContent value="settings" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                                        <div className="flex items-center gap-3 border-b border-black/5 dark:border-white/5 pb-4">
                                            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600"><Settings className="h-5 w-5" /></div>
                                            <h3 className="font-black text-[16px] text-slate-900 dark:text-white">Form Behavior</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <FormField control={control} name="settings.limit" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Max Responses</FormLabel>
                                                    <FormControl><Input type="number" placeholder="Unlimited" className="h-12 rounded-2xl font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} value={field.value || ""} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={control} name="settings.expiryDate" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Auto-Close Date</FormLabel>
                                                    <FormControl><Input type="datetime-local" className="h-12 rounded-2xl font-bold bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" {...field} value={field.value || ""} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="pt-4 border-t border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField control={control} name="settings.notifyAdmin" render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-[14px] font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-blue-500" /> Email Notifications</FormLabel>
                                                    </div>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={control} name="settings.isMultipleStep" render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-[14px] font-bold flex items-center gap-2"><LayoutPanelTop className="h-4 w-4 text-indigo-500" /> Multi-step UI</FormLabel>
                                                    </div>
                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="pt-4 border-t border-black/5 dark:border-white/5">
                                            <FormField control={control} name="settings.syncToGoogleSheet" render={({ field }) => (
                                                <FormItem className={cn("flex flex-row items-center justify-between rounded-2xl border p-5 transition-all", isGoogleConnected ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20" : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950")}>
                                                    <div className="space-y-1">
                                                        <FormLabel className="text-[15px] font-black flex items-center gap-2 text-slate-900 dark:text-white">
                                                            <FileSpreadsheet className={cn("h-5 w-5", isGoogleConnected ? "text-emerald-500" : "text-slate-400")} />
                                                            Sync to Google Sheets
                                                        </FormLabel>
                                                        <p className="text-[12px] text-slate-500 font-medium max-w-[300px]">
                                                            {isGoogleConnected ? "Responses will be automatically added to a Google Sheet." : "Please connect your Google Account from the main dashboard first."}
                                                        </p>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!isGoogleConnected} className={isGoogleConnected ? "data-[state=checked]:bg-emerald-500" : ""} />
                                                    </FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>

                            <div className="p-6 shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-black/5 dark:border-white/5 flex justify-end gap-4 rounded-b-[32px]">
                                <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending} className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white">Cancel</Button>
                                <Button type="submit" disabled={mutation.isPending} className="h-12 px-10 rounded-2xl font-black bg-primary text-white dark:text-slate-900 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                    {mutation.isPending ? "Saving Builder..." : "Save Custom Form"}
                                </Button>
                            </div>
                        </Tabs>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}