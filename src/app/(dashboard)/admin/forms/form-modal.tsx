/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Plus, Trash2, Settings, LayoutTemplate, Type, FileText, CalendarDays, CheckSquare, List, Link as LinkIcon, Mail, LayoutPanelTop, FileSpreadsheet } from "lucide-react";

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
            title: "", description: "", slug: "", status: "DRAFT",
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
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-0 rounded-2xl shadow-xl">
                <DialogHeader className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                    <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <LayoutTemplate className="h-5 w-5 text-zinc-500" />
                        {isEdit ? "Update Form" : "Create New Form"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col flex-1 overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                                <TabsList className="bg-transparent gap-4 h-10 w-full justify-start">
                                    <TabsTrigger value="general" className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-lg px-4 text-xs font-semibold">General</TabsTrigger>
                                    <TabsTrigger value="builder" className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-lg px-4 text-xs font-semibold">Fields</TabsTrigger>
                                    <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800 rounded-lg px-4 text-xs font-semibold">Settings</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-zinc-950">
                                <TabsContent value="general" className="m-0 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormField control={control} name="title" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Form Title</FormLabel>
                                                <FormControl><Input placeholder="e.g. Contact Us" className="h-10 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...field} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="slug" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"><LinkIcon className="h-3 w-3" /> URL Slug</FormLabel>
                                                <FormControl><Input placeholder="e.g. contact-us" className="h-10 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono" {...field} onChange={(e) => { field.onChange(e); setIsSlugManual(true); }} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={control} name="description" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Description</FormLabel>
                                            <FormControl><Textarea placeholder="Optional instructions..." className="min-h-[100px] rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 resize-none" {...field} value={field.value || ""} /></FormControl>
                                        </FormItem>
                                    )} />
                                    <FormField control={control} name="status" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-10 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                                    <SelectItem value="PUBLISHED">Published</SelectItem>
                                                    <SelectItem value="CLOSED">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                </TabsContent>

                                <TabsContent value="builder" className="m-0 space-y-6">
                                    <div className="space-y-4">
                                        {fields.map((item, index) => {
                                            const fieldType = form.watch(`fields.${index}.type`);
                                            const showOptions = ["SELECT", "RADIO", "CHECKBOX"].includes(fieldType);

                                            return (
                                                <div key={item.id} className="relative bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 group">
                                                    <div className="absolute -left-2 -top-2 h-6 w-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md flex items-center justify-center font-bold text-xs shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                    {fields.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="absolute right-3 top-3 h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                                                        <div className="md:col-span-5 space-y-2">
                                                            <FormField control={control} name={`fields.${index}.label`} render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Label</FormLabel><FormControl><Input className="h-9 text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" {...field} /></FormControl></FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="md:col-span-4 space-y-2">
                                                            <FormField control={control} name={`fields.${index}.type`} render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Type</FormLabel>
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl><SelectTrigger className="h-9 text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"><SelectValue /></SelectTrigger></FormControl>
                                                                        <SelectContent>
                                                                            {FIELD_TYPES.map(ft => (<SelectItem key={ft.value} value={ft.value}><div className="flex items-center gap-2 text-xs"><ft.icon className="h-3.5 w-3.5 text-zinc-500" /> {ft.label}</div></SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                        <div className="md:col-span-3 flex items-end pb-2">
                                                            <FormField control={control} name={`fields.${index}.required`} render={({ field }) => (
                                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                                                    <FormLabel className="text-xs font-medium cursor-pointer">Required</FormLabel>
                                                                </FormItem>
                                                            )} />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                                        <FormField control={control} name={`fields.${index}.placeholder`} render={({ field }) => (
                                                            <FormItem><FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Placeholder</FormLabel><FormControl><Input className="h-9 text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" {...field} value={field.value || ""} /></FormControl></FormItem>
                                                        )} />
                                                        {showOptions && (
                                                            <FormField control={control} name={`fields.${index}.optionsString`} render={({ field }) => (
                                                                <FormItem><FormLabel className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Options (Comma separated)</FormLabel><FormControl><Input className="h-9 text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800" {...field} value={field.value || ""} /></FormControl></FormItem>
                                                            )} />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <Button type="button" variant="outline" onClick={() => append({ id: crypto.randomUUID(), label: "New Field", type: "TEXT", required: false, optionsString: "" })} className="w-full h-10 rounded-lg border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                        <Plus className="h-4 w-4 mr-2" /> Add Field
                                    </Button>
                                </TabsContent>

                                <TabsContent value="settings" className="m-0 space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormField control={control} name="settings.limit" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Max Responses</FormLabel>
                                                <FormControl><Input type="number" placeholder="Unlimited" className="h-10 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...field} onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} value={field.value || ""} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="settings.expiryDate" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Expiry Date</FormLabel>
                                                <FormControl><Input type="datetime-local" className="h-10 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...field} value={field.value || ""} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <FormField control={control} name="settings.notifyAdmin" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4 text-zinc-500" /> Notifications</FormLabel>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                        <FormField control={control} name="settings.isMultipleStep" render={({ field }) => (
                                            <FormItem className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-semibold flex items-center gap-2"><LayoutPanelTop className="h-4 w-4 text-zinc-500" /> Multi-step UI</FormLabel>
                                                </div>
                                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            </FormItem>
                                        )} />
                                    </div>

                                    <FormField control={control} name="settings.syncToGoogleSheet" render={({ field }) => (
                                        <FormItem className={cn("flex flex-row items-center justify-between p-4 rounded-xl border transition-colors", isGoogleConnected ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20" : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50")}>
                                            <div className="space-y-1">
                                                <FormLabel className="text-sm font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                                    <FileSpreadsheet className={cn("h-4 w-4", isGoogleConnected ? "text-emerald-500" : "text-zinc-400")} />
                                                    Google Sheets Sync
                                                </FormLabel>
                                                <p className="text-xs text-zinc-500 max-w-[300px]">
                                                    {isGoogleConnected ? "Automatically push responses to Google Sheets." : "Connect Google Account from dashboard first."}
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!isGoogleConnected} className={isGoogleConnected ? "data-[state=checked]:bg-emerald-500" : ""} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </TabsContent>
                            </div>

                            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                                <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending} className="h-9 px-5 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800">Cancel</Button>
                                <Button type="submit" disabled={mutation.isPending} className="h-9 px-6 text-xs font-semibold rounded-lg shadow-sm">
                                    {mutation.isPending ? "Saving..." : "Save Form"}
                                </Button>
                            </div>
                        </Tabs>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}