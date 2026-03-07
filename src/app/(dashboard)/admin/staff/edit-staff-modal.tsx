/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UserPen } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
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
import { StaffService } from "@/services/staff.service";
import { staffSchema, StaffFormValues } from "./schema";

export function EditStaffModal({ staff, open, onClose }: { staff: any; open: boolean; onClose: () => void }) {
    const queryClient = useQueryClient();

    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema) as any,
        defaultValues: {
            staffData: {
                employeeId: "",
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                gender: "MALE",
                dateOfBirth: "",
                joiningDate: "",
                designation: "",
                department: "",
                basicSalary: 0,
                bankName: "",
                accountNumber: "",
                ifscCode: "",
                address: "",
            },
            userData: {
                role: "STAFF",
            }
        },
    });

    useEffect(() => {
        if (staff && open) {
            form.reset({
                staffData: {
                    employeeId: staff.employeeId || "",
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
                },
                userData: {
                    role: staff.user?.role || (staff.isTeacher ? "TEACHER" : "STAFF"),
                }
            });
        }
    }, [staff, open, form]);

    const mutation = useMutation({
        mutationFn: (data: any) => StaffService.updateStaff(staff.id, data),
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
        const payload = {
            staffData: {
                ...data.staffData,
                email: data.staffData.email || undefined,
            },
            userData: data.userData?.role ? { role: data.userData.role } : undefined
        };
        mutation.mutate(payload);
    };

    if (!staff) return null;

    return (
        <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
            <SheetContent className="w-full sm:max-w-2xl xl:max-w-3xl overflow-y-auto custom-scrollbar p-0 bg-background border-l-0 sm:border-l">
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-6 py-5">
                    <SheetHeader>
                        <SheetTitle className="text-xl font-extrabold text-primary flex items-center gap-2">
                            <UserPen className="h-5 w-5" /> Edit Staff Profile
                        </SheetTitle>
                        <SheetDescription>
                            Update details and role information for {staff.firstName} {staff.lastName}.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-[calc(100vh-140px)]">
                    <div className="flex-1 p-6 space-y-8">
                        
                        <div className="space-y-5">
                            <h3 className="font-black uppercase tracking-widest text-xs text-primary/70 border-b pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-bold">First Name</Label>
                                    <Input className="h-11 shadow-sm" {...form.register("staffData.firstName")} />
                                    {form.formState.errors.staffData?.firstName && <p className="text-xs text-destructive">{form.formState.errors.staffData.firstName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Last Name</Label>
                                    <Input className="h-11 shadow-sm" {...form.register("staffData.lastName")} />
                                    {form.formState.errors.staffData?.lastName && <p className="text-xs text-destructive">{form.formState.errors.staffData.lastName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Email Address</Label>
                                    <Input className="h-11 shadow-sm" {...form.register("staffData.email")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Phone Number</Label>
                                    <Input className="h-11 shadow-sm" {...form.register("staffData.phone")} />
                                    {form.formState.errors.staffData?.phone && <p className="text-xs text-destructive">{form.formState.errors.staffData.phone.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Gender</Label>
                                    <Select onValueChange={(val) => form.setValue("staffData.gender", val as any)} value={form.watch("staffData.gender")}>
                                        <SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Date of Birth</Label>
                                    <Input type="date" className="h-11 shadow-sm" {...form.register("staffData.dateOfBirth")} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="font-black uppercase tracking-widest text-xs text-primary/70 border-b pb-2">Employment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-bold">Employee ID</Label>
                                    <Input className="h-11 shadow-sm font-mono" {...form.register("staffData.employeeId")} />
                                    {form.formState.errors.staffData?.employeeId && <p className="text-xs text-destructive">{form.formState.errors.staffData.employeeId.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Joining Date</Label>
                                    <Input type="date" className="h-11 shadow-sm" {...form.register("staffData.joiningDate")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Designation</Label>
                                    <Input className="h-11 shadow-sm" {...form.register("staffData.designation")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Department</Label>
                                    <Input className="h-11 shadow-sm" {...form.register("staffData.department")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">System Role</Label>
                                    <Select onValueChange={(val) => form.setValue("userData.role", val as any)} value={form.watch("userData.role")}>
                                        <SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select Role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                                            <SelectItem value="TEACHER">Teacher</SelectItem>
                                            <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                            <SelectItem value="STAFF">Staff</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Basic Salary (₹)</Label>
                                    <Input type="number" className="h-11 shadow-sm font-mono" {...form.register("staffData.basicSalary")} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h3 className="font-black uppercase tracking-widest text-xs text-primary/70 border-b pb-2">Financial & Contact</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-bold">Bank Name</Label>
                                    <Input className="h-11 shadow-sm" {...form.register("staffData.bankName")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Account Number</Label>
                                    <Input className="h-11 shadow-sm font-mono" {...form.register("staffData.accountNumber")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">IFSC Code</Label>
                                    <Input className="h-11 shadow-sm font-mono uppercase" {...form.register("staffData.ifscCode")} />
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <Label className="font-bold">Full Address</Label>
                                <Input className="h-11 shadow-sm" {...form.register("staffData.address")} />
                            </div>
                        </div>

                    </div>

                    <div className="sticky bottom-0 z-10 bg-background/80 backdrop-blur-md border-t p-6">
                        <SheetFooter className="flex flex-col sm:flex-row gap-3 sm:gap-0 w-full sm:justify-end">
                            <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending} className="h-11 px-6">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="h-11 px-8 font-bold">
                                {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </SheetFooter>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    );
}