"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SmsService, SmsPackage } from "@/services/sms.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { loadRazorpayScript } from "@/lib/load-razorpay";
import { useAuth } from "@/hooks/use-auth";

// Type declaration for Razorpay window object
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

export default function SmsRechargePage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch all packages using the properly typed service method
    const { data: packages = [], isLoading } = useQuery<SmsPackage[]>({
        queryKey: ["sms-packages"],
        queryFn: SmsService.getPackages,
    });

    // Filter only active packages for the school admin to see
    const activePackages = packages.filter((pkg) => pkg.isActive);

    const handlePurchase = async (pkg: SmsPackage) => {
        setProcessingId(pkg.id);

        // 1. Load Razorpay SDK
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            toast.error("Payment gateway failed to load. Please check your connection.");
            setProcessingId(null);
            return;
        }

        try {
            // 2. Initiate Recharge in our Backend (Creates a PENDING transaction)
            const order = await SmsService.initiateRecharge({ packageId: pkg.id });

            // 3. Configure Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure this is set in your .env.local
                amount: Math.round(pkg.price * 100), // Razorpay expects amount in paise
                currency: "INR",
                name: "Unifynt Workspace",
                description: `SMS Recharge: ${pkg.name}`,
                // If your backend generates a real Razorpay order_id, pass it here. 
                // Otherwise, Razorpay will handle it as a direct payment.
                order_id: order.referenceId || undefined,
                prefill: {
                    name: user?.name || "School Admin",
                    email: user?.email || "admin@school.com"
                },
                theme: { color: "#2563eb" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handler: async (response: any) => {
                    try {
                        // 4. Verify Payment with our Backend
                        await SmsService.verifyAndCompleteRecharge({
                            transactionId: order.id, // Our DB transaction ID
                            referenceId: response.razorpay_payment_id,
                        });

                        toast.success(`Success! ${pkg.credits.toLocaleString()} SMS credits have been added to your wallet.`);

                        // Refresh Dashboard & Ledger Stats
                        queryClient.invalidateQueries({ queryKey: ["sms-stats"] });
                        queryClient.invalidateQueries({ queryKey: ["sms-transactions"] });
                    } catch (err) {
                        console.error(err);
                        toast.error("Payment verification failed. Please contact support if amount was deducted.");
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

            // 5. Open Razorpay Checkout
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
            {/* Page Header */}
            <div className="flex flex-col gap-2 items-center text-center py-8">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-primary/20">
                    <Zap className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Supercharge Your Communication</h2>
                <p className="text-sm font-medium text-muted-foreground max-w-lg">
                    Instantly add high-delivery transactional SMS credits to your workspace. Credits never expire and come with premium routing.
                </p>
            </div>

            {/* Package List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">Loading premium packages...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1200px] mx-auto pb-10">
                    {activePackages.length > 0 ? activePackages.map((pkg: SmsPackage) => (
                        <Card key={pkg.id} className="relative overflow-hidden border-border/60 hover:border-primary/50 transition-all hover:shadow-2xl flex flex-col h-full bg-card group">
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                                <Zap className="h-32 w-32 text-primary" />
                            </div>

                            <CardHeader className="pb-4 text-center bg-gradient-to-b from-muted/50 to-transparent border-b border-border/40">
                                <CardTitle className="text-xl font-extrabold text-foreground">{pkg.name}</CardTitle>
                                <CardDescription className="text-sm font-bold text-primary mt-1 tracking-wide">PREMIUM ROUTE</CardDescription>
                            </CardHeader>

                            <CardContent className="pt-8 flex-1 flex flex-col justify-between relative z-10 p-6">
                                <div className="text-center mb-8">
                                    <div className="text-5xl font-black text-foreground mb-4 flex justify-center items-start gap-1">
                                        <span className="text-2xl mt-1 text-muted-foreground">₹</span>{pkg.price.toLocaleString()}
                                    </div>
                                    <Badge variant="outline" className="text-sm font-black bg-primary/5 border-primary/30 text-primary px-5 py-2 rounded-full shadow-sm">
                                        {pkg.credits.toLocaleString()} SMS Credits
                                    </Badge>
                                </div>

                                <div className="space-y-4 mb-8 bg-muted/20 p-5 rounded-2xl border border-border/40">
                                    <div className="flex items-center gap-3 text-sm text-foreground font-semibold">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" /> DLT Scrubbing Included
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
                            <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-foreground">No Packages Available</h3>
                            <p className="text-muted-foreground font-medium mt-1">Please contact the Super Admin to configure SMS packages.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-muted-foreground pb-8">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure 256-bit encrypted payments powered by Razorpay.
            </div>
        </div>
    );
}