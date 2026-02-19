/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Loader2,
    Building2,
    Mail,
    Phone,
    CalendarDays,
    Users,
    Activity,
    ExternalLink,
    Globe,
    Receipt,
    MapPin,
    ShieldAlert,
    CreditCard,
    Settings2,
    History
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
import { SchoolService } from "@/services/school.service";
import { PlanService } from "@/services/plan.service";
import { TransactionService } from "@/services/transaction.service";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { editSchoolSchema, EditSchoolFormValues, renewSchoolSchema, RenewSchoolFormValues } from "./schema";

interface SchoolDetailsModalProps {
    schoolId: string | null;
    onClose: () => void;
}

export function SchoolDetailsModal({ schoolId, onClose }: SchoolDetailsModalProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("overview");

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
                smsBalance: school.smsBalance || 0,
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

    const updateMutation = useMutation({
        mutationFn: (data: EditSchoolFormValues) => SchoolService.updateSchool(schoolId as string, data),
        onSuccess: () => {
            toast.success("Workspace configuration updated.");
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
            setActiveTab("overview");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update configuration."),
    });

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
        <Sheet open={!!schoolId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-[900px] w-full p-0 flex flex-col h-full bg-background border-l-0 shadow-2xl">
                <SheetTitle className="sr-only">Workspace Details</SheetTitle>
                <SheetDescription className="sr-only">Detailed view and management of the selected workspace.</SheetDescription>

                {isLoading || !school ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <div className="px-8 pt-10 pb-6 border-b border-border/60 bg-muted/10">
                            <SheetHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-5 items-center">
                                        <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                                            <AvatarImage src={school.logo} alt={school.name} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-2xl font-bold">
                                                {school.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1.5">
                                            <SheetTitle className="text-3xl font-extrabold tracking-tight text-foreground">{school.name}</SheetTitle>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <a href={`https://${school.customDomain || school.subdomain + '.unifynt.com'}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 bg-background border border-border/60 px-2.5 py-1 rounded-md shadow-sm">
                                                    <Globe className="h-3.5 w-3.5" />
                                                    {school.customDomain || `${school.subdomain}.unifynt.com`}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                                <Badge variant={school.isActive ? "default" : "destructive"} className={`shadow-sm ${school.isActive ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                                                    {school.isActive ? "Active Workspace" : "Suspended"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-8 py-4">
                                    <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg h-12">
                                        <TabsTrigger value="overview" className="rounded-md font-semibold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-sm"><Activity className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
                                        <TabsTrigger value="settings" className="rounded-md font-semibold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-sm"><Settings2 className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
                                        <TabsTrigger value="renew" className="rounded-md font-semibold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-sm"><CreditCard className="mr-2 h-4 w-4" /> Upgrade Plan</TabsTrigger>
                                        <TabsTrigger value="billing" className="rounded-md font-semibold text-sm h-full data-[state=active]:bg-background data-[state=active]:shadow-sm"><History className="mr-2 h-4 w-4" /> Billing logs</TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="p-8">
                                    <TabsContent value="overview" className="mt-0 space-y-8 outline-none animate-in fade-in duration-500">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Card className="shadow-sm border-border/60">
                                                <CardContent className="p-5 flex flex-col gap-2">
                                                    <p className="text-sm font-semibold text-muted-foreground">Current Plan</p>
                                                    <p className="text-2xl font-bold tracking-tight text-foreground">{school.plan?.name || "N/A"}</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="shadow-sm border-border/60">
                                                <CardContent className="p-5 flex flex-col gap-2">
                                                    <p className="text-sm font-semibold text-muted-foreground">User Capacity</p>
                                                    <p className="text-2xl font-bold tracking-tight text-foreground">{school._count?.students || 0} <span className="text-lg text-muted-foreground font-medium">/ {school.studentLimit}</span></p>
                                                </CardContent>
                                            </Card>
                                            <Card className="shadow-sm border-border/60">
                                                <CardContent className="p-5 flex flex-col gap-2">
                                                    <p className="text-sm font-semibold text-muted-foreground">SMS Credits</p>
                                                    <p className="text-2xl font-bold tracking-tight text-foreground">{school.smsBalance || 0}</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="shadow-sm border-border/60">
                                                <CardContent className="p-5 flex flex-col gap-2">
                                                    <p className="text-sm font-semibold text-muted-foreground">Renewal Date</p>
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
                                            <div className="space-y-6">
                                                <h3 className="font-semibold text-lg border-b pb-2">Institution Details</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 bg-muted rounded-md"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">Primary Address</p>
                                                            <p className="text-sm text-muted-foreground mt-0.5">{school.address || "No address provided."}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 bg-muted rounded-md"><Mail className="h-4 w-4 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">Contact Email</p>
                                                            <p className="text-sm text-muted-foreground mt-0.5">{school.email || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 bg-muted rounded-md"><Phone className="h-4 w-4 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">Phone Number</p>
                                                            <p className="text-sm text-muted-foreground mt-0.5">{school.phone || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="font-semibold text-lg border-b pb-2">Administration & Legal</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 bg-muted rounded-md"><Users className="h-4 w-4 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">Principal / Admin</p>
                                                            <p className="text-sm text-muted-foreground mt-0.5">{school.principalName || "N/A"} {school.principalPhone ? `(${school.principalPhone})` : ''}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 bg-muted rounded-md"><Receipt className="h-4 w-4 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">Tax ID / GSTIN</p>
                                                            <p className="text-sm text-muted-foreground mt-0.5">{school.taxId || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-2 bg-muted rounded-md"><ShieldAlert className="h-4 w-4 text-muted-foreground" /></div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">Registration Number</p>
                                                            <p className="text-sm text-muted-foreground mt-0.5">{school.registrationCode || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="settings" className="mt-0 outline-none animate-in fade-in duration-500">
                                        <form onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-8 pb-20">

                                            <div className="bg-background rounded-xl border p-6 shadow-sm space-y-6">
                                                <h3 className="text-lg font-bold tracking-tight border-b pb-3">Workspace Identity</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                                                        <Input className="h-11 bg-muted/30 shadow-sm" {...editForm.register("subdomain")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Domain</Label>
                                                        <Input className="h-11 shadow-sm" placeholder="e.g. www.school.com" {...editForm.register("customDomain")} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-background rounded-xl border p-6 shadow-sm space-y-6">
                                                <h3 className="text-lg font-bold tracking-tight border-b pb-3">Contact Information</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Support Email</Label>
                                                        <Input className="h-11 shadow-sm" type="email" {...editForm.register("email")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Support Phone</Label>
                                                        <Input className="h-11 shadow-sm" {...editForm.register("phone")} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Address</Label>
                                                        <Input className="h-11 shadow-sm" {...editForm.register("address")} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-background rounded-xl border p-6 shadow-sm space-y-6">
                                                <h3 className="text-lg font-bold tracking-tight border-b pb-3">Legal & Administration</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Principal Name</Label>
                                                        <Input className="h-11 shadow-sm" {...editForm.register("principalName")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Principal Phone</Label>
                                                        <Input className="h-11 shadow-sm" {...editForm.register("principalPhone")} />
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

                                            <div className="bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900/50 p-6 space-y-6">
                                                <h3 className="text-lg font-bold tracking-tight text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-900/50 pb-3">Danger Zone & Limits</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                                    <div className="space-y-2">
                                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Allocate SMS Credits</Label>
                                                        <Input className="h-11 shadow-sm border-red-200 dark:border-red-900/50" type="number" {...editForm.register("smsBalance", { valueAsNumber: true })} />
                                                    </div>
                                                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-background">
                                                        <div className="space-y-1">
                                                            <Label className="font-bold text-foreground">Workspace Status</Label>
                                                            <p className="text-xs text-muted-foreground">Disable access immediately.</p>
                                                        </div>
                                                        <Switch
                                                            checked={editForm.watch("isActive")}
                                                            onCheckedChange={(val) => editForm.setValue("isActive", val)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="fixed bottom-0 right-0 w-full max-w-[900px] bg-background/80 backdrop-blur-md border-t p-4 z-50 flex justify-end shadow-2xl">
                                                <Button type="submit" className="h-11 px-8 font-bold shadow-md" disabled={updateMutation.isPending}>
                                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Save Configuration
                                                </Button>
                                            </div>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="renew" className="mt-0 outline-none animate-in fade-in duration-500">
                                        <div className="bg-background border rounded-xl shadow-sm p-8">
                                            <div className="mb-8">
                                                <h3 className="text-2xl font-bold tracking-tight">Upgrade Workspace</h3>
                                                <p className="text-sm text-muted-foreground mt-1">Select a new plan or extend the current subscription duration.</p>
                                            </div>

                                            <form onSubmit={renewForm.handleSubmit(processRenewal)} className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-3">
                                                        <Label className="font-semibold text-foreground">1. Select Premium Tier</Label>
                                                        <Select onValueChange={(val) => renewForm.setValue("planId", val)} defaultValue={renewForm.getValues("planId")}>
                                                            <SelectTrigger className="h-14 text-md bg-muted/10 shadow-sm"><SelectValue placeholder="Choose a plan" /></SelectTrigger>
                                                            <SelectContent>
                                                                {plans?.map((plan: any) => (
                                                                    <SelectItem key={plan.id} value={plan.id} className="py-4 cursor-pointer">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="font-bold text-base">{plan.name}</span>
                                                                            <span className="text-muted-foreground text-xs font-medium">₹{plan.pricePerMonth}/mo • Upto {plan.studentLimit} Students</span>
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="font-semibold text-foreground">2. Set Expiration Date</Label>
                                                        <Input className="h-14 bg-muted/10 shadow-sm" type="date" {...renewForm.register("subscriptionEnd")} />
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="font-semibold text-foreground">3. Payment Mode</Label>
                                                        <Select onValueChange={(val) => renewForm.setValue("paymentMethod", val as any)} defaultValue={renewForm.getValues("paymentMethod")}>
                                                            <SelectTrigger className="h-14 text-md bg-muted/10 shadow-sm"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CASH" className="py-3">Cash / Offline Settlement</SelectItem>
                                                                <SelectItem value="BANK_TRANSFER" className="py-3">Direct Bank Transfer</SelectItem>
                                                                <SelectItem value="ONLINE" className="py-3 font-bold text-primary">Process Online (Razorpay)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Label className="font-semibold text-foreground text-muted-foreground">System Allocated Capacity</Label>
                                                        <Input className="h-14 bg-muted/50 cursor-not-allowed font-bold" type="number" readOnly {...renewForm.register("studentLimit", { valueAsNumber: true })} />
                                                    </div>
                                                </div>

                                                <Separator className="my-8" />

                                                <div className="flex flex-col items-end gap-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Due Amount</p>
                                                            <p className="text-xs text-muted-foreground">Auto-calculated based on duration.</p>
                                                        </div>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground">₹</span>
                                                            <Input
                                                                type="number"
                                                                {...renewForm.register("amount", { valueAsNumber: true })}
                                                                className="h-16 w-56 pl-10 text-3xl font-extrabold text-right border-border/60 shadow-inner bg-muted/10"
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button type="submit" size="lg" className="w-full md:w-auto h-14 px-12 text-lg font-bold shadow-xl">
                                                        Confirm & Update Subscription
                                                    </Button>
                                                </div>
                                            </form>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="billing" className="mt-0 outline-none animate-in fade-in duration-500">
                                        <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                                            <div className="p-6 border-b bg-muted/10 flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-bold text-lg">Transaction History</h3>
                                                    <p className="text-sm text-muted-foreground mt-0.5">All billing logs and invoices for this workspace.</p>
                                                </div>
                                                <Button variant="outline" size="sm" className="shadow-sm">Download CSV</Button>
                                            </div>
                                            <div className="p-0">
                                                {isTransactionsLoading ? (
                                                    <div className="flex h-64 items-center justify-center">
                                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : transactions?.length === 0 ? (
                                                    <div className="flex flex-col h-64 items-center justify-center text-muted-foreground">
                                                        <History className="h-10 w-10 mb-3 opacity-20" />
                                                        <p className="font-medium">No billing records found.</p>
                                                    </div>
                                                ) : (
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                                                <TableHead className="font-semibold h-12 px-6">Date</TableHead>
                                                                <TableHead className="font-semibold h-12">Plan</TableHead>
                                                                <TableHead className="font-semibold h-12">Method</TableHead>
                                                                <TableHead className="font-semibold h-12 text-right">Amount</TableHead>
                                                                <TableHead className="font-semibold h-12 text-center">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {transactions?.map((trx: any) => (
                                                                <TableRow key={trx.id} className="hover:bg-muted/10 h-16">
                                                                    <TableCell className="px-6 font-medium text-sm">
                                                                        {new Date(trx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span className="font-semibold text-foreground">{trx.plan?.name || "Custom"}</span>
                                                                    </TableCell>
                                                                    <TableCell className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                                        {trx.paymentMethod.replace("_", " ")}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-bold text-base">
                                                                        ₹{trx.amount.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="text-center">
                                                                        <Badge variant={trx.status === "SUCCESS" ? "default" : "secondary"} className={`shadow-sm ${trx.status === "SUCCESS" ? "bg-green-500 hover:bg-green-600" : ""}`}>
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
    );
}