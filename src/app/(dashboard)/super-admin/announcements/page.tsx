"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Megaphone, UploadCloud, CheckCircle2, ShieldInfo } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import api from "@/lib/axios";

export default function SuperAdminAnnouncementsPage() {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: announcement, isLoading, isError } = useQuery({
        queryKey: ["systemAnnouncement"],
        queryFn: async () => {
            const res = await api.get("/system-announcements");
            return res.data.data;
        },
    });

    const form = useForm({
        defaultValues: {
            isActive: false,
            heading: "",
            description: "",
            buttonText: "",
            buttonLink: "",
        },
    });

    useEffect(() => {
        if (announcement) {
            form.reset({
                isActive: announcement.isActive || false,
                heading: announcement.heading || "",
                description: announcement.description || "",
                buttonText: announcement.buttonText || "",
                buttonLink: announcement.buttonLink || "",
            });
            if (announcement.image) {
                setImagePreview(announcement.image);
            }
        }
    }, [announcement, form]);

    const isActiveWatched = form.watch("isActive");

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            const formData = new FormData();
            formData.append("isActive", String(data.isActive));
            if (data.heading) formData.append("heading", data.heading);
            if (data.description) formData.append("description", data.description);
            if (data.buttonText) formData.append("buttonText", data.buttonText);
            if (data.buttonLink) formData.append("buttonLink", data.buttonLink);

            if (fileInputRef.current?.files?.[0]) {
                formData.append("image", fileInputRef.current.files[0]);
            }

            return api.patch("/system-announcements", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onSuccess: () => {
            toast.success("System announcement updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["systemAnnouncement"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update announcement");
        },
        onSettled: () => {
            setIsUploading(false);
        }
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setImagePreview(reader.result?.toString() || null);
        });
        reader.readAsDataURL(file);
    };

    const onSubmit = (data: any) => {
        setIsUploading(true);
        updateMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground font-medium text-center">Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <ShieldInfo className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Connection failed</h3>
                            <p className="text-sm text-muted-foreground">Unable to fetch announcement configuration.</p>
                        </div>
                        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["systemAnnouncement"] })}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Global Announcement</h2>
                    <p className="text-sm text-muted-foreground">
                        Configure the pop-up modal that appears on all admin dashboards.
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                    <Label className="text-sm font-bold text-muted-foreground mr-2" htmlFor="isActive">
                        {isActiveWatched ? "ACTIVE" : "DISABLED"}
                    </Label>
                    <Switch
                        id="isActive"
                        checked={isActiveWatched}
                        onCheckedChange={(v) => form.setValue("isActive", v)}
                    />
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border py-4">
                                <CardTitle className="text-base font-bold uppercase tracking-wider text-foreground">Content Builder</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Main Heading</Label>
                                    <Input 
                                        className="h-12 bg-muted/20 rounded-xl" 
                                        placeholder="E.g. System Maintenance Update" 
                                        {...form.register("heading")} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Detailed Description</Label>
                                    <Textarea 
                                        className="min-h-[160px] bg-muted/20 rounded-xl resize-none" 
                                        placeholder="Provide comprehensive details about this announcement..." 
                                        {...form.register("description")} 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Button Text</Label>
                                        <Input 
                                            className="h-11 bg-muted/20 rounded-xl" 
                                            placeholder="E.g. Read More" 
                                            {...form.register("buttonText")} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Redirect Link</Label>
                                        <Input 
                                            className="h-11 bg-muted/20 rounded-xl" 
                                            placeholder="https://..." 
                                            {...form.register("buttonLink")} 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border py-4">
                                <CardTitle className="text-base font-bold uppercase tracking-wider text-foreground">Media Assets</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div
                                    className="relative group cursor-pointer aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden bg-muted/30 flex items-center justify-center transition-colors hover:bg-muted/50 hover:border-primary/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-muted-foreground p-4 text-center">
                                            <UploadCloud className="h-8 w-8 mb-2 opacity-50" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Select Banner Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <UploadCloud className="h-6 w-6 text-white" />
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                                </div>
                                
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-foreground">Format Requirement</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Upload a landscape banner (16:9). This will be displayed as the header of the announcement card.
                                    </p>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        className="w-full mt-2 font-bold h-9 rounded-lg" 
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Change Image
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                className="w-full h-12 font-bold shadow-sm rounded-xl transition-all" 
                                disabled={updateMutation.isPending || isUploading}
                            >
                                {(updateMutation.isPending || isUploading) ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Save & Deploy
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
