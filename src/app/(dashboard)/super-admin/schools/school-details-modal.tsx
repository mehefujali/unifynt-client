/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Cropper from "react-easy-crop";
import {
    Loader2,
    Building2,
    Globe,
    Receipt,
    ShieldAlert,
    CreditCard,
    Settings2,
    History,
    UploadCloud,
    Palette,
    KeyRound,
    Crop as CropIcon,
    Activity,
    ExternalLink,
    MessageSquare,
    Send
} from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

import { SchoolService } from "@/services/school.service";
import { PlanService } from "@/services/plan.service";
import { TransactionService } from "@/services/transaction.service";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { editSchoolSchema, EditSchoolFormValues, renewSchoolSchema, RenewSchoolFormValues } from "./schema";
import api from "@/lib/axios";

// FIXED: Import the Assign SMS Modal
import { AssignSmsModal } from "./assign-sms-modal";

interface SchoolDetailsModalProps {
    schoolId: string | null;
    onClose: () => void;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous");
        image.src = url;
    });

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File | null> => {
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
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas is empty"));
                return;
            }
            const file = new File([blob], `cropped-logo-${Date.now()}.jpg`, { type: "image/jpeg" });
            resolve(file);
        }, "image/jpeg", 0.95);
    });
};

export function SchoolDetailsModal({ schoolId, onClose }: SchoolDetailsModalProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("overview");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // FIXED: State for the new Assign SMS Modal
    const [isAssignSmsModalOpen, setIsAssignSmsModalOpen] = useState(false);

    const { data: school, isLoading: isSchoolLoading } = useQuery({
        queryKey: ["school", schoolId],
        queryFn: () => SchoolService.getSingleSchool(schoolId as string),
        enabled: !!schoolId,
    });

    const { data: plans, isLoading: isPlansLoading } = useQuery({
        queryKey: ["plans"],
        queryFn: PlanService.getAllPlans,
    });

    const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ["transactions", schoolId],
        queryFn: () => TransactionService.getSchoolTransactions(schoolId as string),
        enabled: !!schoolId && activeTab === "billing",
    });

    const editForm = useForm<EditSchoolFormValues>({
        resolver: zodResolver(editSchoolSchema),
    });

    const renewForm = useForm<RenewSchoolFormValues>({
        resolver: zodResolver(renewSchoolSchema),
        defaultValues: {
            paymentMethod: "CASH",
            studentLimit: 50,
            amount: 0,
        },
    });

    const watchPlanId = renewForm.watch("planId");
    const watchSubscriptionEnd = renewForm.watch("subscriptionEnd");
    const watchLogoUrl = editForm.watch("logo");

    useEffect(() => {
        if (watchPlanId && watchSubscriptionEnd && plans) {
            const selectedPlan = plans.find((p: any) => p.id === watchPlanId);
            if (selectedPlan) {
                const endDate = new Date(watchSubscriptionEnd);
                const startDate = school?.subscriptionEnd && new Date(school.subscriptionEnd) > new Date()
                    ? new Date(school.subscriptionEnd)
                    : new Date();

                const diffTime = endDate.getTime() - startDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const months = Math.max(0, diffDays / 30);

                const calculatedAmount = Math.round(months * selectedPlan.pricePerMonth);
                renewForm.setValue("amount", calculatedAmount);
                renewForm.setValue("studentLimit", selectedPlan.studentLimit);
            }
        }
    }, [watchPlanId, watchSubscriptionEnd, plans, school, renewForm]);

    useEffect(() => {
        if (school && activeTab === "settings") {
            editForm.reset({
                name: school.name,
                slug: school.slug,
                subdomain: school.subdomain,
                customDomain: school.customDomain || "",
                logo: school.logo || "",
                primaryColor: school.primaryColor || "#2563eb",
                secondaryColor: school.secondaryColor || "#1e40af",
                adminPassword: "",
                email: school.email || "",
                phone: school.phone || "",
                website: school.website || "",
                address: school.address || "",
                principalName: school.principalName || "",
                principalPhone: school.principalPhone || "",
                establishedYear: school.establishedYear || new Date().getFullYear(),
                registrationCode: school.registrationCode || "",
                taxId: school.taxId || "",
                billingAddress: school.billingAddress || "",
                timezone: school.timezone || "Asia/Kolkata",
                currency: school.currency || "INR",
                isActive: school.isActive,
                // Removed smsBalance from form reset to avoid submitting it directly
            });
        }
        if (school && activeTab === "renew" && plans?.length) {
            renewForm.reset({
                planId: school.planId || plans[0].id,
                studentLimit: school.studentLimit,
                paymentMethod: "CASH",
                subscriptionEnd: school.subscriptionEnd ? new Date(school.subscriptionEnd).toISOString().split("T")[0] : "",
                amount: 0,
            });
        }
    }, [school, activeTab, editForm, renewForm, plans]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setCropImageSrc(reader.result?.toString() || null);
            setIsCropModalOpen(true);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
        });
        reader.readAsDataURL(file);

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropAndUpload = async () => {
        if (!cropImageSrc || !croppedAreaPixels) return;

        try {
            setIsUploadingLogo(true);
            const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels);

            if (!croppedFile) {
                toast.error("Failed to process cropped image.");
                return;
            }

            const formData = new FormData();
            formData.append("file", croppedFile);

            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                editForm.setValue("logo", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                toast.success("Logo cropped and uploaded successfully");
                setIsCropModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to upload logo");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const updateMutation = useMutation({
        mutationFn: (data: any) => SchoolService.updateSchool(schoolId as string, data),
        onSuccess: () => {
            toast.success("Workspace configuration updated.");
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
            editForm.setValue("adminPassword", "");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update configuration."),
    });

    const onSettingsSubmit = (data: EditSchoolFormValues) => {
        const payload: any = { ...data };
        if (!payload.adminPassword || payload.adminPassword.trim() === "") {
            delete payload.adminPassword;
        }
        updateMutation.mutate(payload);
    };

    const processRenewal = async (data: RenewSchoolFormValues) => {
        if (data.paymentMethod === "ONLINE") {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error("Failed to load secure payment gateway.");
                return;
            }
            try {
                const order = await SchoolService.createRazorpayOrder(schoolId as string, {
                    amount: data.amount,
                    planId: data.planId,
                });
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: order.amount,
                    currency: order.currency,
                    name: "Unifynt SaaS",
                    description: `Subscription Renewal: ${school?.name}`,
                    order_id: order.id,
                    theme: { color: "#000000" },
                    handler: async function (response: any) {
                        try {
                            await SchoolService.verifyRazorpayPayment(schoolId as string, {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                planId: data.planId,
                                studentLimit: data.studentLimit,
                                subscriptionEnd: data.subscriptionEnd,
                                amount: data.amount,
                            });
                            toast.success("Subscription updated successfully.");
                            queryClient.invalidateQueries({ queryKey: ["schools"] });
                            queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
                            queryClient.invalidateQueries({ queryKey: ["transactions", schoolId] });
                            setActiveTab("overview");
                        } catch (err: any) {
                            toast.error(err.response?.data?.message || "Payment verification failed");
                        }
                    },
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to initialize payment");
            }
        } else {
            try {
                await SchoolService.renewSubscription(schoolId as string, {
                    planId: data.planId,
                    subscriptionEnd: data.subscriptionEnd,
                    studentLimit: data.studentLimit,
                    paymentMethod: data.paymentMethod,
                    amount: data.amount,
                });
                toast.success("Subscription renewed manually.");
                queryClient.invalidateQueries({ queryKey: ["schools"] });
                queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
                queryClient.invalidateQueries({ queryKey: ["transactions", schoolId] });
                setActiveTab("overview");
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to renew subscription");
            }
        }
    };

    const isLoading = isSchoolLoading || isPlansLoading;

    let isExpired = false;
    let daysRemaining = 0;
    if (school?.subscriptionEnd) {
        const expiryDate = new Date(school.subscriptionEnd);
        expiryDate.setHours(23, 59, 59, 999);
        const now = new Date();
        isExpired = expiryDate.getTime() < now.getTime();
        daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    } else {
        isExpired = true;
    }

    return (
        <>
            <Sheet open={!!schoolId} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className="sm:max-w-[1000px] w-full p-0 flex flex-col h-full bg-background border-l-0 shadow-2xl">
                    <SheetTitle className="sr-only">Workspace Details</SheetTitle>
                    <SheetDescription className="sr-only">Detailed view and management of the selected workspace.</SheetDescription>

                    {isLoading || !school ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            <div className="px-8 pt-10 pb-6 border-b border-border/60 bg-muted/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50" />
                                <SheetHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-6 items-center">
                                            <div className="relative group rounded-full">
                                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg transition-transform duration-300 group-hover:scale-105 bg-white">
                                                    <AvatarImage src={school.logo} alt={school.name} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/5 text-primary text-3xl font-extrabold">
                                                        {school.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="space-y-2">
                                                <SheetTitle className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
                                                    {school.name}
                                                    {school.isActive && <span className="flex h-3 w-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>}
                                                </SheetTitle>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <a href={`https://${school.customDomain || school.subdomain + '.unifynt.com'}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 bg-background/50 border border-border px-3 py-1.5 rounded-md shadow-sm backdrop-blur-sm">
                                                        <Globe className="h-4 w-4" />
                                                        {school.customDomain || `${school.subdomain}.unifynt.com`}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                    <Badge variant={school.isActive ? "default" : "destructive"} className={`shadow-sm px-3 py-1 text-xs font-semibold ${school.isActive ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20' : ''}`}>
                                                        {school.isActive ? "Active Workspace" : "Suspended"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950/20 relative">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b px-8 py-3 shadow-sm">
                                        <TabsList className="grid w-full grid-cols-4 bg-muted/40 p-1 rounded-xl h-14 border">
                                            <TabsTrigger value="overview" className="rounded-lg font-bold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"><Activity className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
                                            <TabsTrigger value="settings" className="rounded-lg font-bold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"><Settings2 className="mr-2 h-4 w-4" /> Management</TabsTrigger>
                                            <TabsTrigger value="renew" className="rounded-lg font-bold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"><CreditCard className="mr-2 h-4 w-4" /> Billing & Plan</TabsTrigger>
                                            <TabsTrigger value="billing" className="rounded-lg font-bold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-primary transition-all"><History className="mr-2 h-4 w-4" /> Invoices</TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <div className="p-8">
                                        <TabsContent value="overview" className="mt-0 space-y-8 outline-none animate-in fade-in duration-500">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
                                                    <CardContent className="p-5 flex flex-col gap-2">
                                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Plan</p>
                                                        <p className="text-2xl font-bold tracking-tight text-foreground">{school.plan?.name || "N/A"}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
                                                    <CardContent className="p-5 flex flex-col gap-2">
                                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Capacity</p>
                                                        <p className="text-2xl font-bold tracking-tight text-foreground">{school._count?.students || 0} <span className="text-lg text-muted-foreground font-medium">/ {school.studentLimit}</span></p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
                                                    <CardContent className="p-5 flex flex-col gap-2">
                                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">SMS Credits</p>
                                                        <p className="text-2xl font-bold tracking-tight text-foreground">{school.smsBalance?.toLocaleString() || 0}</p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="shadow-sm border-border/60 hover:shadow-md transition-shadow">
                                                    <CardContent className="p-5 flex flex-col gap-2">
                                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Renewal Date</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xl font-bold tracking-tight text-foreground">
                                                                {school.subscriptionEnd ? new Date(school.subscriptionEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                                                            </p>
                                                        </div>
                                                        <p className={`text-xs font-semibold ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                                                            {isExpired ? 'Subscription Expired' : `${daysRemaining} days remaining`}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-6 bg-background rounded-xl p-6 border shadow-sm">
                                                    <h3 className="font-bold text-lg border-b pb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Institution Contact</h3>
                                                    <div className="space-y-5 mt-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Primary Address</p>
                                                            <p className="text-sm font-medium text-foreground">{school.address || "No address provided."}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                                                                <p className="text-sm font-medium text-foreground">{school.email || "N/A"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Phone Number</p>
                                                                <p className="text-sm font-medium text-foreground">{school.phone || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-6 bg-background rounded-xl p-6 border shadow-sm">
                                                    <h3 className="font-bold text-lg border-b pb-3 flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-primary" /> Legal & Compliance</h3>
                                                    <div className="space-y-5 mt-4">
                                                        <div>
                                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Principal / Administrator</p>
                                                            <p className="text-sm font-medium text-foreground">{school.principalName || "N/A"} <span className="text-muted-foreground ml-1">{school.principalPhone ? `(${school.principalPhone})` : ''}</span></p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Registration No</p>
                                                                <p className="text-sm font-medium text-foreground">{school.registrationCode || "N/A"}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Tax ID / GSTIN</p>
                                                                <p className="text-sm font-medium text-foreground">{school.taxId || "N/A"}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="settings" className="mt-0 outline-none animate-in fade-in duration-500">
                                            <form onSubmit={editForm.handleSubmit(onSettingsSubmit)} className="space-y-8 pb-24">

                                                <div className="bg-background rounded-xl border border-border shadow-sm overflow-hidden">
                                                    <div className="bg-muted/30 px-6 py-4 border-b">
                                                        <h3 className="text-lg font-bold flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Branding & Appearance</h3>
                                                        <p className="text-sm text-muted-foreground">Manage workspace logo and theme colors.</p>
                                                    </div>
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="col-span-1 flex flex-col items-center justify-center space-y-4 border rounded-xl p-6 bg-muted/10 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors">
                                                            <Avatar className="h-32 w-32 border shadow-sm bg-white">
                                                                <AvatarImage src={watchLogoUrl} alt="Preview" className="object-cover" />
                                                                <AvatarFallback className="text-4xl text-muted-foreground"><UploadCloud className="h-10 w-10" /></AvatarFallback>
                                                            </Avatar>
                                                            <input
                                                                type="file"
                                                                ref={fileInputRef}
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={handleFileSelect}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                disabled={isUploadingLogo}
                                                            >
                                                                {isUploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CropIcon className="mr-2 h-4 w-4" />}
                                                                {isUploadingLogo ? "Uploading..." : "Upload & Crop Logo"}
                                                            </Button>
                                                            <input type="hidden" {...editForm.register("logo")} />
                                                        </div>
                                                        <div className="col-span-2 space-y-6">
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div className="space-y-3">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Color</Label>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="relative h-11 w-11 rounded-md border shadow-sm overflow-hidden shrink-0">
                                                                            <input type="color" className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer" {...editForm.register("primaryColor")} />
                                                                        </div>
                                                                        <Input className="h-11 font-mono uppercase" {...editForm.register("primaryColor")} />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secondary Color</Label>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="relative h-11 w-11 rounded-md border shadow-sm overflow-hidden shrink-0">
                                                                            <input type="color" className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer" {...editForm.register("secondaryColor")} />
                                                                        </div>
                                                                        <Input className="h-11 font-mono uppercase" {...editForm.register("secondaryColor")} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                                    <div className="bg-muted/30 px-6 py-4 border-b">
                                                        <h3 className="text-lg font-bold flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /> Security & Access</h3>
                                                        <p className="text-sm text-muted-foreground">Force reset administrator credentials.</p>
                                                    </div>
                                                    <div className="p-6">
                                                        <div className="space-y-3 max-w-md">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Admin Password</Label>
                                                            <Input
                                                                className="h-11 shadow-sm font-mono placeholder:text-muted-foreground/50"
                                                                placeholder="Leave empty to keep unchanged"
                                                                {...editForm.register("adminPassword")}
                                                            />
                                                            <p className="text-xs text-muted-foreground">Setting a new password will immediately log out current sessions for the workspace administrator.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                                    <div className="bg-muted/30 px-6 py-4 border-b">
                                                        <h3 className="text-lg font-bold">Workspace Identity</h3>
                                                    </div>
                                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">School Name</Label>
                                                            <Input className="h-11 shadow-sm" {...editForm.register("name")} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Established Year</Label>
                                                            <Input className="h-11 shadow-sm" type="number" {...editForm.register("establishedYear", { valueAsNumber: true })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subdomain URL</Label>
                                                            <div className="flex items-center shadow-sm rounded-md border focus-within:ring-1 focus-within:ring-ring">
                                                                <Input className="h-11 border-0 shadow-none focus-visible:ring-0" {...editForm.register("subdomain")} />
                                                                <div className="px-3 h-11 flex items-center bg-muted/50 border-l text-muted-foreground text-sm font-medium">.unifynt.com</div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Domain</Label>
                                                            <Input className="h-11 shadow-sm" placeholder="e.g. www.school.com" {...editForm.register("customDomain")} />
                                                        </div>
                                                        <div className="space-y-2 md:col-span-2">
                                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">System Slug (Unique ID)</Label>
                                                            <Input className="h-11 shadow-sm bg-muted/30 font-mono" {...editForm.register("slug")} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                                        <div className="bg-muted/30 px-6 py-4 border-b">
                                                            <h3 className="text-lg font-bold">Contact Info</h3>
                                                        </div>
                                                        <div className="p-6 space-y-5">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Support Email</Label>
                                                                <Input className="h-11 shadow-sm" type="email" {...editForm.register("email")} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Support Phone</Label>
                                                                <Input className="h-11 shadow-sm" {...editForm.register("phone")} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Address</Label>
                                                                <Input className="h-11 shadow-sm" {...editForm.register("address")} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                                        <div className="bg-muted/30 px-6 py-4 border-b">
                                                            <h3 className="text-lg font-bold">Legal Details</h3>
                                                        </div>
                                                        <div className="p-6 space-y-5">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Principal Name</Label>
                                                                <Input className="h-11 shadow-sm" {...editForm.register("principalName")} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Registration Number</Label>
                                                                <Input className="h-11 shadow-sm" {...editForm.register("registrationCode")} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tax ID / GSTIN</Label>
                                                                <Input className="h-11 shadow-sm" {...editForm.register("taxId")} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* FIXED: Professional SMS Package Allocation Section */}
                                                <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                                    <div className="bg-muted/30 px-6 py-4 border-b">
                                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                                            <MessageSquare className="h-5 w-5 text-primary" /> Communication Quota
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground">Manage transactional SMS packages and current balance.</p>
                                                    </div>
                                                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Available SMS Credits</p>
                                                            <p className="text-4xl font-black text-foreground">{school.smsBalance?.toLocaleString() || 0}</p>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={() => setIsAssignSmsModalOpen(true)}
                                                            className="h-12 px-6 font-bold shadow-md hover:scale-[1.02] transition-transform"
                                                        >
                                                            <Send className="mr-2 h-4 w-4" /> Assign SMS Package
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-6 space-y-6">
                                                    <h3 className="text-lg font-bold tracking-tight text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-900/50 pb-3">Danger Zone</h3>
                                                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-xl bg-white dark:bg-background shadow-sm">
                                                        <div className="space-y-1">
                                                            <Label className="font-bold text-foreground">Workspace Status</Label>
                                                            <p className="text-xs text-muted-foreground">Disable workspace access instantly. Users will not be able to log in.</p>
                                                        </div>
                                                        <Switch
                                                            checked={editForm.watch("isActive")}
                                                            onCheckedChange={(val) => editForm.setValue("isActive", val, { shouldDirty: true })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="fixed bottom-0 right-0 w-full max-w-[1000px] bg-background/90 backdrop-blur-xl border-t p-5 z-40 flex justify-end shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                                                    <Button type="submit" size="lg" className="h-12 px-10 font-bold shadow-lg" disabled={updateMutation.isPending}>
                                                        {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                                        Save All Changes
                                                    </Button>
                                                </div>
                                            </form>
                                        </TabsContent>

                                        <TabsContent value="renew" className="mt-0 outline-none animate-in fade-in duration-500">
                                            <div className="bg-background border rounded-xl shadow-sm p-8">
                                                <div className="mb-8 border-b pb-6">
                                                    <h3 className="text-2xl font-bold tracking-tight">Manage Subscription</h3>
                                                    <p className="text-sm text-muted-foreground mt-1.5">Upgrade or extend the workspace quota and plan validity.</p>
                                                </div>

                                                <form onSubmit={renewForm.handleSubmit(processRenewal)} className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">1. Select Tier</Label>
                                                            <Select onValueChange={(val) => renewForm.setValue("planId", val)} defaultValue={renewForm.getValues("planId")}>
                                                                <SelectTrigger className="h-16 text-md bg-muted/20 shadow-sm border-border/80"><SelectValue placeholder="Choose a plan" /></SelectTrigger>
                                                                <SelectContent>
                                                                    {plans?.map((plan: any) => (
                                                                        <SelectItem key={plan.id} value={plan.id} className="py-4 cursor-pointer">
                                                                            <div className="flex flex-col gap-1.5">
                                                                                <span className="font-extrabold text-base">{plan.name}</span>
                                                                                <span className="text-muted-foreground text-xs font-semibold">₹{plan.pricePerMonth}/mo • Max {plan.studentLimit} Students</span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">2. New Expiration Date</Label>
                                                            <Input className="h-16 bg-muted/20 shadow-sm border-border/80 text-md font-semibold" type="date" {...renewForm.register("subscriptionEnd")} />
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground">3. Payment Mode</Label>
                                                            <Select onValueChange={(val) => renewForm.setValue("paymentMethod", val as any)} defaultValue={renewForm.getValues("paymentMethod")}>
                                                                <SelectTrigger className="h-16 text-md bg-muted/20 shadow-sm border-border/80"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="CASH" className="py-3 font-medium">Cash / Offline Settlement</SelectItem>
                                                                    <SelectItem value="BANK_TRANSFER" className="py-3 font-medium">Direct Bank Transfer</SelectItem>
                                                                    <SelectItem value="ONLINE" className="py-3 font-bold text-primary">Process Online Gateway</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label className="font-bold text-sm uppercase tracking-wider text-muted-foreground opacity-70">Assigned Quota</Label>
                                                            <Input className="h-16 bg-muted/50 cursor-not-allowed font-extrabold text-xl text-center" type="number" readOnly {...renewForm.register("studentLimit", { valueAsNumber: true })} />
                                                        </div>
                                                    </div>

                                                    <Separator className="my-8" />

                                                    <div className="flex flex-col items-end gap-6 bg-muted/10 p-6 rounded-xl border">
                                                        <div className="flex items-center gap-8">
                                                            <div className="text-right">
                                                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Billable</p>
                                                                <p className="text-xs text-muted-foreground">Calculated pro-rata basis.</p>
                                                            </div>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground opacity-50">₹</span>
                                                                <Input
                                                                    type="number"
                                                                    {...renewForm.register("amount", { valueAsNumber: true })}
                                                                    className="h-20 w-64 pl-12 text-4xl font-black text-right border-border shadow-inner bg-background rounded-lg"
                                                                />
                                                            </div>
                                                        </div>
                                                        <Button type="submit" size="lg" className="w-full md:w-auto h-14 px-12 text-lg font-bold shadow-xl">
                                                            Confirm & Process Upgrade
                                                        </Button>
                                                    </div>
                                                </form>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="billing" className="mt-0 outline-none animate-in fade-in duration-500">
                                            <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                                <div className="p-6 border-b bg-muted/20 flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-bold text-lg">Billing History</h3>
                                                        <p className="text-sm text-muted-foreground mt-1">Transaction logs and invoice statements.</p>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="shadow-sm font-semibold"><UploadCloud className="mr-2 w-4 h-4" /> Export CSV</Button>
                                                </div>
                                                <div className="p-0">
                                                    {isTransactionsLoading ? (
                                                        <div className="flex h-72 items-center justify-center">
                                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                        </div>
                                                    ) : transactions?.length === 0 ? (
                                                        <div className="flex flex-col h-72 items-center justify-center text-muted-foreground bg-muted/5">
                                                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                                                <Receipt className="h-8 w-8 opacity-40" />
                                                            </div>
                                                            <p className="font-semibold text-foreground">No invoices found</p>
                                                            <p className="text-sm">This workspace has no recorded transactions yet.</p>
                                                        </div>
                                                    ) : (
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow className="bg-muted/10 hover:bg-muted/10 border-b">
                                                                    <TableHead className="font-bold text-xs uppercase tracking-wider h-14 px-6 text-muted-foreground">Date</TableHead>
                                                                    <TableHead className="font-bold text-xs uppercase tracking-wider h-14 text-muted-foreground">Plan</TableHead>
                                                                    <TableHead className="font-bold text-xs uppercase tracking-wider h-14 text-muted-foreground">Method</TableHead>
                                                                    <TableHead className="font-bold text-xs uppercase tracking-wider h-14 text-right text-muted-foreground">Amount</TableHead>
                                                                    <TableHead className="font-bold text-xs uppercase tracking-wider h-14 text-center text-muted-foreground">Status</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {transactions?.map((trx: any) => (
                                                                    <TableRow key={trx.id} className="hover:bg-muted/5 h-16 transition-colors">
                                                                        <TableCell className="px-6 font-semibold text-sm">
                                                                            {new Date(trx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <span className="font-bold text-foreground">{trx.plan?.name || "Custom"}</span>
                                                                        </TableCell>
                                                                        <TableCell className="text-muted-foreground text-xs font-bold uppercase tracking-wider bg-muted/20 px-3 py-1 rounded-md inline-block mt-3">
                                                                            {trx.paymentMethod.replace("_", " ")}
                                                                        </TableCell>
                                                                        <TableCell className="text-right font-black text-lg">
                                                                            ₹{trx.amount.toLocaleString()}
                                                                        </TableCell>
                                                                        <TableCell className="text-center">
                                                                            <Badge variant={trx.status === "SUCCESS" ? "default" : "secondary"} className={`shadow-sm px-3 py-1 font-bold ${trx.status === "SUCCESS" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20" : ""}`}>
                                                                                {trx.status}
                                                                            </Badge>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    )}
                                                </div>
                                            </div>
                                        </TabsContent>

                                    </div>
                                </Tabs>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* NEW: External SMS Assignment Modal */}
            {school && (
                <AssignSmsModal
                    isOpen={isAssignSmsModalOpen}
                    onClose={() => setIsAssignSmsModalOpen(false)}
                    schoolId={school.id}
                    schoolName={school.name}
                />
            )}

            {/* CROP MODAL DIALOG */}
            <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
                <DialogContent className="sm:max-w-[500px] z-[60]">
                    <DialogHeader>
                        <DialogTitle>Adjust Profile Image</DialogTitle>
                        <DialogDescription>
                            Resize and position the image to fit a perfect square format (1:1 aspect ratio).
                        </DialogDescription>
                    </DialogHeader>

                    <div className="relative h-[350px] w-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden my-2 border">
                        {cropImageSrc && (
                            <Cropper
                                image={cropImageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Square Crop
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                showGrid={true}
                                cropShape="rect"
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <span>Zoom Out</span>
                            <span>Zoom In</span>
                        </div>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <DialogFooter className="mt-6 gap-3 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsCropModalOpen(false)} disabled={isUploadingLogo}>
                            Cancel
                        </Button>
                        <Button onClick={handleCropAndUpload} disabled={isUploadingLogo} className="font-bold">
                            {isUploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CropIcon className="mr-2 h-4 w-4" />}
                            Crop & Upload
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}