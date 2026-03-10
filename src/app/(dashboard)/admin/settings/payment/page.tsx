"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import {
    CreditCard,
    ShieldCheck,
    ShieldOff,
    Plug,
    Trash2,
    Loader2,
    Eye,
    EyeOff,
    AlertTriangle,
    CheckCircle2,
    Info,
    BadgeIndianRupee,
    BookOpen,
    Zap,
    Key,
    ToggleRight,
    ExternalLink,
    HelpCircle,
    ArrowRight,
    Globe,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FinancialService } from "@/services/financial.service";

const formSchema = z.object({
    razorpayKeyId: z
        .string()
        .trim()
        .regex(/^rzp_(live|test)_[a-zA-Z0-9]+$/, "Must start with rzp_live_ or rzp_test_"),
    razorpayKeySecret: z
        .string()
        .trim()
        .min(20, "Key Secret appears too short"),
    isPaymentEnabled: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
    {
        icon: Globe,
        title: "Create a Razorpay Account",
        description: "If you don't have one, sign up free at razorpay.com. It takes under 5 minutes.",
        link: "https://razorpay.com",
        linkLabel: "Go to Razorpay →",
    },
    {
        icon: Key,
        title: "Get Your API Keys",
        description: "Login to Razorpay Dashboard → Settings → API Keys → Generate Test Key (for testing) or Live Key (for real payments).",
        link: "https://dashboard.razorpay.com/app/keys",
        linkLabel: "Open API Keys →",
    },
    {
        icon: CreditCard,
        title: "Paste Keys Below",
        description: "Copy your Key ID and Key Secret from the dashboard and paste them in the form below. Your secret key is encrypted before saving — we never store it in plain text.",
    },
    {
        icon: Plug,
        title: "Test the Connection",
        description: "Click \"Test Connection\" to verify your keys work. We'll create a harmless ₹1 test order to confirm everything is connected properly.",
    },
    {
        icon: ToggleRight,
        title: "Enable Online Payments",
        description: "Once tested, turn on the \"Enable Online Payments\" toggle. Your school can now collect fees and admission payments digitally.",
    },
];

const FAQ = [
    {
        q: "Is it safe to enter my Razorpay Secret here?",
        a: "Yes. Your secret key is immediately encrypted using AES-256-GCM (military-grade encryption) before being stored. It is decrypted only on our secure server when creating a payment — it never reaches your browser again.",
    },
    {
        q: "Where does the money go?",
        a: "Directly to your school's bank account linked to your Razorpay account. Unifynt does not touch or hold your funds. We only facilitate the connection.",
    },
    {
        q: "What's the difference between Test and Live keys?",
        a: "Test keys (rzp_test_...) use dummy money — perfect for testing. Live keys (rzp_live_...) process real payments. Always verify with Test first, then switch to Live.",
    },
    {
        q: "Can I disable payments later?",
        a: "Yes. Use the toggle to turn payments on/off at any time without losing your saved credentials. You can also remove credentials entirely.",
    },
    {
        q: "What is the Razorpay platform fee?",
        a: "Razorpay charges ~2% per transaction directly to your account. Unifynt charges nothing extra for this feature.",
    },
];

export default function PaymentGatewayPage() {
    const queryClient = useQueryClient();
    const [showSecret, setShowSecret] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    const { data: status, isLoading: isStatusLoading } = useQuery({
        queryKey: ["payment-gateway-status"],
        queryFn: FinancialService.getGatewayStatus,
    });

    const form = useForm<FormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: { razorpayKeyId: "", razorpayKeySecret: "", isPaymentEnabled: false },
    });

    const saveMutation = useMutation({
        mutationFn: FinancialService.saveGatewayConfig,
        onSuccess: () => {
            toast.success("Payment gateway configured successfully!");
            queryClient.invalidateQueries({ queryKey: ["payment-gateway-status"] });
            form.reset({ razorpayKeyId: "", razorpayKeySecret: "", isPaymentEnabled: false });
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error((err as any)?.response?.data?.message || "Failed to save configuration.");
        },
    });

    const toggleMutation = useMutation({
        mutationFn: (isPaymentEnabled: boolean) => FinancialService.togglePaymentEnabled(isPaymentEnabled),
        onSuccess: (_, enabled) => {
            toast.success(`Online payments ${enabled ? "enabled" : "disabled"}.`);
            queryClient.invalidateQueries({ queryKey: ["payment-gateway-status"] });
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error((err as any)?.response?.data?.message || "Failed to update.");
        },
    });

    const removeMutation = useMutation({
        mutationFn: FinancialService.removeGatewayConfig,
        onSuccess: () => {
            toast.success("Payment gateway credentials removed.");
            queryClient.invalidateQueries({ queryKey: ["payment-gateway-status"] });
        },
        onError: (err: unknown) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error((err as any)?.response?.data?.message || "Failed to remove.");
        },
    });

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const result = await FinancialService.testGatewayConnection();
            if (result.success) toast.success(result.message);
            else toast.error(result.message);
        } catch (err: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error((err as any)?.response?.data?.message || "Connection test failed.");
        } finally {
            setIsTesting(false);
        }
    };

    const onSubmit = (values: FormValues) => saveMutation.mutate(values);

    if (isStatusLoading) {
        return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">

            {/* ─── Header ─── */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" /> Payment Gateway
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Connect your school&apos;s Razorpay account to collect fees and admission payments online.
                    Money goes directly into your bank account — Unifynt doesn&apos;t touch it.
                </p>
            </div>

            <Separator />

            {/* ─── Status Card ─── */}
            <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Current Status</CardTitle>
                        {status?.isConfigured ? (
                            <Badge variant="default" className="gap-1 bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle2 className="h-3 w-3" /> Configured
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="gap-1">
                                <AlertTriangle className="h-3 w-3" /> Not Configured
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status?.isConfigured ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-muted/40 rounded-lg p-3 border col-span-2">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Key ID (masked)</p>
                                <p className="font-mono text-sm font-medium">{status.maskedKeyId}</p>
                            </div>
                            <div className="bg-muted/40 rounded-lg p-3 border">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Mode</p>
                                <Badge variant={status.keyMode === "LIVE" ? "default" : "outline"} className={status.keyMode === "LIVE" ? "bg-emerald-500" : ""}>
                                    {status.keyMode ?? "—"}
                                </Badge>
                            </div>
                        </div>
                    ) : (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>No Razorpay credentials saved yet. Follow the setup guide below to connect your account.</AlertDescription>
                        </Alert>
                    )}

                    {status?.isConfigured && (
                        <>
                            <div className="flex items-center justify-between rounded-xl border p-4 bg-background">
                                <div>
                                    <p className="font-semibold text-sm">Enable Online Payments</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Turn off to hide all payment options from students and parents.</p>
                                </div>
                                <Switch
                                    checked={status.isPaymentEnabled}
                                    disabled={toggleMutation.isPending}
                                    onCheckedChange={(val) => toggleMutation.mutate(val)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="outline" size="sm" className="gap-2" onClick={handleTestConnection} disabled={isTesting}>
                                    {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plug className="h-3.5 w-3.5" />}
                                    Test Connection
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60">
                                            <Trash2 className="h-3.5 w-3.5" /> Remove Credentials
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove Payment Gateway?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will delete your Razorpay credentials and disable all online payments. This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => removeMutation.mutate()}>
                                                {removeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                Yes, Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ─── Setup Guide ─── */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" /> How to Set Up — Step by Step
                    </CardTitle>
                    <CardDescription>Follow these 5 steps. Takes about 5 minutes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative pl-6 space-y-0">
                        {/* Vertical line */}
                        <div className="absolute left-[11px] top-4 bottom-4 w-px bg-border" />
                        {STEPS.map((step, i) => (
                            <div key={i} className="relative pb-7 last:pb-0">
                                {/* Circle */}
                                <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background z-10">
                                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                                </div>
                                <div className="pl-4">
                                    <p className="font-semibold text-sm flex items-center gap-2">
                                        <step.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                        {step.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
                                    {step.link && (
                                        <a href={step.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                                            {step.linkLabel} <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ─── Config Form ─── */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <BadgeIndianRupee className="h-4 w-4 text-primary" />
                        {status?.isConfigured ? "Update Your Credentials" : "Enter Your Razorpay Keys"}
                    </CardTitle>
                    <CardDescription>
                        Get your keys from{" "}
                        <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">
                            Razorpay Dashboard → Settings → API Keys
                        </a>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField control={form.control} name="razorpayKeyId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Key ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder="rzp_live_xxxxxxxxxxxx  or  rzp_test_xxxxxxxxxxxx" className="font-mono h-11" {...field} />
                                    </FormControl>
                                    <FormDescription>This is public — starts with <code>rzp_live_</code> or <code>rzp_test_</code></FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="razorpayKeySecret" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Key Secret</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showSecret ? "text" : "password"}
                                                placeholder="Your secret key from Razorpay"
                                                className="font-mono h-11 pr-10"
                                                {...field}
                                            />
                                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground" onClick={() => setShowSecret(!showSecret)}>
                                                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>Encrypted immediately — never stored in plain text, never sent to the browser again.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="isPaymentEnabled" render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-xl border p-4 bg-muted/20">
                                    <div>
                                        <FormLabel className="font-bold cursor-pointer">Enable Online Payments Immediately</FormLabel>
                                        <FormDescription>You can also enable/disable this from the status card above.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40">
                                <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                                    <strong>Security:</strong> Your Key Secret is encrypted with AES-256-GCM before storage. It is only decrypted on the server when creating a payment order — your browser never sees it again after you submit.
                                </AlertDescription>
                            </Alert>

                            <Button type="submit" disabled={saveMutation.isPending} className="w-full h-11 font-bold shadow-sm">
                                {saveMutation.isPending
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                    : <><ShieldOff className="mr-2 h-4 w-4" /> Save Gateway Configuration</>}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* ─── FAQ ─── */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" /> Frequently Asked Questions
                    </CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                    {FAQ.map((item, i) => (
                        <div key={i} className="py-4 first:pt-0 last:pb-0">
                            <p className="font-semibold text-sm flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /> {item.q}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1.5 pl-6 leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* ─── Useful Links ─── */}
            <Card className="border shadow-sm bg-muted/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5" /> Useful Links
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    {[
                        { label: "Razorpay Dashboard", href: "https://dashboard.razorpay.com" },
                        { label: "API Keys", href: "https://dashboard.razorpay.com/app/keys" },
                        { label: "KYC & Settlement", href: "https://dashboard.razorpay.com/app/merchant-settings" },
                        { label: "Razorpay Docs", href: "https://razorpay.com/docs/payments/payment-gateway/" },
                        { label: "Support", href: "https://razorpay.com/support" },
                    ].map((link) => (
                        <Link key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 transition-colors">
                            {link.label} <ExternalLink className="h-3 w-3" />
                        </Link>
                    ))}
                </CardContent>
            </Card>

        </div>
    );
}
