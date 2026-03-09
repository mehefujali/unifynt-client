/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Building2, User, Mail, Phone, MapPin, Lock, Globe, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import Image from "next/image";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
    schoolName: z.string().min(2, "Institution name is required"),
    subdomain: z.string().min(3, "Min 3 characters").regex(/^[a-z0-9-]+$/, "Only lowercase, numbers & hyphens"),
    adminName: z.string().min(2, "Admin name is required"),
    email: z.string().email("Valid email is required"),
    schoolPhone: z.string().min(10, "Valid phone is required"),
    schoolAddress: z.string().min(5, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
    otp: z.string().length(6, "Must be 6 digits"),
});

export default function RegisterPage() {
    const router = useRouter();
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { schoolName: "", subdomain: "", adminName: "", email: "", schoolPhone: "", schoolAddress: "", password: "" },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const onRequestOTP = async (values: z.infer<typeof registerSchema>) => {
        setIsLoading(true);
        try {
            await api.post("/auth/register-school/request", values);
            setEmail(values.email);
            setShowOtp(true);
            toast.success("Verification code sent to your email!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.post("/auth/resend-otp", { email, type: "REGISTRATION" });
            setCooldown(data.data.nextResendIn); // ব্যাকএন্ড থেকে আসা ডাইনামিক কুলডাউন
            toast.success("New verification code sent!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Resend failed");
        } finally {
            setIsLoading(false);
        }
    };

    const onConfirm = async (values: z.infer<typeof otpSchema>) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/register-school/confirm", { email, otp: values.otp });
            if (data.data?.accessToken) localStorage.setItem("accessToken", data.data.accessToken);
            toast.success("Account created successfully!");
            router.push("/admin");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Left Column: Black Section */}
            <div className="hidden lg:flex w-[45%] bg-zinc-950 text-white flex-col justify-between p-12 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <Image src="/unifynt-logo.png" alt="Logo" width={40} height={40} className="brightness-0 invert" />
                        <span className="text-2xl font-black uppercase tracking-tight">Unifynt</span>
                    </div>
                    <div className="space-y-5">
                        <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15]">The platform for modern educational institutions.</h1>
                        <p className="text-zinc-400 text-lg max-w-md leading-relaxed">Setup your entire campus management system in minutes.</p>
                    </div>
                </div>
                <div className="relative z-10 text-xs font-bold text-zinc-500 uppercase tracking-widest">© {new Date().getFullYear()} Unifynt Inc.</div>
            </div>

            {/* Right Column: White Section */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
                <div className="absolute top-8 right-8 text-sm font-medium text-muted-foreground">
                    Have an account?{" "}
                    <Link href="/login" className="text-foreground hover:text-emerald-600 transition-all font-black uppercase underline-offset-4 hover:underline">Sign in</Link>
                </div>

                <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">{showOtp ? "Verify Email" : "Create workspace"}</h2>
                        <p className="text-sm text-muted-foreground mt-1.5">{showOtp ? `Confirm the code sent to ${email}` : "Enter your institution details to get started."}</p>
                    </div>

                    {!showOtp ? (
                        <form onSubmit={form.handleSubmit(onRequestOTP)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Institution Name</Label>
                                    <div className="relative"><Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input {...form.register("schoolName")} placeholder="Oxford Academy" className="pl-9 h-11 bg-muted/20" disabled={isLoading} /></div>
                                    {form.formState.errors.schoolName && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.schoolName.message}</p>}
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace URL</Label>
                                    <div className="relative flex"><Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" /><Input {...form.register("subdomain")} placeholder="oxford" className="pl-9 h-11 rounded-r-none bg-muted/20" disabled={isLoading} /><div className="inline-flex items-center px-3 rounded-r-md border border-l-0 bg-muted/50 text-muted-foreground text-[10px] font-black uppercase">.unifynt.com</div></div>
                                    {form.formState.errors.subdomain && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.subdomain.message}</p>}
                                </div>
                                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admin Name</Label>
                                    <div className="relative"><User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input {...form.register("adminName")} placeholder="John Doe" className="pl-9 h-11 bg-muted/20" disabled={isLoading} /></div>
                                    {form.formState.errors.adminName && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.adminName.message}</p>}
                                </div>
                                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                                    <div className="relative"><Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input {...form.register("schoolPhone")} placeholder="+91..." className="pl-9 h-11 bg-muted/20" disabled={isLoading} /></div>
                                    {form.formState.errors.schoolPhone && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.schoolPhone.message}</p>}
                                </div>
                                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Email</Label>
                                    <div className="relative"><Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input {...form.register("email")} type="email" placeholder="admin@school.com" className="pl-9 h-11 bg-muted/20" disabled={isLoading} /></div>
                                    {form.formState.errors.email && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.email.message}</p>}
                                </div>
                                <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                                    <div className="relative"><Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input {...form.register("password")} type="password" placeholder="••••••••" className="pl-9 h-11 bg-muted/20" disabled={isLoading} /></div>
                                    {form.formState.errors.password && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.password.message}</p>}
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Address</Label>
                                    <div className="relative"><MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input {...form.register("schoolAddress")} placeholder="City, State" className="pl-9 h-11 bg-muted/20" disabled={isLoading} /></div>
                                    {form.formState.errors.schoolAddress && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.schoolAddress.message}</p>}
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 text-sm font-black uppercase tracking-widest transition-all shadow-md" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <>Verify Email & Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={otpForm.handleSubmit(onConfirm)} className="space-y-6 text-center">
                            <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="h-10 w-10 text-emerald-600" />
                            </div>
                            <Input id="otp" placeholder="000000" className="h-14 text-center text-3xl tracking-[0.5em] font-mono font-black border-2 focus:border-emerald-500" maxLength={6} {...otpForm.register("otp")} disabled={isLoading} />
                            <div className="space-y-4">
                                <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-lg shadow-emerald-500/20" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Finalize Registration"}
                                </Button>
                                <div className="flex flex-col gap-3 pt-2 text-center">
                                    <button type="button" disabled={cooldown > 0 || isLoading} onClick={handleResend} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                                        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                                        {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Verification Code"}
                                    </button>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-2" onClick={() => setShowOtp(false)}>
                                        <ArrowLeft className="h-3 w-3" /> Edit Details
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}