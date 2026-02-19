/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Loader2,
    Building,
    Mail,
    Phone,
    Calendar,
    Users,
    Activity,
    ExternalLink,
    Globe,
    Receipt,
    MapPin,
    Landmark,
    ShieldCheck,
    CreditCard
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        if (school && activeTab === "edit") {
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
            toast.success("School details updated successfully");
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
            setActiveTab("overview");
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update school"),
    });

    const processRenewal = async (data: RenewSchoolFormValues) => {
        if (data.paymentMethod === "ONLINE") {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error("Failed to load Razorpay SDK");
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
                    description: `Subscription Renewal for ${school?.name}`,
                    order_id: order.id,
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
                            toast.success("Subscription renewed via Online Payment");
                            queryClient.invalidateQueries({ queryKey: ["schools"] });
                            queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
                            queryClient.invalidateQueries({ queryKey: ["transactions", schoolId] });
                            setActiveTab("billing");
                        } catch (err: any) {
                            toast.error(err.response?.data?.message || "Payment verification failed");
                        }
                    },
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to create order");
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
                toast.success("Subscription renewed successfully");
                queryClient.invalidateQueries({ queryKey: ["schools"] });
                queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
                queryClient.invalidateQueries({ queryKey: ["transactions", schoolId] });
                setActiveTab("billing");
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to renew subscription");
            }
        }
    };

    const isLoading = isSchoolLoading || isPlansLoading;

    return (
        <Sheet open={!!schoolId} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-[850px] w-[90vw] p-0 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950">

                {/* sr-only Title for Radix UI Accessibility when Loading */}
                <SheetTitle className="sr-only">School Management Modal</SheetTitle>
                <SheetDescription className="sr-only">Manage school details, subscriptions, and billing.</SheetDescription>

                {isLoading || !school ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b bg-background shadow-sm z-10">
                            <SheetHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <Building className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <SheetTitle className="text-2xl font-bold tracking-tight">{school.name}</SheetTitle>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <a href={`https://${school.customDomain || school.subdomain + '.unifynt.com'}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary flex items-center hover:underline bg-primary/5 px-2 py-0.5 rounded-md">
                                                    <Globe className="mr-1.5 h-3.5 w-3.5" />
                                                    {school.customDomain || `${school.subdomain}.unifynt.com`}
                                                    <ExternalLink className="ml-1.5 h-3 w-3" />
                                                </a>
                                                <Badge variant={school.isActive ? "default" : "destructive"} className="shadow-sm">
                                                    {school.isActive ? "Active Account" : "Suspended"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-4 mb-8 bg-background border shadow-sm p-1 rounded-xl">
                                    <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                                    <TabsTrigger value="edit" className="rounded-lg">Edit All Data</TabsTrigger>
                                    <TabsTrigger value="renew" className="rounded-lg">Renew Plan</TabsTrigger>
                                    <TabsTrigger value="billing" className="rounded-lg">Billing History</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6 outline-none">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Card className="shadow-sm">
                                            <CardContent className="p-5 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground font-semibold">Active Plan</p>
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                                                        <Activity className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <p className="text-2xl font-bold">{school.plan?.name || "N/A"}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="shadow-sm">
                                            <CardContent className="p-5 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground font-semibold">Students</p>
                                                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg text-green-600 dark:text-green-400">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <p className="text-2xl font-bold">{school._count?.students || 0} / <span className="text-muted-foreground text-lg">{school.studentLimit}</span></p>
                                            </CardContent>
                                        </Card>
                                        <Card className="shadow-sm">
                                            <CardContent className="p-5 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground font-semibold">SMS Balance</p>
                                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg text-orange-600 dark:text-orange-400">
                                                        <Mail className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <p className="text-2xl font-bold">{school.smsBalance || 0}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="shadow-sm">
                                            <CardContent className="p-5 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-muted-foreground font-semibold">Expiry Date</p>
                                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-purple-600 dark:text-purple-400">
                                                        <Calendar className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <p className="text-lg font-bold truncate">
                                                    {school.subscriptionEnd ? new Date(school.subscriptionEnd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-3 border-b">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-primary" /> Contact & Location
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Official Email</p>
                                                        <p className="text-sm font-medium">{school.email || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Official Phone</p>
                                                        <p className="text-sm font-medium">{school.phone || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Full Address</p>
                                                        <p className="text-sm font-medium leading-relaxed">{school.address || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-3 border-b">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <ShieldCheck className="h-4 w-4 text-primary" /> Legal & Administration
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-start gap-3">
                                                    <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Principal Name</p>
                                                        <p className="text-sm font-medium">{school.principalName || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Landmark className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Registration / Affiliation No.</p>
                                                        <p className="text-sm font-medium">{school.registrationCode || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Receipt className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground">Tax ID / GSTIN</p>
                                                        <p className="text-sm font-medium">{school.taxId || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="edit" className="outline-none">
                                    <form onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6 pb-20">
                                        <Card className="shadow-sm border-t-4 border-t-primary">
                                            <CardHeader className="pb-4 border-b">
                                                <CardTitle className="text-lg">Basic Information</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>School Name <span className="text-red-500">*</span></Label>
                                                        <Input className="h-11" {...editForm.register("name")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Established Year</Label>
                                                        <Input className="h-11" type="number" {...editForm.register("establishedYear", { valueAsNumber: true })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Subdomain <span className="text-red-500">*</span></Label>
                                                        <Input className="h-11 bg-muted/50" {...editForm.register("subdomain")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Unique Slug <span className="text-red-500">*</span></Label>
                                                        <Input className="h-11 bg-muted/50" {...editForm.register("slug")} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label>Custom Domain</Label>
                                                        <Input className="h-11" placeholder="e.g. www.myschool.com" {...editForm.register("customDomain")} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-4 border-b">
                                                <CardTitle className="text-lg">Contact & Location</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>Official Email</Label>
                                                        <Input className="h-11" type="email" {...editForm.register("email")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Official Phone</Label>
                                                        <Input className="h-11" {...editForm.register("phone")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Website</Label>
                                                        <Input className="h-11" placeholder="https://" {...editForm.register("website")} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label>Full Address</Label>
                                                        <Input className="h-11" {...editForm.register("address")} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm">
                                            <CardHeader className="pb-4 border-b">
                                                <CardTitle className="text-lg">Administration & Legal</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>Principal Name</Label>
                                                        <Input className="h-11" {...editForm.register("principalName")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Principal Phone</Label>
                                                        <Input className="h-11" {...editForm.register("principalPhone")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Registration / Affiliation No.</Label>
                                                        <Input className="h-11" {...editForm.register("registrationCode")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Tax ID / GSTIN</Label>
                                                        <Input className="h-11" {...editForm.register("taxId")} />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <Label>Billing Address</Label>
                                                        <Input className="h-11" {...editForm.register("billingAddress")} />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-sm bg-primary/5 border-primary/20">
                                            <CardHeader className="pb-4 border-b border-primary/10">
                                                <CardTitle className="text-lg text-primary">System Control</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                                    <div className="space-y-2">
                                                        <Label className="text-foreground font-semibold">SMS Balance (Credits)</Label>
                                                        <Input className="h-11 border-primary/20 focus-visible:ring-primary" type="number" {...editForm.register("smsBalance", { valueAsNumber: true })} />
                                                    </div>
                                                    <div className="flex items-center justify-between p-5 border border-primary/20 rounded-xl bg-background shadow-sm">
                                                        <div className="space-y-1">
                                                            <Label className="text-base font-bold">Account Status</Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                Suspend or activate this school access instantly.
                                                            </p>
                                                        </div>
                                                        <Switch
                                                            checked={editForm.watch("isActive")}
                                                            onCheckedChange={(val) => editForm.setValue("isActive", val)}
                                                            className="scale-125 mr-2"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="fixed bottom-0 right-0 p-6 w-full max-w-[850px] bg-background/80 backdrop-blur-md border-t z-50 flex justify-end shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                                            <Button type="submit" size="lg" className="w-full md:w-auto px-8 shadow-lg text-md h-12" disabled={updateMutation.isPending}>
                                                {updateMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </TabsContent>

                                <TabsContent value="renew" className="outline-none">
                                    <Card className="shadow-sm border-t-4 border-t-green-500">
                                        <CardHeader className="pb-4 border-b">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-green-600" /> Renew Subscription
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <form onSubmit={renewForm.handleSubmit(processRenewal)} className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>Select Premium Plan</Label>
                                                        <Select onValueChange={(val) => renewForm.setValue("planId", val)} defaultValue={renewForm.getValues("planId")}>
                                                            <SelectTrigger className="h-12"><SelectValue placeholder="Choose a plan" /></SelectTrigger>
                                                            <SelectContent>
                                                                {plans?.map((plan: any) => (
                                                                    <SelectItem key={plan.id} value={plan.id} className="font-medium py-3">
                                                                        {plan.name} (₹{plan.pricePerMonth} / month)
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Payment Method</Label>
                                                        <Select onValueChange={(val) => renewForm.setValue("paymentMethod", val as any)} defaultValue={renewForm.getValues("paymentMethod")}>
                                                            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="CASH">Cash Payment (Offline)</SelectItem>
                                                                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                                                <SelectItem value="ONLINE">Online (Razorpay)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label>New Expiry Date</Label>
                                                        <Input className="h-12" type="date" {...renewForm.register("subscriptionEnd")} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Student Limit (Auto-filled by Plan)</Label>
                                                        <Input className="h-12 bg-muted/50" type="number" {...renewForm.register("studentLimit", { valueAsNumber: true })} />
                                                    </div>
                                                </div>
                                                <div className="p-6 bg-slate-100 dark:bg-slate-900 border rounded-xl flex items-center justify-between mt-6">
                                                    <div>
                                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Payable Amount</p>
                                                        <p className="text-xs text-muted-foreground">Calculated automatically based on plan and duration.</p>
                                                    </div>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-foreground">₹</span>
                                                        <Input
                                                            type="number"
                                                            {...renewForm.register("amount", { valueAsNumber: true })}
                                                            className="h-14 w-48 pl-9 text-2xl font-bold text-right border-primary/30 focus-visible:ring-primary shadow-inner bg-background"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="pt-4 flex justify-end">
                                                    <Button type="submit" size="lg" className="w-full md:w-auto px-10 h-14 text-lg bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20">
                                                        Process Payment & Renew
                                                    </Button>
                                                </div>
                                            </form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="billing" className="outline-none">
                                    <Card className="shadow-sm">
                                        <CardHeader className="pb-4 border-b">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Receipt className="h-5 w-5 text-primary" /> Billing & Transaction History
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {isTransactionsLoading ? (
                                                <div className="flex h-40 items-center justify-center">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : transactions?.length === 0 ? (
                                                <div className="flex flex-col h-40 items-center justify-center text-muted-foreground">
                                                    <Receipt className="h-10 w-10 mb-2 opacity-20" />
                                                    <p>No billing history found for this school.</p>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <Table>
                                                        <TableHeader className="bg-muted/50">
                                                            <TableRow>
                                                                <TableHead className="font-semibold h-12 px-6">Date</TableHead>
                                                                <TableHead className="font-semibold h-12">Plan Name</TableHead>
                                                                <TableHead className="font-semibold h-12">Method</TableHead>
                                                                <TableHead className="font-semibold h-12 text-right">Amount</TableHead>
                                                                <TableHead className="font-semibold h-12 text-center">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {transactions?.map((trx: any) => (
                                                                <TableRow key={trx.id} className="hover:bg-muted/30 transition-colors">
                                                                    <TableCell className="px-6 py-4 font-medium">
                                                                        {new Date(trx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    </TableCell>
                                                                    <TableCell className="py-4">
                                                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                                            {trx.plan?.name || "Custom"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="py-4 text-muted-foreground text-sm">
                                                                        {trx.paymentMethod.replace("_", " ")}
                                                                    </TableCell>
                                                                    <TableCell className="py-4 text-right font-bold">
                                                                        ₹{trx.amount.toLocaleString()}
                                                                    </TableCell>
                                                                    <TableCell className="py-4 text-center">
                                                                        <Badge variant={trx.status === "SUCCESS" ? "default" : "secondary"} className={trx.status === "SUCCESS" ? "bg-green-500 hover:bg-green-600" : ""}>
                                                                            {trx.status}
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                            </Tabs>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}