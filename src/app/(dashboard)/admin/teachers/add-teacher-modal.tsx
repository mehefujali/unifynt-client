/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TeacherService } from "@/services/teacher.service";
import { addTeacherSchema, AddTeacherFormValues } from "./schema";

export function AddTeacherModal() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<AddTeacherFormValues>({
        resolver: zodResolver(addTeacherSchema),
    });

    const mutation = useMutation({
        mutationFn: TeacherService.createTeacher,
        onSuccess: () => {
            toast.success("Teacher added successfully");
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            setOpen(false);
            reset();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add teacher");
        },
    });

    const onSubmit = (data: AddTeacherFormValues) => {
        mutation.mutate(data);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="lg" className="px-6">
                    <Plus className="mr-2 h-5 w-5" /> Add Teacher
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto p-8">
                <SheetHeader className="mb-8">
                    <SheetTitle className="text-2xl font-bold tracking-tight">Add New Teacher</SheetTitle>
                    <SheetDescription className="text-base mt-2">
                        Create a new teacher profile. They will receive an email with their login credentials.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                            <Input id="firstName" className="h-11" {...register("firstName")} />
                            {errors.firstName && (
                                <p className="text-sm text-red-500 font-medium">{errors.firstName.message}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                            <Input id="lastName" className="h-11" {...register("lastName")} />
                            {errors.lastName && (
                                <p className="text-sm text-red-500 font-medium">{errors.lastName.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input id="email" type="email" className="h-11" {...register("email")} />
                        {errors.email && (
                            <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="password" className="text-sm font-medium">Temporary Password</Label>
                        <Input id="password" type="password" className="h-11" {...register("password")} />
                        {errors.password && (
                            <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="gender" className="text-sm font-medium">Gender</Label>
                            <Select onValueChange={(val) => setValue("gender", val as any)}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-red-500 font-medium">{errors.gender.message}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                            <Input id="phone" className="h-11" {...register("phone")} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="designation" className="text-sm font-medium">Designation</Label>
                            <Input id="designation" className="h-11" {...register("designation")} />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="qualification" className="text-sm font-medium">Qualification</Label>
                            <Input id="qualification" className="h-11" {...register("qualification")} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                            <Input id="dateOfBirth" type="date" className="h-11" {...register("dateOfBirth")} />
                            {errors.dateOfBirth && (
                                <p className="text-sm text-red-500 font-medium">{errors.dateOfBirth.message}</p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="joiningDate" className="text-sm font-medium">Joining Date</Label>
                            <Input id="joiningDate" type="date" className="h-11" {...register("joiningDate")} />
                        </div>
                    </div>
                    <div className="pt-8 mt-4 flex justify-end border-t">
                        <Button type="submit" size="lg" className="w-full sm:w-auto px-8" disabled={mutation.isPending}>
                            {mutation.isPending && (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            )}
                            Save Teacher Profile
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}