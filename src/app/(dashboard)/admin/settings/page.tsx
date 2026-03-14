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
    Lock,
    Globe,
    Mail,
    FileText,
    ExternalLink,
    Settings,
    Copy,
    RefreshCw,
    Check,
    MessageCircle,
    PhoneCall,
    UploadCloud,
    CheckCircle2,
    Save
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { SchoolService } from "@/services/school.service";
import { cn } from "@/lib/utils";

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

// --- IMAGE UTILS ---
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

export default function AdminWorkspaceProfilePage() {
    const queryClient = useQueryClient();
    const { user, isLoading: isAuthLoading } = useAuth();

    const [activeTab, setActiveTab] = useState("identity");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modals
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
    
    // Crop Settings
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // DNS
    const [dnsStatus, setDnsStatus] = useState<{ aRecord: boolean; cnameRecord: boolean } | null>(null);

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
            if (data.customDomain) {
                data.customDomain = data.customDomain.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase();
            }
            return SchoolService.updateSchool(user?.schoolId as string, data);
        },
        onSuccess: (data, variables) => {
            toast.success("Settings saved successfully");
            queryClient.invalidateQueries({ queryKey: ["my-school", user?.schoolId] });
            
            // Auto open DNS modal if custom domain was the trigger
            if (variables.customDomain && variables.customDomain !== schoolData?.customDomain) {
                setIsDomainModalOpen(true);
            }
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to save settings"),
    });

    const verifyDnsMutation = useMutation({
        mutationFn: async () => {
            const domain = form.getValues("customDomain")?.replace(/^(https?:\/\/)?(www\.)?/, '').toLowerCase();
            const subdomain = schoolData?.subdomain;
            if (!domain || !subdomain) return null;
            return SchoolService.verifyDns(domain, subdomain);
        },
        onSuccess: (data) => {
            if (!data) return;
            setDnsStatus(data);
            if (data.aRecord && data.cnameRecord) {
                toast.success("Domain successfully verified!");
            } else {
                toast.warning("Verification pending. Records not detected yet.");
            }
        },
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result?.toString() || null);
            setIsLogoModalOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleProcessImage = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            setIsUploading(true);
            const processedFile = await getProcessedImage(imageSrc, croppedAreaPixels);
            const formData = new FormData();
            formData.append("file", processedFile!);
            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.data.success) {
                form.setValue("logo", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                setIsLogoModalOpen(false);
                toast.success("Logo updated. Don't forget to Save Changes below.");
            }
        } catch { toast.error("Upload failed"); } finally { setIsUploading(false); }
    };

    if (isAuthLoading || isSchoolLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
                    <p className="text-sm text-muted-foreground">Manage your institution identity, domain and contact information.</p>
                </div>
                <Button 
                    onClick={form.handleSubmit((data) => updateProfileMutation.mutate(data))}
                    disabled={updateProfileMutation.isPending}
                    className="hidden sm:flex items-center gap-2 px-6"
                >
                    {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-10">
                {/* Fixed Sidenav like Vercel */}
                <aside className="w-full md:w-48 space-y-1">
                    {[
                        { id: "identity", label: "General", icon: Settings },
                        { id: "contact", label: "Contact", icon: Mail },
                        { id: "legal", label: "Administration", icon: FileText },
                        { id: "security", label: "Security", icon: Lock },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                activeTab === item.id 
                                ? "bg-primary/10 text-primary" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </aside>

                {/* Main Form Content */}
                <div className="flex-1 space-y-8">
                    <form onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-8">
                        {activeTab === "identity" && (
                            <div className="space-y-10">
                                {/* Branding Section */}
                                <section className="space-y-6">
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Institution Identity</h2>
                                    
                                    <div className="flex flex-col sm:flex-row items-center gap-8 p-6 border rounded-xl bg-card/50">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <Avatar className="h-24 w-24 border-2 border-background shadow-xl">
                                                <AvatarImage src={form.watch("logo")} className="object-contain p-2" />
                                                <AvatarFallback className="text-2xl font-bold">{form.watch("name")?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <UploadCloud className="text-white h-6 w-6" />
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                        </div>
                                        <div className="space-y-1.5 flex-1">
                                            <h3 className="font-bold">Institution Logo</h3>
                                            <p className="text-xs text-muted-foreground">Recommended: 512x512px. JPG or PNG.</p>
                                            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs">Upload New Logo</Button>
                                        </div>
                                    </div>

                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">Institution Name</Label>
                                            <Input {...form.register("name")} className="max-w-md h-10" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase">Platform URL</Label>
                                            <div className="flex items-center max-w-md bg-muted rounded-md overflow-hidden border">
                                                <Input {...form.register("subdomain")} className="border-0 bg-transparent h-10 shadow-none font-bold" />
                                                <span className="px-4 text-xs font-bold text-muted-foreground">.unifynt.com</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="flex items-center justify-between max-w-md">
                                                <Label className="text-xs font-bold uppercase">Custom Domain</Label>
                                                {form.watch("customDomain") && (
                                                    <button type="button" onClick={() => setIsDomainModalOpen(true)} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                                                        <ExternalLink className="h-3 w-3" /> Configure DNS
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex gap-2 max-w-md">
                                                <div className="relative flex-1">
                                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input {...form.register("customDomain")} placeholder="e.g. morning.com" className="pl-10 h-10 font-mono text-sm" />
                                                </div>
                                                <Button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const domain = form.getValues("customDomain");
                                                        if (!domain) {
                                                            toast.error("Please enter a domain first");
                                                            return;
                                                        }
                                                        setIsDomainModalOpen(true);
                                                        // Also trigger save in background to ensure it's registered
                                                        form.handleSubmit((data) => updateProfileMutation.mutate(data))();
                                                    }}
                                                    variant="secondary" 
                                                    className="px-4 text-xs font-bold h-10"
                                                >
                                                    Connect
                                                </Button>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground">Configure your own domain to point to your school website.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "contact" && (
                            <section className="space-y-8 animate-in fade-in">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contact Information</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">Email Address</Label>
                                        <Input {...form.register("email")} placeholder="support@school.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">Phone Number</Label>
                                        <Input {...form.register("phone")} placeholder="+91 ..." />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label className="text-xs font-bold">Physical Address</Label>
                                        <textarea {...form.register("address")} className="w-full min-h-[100px] p-3 rounded-md border bg-background text-sm focus:ring-1 focus:ring-primary outline-none" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === "legal" && (
                            <section className="space-y-8 animate-in fade-in">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Administration Settings</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">Principal Name</Label>
                                        <Input {...form.register("principalName")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">Established Year</Label>
                                        <Input type="number" {...form.register("establishedYear", { valueAsNumber: true })} />
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label className="text-xs font-bold">Attendance Type</Label>
                                        <select {...form.register("attendanceType")} className="w-full h-10 px-3 rounded-md border bg-background text-sm font-medium">
                                            <option value="DAILY">Daily (Standard)</option>
                                            <option value="SUBJECT_WISE">Subject-wise (Period tracking)</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}
                        
                        {/* Global Save Button at Bottom */}
                        {activeTab !== "security" && (
                            <div className="pt-10 border-t flex items-center justify-between bg-card p-6 rounded-xl border mt-10">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold italic">Unsaved changes may be lost.</p>
                                    <p className="text-xs text-muted-foreground">Click save to persist institution branding and settings.</p>
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={updateProfileMutation.isPending}
                                    className="px-8 flex items-center gap-2"
                                >
                                    {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </form>

                    {activeTab === "security" && (
                        <div className="space-y-8 animate-in fade-in">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Account Credentials</h2>
                            <Card className="border-destructive/20 border-2">
                                <CardHeader>
                                    <CardTitle className="text-destructive flex items-center gap-2 text-lg">Change Master Password</CardTitle>
                                    <CardDescription>Update the root administrator password for this school workspace.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="max-w-md space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold">Current Password</Label>
                                            <Input type="password" {...passwordForm.register("currentPassword")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold">New Password</Label>
                                            <Input type="password" {...passwordForm.register("newPassword")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold">Confirm New Password</Label>
                                            <Input type="password" {...passwordForm.register("confirmPassword")} />
                                        </div>
                                    </div>
                                    <Button variant="destructive" className="px-8 mt-4">Update Password</Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* DOMAIN CONFIG MODAL (VERCEL STYLE - COMPACT & CLEAN) */}
            <Dialog open={isDomainModalOpen} onOpenChange={setIsDomainModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-xl border shadow-2xl">
                    <div className="p-8 space-y-8">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" /> 
                                DNS Configuration
                            </DialogTitle>
                            <DialogDescription className="text-sm">
                                Setup <span className="text-foreground font-bold">{form.getValues("customDomain")}</span> by adding these records to your domain provider.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* A Record */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">A Record (Apex)</span>
                                    {dnsStatus?.aRecord ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            <Check className="h-3 w-3" /> Valid
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-12 p-4 gap-4 items-center">
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Type</p>
                                        <p className="text-xs font-mono font-bold">A</p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Host</p>
                                        <p className="text-xs font-mono font-bold">@</p>
                                    </div>
                                    <div className="col-span-8 space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Value</p>
                                        <div className="flex items-center justify-between gap-2 bg-muted/40 p-2 rounded border border-border/10">
                                            <code className="text-xs font-mono font-bold">103.118.0.3</code>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText("103.118.0.3"); toast.success("Copied"); }}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CNAME Record */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted/50 px-4 py-2 border-b flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">CNAME Record (WWW)</span>
                                    {dnsStatus?.cnameRecord ? (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            <Check className="h-3 w-3" /> Valid
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Pending</span>
                                    )}
                                </div>
                                <div className="grid grid-cols-12 p-4 gap-4 items-center">
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Type</p>
                                        <p className="text-xs font-mono font-bold">CNAME</p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Host</p>
                                        <p className="text-xs font-mono font-bold">www</p>
                                    </div>
                                    <div className="col-span-8 space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Value</p>
                                        <div className="flex items-center justify-between gap-2 bg-muted/40 p-2 rounded border border-border/10">
                                            <code className="text-xs font-mono font-bold truncate max-w-[150px]">{schoolData?.subdomain}.unifynt.com</code>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(`${schoolData?.subdomain}.unifynt.com`); toast.success("Copied"); }}>
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Propagations Support</p>
                                <div className="flex gap-4">
                                    <a href="https://wa.me/919239536545" target="_blank" className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                                        <MessageCircle className="h-3 w-3" /> WhatsApp
                                    </a>
                                    <a href="tel:+919239536545" className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
                                        <PhoneCall className="h-3 w-3" /> Call Support
                                    </a>
                                </div>
                            </div>
                            <Button 
                                onClick={() => verifyDnsMutation.mutate()} 
                                disabled={verifyDnsMutation.isPending}
                                className="px-6 h-11 flex items-center gap-2"
                            >
                                {verifyDnsMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                Verify Configuration
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* LOGO CROP MODAL */}
            <Dialog open={isLogoModalOpen} onOpenChange={setIsLogoModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Position your Logo</DialogTitle>
                    </DialogHeader>
                    <div className="relative h-64 bg-muted rounded-lg overflow-hidden my-4 border">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop} zoom={zoom} aspect={1}
                                onCropChange={setCrop} onZoomChange={setZoom}
                                onCropComplete={(_, p) => setCroppedAreaPixels(p)}
                                cropShape="round" showGrid={false}
                            />
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLogoModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleProcessImage} disabled={isUploading}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Apply Logo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}