/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, User, Briefcase, FileBadge, Save, UploadCloud, FileText } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { TeacherService } from "@/services/teacher.service";
import api from "@/lib/axios";
import { editTeacherSchema, EditTeacherFormValues } from "./schema";

interface EditTeacherModalProps {
    teacherId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTeacherModal({ teacherId, open, onOpenChange }: EditTeacherModalProps) {
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("personal");
    const [isUploadingImg, setIsUploadingImg] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const imgInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const { data: teacher, isLoading } = useQuery({
        queryKey: ["teacher", teacherId],
        queryFn: () => TeacherService.getSingleTeacher(teacherId as string),
        enabled: !!teacherId && open,
    });

    const form = useForm<EditTeacherFormValues>({
        resolver: zodResolver(editTeacherSchema),
    });

    // Populate form when data arrives
    useEffect(() => {
        if (teacher && open) {
            form.reset({
                firstName: teacher.firstName || "",
                lastName: teacher.lastName || "",
                email: teacher.user?.email || "",
                phone: teacher.phone || "",
                gender: teacher.gender || "MALE",
                dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : "",
                address: teacher.address || "",

                employeeId: teacher.employeeId || "",
                department: teacher.department || "",
                designation: teacher.designation || "",
                qualification: teacher.qualification || "",
                employmentType: teacher.employmentType || "FULL_TIME",
                experienceYears: teacher.experienceYears || 0,
                joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : "",
                linkedinUrl: teacher.linkedinUrl || "",

                profileImage: teacher.profileImage || "",
                resumeUrl: teacher.resumeUrl || "",
                emergencyContactName: teacher.emergencyContactName || "",
                emergencyContactPhone: teacher.emergencyContactPhone || "",
            });
            setActiveTab("personal");
        }
    }, [teacher, open, form]);

    const mutation = useMutation({
        // Fix: Added safety check for teacherId and used TeacherService instead of raw api.patch
        mutationFn: async (data: EditTeacherFormValues) => {
            if (!teacherId) throw new Error("Teacher ID is missing");
            return await TeacherService.updateTeacher(teacherId, data);
        },
        onSuccess: () => {
            toast.success("Teacher profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || error.message || "Failed to update teacher");
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            type === 'image' ? setIsUploadingImg(true) : setIsUploadingDoc(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

            if (res.data.success) {
                if (type === 'image') form.setValue("profileImage", res.data.data.url, { shouldDirty: true });
                if (type === 'document') form.setValue("resumeUrl", res.data.data.url, { shouldDirty: true });
                toast.success(`${type === 'image' ? 'Profile picture' : 'Resume'} updated`);
            }
        } catch (error: any) {
            toast.error("File upload failed");
        } finally {
            type === 'image' ? setIsUploadingImg(false) : setIsUploadingDoc(false);
        }
    };

    const onSubmit = (data: EditTeacherFormValues) => {
        mutation.mutate(data);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[750px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">Edit Teacher Profile</SheetTitle>
                        <SheetDescription className="text-sm font-medium">
                            Modify the personal, professional, and document records for this teacher.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                        <form id="edit-teacher-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                                <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/40 p-1 rounded-xl shrink-0">
                                    <TabsTrigger value="personal" className="rounded-lg font-bold data-[state=active]:shadow-sm"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                                    <TabsTrigger value="professional" className="rounded-lg font-bold data-[state=active]:shadow-sm"><Briefcase className="w-4 h-4 mr-2" /> Professional</TabsTrigger>
                                    <TabsTrigger value="documents" className="rounded-lg font-bold data-[state=active]:shadow-sm"><FileBadge className="w-4 h-4 mr-2" /> Documents</TabsTrigger>
                                </TabsList>

                                {/* TAB 1: PERSONAL */}
                                <TabsContent value="personal" className="space-y-6 flex-1 outline-none animate-in fade-in duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name *</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" {...form.register("firstName")} />
                                            {form.formState.errors.firstName && <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name *</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" {...form.register("lastName")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</Label>
                                            <Input type="email" className="h-11 shadow-sm bg-muted/10" {...form.register("email")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number *</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" {...form.register("phone")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender *</Label>
                                            <Select value={form.watch("gender")} onValueChange={(val) => form.setValue("gender", val as any)}>
                                                <SelectTrigger className="h-11 bg-muted/10"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth *</Label>
                                            <Input type="date" className="h-11 shadow-sm bg-muted/10" {...form.register("dateOfBirth")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Residential Address</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10" {...form.register("address")} />
                                    </div>
                                </TabsContent>

                                {/* TAB 2: PROFESSIONAL */}
                                <TabsContent value="professional" className="space-y-6 flex-1 outline-none animate-in fade-in duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee ID</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10 font-mono" {...form.register("employeeId")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" {...form.register("department")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation *</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" {...form.register("designation")} />
                                            {form.formState.errors.designation && <p className="text-xs text-red-500">{form.formState.errors.designation.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Highest Qualification *</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" {...form.register("qualification")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employment Type</Label>
                                            <Select value={form.watch("employmentType")} onValueChange={(val) => form.setValue("employmentType", val as any)}>
                                                <SelectTrigger className="h-11 bg-muted/10"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                                                    <SelectItem value="CONTRACT">Contract Basis</SelectItem>
                                                    <SelectItem value="GUEST">Guest Lecturer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience (Years)</Label>
                                            <Input type="number" className="h-11 shadow-sm bg-muted/10" {...form.register("experienceYears")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Joining Date *</Label>
                                            <Input type="date" className="h-11 shadow-sm bg-muted/10" {...form.register("joiningDate")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">LinkedIn Profile</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" {...form.register("linkedinUrl")} />
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* TAB 3: DOCUMENTS */}
                                <TabsContent value="documents" className="space-y-8 flex-1 outline-none animate-in fade-in duration-500">
                                    <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                        <Avatar className="h-20 w-20 border-2 shadow-sm">
                                            <AvatarImage src={form.watch("profileImage")} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold"><User className="h-8 w-8" /></AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2 flex-1">
                                            <h4 className="font-bold text-sm uppercase tracking-wider">Profile Picture</h4>
                                            <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                                            <Button type="button" variant="outline" size="sm" onClick={() => imgInputRef.current?.click()} disabled={isUploadingImg}>
                                                {isUploadingImg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                                {isUploadingImg ? "Uploading..." : "Update Image"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <h4 className="font-bold text-sm uppercase tracking-wider">Curriculum Vitae (CV)</h4>
                                            <div className="flex items-center gap-3">
                                                <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'document')} />
                                                <Button type="button" variant="outline" size="sm" onClick={() => docInputRef.current?.click()} disabled={isUploadingDoc}>
                                                    {isUploadingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                                    {isUploadingDoc ? "Uploading..." : "Upload New CV"}
                                                </Button>
                                                {form.watch("resumeUrl") && (
                                                    <a href={form.watch("resumeUrl")} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary hover:underline">View Attached</a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 border rounded-xl space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2">Emergency Contact</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Name</Label>
                                                <Input className="h-11 shadow-sm bg-muted/10" {...form.register("emergencyContactName")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Phone</Label>
                                                <Input className="h-11 shadow-sm bg-muted/10" {...form.register("emergencyContactPhone")} />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </form>
                    </div>
                )}

                {/* FIXED FOOTER */}
                <div className="border-t p-6 bg-background/90 backdrop-blur flex justify-between items-center shrink-0">
                    <p className="text-xs text-muted-foreground font-medium hidden sm:block">Please ensure all details are correct before saving.</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">Cancel</Button>
                        <Button type="submit" form="edit-teacher-form" className="font-bold flex-1 sm:flex-none px-8" disabled={mutation.isPending || isLoading}>
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}