"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Loader2,
    Building2,
    User,
    Eye,
    EyeOff,
    GraduationCap,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { Separator } from "@/components/ui/separator";


// --- Zod Schema (Same as before) ---
const registerSchema = z
    .object({
        schoolName: z.string().min(3, "School name must be at least 3 characters"),
        subdomain: z
            .string()
            .min(3, "Subdomain must be at least 3 characters")
            .regex(
                /^[a-z0-9-]+$/,
                "Only lowercase letters, numbers, and hyphens allowed"
            ),
        schoolAddress: z.string().min(5, "Address is required"),
        schoolPhone: z.string().min(10, "Phone number must be valid"),
        adminName: z.string().min(3, "Admin name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            schoolName: "",
            subdomain: "",
            schoolAddress: "",
            schoolPhone: "",
            adminName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const { mutate: register, isPending } = useMutation({
        mutationFn: async (data: RegisterFormValues) => {
            // NOTE: Ensure your backend endpoint exists at this path
            const response = await api.post("/auth/register-school", data);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success("School registered successfully!");
            // If the backend returns a token directly, login immediately.
            if (data.data?.accessToken) {
                localStorage.setItem("accessToken", data.data.accessToken);
                const role = data.data.role;
                router.push(role === "SUPER_ADMIN" ? "/super-admin" : "/admin");
            } else {
                // Otherwise, redirect to login
                router.push("/login");
            }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            console.error("Registration error:", error);
            toast.error(
                error.response?.data?.message || "Registration failed. Please try again."
            );
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        register(data);
    };

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Branding & Info (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-10 text-white">
                <div className="flex items-center gap-2 font-bold text-2xl">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <span>EduManager Pro</span>
                </div>

                <div className="space-y-6 max-w-md">
                    <h1 className="text-4xl font-bold tracking-tight leading-tight">
                        Start managing your institution smarter today.
                    </h1>
                    <p className="text-zinc-300 text-lg">
                        Join hundreds of schools that trust our platform for streamlined
                        administration, student management, and academic excellence.
                    </p>

                    <div className="space-y-3 pt-4">
                        {[
                            "Integrated Student Information System",
                            "Automated Fee & Finance Management",
                            "Teacher & Staff Portals",
                            "Secure Cloud Infrastructure",
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-zinc-200">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-sm text-zinc-500">
                    © {new Date().getFullYear()} EduManager Inc. All rights reserved.
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex items-center justify-center p-6 md:p-10 bg-background">
                <div className="w-full max-w-[600px] space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Create School Account
                        </h2>
                        <p className="text-muted-foreground">
                            Enter your institution details to get started with the platform.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            {/* Section 1: School Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    <Building2 className="h-4 w-4" />
                                    <h3>Institution Details</h3>
                                </div>
                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <FormField
                                        control={form.control}
                                        name="schoolName"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>School Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Springfield Academy" {...field} className="h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subdomain"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Workspace URL (Subdomain)</FormLabel>
                                                <FormControl>
                                                    <div className="flex rounded-md shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                                                        <Input
                                                            placeholder="springfield"
                                                            {...field}
                                                            className="rounded-r-none h-11 focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0"
                                                        />
                                                        <div className="flex items-center px-4 border border-l-0 rounded-r-md bg-muted/50 text-muted-foreground text-sm font-medium">
                                                            .your-app.com
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormDescription className="text-xs mt-1">
                                                    Only lowercase letters, numbers, and hyphens.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="schoolPhone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+1 (555) 000-0000" {...field} className="h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="schoolAddress"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="City, Country" {...field} className="h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Admin Details */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider mt-6">
                                    <User className="h-4 w-4" />
                                    <h3>Administrator Profile</h3>
                                </div>
                                <Separator />

                                <div className="grid grid-cols-1 gap-4 pt-2">
                                    <FormField
                                        control={form.control}
                                        name="adminName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} className="h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Work Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="admin@school.edu" {...field} className="h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                {...field}
                                                                className="h-11 pr-10"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            {...field}
                                                            className="h-11"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button className="w-full h-11 text-base" type="submit" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Setting up your school...
                                        </>
                                    ) : (
                                        "Complete Registration"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="text-center text-sm text-muted-foreground">
                        Already registered your institution?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline underline-offset-4"
                        >
                            Sign in here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}