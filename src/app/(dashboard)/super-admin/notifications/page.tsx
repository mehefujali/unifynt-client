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
    X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

    const [selectedSchools, setSelectedSchools] = useState<{ id: string, name: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

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

        formData.append("title", values.title);
        formData.append("message", values.message);
        formData.append("type", values.type);
        formData.append("targetType", values.targetType);
        if (values.actionUrl) formData.append("actionUrl", values.actionUrl);

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
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Broadcast Hub</h2>
                    <p className="text-sm text-muted-foreground">
                        Create and dispatch real-time notifications across the entire platform.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border py-4">
                            <CardTitle className="text-base font-bold uppercase tracking-wider text-foreground">Notification Composer</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Notification Heading</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="E.g. System Maintenance Scheduled" {...field} className="h-11 bg-muted/20 rounded-xl" />
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
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Category</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-muted/20 rounded-xl">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl shadow-lg">
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

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Detailed Message</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Type the full notification body here..."
                                                        {...field}
                                                        className="min-h-[140px] bg-muted/20 rounded-xl resize-none"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="bg-muted/10 rounded-xl border border-border p-6 space-y-6">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Target Selection</span>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="targetType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select 
                                                        onValueChange={(val) => {
                                                            field.onChange(val);
                                                            setSelectedSchools([]);
                                                            setSelectedRoles([]);
                                                        }} 
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-background border-border rounded-xl">
                                                                <SelectValue placeholder="Target audience" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-xl">
                                                            <SelectItem value="ALL_USERS">Global: Every Registered User</SelectItem>
                                                            <SelectItem value="ALL_SCHOOLS">All Institution Admins</SelectItem>
                                                            <SelectItem value="SPECIFIC_SCHOOLS">Specific Institutions</SelectItem>
                                                            <SelectItem value="SPECIFIC_ROLES">Specific Global Roles</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {currentTargetType === "SPECIFIC_SCHOOLS" && (
                                            <div className="space-y-3 pt-2">
                                                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Pick Institutions</Label>
                                                <div className="flex flex-col gap-2">
                                                    <Popover open={isSchoolDropdownOpen} onOpenChange={setIsSchoolDropdownOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="w-full justify-between h-11 rounded-xl border-border bg-background font-normal"
                                                            >
                                                                <span className="text-muted-foreground">Search institutions...</span>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[400px] p-0 rounded-xl shadow-xl border-border overflow-hidden" align="start">
                                                            <Command shouldFilter={false}>
                                                                <CommandInput
                                                                    placeholder="Type to search..."
                                                                    value={schoolSearchQuery}
                                                                    onValueChange={(val) => {
                                                                        setSchoolSearchQuery(val);
                                                                        setSchoolPage(1);
                                                                    }}
                                                                    className="h-11"
                                                                />
                                                                <CommandList>
                                                                    <CommandEmpty className="py-6 text-center text-xs text-muted-foreground font-medium">
                                                                        {isLoadingSchools ? "Syncing..." : "No results found."}
                                                                    </CommandEmpty>
                                                                    {!isLoadingSchools && schoolsData.length > 0 && (
                                                                        <CommandGroup className="p-1">
                                                                            {schoolsData.map((school: any) => {
                                                                                const isSelected = selectedSchools.some(s => s.id === school.id);
                                                                                return (
                                                                                    <CommandItem
                                                                                        key={school.id}
                                                                                        onSelect={() => {
                                                                                            if (isSelected) {
                                                                                                setSelectedSchools(selectedSchools.filter(s => s.id !== school.id));
                                                                                            } else {
                                                                                                setSelectedSchools([...selectedSchools, { id: school.id, name: school.name }]);
                                                                                            }
                                                                                        }}
                                                                                        className="rounded-lg my-0.5"
                                                                                    >
                                                                                        <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                                                                        <div className="flex flex-col">
                                                                                            <span className="font-bold text-sm">{school.name}</span>
                                                                                            <span className="text-[10px] text-muted-foreground uppercase">{school.subdomain || "No domain"}</span>
                                                                                        </div>
                                                                                    </CommandItem>
                                                                                );
                                                                            })}
                                                                        </CommandGroup>
                                                                    )}
                                                                </CommandList>
                                                                <div className="flex items-center justify-between p-2 bg-muted/30 border-t border-border">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 h-8 rounded-lg"
                                                                        onClick={() => setSchoolPage(p => Math.max(1, p - 1))}
                                                                        disabled={schoolPage <= 1 || isLoadingSchools}
                                                                    >
                                                                        <ChevronLeft className="h-4 w-4" />
                                                                    </Button>
                                                                    <span className="text-[10px] font-bold text-muted-foreground">Page {schoolPage}</span>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 h-8 rounded-lg"
                                                                        onClick={() => setSchoolPage(p => Math.min(schoolsMeta.totalPage || 1, p + 1))}
                                                                        disabled={schoolPage >= (schoolsMeta.totalPage || 1) || isLoadingSchools}
                                                                    >
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>

                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {selectedSchools.map(school => (
                                                            <Badge key={school.id} variant="secondary" className="px-3 py-1.5 bg-background shadow-sm border border-border rounded-lg group">
                                                                <span className="font-bold mr-1">{school.name}</span>
                                                                <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive transition-colors" onClick={() => setSelectedSchools(selectedSchools.filter(s => s.id !== school.id))} />
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {currentTargetType === "SPECIFIC_ROLES" && (
                                            <div className="space-y-3 pt-2">
                                                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Select Access Roles</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {rolesList.map(role => {
                                                        const isSelected = selectedRoles.includes(role);
                                                        return (
                                                            <Button
                                                                type="button"
                                                                key={role}
                                                                variant={isSelected ? "default" : "outline"}
                                                                onClick={() => {
                                                                    if (isSelected) setSelectedRoles(selectedRoles.filter(r => r !== role));
                                                                    else setSelectedRoles([...selectedRoles, role]);
                                                                }}
                                                                className="h-10 px-4 rounded-xl text-xs font-bold transition-all"
                                                            >
                                                                {role.replace(/_/g, " ")}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                        <FormField
                                            control={form.control}
                                            name="actionUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                        <LinkIcon className="h-3 w-3" /> Redirect URL
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} className="h-11 bg-muted/20 rounded-xl" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormItem>
                                            <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <ImageIcon className="h-3 w-3" /> Graphic Attachment
                                            </FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex-1 h-11 px-4 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/30 cursor-pointer flex items-center justify-center text-xs font-bold text-muted-foreground transition-all">
                                                        <span>{imageFile ? "Update Image" : "Select File"}</span>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                    </label>
                                                    {imagePreview && (
                                                        <div className="h-11 w-11 rounded-lg border border-border overflow-hidden shrink-0 shadow-sm relative group">
                                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <X className="h-3 w-3 text-white cursor-pointer" onClick={() => { setImageFile(null); setImagePreview(null); }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={createNotificationMutation.isPending}
                                            className="h-12 px-10 rounded-xl font-bold transition-all shadow-sm"
                                        >
                                            {createNotificationMutation.isPending ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="mr-2 h-4 w-4" />
                                            )}
                                            Dispatch Notification
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div className="hidden lg:block">
                    <div className="sticky top-28 space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Snapshot Preview</h3>
                        </div>

                        <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                            <div className="p-4 flex gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    {form.watch("type") === "INFO" && <Info className="h-5 w-5" />}
                                    {form.watch("type") === "WARNING" && <AlertTriangle className="h-5 w-5" />}
                                    {form.watch("type") === "SUCCESS" && <CheckCircle className="h-5 w-5" />}
                                    {form.watch("type") === "ERROR" && <XCircle className="h-5 w-5" />}
                                    {form.watch("type") === "SYSTEM" && <Megaphone className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-sm text-foreground truncate">{form.watch("title") || "Preview Title"}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{form.watch("message") || "Message body will appear here..."}</p>
                                </div>
                            </div>
                            {imagePreview && (
                                <div className="aspect-video w-full border-t border-border">
                                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                            <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">UNIFYNT BROADCAST</span>
                                <span className="text-[10px] font-medium text-muted-foreground">NOW</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-border bg-muted/20">
                            <p className="text-xs text-muted-foreground leading-relaxed italic">
                                This live preview reflects the real-time notification experience for users on various dashboard modules.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
