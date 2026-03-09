"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Megaphone, UploadCloud, CheckCircle2 } from "lucide-react";

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

    const { data: announcement, isLoading } = useQuery({
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
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 lg:py-12 px-6 animate-in fade-in duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                        <Megaphone className="h-8 w-8 text-primary" /> Global Announcement
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm font-medium">
                        Configure the pop-up modal that appears on all admin dashboards.
                    </p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card className="border-border/60 shadow-sm overflow-hidden rounded-2xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                    <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50 px-8 py-6 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Announcement Settings</CardTitle>
                            <CardDescription>Design the content of your modal</CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Label className="font-bold text-sm cursor-pointer" htmlFor="isActive">Active Status</Label>
                            <Switch
                                id="isActive"
                                checked={isActiveWatched} // Use the watched value
                                onCheckedChange={(v) => form.setValue("isActive", v)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Image Uploader */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pb-8 border-b border-zinc-200/50 dark:border-zinc-800/50">
                            <div
                                className="relative group cursor-pointer shrink-0 w-48 h-32 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-400 p-4text-center">
                                        <UploadCloud className="h-8 w-8 mb-2" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Select Image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <UploadCloud className="h-8 w-8 text-white" />
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                            </div>
                            <div className="space-y-3 flex-1">
                                <h4 className="font-extrabold text-lg">Banner Image</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">Upload a wide banner image to be displayed at the top of the announcement modal. Recommended ratio 16:9.</p>
                                <Button type="button" variant="outline" size="sm" className="mt-2 shadow-sm font-bold h-10 px-6 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900" onClick={() => fileInputRef.current?.click()}>
                                    Choose Image
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Heading</Label>
                                <Input className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl" placeholder="E.g. System Maintenance Update" {...form.register("heading")} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Detailed Description</Label>
                                <Textarea className="min-h-[120px] shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl resize-none" placeholder="Provide details about this announcement..." {...form.register("description")} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Action Button Text (Optional)</Label>
                                    <Input className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl" placeholder="E.g. Read More" {...form.register("buttonText")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Action Button Link (Optional)</Label>
                                    <Input className="h-12 shadow-sm bg-zinc-50 dark:bg-zinc-900/50 rounded-xl" placeholder="https://" {...form.register("buttonLink")} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" className="px-10 h-14 font-extrabold shadow-xl hover:shadow-primary/50 text-[15px] rounded-2xl w-full md:w-auto transition-all" disabled={updateMutation.isPending || isUploading}>
                        {(updateMutation.isPending || isUploading) ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                        Publish Announcement
                    </Button>
                </div>
            </form>
        </div>
    );
}
