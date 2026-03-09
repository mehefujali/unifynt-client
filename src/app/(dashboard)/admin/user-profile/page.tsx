/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Loader2,
    UserCircle,
    Lock,
    ShieldCheck,
    CheckCircle2,
    Mail,
    User as UserIcon,
    Phone
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ImageCropper from "@/components/ui/image-cropper";

import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";

const userProfileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional().or(z.literal("")),
    phone: z.string().optional().or(z.literal("")),
    profileImage: z.any().optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function UserProfilePage() {
    const queryClient = useQueryClient();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [activeTab, setActiveTab] = useState("account");

    const profileForm = useForm<UserProfileFormValues>({
        resolver: zodResolver(userProfileSchema),
    });

    const passwordForm = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
    });

    useEffect(() => {
        if (user) {
            profileForm.reset({
                firstName: user.details?.firstName || user.name?.split(" ")[0] || "",
                lastName: user.details?.lastName || user.name?.split(" ").slice(1).join(" ") || "",
                phone: user.details?.phone || "",
                profileImage: user.details?.profileImage || (user as any).profileImage || undefined,
            });
        }
    }, [user, profileForm]);

    const updateProfileMutation = useMutation({
        mutationFn: async (data: UserProfileFormValues) => {
            const formData = new FormData();
            const { profileImage, ...restData } = data;

            formData.append("data", JSON.stringify(restData));

            if (profileImage && profileImage instanceof File) {
                formData.append("profileImage", profileImage);
            }

            const res = await api.patch("/user/update-profile", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Personal profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
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
            toast.success("Password updated successfully!");
            passwordForm.reset();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Incorrect current password"),
    });

    if (isAuthLoading) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                    <UserCircle className="h-8 w-8 text-primary" /> My Profile
                </h1>
                <p className="text-muted-foreground mt-2 text-sm font-medium">Manage your personal information, contact details, and account security.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 shrink-0">
                    <div className="sticky top-8 bg-background border shadow-sm rounded-xl p-3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                            <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                                <TabsTrigger value="account" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all">
                                    <UserIcon className="mr-3 h-4 w-4" /> Personal Details
                                </TabsTrigger>
                                <Separator className="my-2 opacity-50" />
                                <TabsTrigger value="security" className="w-full justify-start px-4 py-3.5 text-sm font-bold rounded-lg data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive data-[state=active]:shadow-none hover:bg-muted transition-all text-muted-foreground">
                                    <ShieldCheck className="mr-3 h-4 w-4" /> Security & Password
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                <div className="flex-1">
                    {activeTab === "account" && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <Card className="border-border/60 shadow-sm overflow-hidden rounded-xl">
                                <CardHeader className="bg-muted/30 border-b px-8 py-6">
                                    <CardTitle className="text-xl">Personal Information</CardTitle>
                                    <CardDescription>Update your display name and profile picture.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={profileForm.handleSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-8">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-8 border-b border-border/50">
                                            <div className="shrink-0">
                                                <Controller
                                                    control={profileForm.control}
                                                    name="profileImage"
                                                    render={({ field }) => (
                                                        <ImageCropper
                                                            aspectRatio={1}
                                                            shape="round"
                                                            label="Change Photo"
                                                            previewUrl={user?.details?.profileImage || (user as any)?.profileImage}
                                                            onCrop={(file) => field.onChange(file)}
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-extrabold text-lg">Profile Picture</h4>
                                                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">This image will be visible on your dashboard and communications. Use a square, clear photo.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10 font-medium" {...profileForm.register("firstName")} />
                                                {profileForm.formState.errors.firstName && <p className="text-red-500 text-xs font-semibold mt-1">{profileForm.formState.errors.firstName.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name</Label>
                                                <Input className="h-12 shadow-sm bg-muted/10 font-medium" {...profileForm.register("lastName")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between">Email Address <span className="text-[10px] text-zinc-400 font-normal">(Read Only)</span></Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="h-12 pl-10 shadow-sm bg-muted/20 text-muted-foreground cursor-not-allowed" value={user?.email || ""} readOnly disabled />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input className="h-12 pl-10 shadow-sm bg-muted/10" {...profileForm.register("phone")} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end">
                                            <Button type="submit" size="lg" className="px-10 h-12 font-extrabold shadow-md w-full md:w-auto" disabled={updateProfileMutation.isPending}>
                                                {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                                Save Profile Details
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <Card className="border-border/60 shadow-sm overflow-hidden rounded-xl border-destructive/20">
                                <CardHeader className="bg-destructive/5 border-b border-destructive/10 px-8 py-6">
                                    <CardTitle className="text-xl text-destructive flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle>
                                    <CardDescription>Update the password used to access your account.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8">
                                    <form onSubmit={passwordForm.handleSubmit((data) => updatePasswordMutation.mutate(data))} className="space-y-6 max-w-xl">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
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
                                            <Button type="submit" size="lg" variant="destructive" className="w-full md:w-auto px-10 h-12 font-extrabold shadow-md" disabled={updatePasswordMutation.isPending}>
                                                {updatePasswordMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
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
        </div>
    );
}