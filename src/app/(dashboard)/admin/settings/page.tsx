/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Save, Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteConfigService } from "@/services/site-config.service";
import { PreviewRenderer } from "./builder/preview-renderer";


const defaultSections = [
    {
        type: "TOPBAR",
        isVisible: true,
        content: { location: "Kolkata, India", phone: "+91 9876543210", email: "info@school.com", noticeText: "Admissions Open for 2026" }
    },
    {
        type: "HERO",
        isVisible: true,
        content: { heading: "Empowering Future Leaders", subtitle: "Welcome to Excellence", description: "Providing world-class education with holistic development.", bgImage: "" }
    },
    {
        type: "ABOUT",
        isVisible: true,
        content: { heading: "Our Legacy", description: "We have been serving the community for over 25 years.", image1: "" }
    },
    {
        type: "FOOTER",
        isVisible: true,
        content: { aboutText: "Dedicated to excellence in education.", address: "123 School Street", phone: "+91 9876543210", email: "contact@school.com", copyright: "© 2026 School Name. All rights reserved." }
    }
];

export default function BuilderPage() {
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
    const [config, setConfig] = useState<any>({
        primaryColor: "#0f172a",
        secondaryColor: "#d4af37",
        schoolName: "My School",
        sections: defaultSections
    });

    const { register, handleSubmit, reset, watch, setValue } = useForm();

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await SiteConfigService.getSiteConfig();
                if (data && data.gjsAssets) {
                    const parsed = typeof data.gjsAssets === 'string' ? JSON.parse(data.gjsAssets) : data.gjsAssets;
                    setConfig(parsed);
                    reset(parsed);
                }
            } catch (error) {
                console.error("Failed to fetch config");
            }
        };
        fetchConfig();
    }, [reset]);

    useEffect(() => {
        const subscription = watch((value) => {
            setConfig((prev: any) => ({ ...prev, ...value }));
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            await SiteConfigService.saveBuilderData({
                gjsAssets: data,
                gjsHtml: "Wait",
                gjsCss: "Wait",
                gjsComponents: undefined,
                gjsStyles: undefined
            });
            toast.success("Website configuration saved successfully!");
        } catch (error) {
            toast.error("Failed to save configuration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <div className="w-[400px] border-r bg-background overflow-y-auto p-4 shrink-0">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold">Website Builder</h2>
                    <Button onClick={handleSubmit(onSubmit)} disabled={loading} size="sm">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                    </Button>
                </div>

                <form className="space-y-6">
                    <Card>
                        <CardHeader className="py-3">
                            <CardTitle className="text-sm">Global Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <Label>School Name</Label>
                                <Input {...register("schoolName")} placeholder="Enter School Name" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label>Primary Color</Label>
                                    <Input type="color" {...register("primaryColor")} className="h-10 cursor-pointer" />
                                </div>
                                <div>
                                    <Label>Secondary Color</Label>
                                    <Input type="color" {...register("secondaryColor")} className="h-10 cursor-pointer" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="HERO" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="TOPBAR">Top</TabsTrigger>
                            <TabsTrigger value="HERO">Hero</TabsTrigger>
                            <TabsTrigger value="ABOUT">About</TabsTrigger>
                            <TabsTrigger value="FOOTER">Footer</TabsTrigger>
                        </TabsList>

                        <TabsContent value="TOPBAR" className="space-y-3 mt-4">
                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input {...register("sections.0.content.location")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input {...register("sections.0.content.phone")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input {...register("sections.0.content.email")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Notice Text</Label>
                                <Input {...register("sections.0.content.noticeText")} />
                            </div>
                        </TabsContent>

                        <TabsContent value="HERO" className="space-y-3 mt-4">
                            <div className="space-y-2">
                                <Label>Heading</Label>
                                <Input {...register("sections.1.content.heading")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Subtitle</Label>
                                <Input {...register("sections.1.content.subtitle")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea {...register("sections.1.content.description")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Background Image URL</Label>
                                <Input {...register("sections.1.content.bgImage")} placeholder="https://..." />
                            </div>
                        </TabsContent>

                        <TabsContent value="ABOUT" className="space-y-3 mt-4">
                            <div className="space-y-2">
                                <Label>Heading</Label>
                                <Input {...register("sections.2.content.heading")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea {...register("sections.2.content.description")} rows={5} />
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input {...register("sections.2.content.image1")} placeholder="https://..." />
                            </div>
                        </TabsContent>

                        <TabsContent value="FOOTER" className="space-y-3 mt-4">
                            <div className="space-y-2">
                                <Label>About Footer Text</Label>
                                <Textarea {...register("sections.3.content.aboutText")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input {...register("sections.3.content.address")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Copyright</Label>
                                <Input {...register("sections.3.content.copyright")} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>

            <div className="flex-1 bg-slate-100 flex flex-col relative">
                <div className="h-12 border-b bg-white flex items-center justify-center gap-4 px-4 shadow-sm z-10">
                    <Button variant={previewMode === "desktop" ? "default" : "ghost"} size="icon" onClick={() => setPreviewMode("desktop")}><Monitor size={18} /></Button>
                    <Button variant={previewMode === "tablet" ? "default" : "ghost"} size="icon" onClick={() => setPreviewMode("tablet")}><Tablet size={18} /></Button>
                    <Button variant={previewMode === "mobile" ? "default" : "ghost"} size="icon" onClick={() => setPreviewMode("mobile")}><Smartphone size={18} /></Button>
                </div>

                <div className="flex-1 overflow-auto flex justify-center p-8">
                    <div
                        className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden ${previewMode === "mobile" ? "w-[375px] h-[812px] rounded-3xl border-8 border-slate-800" :
                            previewMode === "tablet" ? "w-[768px] h-[1024px] rounded-xl border-4 border-slate-800" :
                                "w-full h-full rounded-none"
                            }`}
                    >
                        <PreviewRenderer config={config} />
                    </div>
                </div>
            </div>
        </div>
    );
}