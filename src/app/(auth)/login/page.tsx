"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Building2, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password cannot be empty"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate: login, isPending } = useMutation({
        mutationFn: async (data: LoginFormValues) => {
            const response = await api.post("/auth/login", data);
            return response.data;
        },
        onSuccess: (data) => {
            if (data.data?.accessToken) {
                localStorage.setItem("accessToken", data.data.accessToken);
            }

            toast.success("Successfully logged in! Redirecting...");

            const role = data.data.role;
            if (role === "SUPER_ADMIN") router.push("/super-admin");
            else if (role === "SCHOOL_ADMIN") router.push("/admin");
            else if (role === "TEACHER") router.push("/teacher");
            else if (role === "STUDENT") router.push("/student");
            else router.push("/admin");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Invalid credentials. Please try again.");
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        login(data);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <div className="hidden lg:flex w-[45%] bg-zinc-950 text-white flex-col justify-between p-12 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-16">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Unifynt</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15]">
                            Welcome back to your workspace.
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                            Sign in to manage your institution, access real-time analytics, and streamline your daily operations.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                        <p className="text-zinc-300 font-medium italic mb-4">
                            &quot;Unifynt has completely transformed how we manage our campus. It&apos;s fast, secure, and incredibly intuitive.&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                <span className="font-bold text-sm">AS</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold">Admin Support</p>
                                <p className="text-xs text-zinc-500">Greenwood International</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">

                <div className="absolute top-8 right-8 text-sm font-medium text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-foreground hover:text-primary hover:underline transition-all font-bold">
                        Create workspace
                    </Link>
                </div>

                <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 text-center sm:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Sign in</h2>
                        <p className="text-sm text-muted-foreground mt-2">Enter your email and password to continue.</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...form.register("email")}
                                        type="email"
                                        placeholder="admin@school.com"
                                        className="pl-10 h-12 shadow-sm bg-muted/20 focus-visible:bg-background transition-colors"
                                        disabled={isPending}
                                    />
                                </div>
                                {form.formState.errors.email && (
                                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                                    <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...form.register("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 shadow-sm bg-muted/20 focus-visible:bg-background transition-colors"
                                        disabled={isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {form.formState.errors.password && (
                                    <p className="text-xs text-red-500 font-medium">{form.formState.errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-md font-bold transition-all shadow-md group"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Authenticating...</>
                            ) : (
                                <>Sign In <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}