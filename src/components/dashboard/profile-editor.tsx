/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import {
    Loader2,
    UserCircle,
    Lock,
    Mail,
    Phone,
    CheckCircle2,
    UploadCloud,
    KeyRound,
    User as UserIcon,
    Image as ImageIcon,
    ShieldCheck,
    ShieldAlert,
    Palette,
    ChevronDown,
    ChevronUp,
    Fingerprint,
    Trash2,
    Calendar,
    Smartphone
} from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";

import { useThemeColor, THEME_PRESETS, type ThemePreset } from "@/providers/theme-color-provider";
import { cn } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";

// --- SCHEMAS ---
const profileSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().optional().or(z.literal("")),
    email: z.string().email("Invalid email format"),
    phone: z.string().optional().or(z.literal("")),
    gender: z.string().optional().or(z.literal("")),
    profileImage: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
    oldPassword: z.string().min(6, "Current password must be provided"),
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
            const file = new File([blob], `profile-pic-${Date.now()}.jpg`, { type: "image/jpeg" });
            resolve(file);
        }, "image/jpeg", 0.95);
    });
};

// --- MAIN COMPONENT ---
export function ProfileEditor() {
    const queryClient = useQueryClient();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("personal");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Image Adjuster States
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // 2FA States
    const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState("");

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" }
    });

    useEffect(() => {
        if (user) {
            const isSuperAdmin = user.role === "SUPER_ADMIN" || user.role === "SCHOOL_ADMIN";

            form.reset({
                firstName: user.details?.firstName || user.name?.split(" ")[0] || (isSuperAdmin ? "System Owner" : ""),
                lastName: user.details?.lastName || user.name?.split(" ")[1] || "",
                email: user.email || "",
                phone: user.details?.phone || "",
                gender: user.details?.gender || "",
                profileImage: user.details?.profilePicture || user.details?.profileImage || "",
            });
        }
    }, [user, form]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: ProfileFormValues) => {
            const formData = new FormData();
            formData.append("firstName", data.firstName);
            if (data.lastName) formData.append("lastName", data.lastName);
            if (data.phone) formData.append("phone", data.phone);
            if (data.gender) formData.append("gender", data.gender);

            return api.patch("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update profile"),
    });

    const updatePasswordMutation = useMutation({
        mutationFn: async (data: PasswordFormValues) => {
            return api.post("/auth/change-password", {
                oldPassword: data.oldPassword,
                newPassword: data.newPassword,
            });
        },
        onSuccess: () => {
            toast.success("Password updated successfully!");
            passwordForm.reset();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update password"),
    });

    const request2FAMutation = useMutation({
        mutationFn: async () => {
            return api.post("/auth/2fa/request-enable");
        },
        onSuccess: () => {
            toast.success("OTP sent to your email!");
        },
        onError: (error: any) => {
            setIsTwoFactorModalOpen(false);
            toast.error(error.response?.data?.message || "Failed to request 2FA");
        },
    });

    const verify2FAMutation = useMutation({
        mutationFn: async () => {
            return api.post("/auth/2fa/verify-enable", { email: user?.email, otp: otpCode });
        },
        onSuccess: () => {
            toast.success("Two-Factor Authentication Enabled!");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            setIsTwoFactorModalOpen(false);
            setOtpCode("");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Invalid OTP code"),
    });

    const disable2FAMutation = useMutation({
        mutationFn: async () => {
            return api.post("/auth/2fa/disable");
        },
        onSuccess: () => {
            toast.success("Two-Factor Authentication Disabled");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to disable 2FA"),
    });

    const { data: passkeysRes, isLoading: isPasskeysLoading } = useQuery({
        queryKey: ["passkeys"],
        queryFn: async () => {
            const { data } = await api.get("/auth/passkey/list");
            return data.data;
        },
    });

    const deletePasskeyMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/auth/passkey/${id}`);
        },
        onSuccess: () => {
            toast.success("Passkey removed");
            queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to remove passkey"),
    });

    const handleRegisterPasskey = async () => {
        try {
            setIsUploading(true);
            const { data: optionsRes } = await api.post("/auth/passkey/register/options");
            const options = optionsRes.data;

            const clientResponse = await startRegistration({ optionsJSON: options });

            await api.post("/auth/passkey/register/verify", clientResponse);
            toast.success("Passkey registered successfully!");
            queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        } catch (error: any) {
            if (error.name === "NotAllowedError") {
                toast.error("Passkey registration cancelled.");
            } else {
                const message = error.response?.data?.message || "Passkey registration failed.";
                toast.error(message);
            }
        } finally {
            setIsUploading(false);
        }
    };

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
            formData.append("profileImage", processedFile);

            const res = await api.patch("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.data.success) {
                form.setValue("profileImage", res.data.data.details?.profileImage || res.data.data.details?.profilePicture, { shouldValidate: true, shouldDirty: true });
                toast.success("Profile picture updated");
                queryClient.invalidateQueries({ queryKey: ["authUser"] });
                setIsModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to upload picture");
        } finally {
            setIsUploading(false);
        }
    };

    if (isAuthLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const currentLogo = form.watch("profileImage");

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <UserCircle className="h-8 w-8 text-primary" /> My Profile
                </h1>
                <p className="text-muted-foreground mt-2 text-sm font-medium">Manage your personal identity and account security.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full xl:w-64 shrink-0">
                    <div className="sticky top-8 bg-card border border-border shadow-sm rounded-xl p-3 overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                            <TabsList className="flex flex-col h-auto bg-transparent space-y-2 p-0">
                                <TabsTrigger 
                                    value="personal" 
                                    className="w-full justify-start px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-300"
                                >
                                    <UserIcon className="mr-3 h-4 w-4" /> Personal Info
                                </TabsTrigger>
                                
                                <TabsTrigger 
                                    value="security" 
                                    className="w-full justify-start px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-300 text-muted-foreground"
                                >
                                    <Lock className="mr-3 h-4 w-4" /> Security
                                </TabsTrigger>

                                <TabsTrigger 
                                    value="appearance" 
                                    className="w-full justify-start px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl data-[state=active]:bg-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all duration-300 text-muted-foreground"
                                >
                                    <Palette className="mr-3 h-4 w-4" /> Aesthetics
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Main Content Form */}
                <div className="flex-1">
                    {/* Color Customizer Hook */}
                    <AppearanceTab active={activeTab === "appearance"} />

                    <form id="profile-form" onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))}>
                        {/* TAB: PERSONAL INFO */}
                        {activeTab === "personal" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <Card className="border border-border shadow-sm overflow-hidden rounded-xl">
                                    <CardHeader className="bg-muted/30 border-b border-border px-8 py-6">
                                        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                            Identity Fundamentals
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium">Update your digital persona and contact information across the workspace.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-border/50">
                                            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                                                <Avatar className="h-32 w-32 border-2 border-border shadow-md transition-all duration-300 relative z-10">
                                                    <AvatarImage src={currentLogo} alt="Profile Picture" className="object-cover" />
                                                    <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-bold">
                                                        {form.getValues("firstName")?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] z-20">
                                                    <UploadCloud className="h-8 w-8 text-white" />
                                                </div>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                            </div>
                                            <div className="space-y-2 text-center md:text-left">
                                                <h4 className="font-bold text-lg">Display Portrait</h4>
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-sm">Upload a professional portrait. This identifies you in communications and records.</p>
                                                <div className="pt-2">
                                                    <Button type="button" variant="outline" size="sm" className="font-bold h-9 px-4 rounded-lg" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4 text-primary" />}
                                                        Change Photo
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                                                <Input className="h-11 shadow-sm bg-muted/10 border-border/50 focus-visible:ring-primary/20 font-medium" {...form.register("firstName")} />
                                                {form.formState.errors.firstName && <p className="text-red-500 text-[11px] mt-1 font-semibold">{form.formState.errors.firstName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                                                <Input className="h-11 shadow-sm bg-muted/10 border-border/50 focus-visible:ring-primary/20 font-medium" {...form.register("lastName")} />
                                            </div>
                                            
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Identity</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3.5 top-11/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                                    <Input disabled className="h-11 pl-10 shadow-sm bg-muted/30 text-muted-foreground border-border/50 cursor-not-allowed font-medium" type="email" {...form.register("email")} />
                                                </div>
                                            </div>
 
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                                    <Input className="h-11 pl-10 shadow-sm bg-muted/10 border-border/50 focus-visible:ring-primary/20 font-medium" {...form.register("phone")} />
                                                </div>
                                            </div>
 
                                            {user?.role !== "SUPER_ADMIN" && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender Identity</Label>
                                                    <Select onValueChange={(val) => form.setValue("gender", val)} value={form.watch("gender") || ""}>
                                                        <SelectTrigger className="h-11 shadow-sm bg-muted/10 border-border/50 focus-visible:ring-primary/20 font-medium px-4">
                                                            <SelectValue placeholder="Select Gender" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl shadow-xl border-border">
                                                            <SelectItem value="MALE" className="rounded-lg py-2.5 font-bold cursor-pointer">Male Participant</SelectItem>
                                                            <SelectItem value="FEMALE" className="rounded-lg py-2.5 font-bold cursor-pointer">Female Participant</SelectItem>
                                                            <SelectItem value="OTHER" className="rounded-lg py-2.5 font-bold cursor-pointer">Unspecified / Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Save Button for Personal Info */}
                        {activeTab === "personal" && (
                            <div className="mt-6 flex justify-end">
                                <Button type="submit" size="lg" className="px-10 h-12 font-bold shadow-md rounded-xl w-full md:w-auto transition-all" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                    Save Profile Details
                                </Button>
                            </div>
                        )}
                    </form>

                    {/* TAB: SECURITY */}
                    {activeTab === "security" && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            
                            {/* Two-Factor Authentication Block */}
                            <Card className="border border-border shadow-sm overflow-hidden rounded-xl">
                                <CardHeader className="bg-muted/30 border-b border-border px-8 py-6 flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                                            <div className={cn(
                                                "h-9 w-9 rounded-lg flex items-center justify-center shadow-sm",
                                                user?.isTwoFactorEnabled ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                                            )}>
                                                {user?.isTwoFactorEnabled ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                            </div>
                                            Two-Factor Authentication
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium">Protect your account with an extra layer of security.</CardDescription>
                                    </div>
                                    <Switch
                                        checked={user?.isTwoFactorEnabled}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setIsTwoFactorModalOpen(true);
                                                request2FAMutation.mutate();
                                            } else {
                                                disable2FAMutation.mutate();
                                            }
                                        }}
                                        disabled={request2FAMutation.isPending || disable2FAMutation.isPending}
                                    />
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-4">
                                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                                Enabling Two-Factor Authentication (2FA) adds a critical security layer. Every time you log in, you will be required to enter a secure code sent to your verified email address.
                                            </p>
                                            <div className="flex flex-wrap gap-4 pt-2">
                                                {user?.isTwoFactorEnabled ? (
                                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                                                        <ShieldCheck className="h-3.5 w-3.5" /> Security Optimized
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-500/20">
                                                        <ShieldAlert className="h-3.5 w-3.5" /> Vulnerability Detected
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 rounded-xl p-6 border border-border/50 flex flex-col justify-center items-center text-center space-y-2">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                                <KeyRound className="h-5 w-5" />
                                            </div>
                                            <h5 className="font-bold text-sm">Mandatory Protocol</h5>
                                            <p className="text-xs text-muted-foreground">Highly recommended for all administrative personnel.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Passkey Management Block */}
                            <Card className="border border-border shadow-sm overflow-hidden rounded-xl">
                                <CardHeader className="bg-muted/30 border-b border-border px-8 py-6">
                                    <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Fingerprint className="h-5 w-5" />
                                        </div>
                                        Passkeys & Biometrics
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium">Use your device fingerprint or face ID for instant, passwordless access.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/50 pb-8 mb-8">
                                        <div className="space-y-2 max-w-lg">
                                            <h4 className="font-bold text-sm">Hardware-Level Security</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                Passkeys are a safer and easier replacement for passwords. With passkeys, you can sign in to your portal using your fingerprint, face, or screen lock.
                                            </p>
                                        </div>
                                        <Button 
                                            type="button" 
                                            onClick={handleRegisterPasskey}
                                            disabled={isUploading}
                                            className="h-12 px-8 font-bold border-2 border-primary/20 hover:border-primary/50 transition-all rounded-xl shadow-lg bg-background text-foreground hover:bg-muted group"
                                        >
                                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Fingerprint className="mr-2 h-5 w-5 text-primary group-hover:scale-110 transition-transform" />}
                                            Add New Passkey
                                        </Button>
                                    </div>

                                    <div className="space-y-4">
                                        <h5 className="text-xs font-bold uppercase tracking-widest text-muted-foreground pl-1">Registered Devices</h5>
                                        {isPasskeysLoading ? (
                                            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary/40" /></div>
                                        ) : passkeysRes?.length > 0 ? (
                                            <div className="grid gap-3">
                                                {passkeysRes.map((pk: any) => (
                                                    <div key={pk.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50 group hover:border-primary/30 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                                <Smartphone className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold capitalize">{pk.credentialDeviceType} Device</p>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                                        <Calendar className="h-3 w-3" />
                                                                        Added {new Date(pk.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                    {pk.credentialBackedUp && (
                                                                        <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Synced</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                                            onClick={() => deletePasskeyMutation.mutate(pk.id)}
                                                            disabled={deletePasskeyMutation.isPending}
                                                        >
                                                            {deletePasskeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border">
                                                <Fingerprint className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                                                <p className="text-sm font-medium text-muted-foreground">No passkeys registered yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
 
                            <Card className="border border-destructive/20 shadow-sm overflow-hidden rounded-xl">
                                <CardHeader className="bg-destructive/5 border-b border-destructive/10 px-8 py-6">
                                    <CardTitle className="text-xl font-bold tracking-tight text-destructive flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                                            <Lock className="h-4 w-4" />
                                        </div>
                                        Security Credentials
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium">Update the master password used to access your vault.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-6 max-w-xl">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                                            <Input type="password" placeholder="••••••••" className="h-11 shadow-sm bg-muted/10 border-border/50 font-mono text-lg tracking-widest" {...passwordForm.register("oldPassword")} />
                                            {passwordForm.formState.errors.oldPassword && <p className="text-red-500 text-[11px] mt-1 font-semibold">{passwordForm.formState.errors.oldPassword.message}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                                <Input type="password" placeholder="••••••••" className="h-11 shadow-sm bg-muted/10 border-border/50 font-mono text-lg tracking-widest" {...passwordForm.register("newPassword")} />
                                                {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-[11px] mt-1 font-semibold">{passwordForm.formState.errors.newPassword.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                                                <Input type="password" placeholder="••••••••" className="h-11 shadow-sm bg-muted/10 border-border/50 font-mono text-lg tracking-widest" {...passwordForm.register("confirmPassword")} />
                                                {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-[11px] mt-1 font-semibold">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                            </div>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" size="lg" variant="destructive" className="w-full md:w-auto px-10 h-11 font-bold shadow-md rounded-xl transition-all" disabled={updatePasswordMutation.isPending}>
                                                {updatePasswordMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                                                Update Password
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* TWO FACTOR AUTH MODAL */}
            <Dialog open={isTwoFactorModalOpen} onOpenChange={(open) => {
                if (!open && !verify2FAMutation.isPending) setIsTwoFactorModalOpen(false);
            }}>
                <DialogContent className="sm:max-w-md border-border rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            {request2FAMutation.isPending ? (
                                <><Loader2 className="h-5 w-5 text-primary animate-spin" /> Preparing Security OTP...</>
                            ) : (
                                <><ShieldCheck className="h-5 w-5 text-primary" /> Verification Required</>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {request2FAMutation.isPending 
                                ? "We are generating a secure code for your identity verification..." 
                                : <>We&apos;ve sent a 6-digit code to <strong className="text-foreground">{user?.email}</strong>.</>
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Auth Code</Label>
                            <Input 
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                placeholder="000000"
                                className="h-12 text-center text-2xl font-mono tracking-[0.4em] bg-muted/20 border-border focus-visible:ring-primary/20"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsTwoFactorModalOpen(false)} 
                            disabled={verify2FAMutation.isPending}
                            className="font-bold h-10 rounded-lg px-6"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => verify2FAMutation.mutate()} 
                            disabled={otpCode.length !== 6 || verify2FAMutation.isPending || request2FAMutation.isPending}
                            className="font-bold h-10 rounded-lg px-6 shadow-sm"
                        >
                            {verify2FAMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Verify & Activate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* IMAGE ADJUSTER MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[480px] border-border rounded-xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight">Adjust Portrait</DialogTitle>
                        <DialogDescription className="text-xs font-medium">
                            Position your profile image within the frame.
                        </DialogDescription>
                    </DialogHeader>
 
                    <div className="relative h-[320px] w-full bg-muted/30 rounded-lg overflow-hidden my-4 border border-border">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc || undefined}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels)}
                                onZoomChange={setZoom}
                                showGrid={false}
                                cropShape="round"
                            />
                        )}
                    </div>
 
                    <div className="space-y-2 mt-4">
                        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>Zoom Out</span>
                            <span>Zoom In</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.05}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                        />
                    </div>
 
                    <DialogFooter className="mt-6 gap-3">
                        <Button variant="outline" className="font-bold h-10 rounded-lg border-border" onClick={() => setIsModalOpen(false)} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleProcessImage} disabled={isUploading} className="font-bold h-10 px-8 rounded-lg shadow-sm transition-all">
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Apply Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AppearanceTab({ active }: { active: boolean }) {
    const { 
        primaryColor, setPrimaryColor, 
        sidebarColor, setSidebarColor,
        navbarColor, setNavbarColor,
        canvasColor, setCanvasColor,
        currentThemeId, setTheme,
        resetAll
    } = useThemeColor();
    const [showAllThemes, setShowAllThemes] = useState(false);

    if (!active) return null;

    // Filter themes to show versions that match the current primary mode
    // To keep it clean, we show the 8 main variants first, then others on "See More"
    const visibleThemes = showAllThemes 
        ? THEME_PRESETS 
        : THEME_PRESETS.slice(0, 8); 

    return (
        <div className="max-w-[1200px] animate-in slide-in-from-right-4 duration-500 space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                        <Palette className="h-6 w-6 text-primary" /> Visual Identity & Themes
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">Select a professional preset or craft your unique brand aesthetic.</p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetAll}
                    className="h-10 px-6 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all shadow-sm border-dashed"
                >
                    Reset All Identity
                </Button>
            </div>

            {/* Theme Presets Gallery */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="h-4 w-1 bg-primary rounded-full" />
                    <Label className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Professional Presets</Label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {visibleThemes.map((theme: ThemePreset) => (
                        <button
                            key={theme.id}
                            onClick={() => setTheme(theme.id)}
                            className={cn(
                                "group relative flex flex-col items-start p-3 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden bg-white dark:bg-zinc-950 shadow-sm",
                                currentThemeId === theme.id 
                                    ? "border-primary ring-4 ring-primary/5 scale-[1.02]" 
                                    : "border-border/40 hover:border-primary/40 hover:shadow-md"
                            )}
                        >
                            <div className="w-full h-24 rounded-xl mb-3 overflow-hidden relative border border-border/10">
                                {/* Preview Mockup */}
                                <div className="absolute inset-0 flex">
                                    <div className="w-1/3 h-full border-r border-border/5" style={{ backgroundColor: theme.sidebar }}>
                                        <div className="h-full w-full opacity-20 bg-[radial-gradient(circle_at_20%_20%,#fff_0,transparent_50%)]" />
                                    </div>
                                    <div className="flex-1 h-full p-2 flex flex-col gap-1.5" style={{ backgroundColor: theme.canvas }}>
                                        <div className="h-2 w-full rounded-[2px]" style={{ backgroundColor: theme.navbar }} />
                                        <div className="flex gap-1.5 items-start mt-1">
                                            <div className="h-10 flex-1 rounded-md shadow-sm border border-border/10 bg-white dark:bg-zinc-950 p-1">
                                                <div className="h-1 w-1/2 rounded-full mb-1" style={{ backgroundColor: theme.primary }} />
                                                <div className="h-0.5 w-full bg-border/20 rounded-full mb-0.5" />
                                                <div className="h-0.5 w-2/3 bg-border/20 rounded-full" />
                                            </div>
                                            <div className="h-6 w-4 rounded-md border border-border/10 bg-white dark:bg-zinc-950" />
                                        </div>
                                    </div>
                                </div>
                                {currentThemeId === theme.id && (
                                    <div className="absolute top-2 right-2 h-5 w-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                        <CheckCircle2 className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-black tracking-tight">{theme.name}</span>
                                <Badge variant="outline" className="text-[8px] h-3.5 px-1 uppercase font-bold opacity-50 group-hover:opacity-100 transition-opacity">
                                    {theme.mode}
                                </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">{theme.description}</span>
                        </button>
                    ))}
                </div>

                {!showAllThemes && THEME_PRESETS.length > 8 && (
                    <div className="flex justify-center pt-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setShowAllThemes(true)}
                            className="group font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all rounded-xl px-8"
                        >
                            Explore All 36 Professional Styles
                            <ChevronDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                        </Button>
                    </div>
                )}
                
                {showAllThemes && (
                    <div className="flex justify-center pt-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => setShowAllThemes(false)}
                            className="group font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary/5 hover:text-primary transition-all rounded-xl px-8"
                        >
                            Show Less
                            <ChevronUp className="ml-2 h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Advanced Branding Kit */}
            <div className="pt-10 border-t border-border/40 space-y-8">
                <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <ImageIcon className="h-3.5 w-3.5" />
                        </div>
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/60">Pro Brand Kit Editor</Label>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium ml-9">Precisely define your institution&apos;s HEX identity for internal and public touchpoints.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Primary Brand Color */}
                    <ColorControl 
                        label="Primary Identity" 
                        value={primaryColor || "#0F172A"} 
                        onChange={setPrimaryColor} 
                        onReset={() => setPrimaryColor(null)}
                        description="Buttons & Accents"
                    />

                    {/* Sidebar Brand Color */}
                    <ColorControl 
                        label="Sidebar Surface" 
                        value={sidebarColor || "#FFFFFF"} 
                        onChange={setSidebarColor} 
                        onReset={() => setSidebarColor(null)}
                        description="Navigation Layout"
                    />

                    {/* Navbar Brand Color */}
                    <ColorControl 
                        label="Toolbar Surface" 
                        value={navbarColor || "#FFFFFF"} 
                        onChange={setNavbarColor} 
                        onReset={() => setNavbarColor(null)}
                        description="Top Header Bar"
                    />

                    {/* Canvas Background Color */}
                    <ColorControl 
                        label="Canvas Layout" 
                        value={canvasColor || "#F8FAFC"} 
                        onChange={setCanvasColor} 
                        onReset={() => setCanvasColor(null)}
                        description="Main Background"
                    />
                </div>
            </div>

            {/* Contrast Guard Footer */}
            <div className="mt-12 group">
                <div className="relative overflow-hidden p-5 border border-primary/20 rounded-2xl bg-gradient-to-br from-primary/[0.04] to-transparent backdrop-blur-sm transition-all hover:bg-primary/[0.06]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-primary uppercase tracking-[0.25em]">Algorithm-Powered Readability</p>
                            <p className="text-[12px] text-muted-foreground font-medium leading-relaxed max-w-[500px]">
                                Our engine calculates the <span className="text-foreground font-bold">Luminance Density</span> of your surfaces and automatically re-maps foreground tokens to maintain WCAG-grade accessibility.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ColorControl({ label, value, onChange, onReset, description }: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    onReset: () => void,
    description: string 
}) {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(value);
        toast.success(`Copied: ${value}`);
    };

    return (
        <Card className="border-border/60 shadow-none rounded-2xl overflow-hidden bg-white/50 dark:bg-zinc-950/50 transition-all hover:border-primary/40 group">
            <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-0.5">
                        <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/40">{label}</Label>
                        <span className="text-[10px] text-muted-foreground/60 font-bold">{description}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {/* Visual Picker */}
                    <div className="relative h-11 w-11 rounded-xl border border-border/60 overflow-hidden shadow-sm group-hover:border-primary/40 transition-all cursor-pointer">
                        <input 
                            type="color" 
                            value={value} 
                            onChange={(e) => onChange(e.target.value)} 
                            className="absolute inset-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none bg-transparent" 
                        />
                    </div>

                    {/* HEX Input Field */}
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 font-mono">#</span>
                        <Input 
                            value={value.replace('#', '').toUpperCase()} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                                    onChange(`#${val}`);
                                }
                            }}
                            className="h-11 pl-7 pr-10 text-[11px] font-mono font-black border-border/40 rounded-xl focus-visible:ring-primary/10 bg-zinc-50/50 dark:bg-zinc-900/50"
                            maxLength={6}
                        />
                        <button 
                            onClick={copyToClipboard}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-primary transition-colors"
                        >
                            <ImageIcon className="h-3 w-3" />
                        </button>
                    </div>
                    
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={onReset} 
                        className="h-11 w-11 rounded-xl hover:bg-destructive/5 hover:text-destructive transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ShieldAlert className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
