/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UserPen, Lock } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageCropper from "@/components/ui/image-cropper";
import { StaffService } from "@/services/staff.service";
import { staffSchema, StaffFormValues } from "./schema";

export function EditStaffModal({ staff, open, onClose }: { staff: any; open: boolean; onClose: () => void }) {
    const queryClient = useQueryClient();

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema) as any,
        defaultValues: {
            staffData: { gender: "MALE", basicSalary: 0 } as any,
            userData: { role: "ACCOUNTANT" }
        },
    });

    useEffect(() => {
        if (staff && open) {
            form.reset({
                staffData: {
                    firstName: staff.firstName || "",
                    lastName: staff.lastName || "",
                    email: staff.user?.email || staff.email || "",
                    phone: staff.phone || "",
                    gender: staff.gender || "MALE",
                    dateOfBirth: staff.dateOfBirth ? new Date(staff.dateOfBirth).toISOString().split('T')[0] : "",
                    joiningDate: staff.joiningDate ? new Date(staff.joiningDate).toISOString().split('T')[0] : "",
                    designation: staff.designation || "",
                    department: staff.department || "",
                    basicSalary: staff.basicSalary || 0,
                    bankName: staff.bankName || "",
                    accountNumber: staff.accountNumber || "",
                    ifscCode: staff.ifscCode || "",
                    address: staff.address || "",
                    profileImage: staff.profileImage || undefined,
                },
                userData: {
                    role: staff.user?.role || (staff.isTeacher ? "TEACHER" : "ACCOUNTANT"),
                }
            });
        }
    }, [staff, open, form]);

    const mutation = useMutation({
        mutationFn: (data: FormData) => StaffService.updateStaff(staff.id, data as any),
        onSuccess: () => {
            toast.success("Staff details updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update staff");
        },
    });

    const onSubmit = (data: StaffFormValues) => {
        const formData = new FormData();
        const { profileImage, ...restStaffData } = data.staffData;

        const payload = {
            staffData: {
                ...restStaffData,
                email: restStaffData.email || undefined,
            },
            userData: data.userData?.role ? { role: data.userData.role } : undefined
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

    const onError = () => {
        toast.error("Please fill in all mandatory fields correctly.");
    };

    if (!staff) return null;

    return (
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="w-full sm:max-w-2xl xl:max-w-3xl overflow-hidden p-0 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col h-full">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <UserPen className="h-5 w-5 text-zinc-500" /> 
                            Edit Staff Profile
                        </SheetTitle>
                        <SheetDescription className="text-xs text-zinc-500 font-medium">
                            Update personal and professional details for {staff.firstName} {staff.lastName}.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <form id="edit-staff-form" onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
                        
                        <div className="space-y-6">
                            <h3 className="font-semibold uppercase tracking-widest text-[10px] text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">Personal Information</h3>
                            
                            <div className="flex justify-center mb-4">
                                <Controller
                                    control={form.control}
                                    name="staffData.profileImage"
                                    render={({ field }) => (
                                        <ImageCropper
                                            aspectRatio={1}
                                            shape="round"
                                            label="Change Photo"
                                            previewUrl={staff.profileImage}
                                            onCrop={(file) => field.onChange(file)}
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">First Name *</Label>
                                    <Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.firstName ? 'border-red-500' : ''}`} {...form.register("staffData.firstName")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Last Name *</Label>
                                    <Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.lastName ? 'border-red-500' : ''}`} {...form.register("staffData.lastName")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between">Email Address <span className="text-[10px] text-zinc-400 font-normal">(Login ID)</span></Label>
                                    <Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.email ? 'border-red-500' : ''}`} {...form.register("staffData.email")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Phone Number *</Label>
                                    <Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.phone ? 'border-red-500' : ''}`} {...form.register("staffData.phone")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Gender *</Label>
                                    <Controller control={form.control} name="staffData.gender" render={({ field }) => (
                                        <Select onValueChange={(val) => field.onChange(val as any)} value={field.value}>
                                            <SelectTrigger className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Date of Birth *</Label>
                                    <Input type="date" className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.dateOfBirth ? 'border-red-500' : ''}`} {...form.register("staffData.dateOfBirth")} />
                                </div>
                            </div>
                            <div className="space-y-1.5 mt-2">
                                <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Full Address</Label>
                                <Input className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...form.register("staffData.address")} />
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="font-semibold uppercase tracking-widest text-[10px] text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">Employment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Employee ID</Label>
                                    <div className="flex items-center gap-2 h-10 px-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md opacity-70 cursor-not-allowed">
                                        <Lock className="h-3.5 w-3.5 text-zinc-400" />
                                        <span className="text-sm font-mono text-zinc-500">{staff.employeeId || "N/A"}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Joining Date *</Label>
                                    <Input type="date" className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.joiningDate ? 'border-red-500' : ''}`} {...form.register("staffData.joiningDate")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Designation *</Label>
                                    <Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.designation ? 'border-red-500' : ''}`} {...form.register("staffData.designation")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Department *</Label>
                                    <Input className={`h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.department ? 'border-red-500' : ''}`} {...form.register("staffData.department")} />
                                </div>
                                
                                {staff.user && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">System Role</Label>
                                        <Controller control={form.control} name="userData.role" render={({ field }) => (
                                            <Select onValueChange={(val) => field.onChange(val as any)} value={field.value}>
                                                <SelectTrigger className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"><SelectValue placeholder="Select Role" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ACCOUNTANT">Accountant / Regular Staff</SelectItem>
                                                    <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                )}
                                
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Basic Salary (Monthly) *</Label>
                                    <Input type="number" className={`h-10 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 ${form.formState.errors.staffData?.basicSalary ? 'border-red-500' : ''}`} {...form.register("staffData.basicSalary")} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="font-semibold uppercase tracking-widest text-[10px] text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-2">Financial Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Bank Name</Label>
                                    <Input className="h-10 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...form.register("staffData.bankName")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Account Number</Label>
                                    <Input className="h-10 text-sm font-mono bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...form.register("staffData.accountNumber")} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">IFSC Code</Label>
                                    <Input className="h-10 text-sm font-mono uppercase bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" {...form.register("staffData.ifscCode")} />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 shrink-0 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending} className="h-10 px-5 text-xs font-semibold rounded-lg border-zinc-200 dark:border-zinc-800">
                        Cancel
                    </Button>
                    <Button type="submit" form="edit-staff-form" disabled={mutation.isPending} className="h-10 px-6 text-xs font-semibold rounded-lg shadow-sm">
                        {mutation.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}