"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmailService, EmailPackage } from "@/services/email.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Mail, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { useAuth } from "@/hooks/use-auth";

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

export default function EmailRechargePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { data: packages = [], isLoading } = useQuery<EmailPackage[]>({
        queryKey: ["email-packages"],
        queryFn: EmailService.getPackages,
    });

    const activePackages = packages.filter((pkg) => pkg.isActive);

    const handlePurchase = async (pkg: EmailPackage) => {
        setProcessingId(pkg.id);
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            toast.error("Payment gateway failed to load. Please check your connection.");
            setProcessingId(null);
            return;
        }

        try {
            const order = await EmailService.initiateRecharge({ packageId: pkg.id });
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: Math.round(pkg.price * 100),
                currency: "INR",
                name: "Unifynt Workspace",
                description: `Email Recharge: ${pkg.name}`,
                order_id: order.referenceId || undefined,
                prefill: {
                    name: user?.name || "School Admin",
                    email: user?.email || "admin@school.com"
                },
                theme: { color: "#2563eb" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handler: async (response: any) => {
                    try {
                        await EmailService.verifyAndCompleteRecharge({
                            transactionId: order.id,
                            referenceId: response.razorpay_payment_id,
                        });
                        toast.success(`Success! ${pkg.credits.toLocaleString()} email credits added to your wallet.`);
                        queryClient.invalidateQueries({ queryKey: ["email-stats"] });
                        queryClient.invalidateQueries({ queryKey: ["email-transactions"] });
                    } catch (err) {
                        console.error(err);
                        toast.error("Payment verification failed. Contact support if amount was deducted.");
                    } finally {
                        setProcessingId(null);
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.info("Payment cancelled.");
                        setProcessingId(null);
                    }
                }
            };
            const rzp = new window.Razorpay(options);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rzp.on("payment.failed", (res: any) => {
                console.error(res.error);
                toast.error(res.error.description || "Payment failed");
                setProcessingId(null);
            });
            rzp.open();
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast.error(err.response?.data?.message || "Failed to initiate recharge securely.");
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2 items-center text-center py-8">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary/20">
                    <Mail className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Supercharge Your Email Outreach</h2>
                <p className="text-sm font-medium text-muted-foreground max-w-lg">
                    Instantly add high-delivery email credits to your workspace. Credits never expire and come with Nodemailer premium SMTP routing.
                </p>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading email packages...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto pb-10">
                    {activePackages.length > 0 ? activePackages.map((pkg: EmailPackage) => (
                        <Card key={pkg.id} className="relative overflow-hidden border-border/60 hover:border-primary/50 transition-all hover:shadow-2xl flex flex-col h-full bg-card group">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                                <Mail className="h-32 w-32 text-primary" />
                            </div>
                            <CardHeader className="pb-4 text-center bg-gradient-to-b from-muted/50 to-transparent border-b border-border/40">
                                <CardTitle className="text-xl font-extrabold text-foreground">{pkg.name}</CardTitle>
                                <CardDescription className="text-sm font-bold text-primary mt-1 tracking-wide">NODEMAILER SMTP</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 flex-1 flex flex-col justify-between relative z-10 p-6">
                                <div className="text-center mb-8">
                                    <div className="text-5xl font-black text-foreground mb-4 flex justify-center items-start gap-1">
                                        <span className="text-2xl mt-1 text-muted-foreground">₹</span>{pkg.price.toLocaleString()}
                                    </div>
                                    <Badge variant="outline" className="text-sm font-black bg-primary/5 border-primary/30 text-primary px-5 py-2 rounded-full shadow-sm">
                                        {pkg.credits.toLocaleString()} Email Credits
                                    </Badge>
                                </div>
                                <div className="space-y-4 mb-8 bg-muted/20 p-5 rounded-2xl border border-border/40">
                                    <div className="flex items-center gap-3 text-sm text-foreground font-semibold">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Bulk deduction (not per-email trickle)
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground font-semibold">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" /> 99.9% Uptime SLA
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-foreground font-semibold">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Lifetime Validity
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handlePurchase(pkg)}
                                    disabled={processingId === pkg.id}
                                    className="w-full h-14 font-bold shadow-lg text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {processingId === pkg.id ? (
                                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing Payment...</>
                                    ) : (
                                        <><CreditCard className="mr-2 h-5 w-5" /> Buy {pkg.credits.toLocaleString()} Credits</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border/60">
                            <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-foreground">No Packages Available</h3>
                            <p className="text-muted-foreground font-medium mt-1">Please contact the Super Admin to configure Email packages.</p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground pb-8">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure 256-bit encrypted payments powered by Razorpay.
            </div>
        </div>
    );
}
