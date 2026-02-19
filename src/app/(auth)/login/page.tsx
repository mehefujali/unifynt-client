/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import api from "@/lib/axios";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
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

            toast.success("Logged in successfully");

            const role = data.data.role;
            if (role === "SUPER_ADMIN") router.push("/super-admin");
            else if (role === "SCHOOL_ADMIN") router.push("/admin");
            else if (role === "TEACHER") router.push("/teacher");
            else if (role === "STUDENT") router.push("/student");
            else router.push("/admin");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong");
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        login(data);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                    Enter your credentials to access your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@school.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                                placeholder="Enter your password"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-500" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <Button className="w-full" type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-gray-500">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Register School
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}