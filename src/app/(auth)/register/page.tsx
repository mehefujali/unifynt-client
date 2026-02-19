/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Building2, User, Mail, Phone, MapPin, Lock, Globe, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";

const registerSchema = z.object({
    schoolName: z.string().min(2, "Institution name is required"),
    subdomain: z.string().min(3, "Min 3 characters").regex(/^[a-z0-9-]+$/, "Only lowercase, numbers & hyphens"),
    adminName: z.string().min(2, "Admin name is required"),
    email: z.string().email("Valid email is required"),
    schoolPhone: z.string().min(10, "Valid phone is required"),
    schoolAddress: z.string().min(5, "Address is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            schoolName: "",
            subdomain: "",
            adminName: "",
            email: "",
            schoolPhone: "",
            schoolAddress: "",
            password: "",
        },
    });

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const response = await api.post("/auth/register-school", data);
            const { accessToken } = response.data.data;

            localStorage.setItem("accessToken", accessToken);
            toast.success("Workspace created successfully! Redirecting...");
            router.push("/admin");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <div className="hidden lg:flex w-[45%] bg-zinc-950 text-white flex-col justify-between p-12 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-16">
                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Unifynt</span>
                    </div>

                    <div className="space-y-5">
                        <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15]">
                            The unified platform for modern educational institutions.
                        </h1>
                        <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                            Start your 14-day premium trial today. Setup your entire campus management system in minutes, not months.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-sm font-medium text-zinc-500">
                    <span>© {new Date().getFullYear()} Unifynt Inc.</span>
                    <div className="h-1 w-1 rounded-full bg-zinc-700" />
                    <span>Enterprise Grade Security</span>
                </div>
            </div>

            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">

                <div className="absolute top-8 right-8 text-sm font-medium text-muted-foreground">
                    Have an account?{" "}
                    <Link href="/login" className="text-foreground hover:text-primary hover:underline transition-all">
                        Sign in
                    </Link>
                </div>

                <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Create workspace</h2>
                        <p className="text-sm text-muted-foreground mt-1.5">Enter your institution details to get started.</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground/80">Institution Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("schoolName")} placeholder="Greenwood High School" className="pl-9 h-10 shadow-sm" />
                                </div>
                                {form.formState.errors.schoolName && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.schoolName.message}</p>}
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground/80">Workspace URL</Label>
                                <div className="relative flex rounded-md shadow-sm">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                    <Input {...form.register("subdomain")} placeholder="greenwood" className="pl-9 h-10 rounded-r-none focus-visible:z-10" />
                                    <div className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted/50 text-muted-foreground text-xs font-medium">
                                        .app.com
                                    </div>
                                </div>
                                {form.formState.errors.subdomain && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.subdomain.message}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground/80">Admin Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("adminName")} placeholder="John Doe" className="pl-9 h-10 shadow-sm" />
                                </div>
                                {form.formState.errors.adminName && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.adminName.message}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground/80">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("schoolPhone")} placeholder="+91 9876543210" className="pl-9 h-10 shadow-sm" />
                                </div>
                                {form.formState.errors.schoolPhone && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.schoolPhone.message}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground/80">Work Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("email")} type="email" placeholder="admin@school.com" className="pl-9 h-10 shadow-sm" />
                                </div>
                                {form.formState.errors.email && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.email.message}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1 space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground/80">Secure Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("password")} type="password" placeholder="••••••••" className="pl-9 h-10 shadow-sm" />
                                </div>
                                {form.formState.errors.password && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.password.message}</p>}
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label className="text-xs font-semibold text-foreground/80">Institution Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input {...form.register("schoolAddress")} placeholder="123 Education Lane, City" className="pl-9 h-10 shadow-sm" />
                                </div>
                                {form.formState.errors.schoolAddress && <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.schoolAddress.message}</p>}
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-11 text-sm font-semibold transition-all shadow-md mt-2" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Provisioning workspace...</>
                            ) : (
                                <>Create Workspace <ArrowRight className="ml-2 h-4 w-4" /></>
                            )}
                        </Button>

                        <p className="text-center text-[11px] text-muted-foreground mt-4 px-6">
                            By clicking continue, you acknowledge that you have read and agree to Unifynt&apos;s{" "}
                            <Link href="#" className="underline hover:text-foreground">Terms of Service</Link> and{" "}
                            <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}