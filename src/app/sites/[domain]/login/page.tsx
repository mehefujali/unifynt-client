/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";

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

export default function PublicSiteLogin() {
  const { domain } = useParams();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [is2FA, setIs2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const { user, isLoading: isAuthLoading } = useAuth();

  const { data: siteData, isLoading: isSiteLoading } = useQuery({
    queryKey: ["public-site", domain],
    queryFn: () => SiteConfigService.getPublicSiteData(domain as string),
    enabled: !!domain,
  });

  const [liveTheme, setLiveTheme] = useState(DEFAULT_SITE_DATA.theme);
  const schoolName = siteData?.school?.name || "School Portal";

  useEffect(() => {
    if (siteData) {
      setLiveTheme({ ...DEFAULT_SITE_DATA.theme, ...(siteData.themeSettings || {}) });
    }
  }, [siteData]);

  useEffect(() => {
    if (user && user.role && !isAuthLoading) {
      if (user.role === "SUPER_ADMIN") router.push("/super-admin");
      else if (user.role === "STUDENT") router.push("/student");
      else if (user.role === "TEACHER") router.push("/teacher");
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

  const handleRouting = (role: string) => {
    if (role === "SUPER_ADMIN") router.push("/super-admin");
    else if (role === "STUDENT") router.push("/student");
    else if (role === "TEACHER") router.push("/teacher");
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

  if (isSiteLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ backgroundColor: liveTheme.background }}>
      {/* Left Branding Side */}
      <div 
        className="hidden lg:flex w-[50%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: liveTheme.primary }}
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
        
        <div className="relative z-10">
          <Link href={`/`} className="flex items-center gap-3 mb-16 hover:opacity-90 transition-opacity">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <Image src="/unifynt-logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tight text-white">{schoolName}</span>
          </Link>
          <div className="space-y-6">
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Student & Teacher Portal
            </h1>
            <p className="text-white/80 text-lg max-w-md leading-relaxed font-medium">
              Access your personalized dashboard, view schedules, track academic progress, and connect with your institution.
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 text-white/60 text-sm font-semibold tracking-wider uppercase">
            <span>Security Verified</span>
            <span>•</span>
            <span>Unifynt Hosted</span>
          </div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="w-full lg:w-[50%] flex items-center justify-center p-6 sm:p-12 relative bg-white">
        {/* Mobile Header */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-3">
          <div className="bg-zinc-100 p-2 rounded-xl">
            <Image src="/unifynt-logo.png" alt="Logo" width={24} height={24} className="opacity-80" />
          </div>
          <span className="text-lg font-black uppercase tracking-tight text-zinc-900">{schoolName}</span>
        </div>

        <div className="absolute top-8 right-8 text-sm font-medium text-muted-foreground">
          Need help?{" "}
          <Link href="/contact" className="text-foreground hover:text-primary transition-all font-black uppercase underline-offset-4 hover:underline" style={{ color: liveTheme.primary }}>Support</Link>
        </div>

        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900">
              {is2FA ? "Security Check" : "Sign in"}
            </h2>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              {is2FA ? `Enter the 6-digit code sent to ${userEmail}` : "Enter your Email or Student ID to access your dashboard."}
            </p>
          </div>

          {!is2FA ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-zinc-600">Email Address or Student ID</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      {...loginForm.register("email")} 
                      type="text" 
                      placeholder="student@school.com or ID" 
                      className="pl-10 h-12 shadow-sm bg-zinc-50 border-zinc-200 focus-visible:ring-1 transition-all" 
                      style={{ focusVisibleRing: liveTheme.primary } as any}
                      disabled={isLoading} 
                    />
                  </div>
                  {loginForm.formState.errors.email && <p className="text-xs text-red-500 font-medium">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-600">Password</Label>
                    <Link href="/forgot-password" style={{ color: liveTheme.primary }} className="text-xs font-bold hover:brightness-90 transition-all">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input 
                      {...loginForm.register("password")} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="pl-10 pr-10 h-12 shadow-sm bg-zinc-50 border-zinc-200 transition-all" 
                      disabled={isLoading} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && <p className="text-xs text-red-500 font-medium">{loginForm.formState.errors.password.message}</p>}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-md font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5" 
                style={{ backgroundColor: liveTheme.primary, color: '#ffffff' }}
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</> : <>Enter Portal <ArrowRight className="ml-2 h-4 w-4" /></>}
              </Button>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div 
                    className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${liveTheme.primary}20` }}
                  >
                    <ShieldCheck className="h-10 w-10" style={{ color: liveTheme.primary }} />
                  </div>
                </div>
                <Input 
                  id="otp" 
                  placeholder="000000" 
                  className="h-14 text-center text-3xl tracking-[0.5em] font-mono font-black border-2 outline-none transition-colors" 
                  style={{ borderFocusColor: liveTheme.primary } as any}
                  maxLength={6} 
                  {...otpForm.register("otp")} 
                  disabled={isLoading} 
                />
              </div>
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-white font-black uppercase shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" 
                  style={{ backgroundColor: liveTheme.primary }}
                  disabled={isLoading}
                >
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
                    <button type="button" disabled={isLoading} onClick={handleResend} style={{ color: liveTheme.primary }} className="text-[12px] font-bold hover:brightness-90 transition-all flex items-center justify-center gap-1.5">
                      <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                      Resend secure code
                    </button>
                  )}
                </div>
                <div className="flex justify-center">
                  <button type="button" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-2 transition-colors mt-4" onClick={() => setIs2FA(false)}>
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
