/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, UploadCloud, FileText, User, Briefcase, FileBadge, Banknote, Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

import { TeacherService } from "@/services/teacher.service";
import { SubjectService } from "@/services/subject.service";
import api from "@/lib/axios";
import { addTeacherSchema, AddTeacherFormValues } from "./schema";
import { ImageCropperModal } from "@/components/ui/image-cropper";

export function AddTeacherModal() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("personal");
    const [isUploadingImg, setIsUploadingImg] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string>("");

    const imgInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const { data: subjectsData } = useQuery({
        queryKey: ["subjects"],
        queryFn: () => SubjectService.getAllSubjects({ limit: 1000 }),
        enabled: open,
    });

    const subjectsList = Array.isArray(subjectsData?.data) ? subjectsData.data : subjectsData?.data?.data || [];

    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<AddTeacherFormValues>({
        resolver: zodResolver(addTeacherSchema) as any,
        defaultValues: { employmentType: "FULL_TIME", experienceYears: 0, basicSalary: 0, subjectIds: [] }
    });

    const watchProfileImage = watch("profileImage");
    const watchResumeUrl = watch("resumeUrl");

    const mutation = useMutation({
        mutationFn: TeacherService.createTeacher,
        onSuccess: () => {
            toast.success("Teacher onboarded successfully");
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            setOpen(false);
            reset();
            setActiveTab("personal");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add teacher");
        },
    });

    const uploadFile = async (file: File | Blob, type: 'image' | 'document') => {
        try {
            type === 'image' ? setIsUploadingImg(true) : setIsUploadingDoc(true);
            const formData = new FormData();
            formData.append("file", file as File);

            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

            if (res.data.success) {
                if (type === 'image') setValue("profileImage", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                if (type === 'document') setValue("resumeUrl", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                toast.success(`${type === 'image' ? 'Profile picture' : 'Resume'} uploaded successfully`);
            }
        } catch (error: any) {
            toast.error("File upload failed");
        } finally {
            type === 'image' ? setIsUploadingImg(false) : setIsUploadingDoc(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'image') {
            const reader = new FileReader();
            reader.onload = () => { setImageToCrop(reader.result as string); setCropModalOpen(true); };
            reader.readAsDataURL(file);
        } else {
            uploadFile(file, type);
        }
        e.target.value = "";
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropModalOpen(false);
        const file = new File([croppedBlob], "teacher-profile.png", { type: "image/png" });
        await uploadFile(file, 'image');
    };

    const onSubmit = (data: AddTeacherFormValues) => mutation.mutate(data);

    const onError = (formErrors: any) => {
        const errorKeys = Object.keys(formErrors);
        if (errorKeys.some(key => ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth'].includes(key))) setActiveTab("personal");
        else if (errorKeys.some(key => ['designation', 'qualification', 'joiningDate', 'subjectIds'].includes(key))) setActiveTab("professional");
        else if (errorKeys.some(key => ['basicSalary'].includes(key))) setActiveTab("payroll");
        else setActiveTab("documents");
        toast.error("Please fill in all mandatory fields correctly.");
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild><Button size="lg" className="px-6 font-bold shadow-md"><Plus className="mr-2 h-5 w-5" /> Onboard Teacher</Button></SheetTrigger>
            <SheetContent className="sm:max-w-[750px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">Teacher Onboarding</SheetTitle>
                        <SheetDescription className="text-sm font-medium">Enter profile and payroll details.</SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form id="add-teacher-form" onSubmit={handleSubmit(onSubmit, onError)}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/40 p-1 rounded-xl">
                                <TabsTrigger value="personal" className="rounded-lg font-bold"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                                <TabsTrigger value="professional" className="rounded-lg font-bold"><Briefcase className="w-4 h-4 mr-2" /> Work</TabsTrigger>
                                <TabsTrigger value="payroll" className="rounded-lg font-bold"><Banknote className="w-4 h-4 mr-2" /> Payroll</TabsTrigger>
                                <TabsTrigger value="documents" className="rounded-lg font-bold"><FileBadge className="w-4 h-4 mr-2" /> Docs</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal" className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>First Name *</Label><Input className={errors.firstName ? 'border-red-500' : ''} {...register("firstName")} /></div>
                                    <div className="space-y-2"><Label>Last Name *</Label><Input className={errors.lastName ? 'border-red-500' : ''} {...register("lastName")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Email Address *</Label><Input type="email" className={errors.email ? 'border-red-500' : ''} {...register("email")} /></div>
                                    <div className="space-y-2"><Label>Phone Number *</Label><Input className={errors.phone ? 'border-red-500' : ''} {...register("phone")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Gender *</Label>
                                        <Controller control={control} name="gender" render={({ field }) => (
                                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                                <SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div className="space-y-2"><Label>Date of Birth *</Label><Input type="date" className={errors.dateOfBirth ? 'border-red-500' : ''} {...register("dateOfBirth")} /></div>
                                </div>
                                <div className="space-y-2"><Label>Residential Address</Label><Input {...register("address")} /></div>
                            </TabsContent>

                            <TabsContent value="professional" className="space-y-6">
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
                                                                            {subject.name}
                                                                            <span className="cursor-pointer hover:bg-muted-foreground/20 rounded-full p-0.5" onClick={(e) => { e.stopPropagation(); field.onChange(field.value?.filter((val) => val !== id)); }}>
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
                                                                        <CommandItem key={subject.id} value={subject.name} onSelect={() => { const currentValues = field.value || []; const newValues = isSelected ? currentValues.filter((val) => val !== subject.id) : [...currentValues, subject.id]; field.onChange(newValues); }}>
                                                                            <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100 text-primary" : "opacity-0")} />
                                                                            {subject.name} <span className="text-xs text-muted-foreground ml-2">({subject.code})</span>
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
                                    <div className="space-y-2"><Label>Designation *</Label><Input className={errors.designation ? 'border-red-500' : ''} {...register("designation")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Highest Qualification *</Label><Input className={errors.qualification ? 'border-red-500' : ''} {...register("qualification")} /></div>
                                    <div className="space-y-2">
                                        <Label>Employment Type</Label>
                                        <Controller control={control} name="employmentType" render={({ field }) => (
                                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                                <SelectContent><SelectItem value="FULL_TIME">Full Time</SelectItem><SelectItem value="PART_TIME">Part Time</SelectItem><SelectItem value="CONTRACT">Contract Basis</SelectItem><SelectItem value="GUEST">Guest Lecturer</SelectItem></SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Experience (Years)</Label><Input type="number" {...register("experienceYears")} /></div>
                                    <div className="space-y-2"><Label>Joining Date *</Label><Input type="date" className={errors.joiningDate ? 'border-red-500' : ''} {...register("joiningDate")} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><Label>Employee ID</Label><Input {...register("employeeId")} /></div>
                                    <div className="space-y-2"><Label>LinkedIn Profile</Label><Input {...register("linkedinUrl")} /></div>
                                </div>
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
                                    <Avatar className="h-20 w-20 border-2 shadow-sm"><AvatarImage src={watchProfileImage} className="object-cover" /><AvatarFallback><User className="h-8 w-8" /></AvatarFallback></Avatar>
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-bold text-sm uppercase">Profile Picture</h4>
                                        <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
                                        <Button type="button" variant="outline" size="sm" onClick={() => imgInputRef.current?.click()} disabled={isUploadingImg}>
                                            {isUploadingImg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} {isUploadingImg ? "Uploading..." : "Browse Image"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FileText className="h-8 w-8" /></div>
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-bold text-sm uppercase">Curriculum Vitae (CV)</h4>
                                        <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'document')} />
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
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" form="add-teacher-form" className="font-bold px-8" disabled={mutation.isPending || isUploadingImg || isUploadingDoc}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Complete Onboarding
                    </Button>
                </div>
            </SheetContent>

            <ImageCropperModal open={cropModalOpen} imageSrc={imageToCrop} onClose={() => setCropModalOpen(false)} onCropComplete={handleCropComplete} />
        </Sheet>
    );
}