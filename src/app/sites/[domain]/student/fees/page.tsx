/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    Banknote, 
    Calendar, 
    CreditCard, 
    Loader2, 
    CheckCircle2, 
    Clock, 
    ArrowRight, 
    Search, 
    Filter 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FeesService, StudentInvoice } from "@/services/fees.service";
import { FinancialService } from "@/services/financial.service";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
} from "@/components/ui/card";


export default function StudentFeesPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

    const { data: invoicesRes, isLoading: isInvoicesLoading } = useQuery({
        queryKey: ["student-invoices"],
        queryFn: () => FeesService.getStudentInvoices(),
    });

    const { data: gatewayStatus, isLoading: isGatewayLoading } = useQuery({
        queryKey: ["payment-gateway-status"],
        queryFn: FinancialService.getGatewayStatus,
    });

    const verifyMutation = useMutation({
        mutationFn: FeesService.verifyOnlinePayment,
        onSuccess: () => {
            toast.success("Payment successful! Your fees have been updated.");
            queryClient.invalidateQueries({ queryKey: ["student-invoices"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Verification failed. Please contact school admin if amount was deducted.");
        },
        onSettled: () => setIsProcessingId(null),
    });

    const initiatePaymentMutation = useMutation({
        mutationFn: FeesService.initiateOnlinePayment,
        onSuccess: async (data: any) => {
            const { orderId, amount, currency, razorpayKeyId, invoice } = data;
            
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load.");
                setIsProcessingId(null);
                return;
            }

            const options = {
                key: razorpayKeyId,
                amount: amount,
                currency: currency,
                name: "School Fees Payment",
                description: `Fee Payment for ${invoice.invoiceTitle || "Invoice #" + invoice.id}`,
                order_id: orderId,
                handler: function (response: any) {
                    verifyMutation.mutate({
                        invoiceId: invoice.id,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                    });
                },
                prefill: {
                    name: invoice.student?.firstName ? `${invoice.student.firstName} ${invoice.student.lastName || ""}` : "",
                    email: "",
                    contact: invoice.student?.phone || "",
                },
                theme: {
                    color: "var(--primary)",
                },
                modal: {
                    ondismiss: () => setIsProcessingId(null)
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", (response: any) => {
                toast.error(response.error.description || "Payment failed.");
                setIsProcessingId(null);
            });
            rzp.open();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to initiate payment.");
            setIsProcessingId(null);
        },
    });

    const handlePayNow = (invoice: StudentInvoice) => {
        if (!gatewayStatus?.isPaymentEnabled) {
            toast.error("Online payments are currently disabled by the school admin.");
            return;
        }
        setIsProcessingId(invoice.id);
        const amountToPay = invoice.amountDue - invoice.amountPaid;
        initiatePaymentMutation.mutate({ invoiceId: invoice.id, amount: amountToPay });
    };

    const invoices: StudentInvoice[] = invoicesRes?.data || [];
    const filteredInvoices = invoices.filter(inv => 
        inv.invoiceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalDue = invoices.reduce((acc, inv) => acc + (inv.amountDue - inv.amountPaid), 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + inv.amountPaid, 0);

    if (isInvoicesLoading || isGatewayLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            {/* --- Header --- */}
            <div className="flex flex-col gap-1 pt-2">
                <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
                    Fees & Invoices
                </h1>
                <p className="text-sm font-semibold text-zinc-500">
                    Manage your academic fee payments and billing history.
                </p>
            </div>

            {/* --- Stats Summary --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[120px] relative overflow-hidden">
                    <div className="flex items-center justify-between z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">Total Outstanding</p>
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="z-10 mt-auto">
                        <h3 className="text-[1.8rem] font-black text-rose-600 dark:text-rose-500 tracking-tighter leading-none">
                            ₹{totalDue.toLocaleString("en-IN")}
                        </h3>
                        <p className="text-[11px] font-bold mt-1 text-zinc-400">Pending Dues</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[120px] relative overflow-hidden">
                    <div className="flex items-center justify-between z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">Total Paid</p>
                        <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="z-10 mt-auto">
                        <h3 className="text-[1.8rem] font-black text-emerald-600 dark:text-emerald-500 tracking-tighter leading-none">
                            ₹{totalPaid.toLocaleString("en-IN")}
                        </h3>
                        <p className="text-[11px] font-bold mt-1 text-zinc-400">Successfully Cleared</p>
                    </div>
                </div>

                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[120px] hidden lg:flex">
                    <div className="flex items-center justify-between z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary/70">Payment Gateway</p>
                        <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div className="z-10 mt-auto">
                        <h3 className="text-[1rem] font-black text-primary tracking-tight">
                            {gatewayStatus?.isPaymentEnabled ? "Online Ready" : "Manual Only"}
                        </h3>
                        <p className="text-[11px] font-bold mt-1 text-primary/60">
                            {gatewayStatus?.isPaymentEnabled 
                               ? "Secure payments powered by Razorpay" 
                               : "Contact admin for online setup"}
                        </p>
                    </div>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0d0d0d] p-4 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                        placeholder="Search invoices..." 
                        className="pl-9 h-10 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-10 px-4 flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Filter className="h-4 w-4" />
                        Sort by Date
                    </Button>
                </div>
            </div>

            {/* --- Invoice List --- */}
            <div className="grid grid-cols-1 gap-4">
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                        <Card key={inv.id} className="overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 rounded-[28px] shadow-none bg-white dark:bg-[#0d0d0d] group transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div className="p-6 md:w-2/3 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800/60">
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge 
                                                className={cn(
                                                    "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider",
                                                    inv.status === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    inv.status === "PENDING" ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                    inv.status === "PARTIAL" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                    "bg-zinc-50 text-zinc-600 border-zinc-100"
                                                )}
                                                variant="outline"
                                            >
                                                {inv.status}
                                            </Badge>
                                            <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                Due: {format(new Date(inv.dueDate), "dd MMM yyyy")}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-primary transition-colors">
                                            {inv.invoiceTitle}
                                        </h3>
                                        <p className="text-sm font-medium text-zinc-500 mb-4">
                                            Billing Month: {inv.invoiceMonth}
                                        </p>

                                        <div className="flex items-center gap-6 mt-6">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Items Included</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {inv.items.map((item, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                                                            {item.feeHead.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 md:w-1/3 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-center">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-zinc-500">Invoice Amount</span>
                                                <span className="font-black text-zinc-900 dark:text-zinc-100">₹{inv.amountDue.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-bold text-zinc-500">Already Paid</span>
                                                <span className="font-black text-emerald-500">₹{inv.amountPaid.toLocaleString("en-IN")}</span>
                                            </div>
                                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-[12px] uppercase tracking-widest text-zinc-400">Amount Due</span>
                                                <span className="text-xl font-black text-rose-600 dark:text-rose-500">₹{(inv.amountDue - inv.amountPaid).toLocaleString("en-IN")}</span>
                                            </div>

                                            {inv.status !== "PAID" && (
                                                <Button 
                                                    className="w-full mt-4 rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20"
                                                    disabled={isProcessingId === inv.id}
                                                    onClick={() => handlePayNow(inv)}
                                                >
                                                    {isProcessingId === inv.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>Pay Now <ArrowRight className="ml-2 h-4 w-4" /></>
                                                    )}
                                                </Button>
                                            )}
                                            {inv.status === "PAID" && (
                                               <Button 
                                                    variant="outline"
                                                    className="w-full mt-4 rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] border-emerald-200/50 text-emerald-600 cursor-default"
                                                >
                                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Paid
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200/60 dark:border-zinc-800/60 rounded-[32px] p-20 text-center">
                        <div className="h-20 w-20 bg-zinc-50 dark:bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Banknote className="h-10 w-10 text-zinc-300" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-2">No invoices found</h3>
                        <p className="text-zinc-500 max-w-xs mx-auto text-sm">
                            There are currently no fee invoices generated for your account. Enjoy the free time!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
