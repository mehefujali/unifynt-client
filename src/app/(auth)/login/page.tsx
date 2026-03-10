/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
    email: z.string().min(1, "Please enter your Email or Student ID"),
    password: z.string().min(1, "Password cannot be empty"),
});

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [is2FA, setIs2FA] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [cooldown, setCooldown] = useState(0);

    const { user, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (user && user.role && !isAuthLoading) {
            if (user.role === "SUPER_ADMIN") router.push("/super-admin");
            else if (user.role === "STUDENT") router.push("/student");
            else router.push("/admin");
        }
    }, [user, isAuthLoading, router]);

    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
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

    useEffect(() => {
        if (is2FA && userEmail) {
            const fetchStatus = async () => {
                try {
                    const { data } = await api.get("/auth/otp-status", { params: { email: userEmail, type: "LOGIN" } });
                    if (data?.data?.nextResendIn) setCooldown(data.data.nextResendIn);
                } catch { /* ignore */ }
            };
            fetchStatus();
        }
    }, [is2FA, userEmail]);

    const handleRouting = (role: string) => {
        if (role === "SUPER_ADMIN") router.push("/super-admin");
        else if (role === "STUDENT") router.push("/student");
        else router.push("/admin");
    };

    const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/login", values);
            if (data?.data?.step === "2FA_REQUIRED") {
                setUserEmail(values.email);
                setIs2FA(true);
                toast.success("Security code sent to your email.");
            } else {
                if (data.data?.accessToken) {
                    localStorage.setItem("accessToken", data.data.accessToken);
                }
                toast.success("Successfully logged in!");
                handleRouting(data.data?.role);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.post("/auth/resend-otp", { email: userEmail, type: "LOGIN" });
            setCooldown(data.data.nextResendIn);
            toast.success("New verification code sent!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Resend failed");
        } finally {
            setIsLoading(false);
        }
    };

    const onOTPSubmit = async (values: z.infer<typeof otpSchema>) => {
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/login/verify", { email: userEmail, otp: values.otp });
            if (data.data?.accessToken) {
                localStorage.setItem("accessToken", data.data.accessToken);
            }
            toast.success("Identity verified successfully!");
            handleRouting(data.data?.role);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Invalid OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <div className="hidden lg:flex w-[45%] bg-zinc-950 text-white flex-col justify-between p-12 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <Image src="/unifynt-logo.png" alt="Unifynt Logo" width={40} height={40} className="brightness-0 invert" />
                        <span className="text-2xl font-black uppercase tracking-tight">Unifynt</span>
                    </div>
                    <div className="space-y-6">
                        <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15]">Welcome back to your workspace.</h1>
                        <p className="text-zinc-400 text-lg max-w-md leading-relaxed">Sign in to manage your institution, access real-time analytics, and streamline operations.</p>
                    </div>
                </div>
                <div className="relative z-10 text-xs font-bold text-zinc-500 uppercase tracking-widest">© {new Date().getFullYear()} Unifynt Inc.</div>
            </div>

            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">
                <div className="absolute top-8 right-8 text-sm font-medium text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-foreground hover:text-primary transition-all font-black uppercase underline-offset-4 hover:underline">Create workspace</Link>
                </div>

                <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 text-center sm:text-left">
                        <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">{is2FA ? "Security Check" : "Sign in"}</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            {is2FA ? `Enter the 6-digit code sent to ${userEmail}` : "Enter your Email or Student ID to continue."}
                        </p>
                    </div>

                    {!is2FA ? (
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email or Student ID</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input {...loginForm.register("email")} type="text" placeholder="admin@school.com or ID" className="pl-10 h-12 shadow-sm bg-muted/20" disabled={isLoading} />
                                    </div>
                                    {loginForm.formState.errors.email && <p className="text-xs text-red-500 font-medium">{loginForm.formState.errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                                        <Link href="/forgot-password" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Forgot password?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input {...loginForm.register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 h-12 shadow-sm bg-muted/20" disabled={isLoading} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {loginForm.formState.errors.password && <p className="text-xs text-red-500 font-medium">{loginForm.formState.errors.password.message}</p>}
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 text-md font-black uppercase tracking-wider transition-all shadow-md" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authorizing...</> : <>Authorize Account <ArrowRight className="ml-2 h-4 w-4" /></>}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-center mb-6">
                                    <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center shadow-inner">
                                        <ShieldCheck className="h-10 w-10 text-emerald-600" />
                                    </div>
                                </div>
                                <Input id="otp" placeholder="000000" className="h-14 text-center text-3xl tracking-[0.5em] font-mono font-black border-2 focus:border-emerald-500" maxLength={6} {...otpForm.register("otp")} disabled={isLoading} />
                            </div>
                            <div className="space-y-4">
                                <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase shadow-lg shadow-emerald-500/20" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verify Identity"}
                                </Button>
                                <div className="flex flex-col gap-3 pt-2 text-center h-10 justify-center">
                                    {cooldown > 0 ? (
                                        <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-center gap-1.5 select-none">
                                            <span className="relative flex h-2 w-2 mr-1">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
                                            </span>
                                            {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}s
                                        </div>
                                    ) : (
                                        <button type="button" disabled={isLoading} onClick={handleResend} className="text-[11px] font-bold text-zinc-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1.5">
                                            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                                            Resend code.
                                        </button>
                                    )}
                                </div>
                                <div className="flex justify-center">
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-2" onClick={() => setIs2FA(false)}>
                                        <ArrowLeft className="h-3 w-3" /> Back to Login
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