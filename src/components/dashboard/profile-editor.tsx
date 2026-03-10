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
    ShieldAlert
} from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
            setIsTwoFactorModalOpen(true);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to request 2FA"),
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
                <div className="w-full xl:w-72 shrink-0">
                    <div className="sticky top-8 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm rounded-2xl p-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                                <TabsTrigger value="personal" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all">
                                    <UserIcon className="mr-3 h-4 w-4" /> Personal Information
                                </TabsTrigger>
                                <Separator className="my-2 opacity-50" />
                                <TabsTrigger value="security" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-xl data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-all text-muted-foreground">
                                    <Lock className="mr-3 h-4 w-4" /> Account Security
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Main Content Form */}
                <div className="flex-1">
                    <form id="profile-form" onSubmit={form.handleSubmit((data) => updateProfileMutation.mutate(data))}>

                        {/* TAB: PERSONAL INFO */}
                        {activeTab === "personal" && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-8 py-6">
                                        <CardTitle className="text-xl">Basic Details</CardTitle>
                                        <CardDescription>Update your photo and fundamental profile information.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-8 border-b border-zinc-200/50 dark:border-zinc-800/50">
                                            <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                                                <Avatar className="h-32 w-32 border-4 border-white dark:border-zinc-950 shadow-lg group-hover:scale-105 transition-all bg-zinc-100 dark:bg-zinc-900">
                                                    <AvatarImage src={currentLogo} alt="Profile Picture" className="object-cover" />
                                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-4xl font-extrabold">
                                                        {form.getValues("firstName")?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                                    <ImageIcon className="h-8 w-8 text-white" />
                                                </div>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-extrabold text-lg">Profile Picture</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">Upload a square image to uniquely identify your account across the workspace.</p>
                                                <Button type="button" variant="outline" size="sm" className="mt-2 shadow-sm font-bold h-10 px-6 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                                    {isUploading ? "Uploading..." : "Upload New Photo"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">First Name</Label>
                                                <Input className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/20 font-medium text-[15px]" {...form.register("firstName")} />
                                                {form.formState.errors.firstName && <p className="text-red-500 text-xs mt-1 font-semibold">{form.formState.errors.firstName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Last Name</Label>
                                                <Input className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/20 font-medium text-[15px]" {...form.register("lastName")} />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Current Email Address</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                                    <Input disabled className="h-12 pl-12 shadow-sm bg-zinc-100 dark:bg-zinc-900/80 text-muted-foreground rounded-xl border-zinc-200 dark:border-zinc-800 cursor-not-allowed font-medium text-[15px]" type="email" {...form.register("email")} />
                                                </div>
                                                <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider pl-1 font-semibold">* Emails are securely linked to your profile and cannot be changed.</p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="h-12 pl-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/20 font-medium text-[15px]" {...form.register("phone")} />
                                                </div>
                                            </div>
                                            {user?.role !== "SUPER_ADMIN" && (
                                                <div className="space-y-2">
                                                    <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Gender</Label>
                                                    <Select onValueChange={(val) => form.setValue("gender", val)} value={form.watch("gender") || ""}>
                                                        <SelectTrigger className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/20 font-medium text-[15px]">
                                                            <SelectValue placeholder="Select Gender" />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl drop-shadow-2xl">
                                                            <SelectItem value="MALE" className="rounded-lg py-3 cursor-pointer">Male</SelectItem>
                                                            <SelectItem value="FEMALE" className="rounded-lg py-3 cursor-pointer">Female</SelectItem>
                                                            <SelectItem value="OTHER" className="rounded-lg py-3 cursor-pointer">Other</SelectItem>
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
                        {activeTab !== "security" && (
                            <div className="mt-8 flex justify-end">
                                <Button type="submit" size="lg" className="px-10 h-14 font-extrabold shadow-xl hover:shadow-primary/50 text-[15px] rounded-2xl w-full md:w-auto transition-all" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                    Save Profile Changes
                                </Button>
                            </div>
                        )}
                    </form>

                    {/* TAB: SECURITY */}
                    {activeTab === "security" && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                            
                            {/* Two-Factor Authentication Block */}
                            <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                                <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-8 py-6 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl flex items-center gap-2">
                                            {user?.isTwoFactorEnabled ? <ShieldCheck className="text-green-500 h-5 w-5" /> : <ShieldAlert className="text-orange-500 h-5 w-5" />}
                                            Two-Factor Authentication (2FA)
                                        </CardTitle>
                                        <CardDescription className="mt-1">Add an extra layer of security to your account.</CardDescription>
                                    </div>
                                    <div>
                                        <Switch
                                            checked={user?.isTwoFactorEnabled}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    request2FAMutation.mutate();
                                                } else {
                                                    disable2FAMutation.mutate();
                                                }
                                            }}
                                            disabled={request2FAMutation.isPending || disable2FAMutation.isPending}
                                            className="data-[state=checked]:bg-green-500"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-3xl">
                                        When Two-Factor Authentication is enabled, you will be required to enter a secure 6-digit OTP code sent to your registered email address every time you log in. This heavily restricts unauthorized access to your institution&apos;s data.
                                    </p>
                                    <div className="mt-6">
                                        {user?.isTwoFactorEnabled ? (
                                            <div className="inline-flex items-center gap-2 text-sm font-extrabold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 px-4 py-2 rounded-lg border border-green-200 dark:border-green-500/20">
                                                <CheckCircle2 className="h-4 w-4" /> 2FA is currently Active
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 text-sm font-extrabold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-500/20">
                                                <ShieldAlert className="h-4 w-4" /> 2FA is currently Disabled
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                                <CardHeader className="bg-red-50/50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30 px-8 py-6">
                                    <CardTitle className="text-xl text-red-600 dark:text-red-400 flex items-center gap-2"><Lock className="h-5 w-5" /> Account Credentials</CardTitle>
                                    <CardDescription>Update your personal account password.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-6 max-w-xl">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Current Password</Label>
                                            <Input type="password" placeholder="••••••••" className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-zinc-200 dark:border-zinc-800 font-mono text-lg tracking-widest focus-visible:ring-primary/20" {...passwordForm.register("oldPassword")} />
                                            {passwordForm.formState.errors.oldPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{passwordForm.formState.errors.oldPassword.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> New Password</Label>
                                            <Input type="password" placeholder="••••••••" className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-zinc-200 dark:border-zinc-800 font-mono text-lg tracking-widest focus-visible:ring-primary/20" {...passwordForm.register("newPassword")} />
                                            {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{passwordForm.formState.errors.newPassword.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Confirm New Password</Label>
                                            <Input type="password" placeholder="••••••••" className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border-zinc-200 dark:border-zinc-800 font-mono text-lg tracking-widest focus-visible:ring-primary/20" {...passwordForm.register("confirmPassword")} />
                                            {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                        </div>
                                        <div className="pt-6">
                                            <Button type="submit" size="lg" variant="destructive" className="w-full md:w-auto px-10 h-14 font-extrabold shadow-xl text-[15px] rounded-2xl hover:shadow-red-500/50 transition-all" disabled={updatePasswordMutation.isPending}>
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

            {/* TWO FACTOR AUTH MODAL */}
            <Dialog open={isTwoFactorModalOpen} onOpenChange={(open) => {
                if (!open && !verify2FAMutation.isPending) setIsTwoFactorModalOpen(false);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" /> Setup Verification
                        </DialogTitle>
                        <DialogDescription>
                            We have sent a secure 6-digit OTP code to <strong className="text-foreground">{user?.email}</strong>. Enter it below to enable Two-Factor Authentication.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Verification Code</Label>
                            <Input 
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                placeholder="000000"
                                className="h-14 text-center text-3xl font-mono tracking-[0.5em] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-primary/30"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsTwoFactorModalOpen(false)} 
                            disabled={verify2FAMutation.isPending}
                            className="font-bold border-zinc-200 dark:border-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => verify2FAMutation.mutate()} 
                            disabled={otpCode.length !== 6 || verify2FAMutation.isPending}
                            className="font-extrabold shadow-lg hover:shadow-primary/50"
                        >
                            {verify2FAMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                            Verify & Enable 2FA
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* SMART IMAGE PROCESSING MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tight">Adjust Image</DialogTitle>
                        <DialogDescription className="text-sm font-medium mt-1">
                            Position your profile image perfectly.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative h-[350px] w-full bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden my-4 border border-zinc-200/50 dark:border-zinc-800/50">
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

                    <div className="flex flex-col gap-2 mt-4 px-2">
                        <div className="flex items-center justify-between text-[11px] font-black text-muted-foreground uppercase tracking-widest">
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
                            className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <DialogFooter className="mt-8 gap-3 sm:gap-0">
                        <Button variant="outline" className="font-bold h-12 rounded-xl text-[15px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsModalOpen(false)} disabled={isUploading}>
                            Cancel
                        </Button>
                        <Button onClick={handleProcessImage} disabled={isUploading} className="font-extrabold h-12 px-8 rounded-xl text-[15px] shadow-lg hover:shadow-primary/50 transition-all">
                            {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                            Set Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
