/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { startAuthentication, browserSupportsWebAuthnAutofill } from "@simplewebauthn/browser";
import { toast } from "sonner";
import Image from "next/image";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useCallback } from "react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
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
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isCaptchaRequired, setIsCaptchaRequired] = useState(false);
    const [captchaCode, setCaptchaCode] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState(false);

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

    const handleRouting = useCallback((role: string) => {
        if (role === "SUPER_ADMIN") {
            router.push("/super-admin");
        } else {
            router.push("/admin");
        }
    }, [router]);

    const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
        if (isLoading) return;
        if (isCaptchaRequired && captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
            setCaptchaError(true);
            toast.error("Security verification failed. Please try again.");
            generateCaptcha();
            return;
        }

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
            let message = error.response?.data?.message;
            
            // If message is a Zod error string (JSON array), parse it
            if (typeof message === "string" && message.startsWith("[")) {
                try {
                    const parsed = JSON.parse(message);
                    if (Array.isArray(parsed) && parsed[0]?.message) {
                        message = parsed[0].message;
                    }
                } catch { /* stay with original */ }
            }

            const newFailedAttempts = failedAttempts + 1;
            setFailedAttempts(newFailedAttempts);
            
            if (newFailedAttempts >= 3) {
                setIsCaptchaRequired(true);
                generateCaptcha();
            }

            const msgLower = String(message).toLowerCase();
            if (msgLower.includes("password")) {
                loginForm.setError("password", { type: "manual", message: message });
            } else if (msgLower.includes("user") || msgLower.includes("email") || msgLower.includes("identifier")) {
                loginForm.setError("email", { type: "manual", message: message });
            } else {
                toast.error(typeof message === "string" ? message : "Invalid credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateCaptcha = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
        let result = "";
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaCode(result);
        setCaptchaInput("");
        setCaptchaError(false);

        // Draw on canvas after a short tick to ensure element exists
        setTimeout(() => {
            const canvas = document.getElementById("captcha-canvas") as HTMLCanvasElement;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Background
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#f4f4f5"; // zinc-100
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add some noise (lines)
            for (let i = 0; i < 5; i++) {
                ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
                ctx.beginPath();
                ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
                ctx.stroke();
            }

            // Draw characters
            ctx.font = "bold 24px monospace";
            ctx.textBaseline = "middle";
            for (let i = 0; i < result.length; i++) {
                const x = 10 + i * 20;
                const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((Math.random() - 0.5) * 0.4);
                ctx.fillStyle = "#18181b"; // zinc-900
                ctx.fillText(result[i], 0, 0);
                ctx.restore();
            }
        }, 50);
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
            const message = error.response?.data?.message;
            toast.error(typeof message === "string" ? message : "Invalid OTP.");
        } finally {
            setIsLoading(false);
        }
    };

    // Initialize Passkey Conditional UI (Autofill) on mount
    useEffect(() => {
        if (is2FA) return;

        let isMounted = true;
        const initConditionalAuth = async () => {
            try {
                const available = await browserSupportsWebAuthnAutofill();
                if (!available || !isMounted) return;

                const { data: optionsRes } = await api.post("/auth/passkey/login/options", { email: "" });
                const options = optionsRes.data;

                if (!isMounted) return;

                const clientResponse = await startAuthentication({ 
                    optionsJSON: options,
                    useBrowserAutofill: true 
                });

                if (isMounted) {
                    setIsLoading(true);
                    const { data: verifyRes } = await api.post("/auth/passkey/login/verify", { 
                        email: "", 
                        clientResponse 
                    });

                    if (verifyRes.data?.accessToken) {
                        localStorage.setItem("accessToken", verifyRes.data.accessToken);
                    }
                    toast.success("Welcome back! Authenticated with Passkey.");
                    handleRouting(verifyRes.data?.role);
                }
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Passkey Auth Error:", error);
                    toast.error("Passkey authentication failed. Please login with your password.");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initConditionalAuth();

        return () => {
            isMounted = false;
        };
    }, [is2FA, handleRouting]);

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

            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative bg-muted/5">
                <div className="absolute top-8 right-8 flex items-center gap-4">
                    <ModeToggle />
                    <Link href="/register" className="hidden sm:block">
                        <Button variant="outline" className="text-xs font-bold uppercase tracking-wider h-9">
                            New Workspace
                        </Button>
                    </Link>
                </div>

                <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">{is2FA ? "Security Check" : "Portal Login"}</h2>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                            {is2FA ? `Identity verification code dispatched.` : "Secure access for authorized personnel only."}
                        </p>
                    </div>

                    {!is2FA ? (
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">Administrator Email</Label>
                                    <div className="relative">
                                        <Mail className={cn("absolute left-3.5 top-3.5 h-4 w-4 transition-colors", loginForm.formState.errors.email ? "text-red-500" : "text-muted-foreground")} />
                                        <Input 
                                            {...loginForm.register("email")} 
                                            type="email" 
                                            placeholder="admin@school.com" 
                                            autoComplete="username webauthn"
                                            className={cn(
                                                "pl-11 h-12 bg-muted/20 border-border rounded-xl focus:bg-background transition-all",
                                                loginForm.formState.errors.email && "border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/10"
                                            )} 
                                            disabled={isLoading} 
                                        />
                                    </div>
                                    {loginForm.formState.errors.email && <p className="text-xs text-red-500 font-bold mt-1.5 pl-1 uppercase tracking-tighter">{loginForm.formState.errors.email.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between pl-1">
                                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">Security Password</Label>
                                        <Link href="/forgot-password" title="Reset password" className="text-[10px] font-bold uppercase text-primary hover:underline underline-offset-4">Forgot?</Link>
                                    </div>
                                    <div className="relative">
                                        <Lock className={cn("absolute left-3.5 top-3.5 h-4 w-4 transition-colors", loginForm.formState.errors.password ? "text-red-500" : "text-muted-foreground")} />
                                        <Input 
                                            {...loginForm.register("password")} 
                                            type={showPassword ? "text" : "password"} 
                                            placeholder="••••••••" 
                                            className={cn(
                                                "pl-11 pr-11 h-12 bg-muted/20 border-border rounded-xl focus:bg-background transition-all",
                                                loginForm.formState.errors.password && "border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/10"
                                            )} 
                                            disabled={isLoading} 
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground transition-colors">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {loginForm.formState.errors.password && <p className="text-xs text-red-500 font-bold mt-1.5 pl-1 uppercase tracking-tighter">{loginForm.formState.errors.password.message}</p>}
                                </div>
                            </div>

                            {/* Captcha Section */}
                            {isCaptchaRequired && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 pl-1">Security Verification</Label>
                                    <div className="flex gap-3">
                                        <div className="relative group flex-shrink-0">
                                            <canvas 
                                                id="captcha-canvas" 
                                                width="135" 
                                                height="48" 
                                                className="rounded-xl border border-border/60 bg-muted/30 cursor-pointer hover:opacity-80 transition-opacity"
                                                onClick={generateCaptcha}
                                                title="Click to refresh"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={generateCaptcha} 
                                                className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-1 shadow-sm hover:text-primary transition-colors"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                            </button>
                                        </div>
                                        <div className="flex-grow">
                                            <Input 
                                                placeholder="Enter code" 
                                                className={cn(
                                                    "h-12 bg-muted/20 border-border rounded-xl focus:bg-background transition-all uppercase font-mono tracking-wider",
                                                    captchaError && "border-red-500/50 bg-red-500/5 focus:border-red-500"
                                                )}
                                                value={captchaInput}
                                                onChange={(e) => {
                                                    setCaptchaInput(e.target.value);
                                                    setCaptchaError(false);
                                                }}
                                                maxLength={6}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground italic pl-1">Prove you are human to proceed.</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Button 
                                    type="submit" 
                                    className={cn(
                                        "w-full h-12 font-bold uppercase tracking-widest transition-all rounded-xl shadow-sm",
                                        isCaptchaRequired && !captchaInput && "opacity-50 pointer-events-none"
                                    )} 
                                    disabled={isLoading} 
                                >
                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authorizing...</> : <>Log in to Dashboard <ArrowRight className="ml-2 h-3.5 w-3.5" /></>}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-center mb-8">
                                    <div className="h-20 w-20 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center shadow-inner">
                                        <ShieldCheck className="h-10 w-10 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2 text-center mb-4">
                                     <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification Code</Label>
                                     <Input id="otp" placeholder="000000" className="h-14 text-center text-3xl tracking-[0.4em] font-mono font-bold border-border bg-muted/20 rounded-xl focus:border-primary transition-all" maxLength={6} {...otpForm.register("otp")} disabled={isLoading} />
                                     <p className="text-[10px] font-medium text-muted-foreground mt-2 italic">Check your email: {userEmail}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Button type="submit" className="w-full h-12 bg-primary hover:opacity-90 font-bold uppercase tracking-widest rounded-xl transition-all shadow-md" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verify Identity"}
                                </Button>
                                <div className="flex items-center justify-between pt-2">
                                     <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors" onClick={() => setIs2FA(false)}>
                                        <ArrowLeft className="h-3 w-3" /> Back
                                    </button>
                                    
                                    {cooldown > 0 ? (
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                            <RefreshCw className="h-3 w-3 animate-spin opacity-50" />
                                            {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
                                        </div>
                                    ) : (
                                        <button type="button" disabled={isLoading} onClick={handleResend} className="text-[10px] font-bold text-primary hover:underline underline-offset-4 uppercase tracking-widest">
                                            Resend Code
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}