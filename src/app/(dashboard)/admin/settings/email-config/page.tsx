/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Loader2,
    Mail,
    RefreshCw,
    Save,
    ShieldCheck,
    HelpCircle,
    ArrowRight,
    Zap,
    ExternalLink,
    Globe,
    Key,
    Server,
    Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useAuth } from "@/hooks/use-auth";
import { SchoolService } from "@/services/school.service";
import { useEffect } from "react";

const emailConfigSchema = z.object({
    emailHost: z.string().optional().or(z.literal("")),
    emailPort: z.number({ invalid_type_error: "Must be a number" }).optional(),
    emailUser: z.string().optional().or(z.literal("")),
    emailPass: z.string().optional().or(z.literal("")),
    emailFrom: z.string().optional().or(z.literal("")),
    useCustomEmail: z.boolean(),
});

type EmailConfigFormValues = z.infer<typeof emailConfigSchema>;

const SETUP_STEPS = [
    {
        icon: Globe,
        title: "Choose Your Provider",
        description: "Decide which email service you want to use (Gmail, Outlook, Private Hosting, etc.).",
    },
    {
        icon: Key,
        title: "Generate App Password",
        description: "For Gmail/Outlook, standard passwords won't work. You must enable 2FA and create an 'App Password' from your provider's security settings.",
    },
    {
        icon: Server,
        title: "Identify SMTP Details",
        description: "Find your host (e.g., smtp.gmail.com) and port (usually 587 or 465) from your email provider's documentation.",
    },
    {
        icon: ShieldCheck,
        title: "Test Connection",
        description: "Enter the details in the form and click 'Test Connection' to ensure we can reach your mail server.",
    },
    {
        icon: Save,
        title: "Activate Workspace",
        description: "Enable the 'Use Custom SMTP' toggle and save. All your institution emails will now be sent via your own server.",
    },
];

const EMAIL_FAQ = [
    {
        q: "Why do I need an App Password for Gmail?",
        a: "Google no longer allows 'Less Secure Apps'. You must use an App Password which is a 16-digit code specifically for Unifynt.",
    },
    {
        q: "What is the benefit of custom SMTP?",
        a: "Emails appear to come directly from your institution domain (e.g., admin@school.com), which increases trust and improves deliverability.",
    },
    {
        q: "Does Unifynt store my email password securely?",
        a: "Yes. Your SMTP password is encrypted with military-grade AES-256 encryption before storage and is never exposed to anybody.",
    },
    {
        q: "What happens if my SMTP connection fails?",
        a: "If the connection fails and custom SMTP is disabled, Unifynt will fall back to its internal secure delivery system so you never miss a notification.",
    },
];

export default function EmailConfigPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: schoolData, isLoading: isSchoolLoading } = useQuery({
        queryKey: ["my-school", user?.schoolId],
        queryFn: () => SchoolService.getSingleSchool(user?.schoolId as string),
        enabled: !!user?.schoolId,
    });

    const form = useForm<EmailConfigFormValues>({
        resolver: zodResolver(emailConfigSchema) as any,
        defaultValues: {
            useCustomEmail: false,
        }
    });

    useEffect(() => {
        if (schoolData) {
            form.reset({
                emailHost: schoolData.emailHost || "",
                emailPort: schoolData.emailPort || 587,
                emailUser: schoolData.emailUser || "",
                emailPass: schoolData.emailPass || "",
                emailFrom: schoolData.emailFrom || "",
                useCustomEmail: schoolData.useCustomEmail || false,
            });
        }
    }, [schoolData, form]);

    const updateMutation = useMutation({
        mutationFn: async (data: EmailConfigFormValues) => {
            return SchoolService.updateSchool(user?.schoolId as string, data as any);
        },
        onSuccess: () => {
            toast.success("Email configuration saved");
            queryClient.invalidateQueries({ queryKey: ["my-school", user?.schoolId] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to save settings"),
    });

    const testSmtpMutation = useMutation({
        mutationFn: async () => {
            const values = form.getValues();
            return SchoolService.testSmtp({
                emailHost: values.emailHost,
                emailPort: values.emailPort,
                emailUser: values.emailUser,
                emailPass: values.emailPass,
                emailFrom: values.emailFrom,
            });
        },
        onSuccess: (res: any) => toast.success(res.message || "Test email sent successfully!"),
        onError: (error: any) => toast.error(error.response?.data?.message || "SMTP Connection Failed"),
    });

    if (isSchoolLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between border-b pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Email Configuration</h1>
                    <p className="text-sm text-muted-foreground">Setup custom SMTP to send emails from your own institution domain.</p>
                </div>
                <Button 
                    onClick={form.handleSubmit((data) => updateMutation.mutate(data))}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-6"
                >
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Settings
                </Button>
            </div>

            <Card className="border-2">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">Use Custom SMTP</CardTitle>
                            <CardDescription>Toggle this to enable or disable custom email provider settings.</CardDescription>
                        </div>
                        <Switch 
                            checked={form.watch("useCustomEmail")}
                            onCheckedChange={(checked) => form.setValue("useCustomEmail", checked)}
                        />
                    </div>
                </CardHeader>
                {form.watch("useCustomEmail") && (
                    <CardContent className="space-y-6 pt-6 border-t animate-in fade-in slide-in-from-top-2">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMTP Host</Label>
                                <Input {...form.register("emailHost")} placeholder="e.g. smtp.gmail.com" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMTP Port</Label>
                                <Input type="number" {...form.register("emailPort", { valueAsNumber: true })} placeholder="e.g. 587" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMTP Username</Label>
                                <Input {...form.register("emailUser")} placeholder="e.g. notifications@yourdomain.com" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMTP Password</Label>
                                <Input type="password" {...form.register("emailPass")} placeholder="••••••••••••" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From Name (Display Name)</Label>
                                <Input {...form.register("emailFrom")} placeholder="e.g. Golden Public School" />
                                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    This name will be appearing in the recipient&apos;s inbox.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t flex justify-between items-center bg-secondary/30 dark:bg-zinc-900/50 -mx-6 -mb-6 p-6">
                            <p className="text-xs text-muted-foreground italic font-medium">Tip: Verify your credentials before saving.</p>
                            <Button 
                                type="button" 
                                variant="outline"
                                disabled={testSmtpMutation.isPending}
                                onClick={() => testSmtpMutation.mutate()}
                                className="flex items-center gap-2 border-primary/30 hover:bg-primary/5 active:scale-95 transition-all shadow-sm group"
                            >
                                {testSmtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <RefreshCw className="h-4 w-4 text-primary group-hover:rotate-180 transition-transform duration-500" />}
                                <span className="font-bold text-primary">Test Connection</span>
                            </Button>
                        </div>
                    </CardContent>
                )}
            </Card>

            <Separator />

            {/* Documentation Section */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* How to Setup */}
                <Card className="border shadow-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" /> Setup Guide
                        </CardTitle>
                        <CardDescription>Follow these steps to connect your custom email.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pl-6 space-y-0">
                            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-border" />
                            {SETUP_STEPS.map((step, i) => (
                                <div key={i} className="relative pb-6 last:pb-0">
                                    <div className="absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background z-10">
                                        <span className="text-[10px] font-bold text-primary">{i+1}</span>
                                    </div>
                                    <div className="pl-4">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <step.icon className="h-3.5 w-3.5 text-muted-foreground" />
                                            {step.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* FAQ section */}
                <div className="space-y-6">
                    <Card className="border shadow-md bg-muted/20">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <HelpCircle className="h-4 w-4 text-primary" /> Frequently Asked Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y space-y-4">
                            {EMAIL_FAQ.map((item, i) => (
                                <div key={i} className="pt-4 first:pt-0">
                                    <p className="text-sm font-bold flex items-start gap-2">
                                        <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                        {item.q}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2 pl-6 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Alert className="bg-primary/5 border-primary/20">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-xs font-medium text-muted-foreground leading-relaxed">
                            <strong>Security Note:</strong> Your SMTP credentials are encrypted with AES-256 before being stored. Unifynt staff can never see your plain SMTP password.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>

            {/* Extra Guidance */}
            <Card className="border shadow-sm border-dashed">
                <CardHeader className="pb-3 px-6">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Info className="h-4 w-4" /> Quick Links & Documentation
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 px-6">
                    {[
                        { label: "Google App Passwords", href: "https://myaccount.google.com/apppasswords" },
                        { label: "Outlook SMTP Setup", href: "https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040" },
                        { label: "Gmail SMTP Guide", href: "https://support.google.com/a/answer/176600?hl=en" },
                        { label: "Common Port Guide", href: "https://www.mailgun.com/blog/email/which-smtp-port-should-i-use/" },
                    ].map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" 
                           className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-full px-4 py-2 transition-all">
                            {link.label} <ExternalLink className="h-3 w-3" />
                        </a>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
