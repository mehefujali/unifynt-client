/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Loader2,
    CheckCircle2,
    Lock,
    CreditCard,
    Zap,
    Users,
    CalendarDays
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { SchoolService } from "@/services/school.service";
import { PlanService } from "@/services/plan.service";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { renewalSchema, RenewalFormValues } from "./schema";

export default function BillingOverviewPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const schoolId = user?.schoolId;
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: school, isLoading: isSchoolLoading } = useQuery({
        queryKey: ["school", schoolId],
        queryFn: () => SchoolService.getSingleSchool(schoolId as string),
        enabled: !!schoolId,
    });

    const { data: plans, isLoading: isPlansLoading } = useQuery({
        queryKey: ["plans"],
        queryFn: PlanService.getAllPlans,
    });

    const form = useForm<RenewalFormValues>({
        resolver: zodResolver(renewalSchema),
        defaultValues: {
            durationMonths: 12,
        },
    });

    const watchPlanId = form.watch("planId");
    const watchDuration = form.watch("durationMonths");

    useEffect(() => {
        if (school?.planId && !watchPlanId && plans) {
            form.setValue("planId", school.planId, { shouldValidate: true, shouldDirty: true });
        }
    }, [school, plans, form, watchPlanId]);

    const selectedPlan = plans?.find((p: any) => p.id === watchPlanId);
    const totalAmount = selectedPlan ? selectedPlan.pricePerMonth * watchDuration : 0;

    const calculateNewExpiry = () => {
        let currentEnd = new Date();
        if (school?.subscriptionEnd) {
            const tempEnd = new Date(school.subscriptionEnd);
            tempEnd.setHours(23, 59, 59, 999);
            if (tempEnd.getTime() > new Date().getTime()) {
                currentEnd = tempEnd;
            }
        }
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + watchDuration);
        return newEnd.toISOString();
    };

    const handlePayment = async (data: RenewalFormValues) => {
        if (!schoolId) {
            toast.error("Session expired. Please log in again.");
            return;
        }
        if (!selectedPlan) return;
        if (totalAmount <= 0) {
            toast.error("Invalid total amount.");
            return;
        }

        setIsProcessing(true);
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            toast.error("Payment gateway failed to load.");
            setIsProcessing(false);
            return;
        }

        try {
            const order = await SchoolService.createRazorpayOrder(schoolId as string, {
                amount: totalAmount,
                planId: data.planId,
            });

            const newExpiryDate = calculateNewExpiry();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Unifynt SaaS",
                description: `Renewal: ${selectedPlan.name} (${data.durationMonths} Months)`,
                order_id: order.id,
                prefill: {
                    name: school?.name || user?.name || "",
                    email: school?.email || user?.email || "",
                    contact: school?.phone || "",
                },
                theme: { color: "#000000" },
                handler: async (response: any) => {
                    try {
                        await SchoolService.verifyRazorpayPayment(schoolId as string, {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            planId: data.planId,
                            studentLimit: selectedPlan.studentLimit,
                            subscriptionEnd: newExpiryDate,
                            amount: totalAmount,
                        });
                        toast.success("Payment successful. Subscription updated.");
                        queryClient.invalidateQueries({ queryKey: ["school", schoolId] });
                        router.push("/admin/billing/history");
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || "Verification failed.");
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", (response: any) => {
                toast.error(response.error.description || "Payment failed.");
                setIsProcessing(false);
            });
            rzp.open();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Payment initialization failed.");
            setIsProcessing(false);
        }
    };

    if (isAuthLoading || isSchoolLoading || isPlansLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const studentsCount = school?._count?.students || 0;
    const studentLimit = school?.studentLimit || 0;
    const usagePercentage = studentLimit > 0 ? Math.min(100, Math.round((studentsCount / studentLimit) * 100)) : 0;
    const isNearLimit = usagePercentage >= 90;

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
        <div className="max-w-6xl mx-auto space-y-10 pb-10">
            <div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Billing & Subscription</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your workspace plan, view usage, and update payment methods.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-none border-border/60">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Zap className="h-4 w-4" /> Current Plan
                                </p>
                                <p className="text-2xl font-semibold text-foreground">
                                    {school?.plan?.name || "No Plan"}
                                </p>
                            </div>
                            <Badge variant={isExpired ? "destructive" : "secondary"} className="font-normal rounded-full px-3">
                                {isExpired ? "Expired" : "Active"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-border/60">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Student Usage
                                </p>
                                <span className="text-sm font-medium text-foreground">
                                    {studentsCount} / {studentLimit}
                                </span>
                            </div>
                            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-destructive' : 'bg-primary'}`}
                                    style={{ width: `${usagePercentage}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-none border-border/60">
                    <CardContent className="p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" /> Billing Cycle
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {school?.subscriptionEnd ? new Date(school.subscriptionEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {!isExpired && daysRemaining > 0 ? `Renews in ${daysRemaining} days` : "Action required immediately"}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="bg-border/50" />

            <form onSubmit={form.handleSubmit(handlePayment)}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-lg font-semibold">Change Plan</h2>
                            <p className="text-sm text-muted-foreground mt-1 mb-5">Select a plan that scales with your institution.</p>

                            <div className="space-y-4">
                                <Label className="text-sm font-medium">Select Workspace Plan</Label>
                                <Select onValueChange={(val) => form.setValue("planId", val, { shouldValidate: true })} value={watchPlanId}>
                                    <SelectTrigger className="h-12 bg-transparent border-border/60 hover:bg-muted/30 transition-colors">
                                        <SelectValue placeholder="Choose a plan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {plans?.filter((p: any) => p.isActive).map((plan: any) => (
                                            <SelectItem key={plan.id} value={plan.id} className="py-3">
                                                <div className="flex items-center justify-between w-full min-w-[200px] gap-4">
                                                    <span className="font-medium">{plan.name}</span>
                                                    <span className="text-muted-foreground text-sm">₹{plan.pricePerMonth} / mo</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 mt-6">
                                <Label className="text-sm font-medium">Billing Interval</Label>
                                <Select onValueChange={(val) => form.setValue("durationMonths", Number(val), { shouldValidate: true })} value={watchDuration.toString()}>
                                    <SelectTrigger className="h-12 bg-transparent border-border/60 hover:bg-muted/30 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="3" className="py-3">Quarterly (3 Months)</SelectItem>
                                        <SelectItem value="6" className="py-3">Half-Yearly (6 Months)</SelectItem>
                                        <SelectItem value="12" className="py-3">Annually (12 Months) - Recommended</SelectItem>
                                        <SelectItem value="24" className="py-3">Biennially (24 Months)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedPlan && (
                            <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
                                <h3 className="text-sm font-medium mb-4 text-foreground">Features included in {selectedPlan.name}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-primary" />
                                        <span>Up to {selectedPlan.studentLimit} Students</span>
                                    </div>
                                    {selectedPlan.features?.map((feature: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-6 rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                            <h3 className="font-semibold text-lg mb-6">Order Summary</h3>

                            {selectedPlan ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{selectedPlan.name} Plan</span>
                                        <span className="font-medium">₹{selectedPlan.pricePerMonth.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Billing Cycle</span>
                                        <span className="font-medium">{watchDuration} Months</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Capacity</span>
                                        <span className="font-medium">{selectedPlan.studentLimit} Users</span>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-foreground">Total Due</span>
                                        <span className="text-2xl font-bold tracking-tight text-foreground">
                                            ₹{totalAmount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground mb-10">Select a plan to see the summary.</p>
                            )}

                            <div className="mt-8 space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12"
                                    disabled={!selectedPlan || isProcessing || totalAmount <= 0}
                                >
                                    {isProcessing ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                                    ) : (
                                        <><CreditCard className="mr-2 h-4 w-4" /> Confirm & Pay</>
                                    )}
                                </Button>

                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <Lock className="h-3 w-3" />
                                    Payments are securely processed by Razorpay.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}