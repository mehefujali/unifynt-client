/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UploadCloud, FileText, User, Briefcase, Save, Banknote, Check, ChevronsUpDown, X, FileBadge } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

import { TeacherService } from "@/services/teacher.service";
import { SubjectService } from "@/services/subject.service";
import api from "@/lib/axios";
import { editTeacherSchema, EditTeacherFormValues } from "./schema";
import ImageCropper from "@/components/ui/image-cropper";

interface EditTeacherModalProps { teacherId: string | null; open: boolean; onOpenChange: (open: boolean) => void; }

const safeDate = (dateVal: any) => {
    if (!dateVal) return "";
    try { const d = new Date(dateVal); if (isNaN(d.getTime())) return ""; return d.toISOString().split('T')[0]; } catch { return ""; }
};

export function EditTeacherModal({ teacherId, open, onOpenChange }: EditTeacherModalProps) {
    const { data: teacher, isLoading } = useQuery({
        queryKey: ["teacher", teacherId],
        queryFn: () => TeacherService.getSingleTeacher(teacherId as string),
        enabled: !!teacherId && open,
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[750px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">Edit Teacher Profile</SheetTitle>
                        <SheetDescription className="text-sm font-medium">Update teacher roles, payroll and documents.</SheetDescription>
                    </SheetHeader>
                </div>

                {isLoading || !teacher ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Loading full records...</p>
                    </div>
                ) : (
                    <EditTeacherForm teacherId={teacherId as string} teacher={teacher?.data || teacher} onOpenChange={onOpenChange} open={open} />
                )}
            </SheetContent>
        </Sheet>
    );
}

function EditTeacherForm({ teacherId, teacher, onOpenChange, open }: { teacherId: string, teacher: any, onOpenChange: (open: boolean) => void, open: boolean }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("personal");
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const docInputRef = useRef<HTMLInputElement>(null);

    const { data: subjectsData } = useQuery({
        queryKey: ["subjects"],
        queryFn: () => SubjectService.getAllSubjects({ limit: 1000 }),
        enabled: open,
    });

    const subjectsList = Array.isArray(subjectsData?.data) ? subjectsData.data : subjectsData?.data?.data || [];

    const form = useForm<EditTeacherFormValues>({
        resolver: zodResolver(editTeacherSchema) as any,
        defaultValues: {
            firstName: teacher.firstName || "", lastName: teacher.lastName || "", email: teacher.user?.email || teacher.email || "",
            phone: teacher.phone || "", gender: teacher.gender || "MALE", dateOfBirth: safeDate(teacher.dateOfBirth),
            address: teacher.address || "", department: teacher.department || "", designation: teacher.designation || "",
            qualification: teacher.qualification || "", employmentType: teacher.employmentType || "FULL_TIME",
            experienceYears: teacher.experienceYears || 0, joiningDate: safeDate(teacher.joiningDate),
            linkedinUrl: teacher.linkedinUrl || "", profileImage: teacher.profileImage || "",
            resumeUrl: teacher.resumeUrl || "", emergencyContactName: teacher.emergencyContactName || "",
            emergencyContactPhone: teacher.emergencyContactPhone || "",
            basicSalary: teacher.basicSalary || 0, bankName: teacher.bankName || "", accountNumber: teacher.accountNumber || "",
            ifscCode: teacher.ifscCode || "", panNumber: teacher.panNumber || "",
            subjectIds: teacher.subjects?.map((s: any) => s.id) || []
        }
    });

    const { register, handleSubmit, control, setValue, watch, trigger, formState: { errors } } = form;

    const watchResumeUrl = watch("resumeUrl");

    const mutation = useMutation({
        mutationFn: async (data: FormData) => {
            return await TeacherService.updateTeacher(teacherId, data as any);
        },
        onSuccess: () => {
            toast.success("Teacher profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
            onOpenChange(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update teacher"),
    });

    const uploadDoc = async (file: File | Blob) => {
        try {
            setIsUploadingDoc(true);
            const formData = new FormData();
            formData.append("file", file as File);
            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (res.data.success) {
                setValue("resumeUrl", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                toast.success('Resume updated successfully');
            }
        } catch (error: any) { toast.error("Document upload failed"); } finally { setIsUploadingDoc(false); }
    };

    const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadDoc(file);
        e.target.value = "";
    };

    const handleTabChange = async (newTab: string) => {
        if (activeTab === "personal") {
            const isPersonalValid = await trigger(["firstName", "lastName", "email", "phone", "gender", "dateOfBirth"] as any);
            if (!isPersonalValid) {
                toast.error("Please complete the mandatory fields in Personal tab first.");
                return;
            }
        }
        
        if (activeTab === "professional" && newTab !== "personal") {
            const isProfessionalValid = await trigger(["designation", "qualification", "joiningDate"] as any);
            if (!isProfessionalValid) {
                toast.error("Please complete the mandatory fields in Work tab first.");
                return;
            }
        }

        setActiveTab(newTab);
    };

    const onSubmit = (data: EditTeacherFormValues) => {
        const formData = new FormData();
        const { profileImage, ...restTeacherData } = data;

        const payload: any = { ...restTeacherData };

        if (typeof profileImage === "string" && profileImage.trim() !== "") {
            payload.profileImage = profileImage;
        }

        formData.append("data", JSON.stringify(payload));

        if (profileImage && typeof profileImage === "object") {
            formData.append("profileImage", profileImage as File);
        }

        mutation.mutate(formData as any);
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-8">
                <form id="edit-teacher-form" onSubmit={handleSubmit(onSubmit)}>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/40 p-1 rounded-xl">
                            <TabsTrigger value="personal" className="rounded-lg font-bold"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                            <TabsTrigger value="professional" className="rounded-lg font-bold"><Briefcase className="w-4 h-4 mr-2" /> Work</TabsTrigger>
                            <TabsTrigger value="payroll" className="rounded-lg font-bold"><Banknote className="w-4 h-4 mr-2" /> Payroll</TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-lg font-bold"><FileBadge className="w-4 h-4 mr-2" /> Docs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="space-y-6">
                            <div className="flex justify-center mb-6">
                                <Controller
                                    control={control}
                                    name="profileImage"
                                    render={({ field }) => (
                                        <ImageCropper
                                            aspectRatio={1}
                                            shape="round"
                                            label="Change Photo"
                                            previewUrl={typeof field.value === "string" ? field.value : null}
                                            onCrop={(file) => field.onChange(file)}
                                        />
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>First Name *</Label>
                                    <Input className={errors.firstName ? 'border-red-500' : ''} {...register("firstName")} />
                                    {errors.firstName && <span className="text-xs text-red-500">{errors.firstName.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name *</Label>
                                    <Input className={errors.lastName ? 'border-red-500' : ''} {...register("lastName")} />
                                    {errors.lastName && <span className="text-xs text-red-500">{errors.lastName.message}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Email Address *</Label>
                                    <Input type="email" disabled className="bg-muted/30 cursor-not-allowed" {...register("email")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number *</Label>
                                    <Input className={errors.phone ? 'border-red-500' : ''} {...register("phone")} />
                                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Gender *</Label>
                                    <Controller control={control} name="gender" render={({ field }) => (
                                        <Select value={field.value || undefined} onValueChange={field.onChange}>
                                            <SelectTrigger className={errors.gender ? 'border-red-500' : ''}><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent>
                                        </Select>
                                    )} />
                                    {errors.gender && <span className="text-xs text-red-500">{errors.gender.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth *</Label>
                                    <Input type="date" className={errors.dateOfBirth ? 'border-red-500' : ''} {...register("dateOfBirth")} />
                                    {errors.dateOfBirth && <span className="text-xs text-red-500">{errors.dateOfBirth.message}</span>}
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Residential Address</Label><Input {...register("address")} /></div>
                        </TabsContent>

                        <TabsContent value="professional" className="space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Employee ID</span>
                                    <span className="font-mono text-lg font-black tracking-widest text-primary">{teacher.employeeId}</span>
                                </div>
                                <Badge variant="secondary" className="ml-auto pointer-events-none">Auto Generated</Badge>
                            </div>

                            <div className="space-y-2">
                                <Label>Assigned Subjects (Multi-select)</Label>
                                <Controller
                                    control={control}
                                    name="subjectIds"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal min-h-10 h-auto py-2", (!field.value || field.value.length === 0) && "text-muted-foreground")}>
                                                    {field.value && field.value.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {field.value.map((id) => {
                                                                const subject = subjectsList.find((s: any) => s.id === id);
                                                                return subject ? (
                                                                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                                                                        {subject.subjectName}
                                                                        <span className="cursor-pointer hover:bg-muted-foreground/20 rounded-full p-0.5" onClick={(e) => { e.stopPropagation(); field.onChange(field.value?.filter((val: string) => val !== id)); }}>
                                                                            <X className="h-3 w-3" />
                                                                        </span>
                                                                    </Badge>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    ) : "Search and select subjects..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search subject..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No subject found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {subjectsList.map((subject: any) => {
                                                                const isSelected = (field.value || []).includes(subject.id);
                                                                return (
                                                                    <CommandItem key={subject.id} value={subject.subjectName} onSelect={() => { const currentValues = field.value || []; const newValues = isSelected ? currentValues.filter((val: string) => val !== subject.id) : [...currentValues, subject.id]; field.onChange(newValues); }}>
                                                                        <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100 text-primary" : "opacity-0")} />
                                                                        {subject.subjectName} <span className="text-xs text-muted-foreground ml-2">({subject.subjectCode})</span>
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><Label>Department</Label><Input {...register("department")} /></div>
                                <div className="space-y-2">
                                    <Label>Designation *</Label>
                                    <Input className={errors.designation ? 'border-red-500' : ''} {...register("designation")} />
                                    {errors.designation && <span className="text-xs text-red-500">{errors.designation.message}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Highest Qualification *</Label>
                                    <Input className={errors.qualification ? 'border-red-500' : ''} {...register("qualification")} />
                                    {errors.qualification && <span className="text-xs text-red-500">{errors.qualification.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Employment Type</Label>
                                    <Controller control={control} name="employmentType" render={({ field }) => (
                                        <Select value={field.value || undefined} onValueChange={field.onChange}>
                                            <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                            <SelectContent><SelectItem value="FULL_TIME">Full Time</SelectItem><SelectItem value="PART_TIME">Part Time</SelectItem><SelectItem value="CONTRACT">Contract</SelectItem><SelectItem value="GUEST">Guest</SelectItem></SelectContent>
                                        </Select>
                                    )} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><Label>Experience (Years)</Label><Input type="number" {...register("experienceYears")} /></div>
                                <div className="space-y-2">
                                    <Label>Joining Date *</Label>
                                    <Input type="date" className={errors.joiningDate ? 'border-red-500' : ''} {...register("joiningDate")} />
                                    {errors.joiningDate && <span className="text-xs text-red-500">{errors.joiningDate.message}</span>}
                                </div>
                            </div>
                            <div className="space-y-2"><Label>LinkedIn Profile</Label><Input {...register("linkedinUrl")} /></div>
                        </TabsContent>

                        <TabsContent value="payroll" className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><Label className="font-bold text-primary">Basic Salary (Monthly)</Label><Input type="number" {...register("basicSalary")} /></div>
                                <div className="space-y-2"><Label>PAN Number</Label><Input className="font-mono uppercase" {...register("panNumber")} /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2"><Label>Bank Name</Label><Input {...register("bankName")} /></div>
                                <div className="space-y-2"><Label>Account Number</Label><Input className="font-mono" {...register("accountNumber")} /></div>
                                <div className="space-y-2"><Label>IFSC Code</Label><Input className="font-mono uppercase" {...register("ifscCode")} /></div>
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-8">
                            <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                <Controller
                                    control={control}
                                    name="profileImage"
                                    render={({ field }) => (
                                        <ImageCropper
                                            aspectRatio={1}
                                            shape="round"
                                            label="Change Photo"
                                            previewUrl={typeof field.value === "string" ? field.value : null}
                                            onCrop={(file) => field.onChange(file)}
                                        />
                                    )}
                                />
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-bold text-sm uppercase text-primary">Profile Picture</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Upload a clear, professional photo. 1:1 aspect ratio recommended.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FileText className="h-8 w-8" /></div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-bold text-sm uppercase">Curriculum Vitae (CV)</h4>
                                    <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleDocSelect} />
                                    <Button type="button" variant="outline" size="sm" onClick={() => docInputRef.current?.click()} disabled={isUploadingDoc}>
                                        {isUploadingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} {isUploadingDoc ? "Uploading..." : (watchResumeUrl ? "Change Document" : "Upload Document")}
                                    </Button>
                                </div>
                            </div>

                            <div className="p-5 border rounded-xl space-y-4">
                                <h4 className="font-bold text-sm uppercase border-b pb-2">Emergency Contact</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Contact Name</Label><Input {...register("emergencyContactName")} /></div>
                                    <div className="space-y-2"><Label>Contact Phone</Label><Input {...register("emergencyContactPhone")} /></div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>

            <div className="p-6 border-t bg-background/90 backdrop-blur shrink-0 flex justify-between">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" form="edit-teacher-form" className="font-bold px-8" disabled={mutation.isPending || isUploadingDoc}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                </Button>
            </div>
        </>
    );
}