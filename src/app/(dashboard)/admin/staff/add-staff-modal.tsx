/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, User, Briefcase, Banknote, ShieldCheck } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";


import { staffSchema, StaffFormValues } from "./schema";
import { StaffService } from "@/services/staff.service";

export function AddStaffModal() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("personal");

    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema) as any,
        defaultValues: {
            staffData: { gender: "MALE", basicSalary: 0 },
            userData: { createAccount: false }
        }
    });

    const watchCreateAccount = watch("userData.createAccount");

    const mutation = useMutation({
        mutationFn: StaffService.createStaff,
        onSuccess: () => {
            toast.success("Staff onboarded successfully");
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            setOpen(false);
            reset();
            setActiveTab("personal");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add staff");
        },
    });

    const onSubmit = (data: StaffFormValues) => mutation.mutate(data);

    const onError = (formErrors: any) => {
        const errorKeys = Object.keys(formErrors?.staffData || {});
        const userErrorKeys = Object.keys(formErrors?.userData || {});
        
        if (errorKeys.some(key => ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth'].includes(key))) setActiveTab("personal");
        else if (errorKeys.some(key => ['designation', 'department', 'joiningDate', 'employeeId'].includes(key))) setActiveTab("professional");
        else if (errorKeys.some(key => ['basicSalary', 'bankName', 'accountNumber', 'ifscCode'].includes(key))) setActiveTab("payroll");
        else if (userErrorKeys.length > 0) setActiveTab("account");
        
        toast.error("Please fill in all mandatory fields correctly.");
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="lg" className="px-6 font-bold shadow-md"><Plus className="mr-2 h-5 w-5" /> Onboard Staff</Button></SheetTrigger>
            <SheetContent className="sm:max-w-[750px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">Staff Onboarding</SheetTitle>
                        <SheetDescription className="text-sm font-medium">Enter personal, professional and access details.</SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form id="add-staff-form" onSubmit={handleSubmit(onSubmit, onError)}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/40 p-1 rounded-xl">
                                <TabsTrigger value="personal" className="rounded-lg font-bold"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                                <TabsTrigger value="professional" className="rounded-lg font-bold"><Briefcase className="w-4 h-4 mr-2" /> Work</TabsTrigger>
                                <TabsTrigger value="payroll" className="rounded-lg font-bold"><Banknote className="w-4 h-4 mr-2" /> Payroll</TabsTrigger>
                                <TabsTrigger value="account" className="rounded-lg font-bold"><ShieldCheck className="w-4 h-4 mr-2" /> Access</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal" className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>First Name *</Label><Input className={errors.staffData?.firstName ? 'border-red-500' : ''} {...register("staffData.firstName")} /></div>
                                    <div className="space-y-2"><Label>Last Name *</Label><Input className={errors.staffData?.lastName ? 'border-red-500' : ''} {...register("staffData.lastName")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Email Address</Label><Input type="email" className={errors.staffData?.email ? 'border-red-500' : ''} {...register("staffData.email")} /></div>
                                    <div className="space-y-2"><Label>Phone Number *</Label><Input className={errors.staffData?.phone ? 'border-red-500' : ''} {...register("staffData.phone")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Gender *</Label>
                                        <Controller control={control} name="staffData.gender" render={({ field }) => (
                                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                <SelectTrigger className={errors.staffData?.gender ? 'border-red-500' : ''}><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                                <SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2"><Label>Date of Birth *</Label><Input type="date" className={errors.staffData?.dateOfBirth ? 'border-red-500' : ''} {...register("staffData.dateOfBirth")} /></div>
                                </div>
                                <div className="space-y-2"><Label>Residential Address</Label><Input {...register("staffData.address")} /></div>
                            </TabsContent>

                            <TabsContent value="professional" className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Employee ID *</Label><Input className={errors.staffData?.employeeId ? 'border-red-500' : ''} {...register("staffData.employeeId")} /></div>
                                    <div className="space-y-2"><Label>Joining Date *</Label><Input type="date" className={errors.staffData?.joiningDate ? 'border-red-500' : ''} {...register("staffData.joiningDate")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Department *</Label><Input className={errors.staffData?.department ? 'border-red-500' : ''} {...register("staffData.department")} /></div>
                                    <div className="space-y-2"><Label>Designation *</Label><Input className={errors.staffData?.designation ? 'border-red-500' : ''} {...register("staffData.designation")} /></div>
                                </div>
                            </TabsContent>

                            <TabsContent value="payroll" className="space-y-6">
                                <div className="space-y-2"><Label className="font-bold text-primary">Basic Salary (Monthly) *</Label><Input type="number" className={errors.staffData?.basicSalary ? 'border-red-500' : ''} {...register("staffData.basicSalary")} /></div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Bank Name</Label><Input {...register("staffData.bankName")} /></div>
                                    <div className="space-y-2"><Label>Account Number</Label><Input className="font-mono" {...register("staffData.accountNumber")} /></div>
                                </div>
                                <div className="space-y-2"><Label>IFSC Code</Label><Input className="font-mono uppercase" {...register("staffData.ifscCode")} /></div>
                            </TabsContent>

                            <TabsContent value="account" className="space-y-6">
                                <div className="flex flex-row items-center justify-between rounded-xl border p-5 bg-muted/5 shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-bold">System Access</Label>
                                        <p className="text-sm text-muted-foreground">Create a login account for this staff member.</p>
                                    </div>
                                    <Controller control={control} name="userData.createAccount" render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )} />
                                </div>

                                {watchCreateAccount && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 border p-5 rounded-xl bg-card">
                                        <div className="space-y-2">
                                            <Label>System Role *</Label>
                                            <Controller control={control} name="userData.role" render={({ field }) => (
                                                <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                    <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                                        <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                                                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )} />
                                        </div>
                                        <div className="space-y-2"><Label>Login Password (Optional)</Label><Input type="password" placeholder="Leave blank for default: 123456" {...register("userData.password")} /></div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </form>
                </div>

                <div className="p-6 border-t bg-background/90 backdrop-blur shrink-0 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" form="add-staff-form" className="font-bold px-8" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Staff
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}