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
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-primary" /> Workspace Configuration
                </h1>
                <p className="text-muted-foreground mt-2 text-sm font-medium">Manage your institution&apos;s global identity, contact details, and security.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full xl:w-72 shrink-0">
                    <div className="sticky top-8 bg-background border shadow-sm rounded-xl p-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                                <TabsTrigger value="identity" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all">
                                    <Palette className="mr-3 h-4 w-4" /> Identity & Branding
                                </TabsTrigger>
                                <TabsTrigger value="contact" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all">
                                    <Mail className="mr-3 h-4 w-4" /> Contact & Location
                                </TabsTrigger>
                                <TabsTrigger value="legal" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all">
                                    <FileText className="mr-3 h-4 w-4" /> Legal & Administration
                                </TabsTrigger>
                                <Separator className="my-2 opacity-50" />
                                <TabsTrigger value="security" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-lg data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:shadow-none hover:bg-muted transition-all text-muted-foreground">
                                    <ShieldCheck className="mr-3 h-4 w-4" /> Account Security
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
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <Card className="border-border/60 shadow-sm overflow-hidden rounded-xl">
                                    <CardHeader className="bg-muted/30 border-b px-8 py-6">
                                        <CardTitle className="text-xl">Branding Assets</CardTitle>
                                        <CardDescription>Upload your workspace logo and choose brand colors.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-8 border-b border-border/50">
                                            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                                                <Avatar className="h-32 w-32 border-4 border-background shadow-lg group-hover:scale-105 transition-all bg-white">
                                                    <AvatarImage src={currentLogo} alt="Logo" className="object-cover" />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-4xl font-extrabold">
                                                        {form.getValues("name")?.charAt(0) || "W"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <ImageIcon className="h-8 w-8 text-white" />
                                                </div>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-extrabold text-lg">Workspace Logo</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">We recommend a clear, square-oriented image. High resolution is preferred. Our smart adjuster will help you fit it perfectly.</p>
                                                <Button type="button" variant="outline" size="sm" className="mt-2 shadow-sm font-bold h-10 px-6" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                                    {isUploading ? "Processing..." : "Upload New Logo"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace / School Name</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10 font-medium text-lg" {...form.register("name")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subdomain URL</Label>
                                                <div className="flex shadow-sm rounded-md border focus-within:ring-1 focus-within:ring-ring bg-muted/10 overflow-hidden">
                                                    <Input className="h-12 border-0 shadow-none focus-visible:ring-0 bg-transparent font-mono" {...form.register("subdomain")} />
                                                    <div className="px-4 h-12 flex items-center bg-muted/50 border-l text-muted-foreground text-sm font-semibold">.unifynt.com</div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Domain <span className="text-[10px] normal-case opacity-60">(Optional)</span></Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="h-12 pl-10 shadow-sm bg-muted/10 font-mono" placeholder="www.yourschool.com" {...form.register("customDomain")} />
                                                </div>
                                            </div>

                                            {/* Colors */}
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Theme Color</Label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-12 rounded-lg border shadow-sm overflow-hidden shrink-0">
                                                        <input type="color" className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer" {...form.register("primaryColor")} />
                                                    </div>
                                                    <Input className="h-12 font-mono uppercase bg-muted/10" {...form.register("primaryColor")} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secondary Theme Color</Label>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-12 w-12 rounded-lg border shadow-sm overflow-hidden shrink-0">
                                                        <input type="color" className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer" {...form.register("secondaryColor")} />
                                                    </div>
                                                    <Input className="h-12 font-mono uppercase bg-muted/10" {...form.register("secondaryColor")} />
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
                            <div className="mt-8 flex justify-end">
                                <Button type="submit" size="lg" className="px-10 h-14 font-extrabold shadow-xl text-lg w-full md:w-auto" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                    Save Workspace Configuration
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