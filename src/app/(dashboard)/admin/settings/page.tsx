/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import {
    Loader2,
    Building2,
    Lock,
    Globe,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    CheckCircle2,
    UploadCloud,
    KeyRound,
    Palette,
    FileText,
    Image as ImageIcon
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { SchoolService } from "@/services/school.service";

// --- SCHEMAS ---
const schoolProfileSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
    subdomain: z.string().min(1, "Subdomain is required"),
    customDomain: z.string().optional().or(z.literal("")),
    logo: z.string().optional().or(z.literal("")),
    primaryColor: z.string().optional().or(z.literal("")),
    secondaryColor: z.string().optional().or(z.literal("")),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    website: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    billingAddress: z.string().optional().or(z.literal("")),
    principalName: z.string().optional().or(z.literal("")),
    principalPhone: z.string().optional().or(z.literal("")),
    establishedYear: z.number({ invalid_type_error: "Must be a number" }).optional(),
    registrationCode: z.string().optional().or(z.literal("")),
    taxId: z.string().optional().or(z.literal("")),
    timezone: z.string().optional().or(z.literal("")),
    currency: z.string().optional().or(z.literal("")),
    attendanceType: z.string().optional().or(z.literal("DAILY")),
});

type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// --- IMAGE PROCESSING UTILS ---
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

const getProcessedImage = async (imageSrc: string, pixelCrop: any): Promise<File | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0, 0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) { reject(new Error("Canvas is empty")); return; }
            const file = new File([blob], `workspace-logo-${Date.now()}.jpg`, { type: "image/jpeg" });
            resolve(file);
        }, "image/jpeg", 0.95);
    });
};

// --- MAIN COMPONENT ---
export default function AdminWorkspaceProfilePage() {
    const queryClient = useQueryClient();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [activeTab, setActiveTab] = useState("identity");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image Adjuster States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const { data: schoolData, isLoading: isSchoolLoading } = useQuery({
        queryKey: ["my-school", user?.schoolId],
        queryFn: () => SchoolService.getSingleSchool(user?.schoolId as string),
        enabled: !!user?.schoolId,
    });

    const form = useForm<SchoolProfileFormValues>({
        resolver: zodResolver(schoolProfileSchema),
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
    });

    useEffect(() => {
        if (schoolData) {
            form.reset({
                name: schoolData.name || "",
                subdomain: schoolData.subdomain || "",
                customDomain: schoolData.customDomain || "",
                logo: schoolData.logo || "",
                primaryColor: schoolData.primaryColor || "#2563eb",
                secondaryColor: schoolData.secondaryColor || "#1e40af",
                email: schoolData.email || "",
                phone: schoolData.phone || "",
                website: schoolData.website || "",
                address: schoolData.address || "",
                billingAddress: schoolData.billingAddress || "",
                principalName: schoolData.principalName || "",
                principalPhone: schoolData.principalPhone || "",
                establishedYear: schoolData.establishedYear || new Date().getFullYear(),
                registrationCode: schoolData.registrationCode || "",
                taxId: schoolData.taxId || "",
                timezone: schoolData.timezone || "Asia/Kolkata",
                currency: schoolData.currency || "INR",
                attendanceType: schoolData.attendanceType || "DAILY",
            });
        }
    }, [schoolData, form]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: SchoolProfileFormValues) => {
            return SchoolService.updateSchool(user?.schoolId as string, data);
        },
        onSuccess: () => {
            toast.success("Workspace profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["my-school", user?.schoolId] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update profile"),
    });

    const updatePasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormValues) => {
            const res = await api.post("/auth/change-password", {
                oldPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Security credentials updated successfully!");
            passwordForm.reset();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Incorrect current password"),
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setImageSrc(reader.result?.toString() || null);
            setIsModalOpen(true);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
        });
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleProcessImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            setIsUploading(true);
            const processedFile = await getProcessedImage(imageSrc, croppedAreaPixels);
            if (!processedFile) { toast.error("Processing failed."); return; }

            const formData = new FormData();
            formData.append("file", processedFile);

            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.data.success) {
                form.setValue("logo", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                toast.success("Workspace logo updated");
                setIsModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to upload logo");
        } finally {
            setIsUploading(false);
        }
    };

    if (isAuthLoading || isSchoolLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const currentLogo = form.watch("logo");

    return (
        <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-700">
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-2 bg-primary rounded-full" />
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
                        Workspace <span className="text-primary/80">Settings</span>
                    </h1>
                </div>
                <p className="text-muted-foreground ml-5 text-sm font-bold tracking-wide opacity-70">Global identity, institutional branding, and infrastructure security.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-10 items-start">
                {/* Sidebar Navigation */}
                <div className="w-full xl:w-80 shrink-0 sticky top-10">
                    <div className="glass-metal p-5 rounded-3xl border border-border/40 shadow-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl">
                        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                            <TabsList className="flex flex-col h-auto bg-transparent space-y-2 p-0">
                                <TabsTrigger 
                                    value="identity" 
                                    className="w-full justify-start px-5 py-4 text-xs font-black uppercase tracking-[0.15em] rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-muted/80 transition-all duration-300 group"
                                >
                                    <Palette className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" /> Identity & Branding
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="contact" 
                                    className="w-full justify-start px-5 py-4 text-xs font-black uppercase tracking-[0.15em] rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-muted/80 transition-all duration-300 group"
                                >
                                    <Mail className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" /> Contact & Location
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="legal" 
                                    className="w-full justify-start px-5 py-4 text-xs font-black uppercase tracking-[0.15em] rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-muted/80 transition-all duration-300 group"
                                >
                                    <FileText className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" /> Legal & Administration
                                </TabsTrigger>
                                <div className="py-3 px-4">
                                    <Separator className="opacity-20" />
                                </div>
                                <TabsTrigger 
                                    value="security" 
                                    className="w-full justify-start px-5 py-4 text-xs font-black uppercase tracking-[0.15em] rounded-2xl data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground data-[state=active]:shadow-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group opacity-70"
                                >
                                    <ShieldCheck className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" /> Account Security
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Main Content Form */}
                <div className="flex-1">
                    <form id="workspace-form" onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))}>

                        {/* TAB: IDENTITY & BRANDING */}
                        {activeTab === "identity" && (
                            <div className="space-y-8 animate-in slide-in-from-right-10 duration-700">
                                <Card className="glass-metal border border-border/40 shadow-2xl rounded-3xl overflow-hidden bg-white/40 dark:bg-zinc-950/40 backdrop-blur-xl">
                                    <CardHeader className="bg-primary/5 border-b border-border/40 px-10 py-10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                                                <Palette className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl font-black uppercase tracking-tight">Institution Branding</CardTitle>
                                                <CardDescription className="font-bold opacity-60">Visual assets and workspace URLs.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 space-y-10">
                                        <div className="flex flex-col md:flex-row items-center gap-12 pb-12 border-b border-border/20">
                                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-cyan-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                                                <Avatar className="h-40 w-40 border-8 border-background shadow-2xl scale-100 group-hover:scale-[1.03] transition-all duration-500 bg-white ring-1 ring-border/20">
                                                    <AvatarImage src={currentLogo} alt="Logo" className="object-contain p-2" />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-5xl font-black">
                                                        {form.getValues("name")?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                                    <div className="bg-white/20 p-4 rounded-full border border-white/40 shadow-xl">
                                                        <ImageIcon className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                            </div>
                                            <div className="space-y-4 flex-1 text-center md:text-left">
                                                <h4 className="font-black text-2xl tracking-tighter uppercase italic">Institutional <span className="text-primary">Logo</span></h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed font-bold opacity-70">Elevate your workspace with a professional emblem. 500x500px square format recommended for optimal cross-platform clarity.</p>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                                                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-sm border-primary/20 hover:bg-primary/5 transition-all">
                                                        {isUploading ? <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary" /> : <UploadCloud className="mr-3 h-4 w-4 text-primary" />}
                                                        Change Artifact
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3 md:col-span-2">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Workspace Full Identifier</Label>
                                                <Input 
                                                    className="h-16 px-6 bg-muted/20 border-border/40 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl text-xl font-black tracking-tight shadow-inner transition-all" 
                                                    placeholder="School/Institution Name"
                                                    {...form.register("name")} 
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Platform Subdomain</Label>
                                                <div className="flex glass-metal rounded-2xl border border-border/40 overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                                    <Input 
                                                        className="h-14 bg-transparent border-0 shadow-none px-6 text-lg font-bold tracking-tight text-primary" 
                                                        {...form.register("subdomain")} 
                                                    />
                                                    <div className="bg-zinc-100 dark:bg-zinc-900 px-6 h-14 flex items-center border-l border-border/40 text-xs font-black uppercase tracking-widest opacity-60">.unifynt.com</div>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Enterprise Domain</Label>
                                                <div className="relative group">
                                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <Input 
                                                        className="h-14 pl-14 px-6 bg-muted/20 border-border/40 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl text-lg font-bold tracking-tight shadow-inner transition-all" 
                                                        placeholder="www.academy.edu" 
                                                        {...form.register("customDomain")} 
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-5">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Primary Signature Color</Label>
                                                <div className="flex items-center gap-4 bg-muted/10 p-4 rounded-2xl border border-border/20">
                                                    <div className="h-14 w-14 rounded-xl border-2 border-white dark:border-zinc-800 shadow-xl overflow-hidden relative group shrink-0">
                                                        <input type="color" className="absolute -inset-4 cursor-pointer scale-150" {...form.register("primaryColor")} />
                                                    </div>
                                                    <Input className="h-14 bg-transparent border-0 font-black tracking-[0.1em] text-lg uppercase" {...form.register("primaryColor")} />
                                                </div>
                                            </div>
                                            <div className="space-y-5">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Secondary Accent Color</Label>
                                                <div className="flex items-center gap-4 bg-muted/10 p-4 rounded-2xl border border-border/20">
                                                    <div className="h-14 w-14 rounded-xl border-2 border-white dark:border-zinc-800 shadow-xl overflow-hidden relative group shrink-0">
                                                        <input type="color" className="absolute -inset-4 cursor-pointer scale-150" {...form.register("secondaryColor")} />
                                                    </div>
                                                    <Input className="h-14 bg-transparent border-0 font-black tracking-[0.1em] text-lg uppercase" {...form.register("secondaryColor")} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* TAB: CONTACT & LOCATION */}
                        {activeTab === "contact" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <Card className="border-border/60 shadow-sm overflow-hidden rounded-xl">
                                    <CardHeader className="bg-muted/30 border-b px-8 py-6">
                                        <CardTitle className="text-xl">Contact Information</CardTitle>
                                        <CardDescription>How users and the system will communicate with your workspace.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Support Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="h-12 pl-10 shadow-sm bg-muted/10" type="email" {...form.register("email")} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Phone</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="h-12 pl-10 shadow-sm bg-muted/10" {...form.register("phone")} />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Official Website</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="h-12 pl-10 shadow-sm bg-muted/10 font-mono" placeholder="https://" {...form.register("website")} />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Physical Address</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                                                    <textarea
                                                        className="w-full min-h-[100px] pl-10 pr-4 py-3 rounded-md border border-input bg-muted/10 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
                                                        {...form.register("address")}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Billing Address <span className="text-[10px] normal-case opacity-60">(If different)</span></Label>
                                                <textarea
                                                    className="w-full min-h-[80px] px-4 py-3 rounded-md border border-input bg-muted/10 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
                                                    {...form.register("billingAddress")}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* TAB: LEGAL & ADMINISTRATION */}
                        {activeTab === "legal" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <Card className="border-border/60 shadow-sm overflow-hidden rounded-xl">
                                    <CardHeader className="bg-muted/30 border-b px-8 py-6">
                                        <CardTitle className="text-xl">Legal Details</CardTitle>
                                        <CardDescription>Compliance, regional settings, and administration details.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Principal / Head Name</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10" {...form.register("principalName")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Principal Contact</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10" {...form.register("principalPhone")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Established Year</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10" type="number" {...form.register("establishedYear", { valueAsNumber: true })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration / Affiliation Code</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10 font-mono" {...form.register("registrationCode")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tax ID / GSTIN</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10 font-mono" {...form.register("taxId")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Currency System</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10 font-mono" placeholder="e.g. INR, USD" {...form.register("currency")} />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attendance Tracking Mode</Label>
                                                <div className="flex flex-col gap-1.5 cursor-pointer">
                                                    <select 
                                                        className="h-12 px-3 rounded-md border border-input bg-muted/10 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm font-medium transition-colors"
                                                        {...form.register("attendanceType")}
                                                    >
                                                        <option value="DAILY">Daily (Once per day, typically 1st Period)</option>
                                                        <option value="SUBJECT_WISE">Subject-Wise (Every teacher marks attendance per class)</option>
                                                    </select>
                                                    <p className="text-[11px] text-muted-foreground">Determines how teachers mark attendance in their mobile app.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Save Button for Workspace Settings */}
                        {activeTab !== "security" && (
                            <div className="mt-10 flex justify-end">
                                <Button 
                                    type="submit" 
                                    size="lg" 
                                    className="px-12 h-16 font-black uppercase tracking-[0.2em] shadow-2xl text-sm w-full md:w-auto rounded-3xl group" 
                                    disabled={updateProfileMutation.isPending}
                                >
                                    {updateProfileMutation.isPending ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />}
                                    Commit Global Changes
                                </Button>
                            </div>
                        )}
                    </form>

                    {/* TAB: SECURITY */}
                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <Card className="border-border/60 shadow-sm overflow-hidden rounded-xl border-destructive/20">
                                <CardHeader className="bg-destructive/5 border-b border-destructive/10 px-8 py-6">
                                    <CardTitle className="text-xl text-destructive flex items-center gap-2"><Lock className="h-5 w-5" /> Account Credentials</CardTitle>
                                    <CardDescription>Update the master password for the workspace administrator.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-6 max-w-xl">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Current Password</Label>
                                            <Input type="password" placeholder="••••••••" className="h-12 shadow-sm bg-muted/10 font-mono text-lg tracking-widest" {...passwordForm.register("currentPassword")} />
                                            {passwordForm.formState.errors.currentPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{passwordForm.formState.errors.currentPassword.message}</p>}
                                        </div>
                                        <Separator className="my-6 opacity-50" />
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                            <Input type="password" placeholder="••••••••" className="h-12 shadow-sm bg-muted/10 font-mono text-lg tracking-widest" {...passwordForm.register("newPassword")} />
                                            {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{passwordForm.formState.errors.newPassword.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm New Password</Label>
                                            <Input type="password" placeholder="••••••••" className="h-12 shadow-sm bg-muted/10 font-mono text-lg tracking-widest" {...passwordForm.register("confirmPassword")} />
                                            {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                        </div>
                                        <div className="pt-6">
                                            <Button type="submit" size="lg" variant="destructive" className="w-full md:w-auto px-10 h-14 font-extrabold shadow-xl text-lg" disabled={updatePasswordMutation.isPending}>
                                                {updatePasswordMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
                                                Update Secure Password
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* SMART IMAGE PROCESSING MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Adjust Logo Position</DialogTitle>
                        <DialogDescription className="text-sm font-medium">
                            Position your image perfectly. We&apos;ll automatically optimize it for all platform views.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative h-[350px] w-full bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden my-4 border shadow-inner">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Strict Square Aspect
                                onCropChange={setCrop}
                                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                onZoomChange={setZoom}
                                showGrid={false}
                                cropShape="round" // Creates a professional circular preview mask
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mt-2 px-2">
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                            <span>Zoom Out</span>
                            <span>Zoom In</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.05}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <DialogFooter className="mt-8 gap-3 sm:gap-0">
                        <Button variant="outline" className="font-bold h-11" onClick={() => setIsModalOpen(false)} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleProcessImage} disabled={isUploading} className="font-bold h-11 px-8">
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Set Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}