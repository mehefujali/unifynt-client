/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    BellRing,
    Send,
    Target,
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Megaphone,
    Check,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const notificationSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    message: z.string().min(10, "Message must be at least 10 characters").max(1000),
    type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR", "SYSTEM"]),
    targetType: z.enum(["ALL_USERS", "ALL_SCHOOLS", "SPECIFIC_SCHOOLS", "SPECIFIC_ROLES", "SPECIFIC_USERS"]),
    targetRoles: z.array(z.string()).optional(),
    targetSchoolIds: z.array(z.string()).optional(),
    targetUserIds: z.array(z.string()).optional(),
    actionUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    image: z.any().optional()
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function SuperAdminNotificationsPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Helper arrays for multi-select mimicking since shadcn lacks a native multi-select
    const [selectedSchools, setSelectedSchools] = useState<{ id: string, name: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    // School Pagination & Search
    const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
    const [schoolPage, setSchoolPage] = useState(1);
    const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);

    const form = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationSchema),
        defaultValues: {
            title: "",
            message: "",
            type: "INFO" as const,
            targetType: "ALL_USERS" as const,
            actionUrl: "",
        },
    });

    const { watch } = form;
    const currentTargetType = watch("targetType");

    // Fetch schools for the school selector (with pagination and search)
    const { data: schoolsDataResponse, isLoading: isLoadingSchools } = useQuery({
        queryKey: ["schools-list", schoolSearchQuery, schoolPage],
        queryFn: async () => {
            const res = await api.get("/schools", {
                params: {
                    searchTerm: schoolSearchQuery,
                    page: schoolPage,
                    limit: 5,
                }
            });
            return res.data;
        },
    });

    const schoolsData = schoolsDataResponse?.data || [];
    const schoolsMeta = schoolsDataResponse?.meta || { page: 1, totalPage: 1 };

    const createNotificationMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const res = await api.post("/notifications", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Notification broadcasted successfully!");
            form.reset();
            setImageFile(null);
            setImagePreview(null);
            setSelectedSchools([]);
            setSelectedRoles([]);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to push notification");
        }
    });

    const onSubmit = (values: NotificationFormValues) => {
        const formData = new FormData();

        // Core details
        formData.append("title", values.title);
        formData.append("message", values.message);
        formData.append("type", values.type);
        formData.append("targetType", values.targetType);
        if (values.actionUrl) formData.append("actionUrl", values.actionUrl);

        // Arrays need JSON stringification or multiple appends. The backend expects JSON string or arrays
        if (currentTargetType === "SPECIFIC_SCHOOLS" && selectedSchools.length > 0) {
            selectedSchools.forEach(school => formData.append("targetSchoolIds[]", school.id));
        }

        if (currentTargetType === "SPECIFIC_ROLES" && selectedRoles.length > 0) {
            selectedRoles.forEach(role => formData.append("targetRoles[]", role));
        }

        if (imageFile) {
            formData.append("file", imageFile);
        }

        createNotificationMutation.mutate(formData);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const rolesList = [
        "SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT", "STAFF"
    ];

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 relative min-h-screen">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 -z-10 w-full h-[500px] bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
                        <BellRing className="h-6 w-6" />
                    </div>
                    Broadcast Hub
                </h2>
                <p className="text-muted-foreground font-medium">
                    Create and dispatch real-time notifications across the entire Unifynt platform.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Form Container */}
                <div className="lg:col-span-2">
                    <Card className="border-0 shadow-2xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 rounded-3xl overflow-hidden">
                        <div className="h-2 w-full bg-gradient-to-r from-primary via-primary/50 to-primary" />

                        <CardHeader className="md:px-8 mt-2">
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Notification Composer
                            </CardTitle>
                            <CardDescription>Target specific crowds or blast a global announcement.</CardDescription>
                        </CardHeader>

                        <CardContent className="md:px-8 pb-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                    {/* Row 1: Title & Type */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">Notification Title *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g. System Maintenance Scheduled" {...field} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-primary/30" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">Priority Tier *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-primary/30">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl shadow-xl">
                                                            <SelectItem value="INFO">Information</SelectItem>
                                                            <SelectItem value="SUCCESS">Success / Achievement</SelectItem>
                                                            <SelectItem value="WARNING">Warning</SelectItem>
                                                            <SelectItem value="ERROR">Critical Error</SelectItem>
                                                            <SelectItem value="SYSTEM">System Broadcast</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Row 2: Message Content */}
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-zinc-700 dark:text-zinc-300">Expanded Message *</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Type the full notification body here..."
                                                        {...field}
                                                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl min-h-[120px] resize-y focus-visible:ring-primary/30"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Row 3: Audience Selector */}
                                    <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            <h3 className="font-bold text-sm uppercase tracking-wider text-primary">Target Audience</h3>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="targetType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={(val) => {
                                                        field.onChange(val);
                                                        setSelectedSchools([]);
                                                        setSelectedRoles([]);
                                                    }} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white dark:bg-zinc-950 border-primary/20 focus:ring-primary/30 rounded-xl font-medium">
                                                                <SelectValue placeholder="Who should receive this?" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl">
                                                            <SelectItem value="ALL_USERS">Global: Everyone</SelectItem>
                                                            <SelectItem value="ALL_SCHOOLS">All Schools (Admins)</SelectItem>
                                                            <SelectItem value="SPECIFIC_SCHOOLS">Select Specific Schools</SelectItem>
                                                            <SelectItem value="SPECIFIC_ROLES">Select Specific Roles</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>Choose exactly who gets pinged by this notification.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Dynamic Selectors Based on Target Type */}
                                        {currentTargetType === "SPECIFIC_SCHOOLS" && (
                                            <div className="space-y-3 pt-2">
                                                <Label className="text-zinc-700 dark:text-zinc-300 font-bold">Select Schools</Label>
                                                <div className="flex flex-col gap-2">

                                                    <Popover open={isSchoolDropdownOpen} onOpenChange={setIsSchoolDropdownOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={isSchoolDropdownOpen}
                                                                className="w-full justify-between bg-white dark:bg-zinc-950 rounded-xl border-zinc-200 dark:border-zinc-800 font-normal shadow-sm h-11"
                                                            >
                                                                <span className="text-zinc-500">Search and select a school...</span>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[400px] p-0 rounded-2xl shadow-2xl border-zinc-200 dark:border-zinc-800 overflow-hidden" align="start">
                                                            <Command shouldFilter={false}>
                                                                <CommandInput
                                                                    placeholder="Search schools..."
                                                                    value={schoolSearchQuery}
                                                                    onValueChange={(val) => {
                                                                        setSchoolSearchQuery(val);
                                                                        setSchoolPage(1);
                                                                    }}
                                                                    className="h-12"
                                                                />
                                                                <CommandList>
                                                                    <CommandEmpty className="py-6 text-center text-sm text-zinc-500">
                                                                        {isLoadingSchools ? "Loading schools..." : "No schools found."}
                                                                    </CommandEmpty>
                                                                    {!isLoadingSchools && schoolsData.length > 0 && (
                                                                        <CommandGroup className="p-2">
                                                                            {schoolsData.map((school: any) => {
                                                                                const isSelected = selectedSchools.some(s => s.id === school.id);
                                                                                return (
                                                                                    <CommandItem
                                                                                        key={school.id}
                                                                                        value={school.id}
                                                                                        onSelect={() => {
                                                                                            if (isSelected) {
                                                                                                setSelectedSchools(selectedSchools.filter(s => s.id !== school.id));
                                                                                            } else {
                                                                                                setSelectedSchools([...selectedSchools, { id: school.id, name: school.name }]);
                                                                                            }
                                                                                        }}
                                                                                        className="rounded-xl my-1 cursor-pointer aria-selected:bg-primary/5 aria-selected:text-primary transition-colors"
                                                                                    >
                                                                                        <Check
                                                                                            className={`mr-3 h-4 w-4 transition-all ${isSelected ? "opacity-100 text-primary scale-100" : "opacity-0 scale-50"}`}
                                                                                        />
                                                                                        <div className="flex flex-col">
                                                                                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{school.name}</span>
                                                                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{school.subdomain || school.domain || "No domain"}</span>
                                                                                        </div>
                                                                                    </CommandItem>
                                                                                );
                                                                            })}
                                                                        </CommandGroup>
                                                                    )}
                                                                </CommandList>

                                                                {/* Pagination Footer */}
                                                                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 rounded-lg text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                                        onClick={() => setSchoolPage(p => Math.max(1, p - 1))}
                                                                        disabled={schoolPage <= 1 || isLoadingSchools}
                                                                    >
                                                                        <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                                                    </Button>
                                                                    <div className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                                                                        Page {schoolsMeta.page} / {schoolsMeta.totalPage || 1}
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 rounded-lg text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                                                        onClick={() => setSchoolPage(p => Math.min(schoolsMeta.totalPage || 1, p + 1))}
                                                                        disabled={schoolPage >= (schoolsMeta.totalPage || 1) || isLoadingSchools}
                                                                    >
                                                                        Next <ChevronRight className="h-4 w-4 ml-1" />
                                                                    </Button>
                                                                </div>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>

                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {selectedSchools.map(school => (
                                                            <Badge key={school.id} variant="secondary" className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 hover:border-rose-200 transition-colors group">
                                                                <span className="font-bold">{school.name}</span>
                                                                <button type="button" onClick={() => setSelectedSchools(selectedSchools.filter(s => s.id !== school.id))} className="text-zinc-400 group-hover:text-rose-500 rounded-full focus:outline-none transition-colors">
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentTargetType === "SPECIFIC_ROLES" && (
                                            <div className="space-y-3 pt-2">
                                                <Label className="text-zinc-700 dark:text-zinc-300 font-bold">Select Roles</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {rolesList.map(role => {
                                                        const isSelected = selectedRoles.includes(role);
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={role}
                                                                onClick={() => {
                                                                    if (isSelected) setSelectedRoles(selectedRoles.filter(r => r !== role));
                                                                    else setSelectedRoles([...selectedRoles, role]);
                                                                }}
                                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${isSelected
                                                                    ? 'bg-primary text-primary-foreground border-primary scale-105'
                                                                    : 'bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-primary/50'
                                                                    }`}
                                                            >
                                                                {role.replace(/_/g, " ")}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Row 4: Action & Media */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <FormField
                                            control={form.control}
                                            name="actionUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                                                        <LinkIcon className="h-4 w-4 text-zinc-400" /> Optional Link
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl focus-visible:ring-primary/30" />
                                                    </FormControl>
                                                    <FormDescription>Where should the user go when clicking this?</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                                                <ImageIcon className="h-4 w-4 text-zinc-400" /> Attached Image
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center justify-center flex-1 h-[42px] px-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors text-sm font-medium text-zinc-500 hover:text-primary">
                                                        <span>{imageFile ? "Change Image" : "Upload Graphic"}</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                    </label>
                                                    {imagePreview && (
                                                        <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border shadow-sm group">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormDescription>Attach promotional banners or context images.</FormDescription>
                                        </FormItem>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            type="submit"
                                            onClick={() => console.log('submitting...')}
                                            disabled={createNotificationMutation.isPending}
                                            className="rounded-xl px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                                        >
                                            {createNotificationMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Broadcasting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Dispatch Notification
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* Live Preview Pane */}
                <div className="hidden lg:flex flex-col">
                    <div className="sticky top-28 space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-500">Live User Preview</h3>
                        </div>

                        <div className="relative w-full max-w-sm ml-auto mr-auto filter drop-shadow-2xl">
                            {/* Toast Mockup */}
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 flex gap-4">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="p-2 rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                                            {form.watch("type") === "INFO" && <Info className="h-5 w-5 text-blue-500" />}
                                            {form.watch("type") === "WARNING" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                                            {form.watch("type") === "SUCCESS" && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                            {form.watch("type") === "ERROR" && <XCircle className="h-5 w-5 text-rose-500" />}
                                            {form.watch("type") === "SYSTEM" && <Megaphone className="h-5 w-5 text-primary" />}
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0 pr-6 w-full">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                            {form.watch("title") || "Notification Title"}
                                        </p>
                                        <p className="text-xs mt-1 text-zinc-500 line-clamp-2 leading-relaxed break-words">
                                            {form.watch("message") || "The body of your message will appear here. Keep it concise and actionable."}
                                        </p>
                                    </div>
                                    <button className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600">
                                        &times;
                                    </button>
                                </div>
                                {imagePreview && (
                                    <div className="w-full h-32 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="bg-zinc-50 dark:bg-zinc-950 p-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-medium tracking-wide flex justify-between items-center">
                                    <span>UNIFYNT SYS</span>
                                    <span>Just now</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm text-xs text-zinc-500 leading-relaxed font-medium">
                            This preview mimics what end users will experience when they receive this toast in real-time across their active sessions.
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
