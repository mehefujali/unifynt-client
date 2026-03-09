/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, User, Briefcase, Banknote, ShieldCheck } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ImageCropper from "@/components/ui/image-cropper";

import { staffSchema, StaffFormValues } from "./schema";
import { StaffService } from "@/services/staff.service";

export function AddStaffModal() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("personal");

    const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema) as any,
        defaultValues: {
            staffData: { gender: "MALE", basicSalary: 0 } as any,
            userData: { createAccount: false, role: "ACCOUNTANT" }
        }
    });

    const watchCreateAccount = watch("userData.createAccount");

    const mutation = useMutation({
        mutationFn: (data: FormData) => StaffService.createStaff(data as any),
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

    const onSubmit = (data: StaffFormValues) => {
        const formData = new FormData();
        const { profileImage, ...restStaffData } = data.staffData;

        const payload = {
            staffData: restStaffData,
            userData: data.userData
        };

        if (profileImage && typeof profileImage === "string") {
            (payload.staffData as any).profileImage = profileImage;
        }

        formData.append("data", JSON.stringify(payload));

        if (profileImage && typeof profileImage === "object") {
            formData.append("profileImage", profileImage as any);
        }

        mutation.mutate(formData as any);
    };

    const onError = (formErrors: any) => {
        const errorKeys = Object.keys(formErrors?.staffData || {});
        const userErrorKeys = Object.keys(formErrors?.userData || {});
        
        if (errorKeys.some(key => ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth'].includes(key))) setActiveTab("personal");
        else if (errorKeys.some(key => ['designation', 'department', 'joiningDate'].includes(key))) setActiveTab("professional");
        else if (errorKeys.some(key => ['basicSalary', 'bankName', 'accountNumber', 'ifscCode'].includes(key))) setActiveTab("payroll");
        else if (userErrorKeys.length > 0) setActiveTab("account");
        
        toast.error("Please fill in all mandatory fields correctly.");
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="h-10 px-5 rounded-lg font-semibold text-xs shadow-sm">
                    <Plus className="mr-2 h-4 w-4" /> Onboard Staff
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[700px] overflow-hidden p-0 border-l border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col h-full bg-white dark:bg-zinc-950">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <User className="h-5 w-5 text-zinc-500" />
                            Staff Onboarding
                        </SheetTitle>
                        <p className="text-xs text-zinc-500 font-medium">Enter personal, professional, and access details for the new staff member.</p>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <form id="add-staff-form" onSubmit={handleSubmit(onSubmit, onError)}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
                            <TabsList className="grid w-full grid-cols-4 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg h-10">
                                <TabsTrigger value="personal" className="rounded-md font-semibold text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"><User className="w-3.5 h-3.5 mr-2 hidden sm:block" /> Personal</TabsTrigger>
                                <TabsTrigger value="professional" className="rounded-md font-semibold text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"><Briefcase className="w-3.5 h-3.5 mr-2 hidden sm:block" /> Work</TabsTrigger>
                                <TabsTrigger value="payroll" className="rounded-md font-semibold text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"><Banknote className="w-3.5 h-3.5 mr-2 hidden sm:block" /> Payroll</TabsTrigger>
                                <TabsTrigger value="account" className="rounded-md font-semibold text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm"><ShieldCheck className="w-3.5 h-3.5 mr-2 hidden sm:block" /> Access</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal" className="m-0 space-y-6">
                                <div className="flex justify-center mb-6">
                                    <Controller
                                        control={control}
                                        name="staffData.profileImage"
                                        render={({ field }) => (
                                            <ImageCropper
                                                aspectRatio={1}
                                                shape="round"
                                                label="Profile Photo"
                                                onCrop={(file) => field.onChange(file)}
                                            />
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">First Name *</Label><Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.firstName ? 'border-red-500' : ''}`} {...register("staffData.firstName")} /></div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Last Name *</Label><Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.lastName ? 'border-red-500' : ''}`} {...register("staffData.lastName")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between">Email Address <span className="text-[10px] text-zinc-400 font-normal">(Req. for login)</span></Label>
                                        <Input type="email" className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.email ? 'border-red-500' : ''}`} {...register("staffData.email")} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone Number *</Label><Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.phone ? 'border-red-500' : ''}`} {...register("staffData.phone")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gender *</Label>
                                        <Controller control={control} name="staffData.gender" render={({ field }) => (
                                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                <SelectTrigger className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.gender ? 'border-red-500' : ''}`}><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Date of Birth *</Label><Input type="date" className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.dateOfBirth ? 'border-red-500' : ''}`} {...register("staffData.dateOfBirth")} /></div>
                                </div>
                                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Residential Address</Label><Input className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...register("staffData.address")} /></div>
                            </TabsContent>

                            <TabsContent value="professional" className="m-0 space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Department *</Label><Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.department ? 'border-red-500' : ''}`} {...register("staffData.department")} /></div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Designation *</Label><Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.designation ? 'border-red-500' : ''}`} {...register("staffData.designation")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Joining Date *</Label><Input type="date" className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.joiningDate ? 'border-red-500' : ''}`} {...register("staffData.joiningDate")} /></div>
                                </div>
                            </TabsContent>

                            <TabsContent value="payroll" className="m-0 space-y-5">
                                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Basic Salary (Monthly) *</Label><Input type="number" className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${errors.staffData?.basicSalary ? 'border-red-500' : ''}`} {...register("staffData.basicSalary")} /></div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Bank Name</Label><Input className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...register("staffData.bankName")} /></div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Account Number</Label><Input className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono" {...register("staffData.accountNumber")} /></div>
                                </div>
                                <div className="space-y-1.5"><Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">IFSC Code</Label><Input className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono uppercase" {...register("staffData.ifscCode")} /></div>
                            </TabsContent>

                            <TabsContent value="account" className="m-0 space-y-5">
                                <div className="flex flex-row items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50 dark:bg-zinc-900/50">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">System Access</Label>
                                        <p className="text-xs text-zinc-500">Create a platform login account for this staff member.</p>
                                    </div>
                                    <Controller control={control} name="userData.createAccount" render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )} />
                                </div>

                                {watchCreateAccount && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-300 p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between">System Role <span className="text-[10px] text-zinc-400 font-normal">Default: Accountant</span></Label>
                                            <Controller control={control} name="userData.role" render={({ field }) => (
                                                <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                    <SelectTrigger className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"><SelectValue placeholder="Select Role" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ACCOUNTANT">Accountant / Regular Staff</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Login Password (Optional)</Label>
                                            <Input type="password" placeholder="Leave blank for default: 123456" className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono" {...register("userData.password")} />
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </form>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-10 px-5 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800">Cancel</Button>
                    <Button type="submit" form="add-staff-form" className="h-10 px-6 text-xs font-semibold rounded-lg shadow-sm" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />} Save Staff
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}