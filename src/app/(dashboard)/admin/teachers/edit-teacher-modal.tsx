/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UploadCloud, FileText, User, Briefcase, FileBadge, Save } from "lucide-react";

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
import { ImageCropperModal } from "@/components/ui/image-cropper";

interface EditTeacherModalProps {
    teacherId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const safeDate = (dateVal: any) => {
    if (!dateVal) return "";
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return "";
        return d.toISOString().split('T')[0];
    } catch {
        return "";
    }
};

export function EditTeacherModal({ teacherId, open, onOpenChange }: EditTeacherModalProps) {
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("personal");
    const [isUploadingImg, setIsUploadingImg] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string>("");

    const imgInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<EditTeacherFormValues>({
        resolver: zodResolver(editTeacherSchema) as any,
    });

    const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = form;

    const watchProfileImage = watch("profileImage");
    const watchResumeUrl = watch("resumeUrl");

    const { data: teacher, isLoading: isTeacherLoading } = useQuery({
        queryKey: ["teacher", teacherId],
        queryFn: () => TeacherService.getSingleTeacher(teacherId as string),
        enabled: !!teacherId && open,
    });

    useEffect(() => {
        if (teacher && open && !isTeacherLoading) {
            reset({
                firstName: teacher.firstName || "",
                lastName: teacher.lastName || "",
                email: teacher.user?.email || teacher.email || "",
                phone: teacher.phone || "",
                gender: teacher.gender || "MALE",
                dateOfBirth: safeDate(teacher.dateOfBirth),
                address: teacher.address || "",
                department: teacher.department || "",
                designation: teacher.designation || "",
                qualification: teacher.qualification || "",
                employmentType: teacher.employmentType || "FULL_TIME",
                experienceYears: teacher.experienceYears || 0,
                joiningDate: safeDate(teacher.joiningDate),
                linkedinUrl: teacher.linkedinUrl || "",
                profileImage: teacher.profileImage || "",
                resumeUrl: teacher.resumeUrl || "",
                emergencyContactName: teacher.emergencyContactName || "",
                emergencyContactPhone: teacher.emergencyContactPhone || "",
            });
            setActiveTab("personal");
        }
    }, [teacher, open, isTeacherLoading, reset]);

    const mutation = useMutation({
        mutationFn: async (data: EditTeacherFormValues) => {
            if (!teacherId) throw new Error("Teacher ID missing");
            data.experienceYears = Number(data.experienceYears);
            return await TeacherService.updateTeacher(teacherId, data);
        },
        onSuccess: () => {
            toast.success("Teacher profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update teacher");
        },
    });

    const uploadFile = async (file: File | Blob, type: 'image' | 'document') => {
        try {
            type === 'image' ? setIsUploadingImg(true) : setIsUploadingDoc(true);
            const formData = new FormData();
            formData.append("file", file as File);

            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                if (type === 'image') setValue("profileImage", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                if (type === 'document') setValue("resumeUrl", res.data.data.url, { shouldValidate: true, shouldDirty: true });
                toast.success(`${type === 'image' ? 'Profile picture' : 'Resume'} updated successfully`);
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
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setCropModalOpen(true);
            };
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

    const onSubmit = (data: EditTeacherFormValues) => {
        mutation.mutate(data);
    };

    const onError = (formErrors: any) => {
        const errorKeys = Object.keys(formErrors);
        const personalFields = ['firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'address'];
        const professionalFields = ['designation', 'qualification', 'joiningDate', 'employmentType', 'department', 'experienceYears', 'linkedinUrl'];

        if (errorKeys.some(key => personalFields.includes(key))) {
            setActiveTab("personal");
        } else if (errorKeys.some(key => professionalFields.includes(key))) {
            setActiveTab("professional");
        } else {
            setActiveTab("documents");
        }

        toast.error("Please fill in all mandatory fields correctly.");
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[750px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">Edit Teacher Profile</SheetTitle>
                        <SheetDescription className="text-sm font-medium">
                            Update teacher profile, roles, and documents.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                {isTeacherLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Loading teacher data...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-8">
                        <form id="edit-teacher-form" onSubmit={handleSubmit(onSubmit, onError)}>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/40 p-1 rounded-xl">
                                    <TabsTrigger value="personal" className="rounded-lg font-bold data-[state=active]:shadow-sm"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                                    <TabsTrigger value="professional" className="rounded-lg font-bold data-[state=active]:shadow-sm"><Briefcase className="w-4 h-4 mr-2" /> Professional</TabsTrigger>
                                    <TabsTrigger value="documents" className="rounded-lg font-bold data-[state=active]:shadow-sm"><FileBadge className="w-4 h-4 mr-2" /> Documents</TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="space-y-6 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name *</Label>
                                            <Input className={`h-11 shadow-sm ${errors.firstName ? 'border-red-500' : 'bg-muted/10'}`} {...register("firstName")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name *</Label>
                                            <Input className={`h-11 shadow-sm ${errors.lastName ? 'border-red-500' : 'bg-muted/10'}`} {...register("lastName")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</Label>
                                            <Input type="email" disabled className="h-11 shadow-sm bg-muted/30 cursor-not-allowed" {...register("email")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number *</Label>
                                            <Input className={`h-11 shadow-sm ${errors.phone ? 'border-red-500' : 'bg-muted/10'}`} {...register("phone")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender *</Label>
                                            <Controller
                                                control={control}
                                                name="gender"
                                                render={({ field }) => (
                                                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                        <SelectTrigger className={`h-11 shadow-sm ${errors.gender ? 'border-red-500' : 'bg-muted/10'}`}>
                                                            <SelectValue placeholder="Select Gender" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="MALE">Male</SelectItem>
                                                            <SelectItem value="FEMALE">Female</SelectItem>
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth *</Label>
                                            <Input type="date" className={`h-11 shadow-sm ${errors.dateOfBirth ? 'border-red-500' : 'bg-muted/10'}`} {...register("dateOfBirth")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Residential Address</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10" {...register("address")} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="professional" className="space-y-6 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</Label>
                                            <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. Science, Arts" {...register("department")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation *</Label>
                                            <Input className={`h-11 shadow-sm ${errors.designation ? 'border-red-500' : 'bg-muted/10'}`} placeholder="e.g. Senior Teacher" {...register("designation")} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Highest Qualification *</Label>
                                            <Input className={`h-11 shadow-sm ${errors.qualification ? 'border-red-500' : 'bg-muted/10'}`} placeholder="e.g. M.Sc in Physics" {...register("qualification")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employment Type</Label>
                                            <Controller
                                                control={control}
                                                name="employmentType"
                                                render={({ field }) => (
                                                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                                                        <SelectTrigger className="h-11 shadow-sm bg-muted/10">
                                                            <SelectValue placeholder="Select Type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                                            <SelectItem value="CONTRACT">Contract Basis</SelectItem>
                                                            <SelectItem value="GUEST">Guest Lecturer</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Experience (Years)</Label>
                                            <Input type="number" className="h-11 shadow-sm bg-muted/10" {...register("experienceYears")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Joining Date *</Label>
                                            <Input type="date" className={`h-11 shadow-sm ${errors.joiningDate ? 'border-red-500' : 'bg-muted/10'}`} {...register("joiningDate")} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">LinkedIn Profile</Label>
                                        <Input className={`h-11 shadow-sm ${errors.linkedinUrl ? 'border-red-500' : 'bg-muted/10'}`} placeholder="linkedin.com/in/..." {...register("linkedinUrl")} />
                                    </div>
                                    <div className="flex justify-between pt-4">
                                        <Button type="button" variant="outline" onClick={() => setActiveTab("personal")}>Back</Button>
                                        <Button type="button" onClick={() => setActiveTab("documents")}>Next: Documents</Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="documents" className="space-y-8 animate-in fade-in duration-500">
                                    <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                        <Avatar className="h-20 w-20 border-2 shadow-sm">
                                            <AvatarImage src={watchProfileImage} className="object-cover" />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold"><User className="h-8 w-8" /></AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-2 flex-1">
                                            <h4 className="font-bold text-sm uppercase tracking-wider">Profile Picture</h4>
                                            <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
                                            <Button type="button" variant="outline" size="sm" onClick={() => imgInputRef.current?.click()} disabled={isUploadingImg}>
                                                {isUploadingImg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                                {isUploadingImg ? "Uploading..." : "Change Image"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <h4 className="font-bold text-sm uppercase tracking-wider">Curriculum Vitae (CV)</h4>
                                            <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'document')} />
                                            <Button type="button" variant="outline" size="sm" onClick={() => docInputRef.current?.click()} disabled={isUploadingDoc}>
                                                {isUploadingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                                {isUploadingDoc ? "Uploading..." : (watchResumeUrl ? "Change Document" : "Upload Document")}
                                            </Button>
                                            {watchResumeUrl && <span className="ml-3 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Document Attached</span>}
                                        </div>
                                    </div>

                                    <div className="p-5 border rounded-xl space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2">Emergency Contact</h4>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Name</Label>
                                                <Input className="h-11 shadow-sm bg-muted/10" {...register("emergencyContactName")} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Phone</Label>
                                                <Input className="h-11 shadow-sm bg-muted/10" {...register("emergencyContactPhone")} />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </form>
                    </div>
                )}

                <div className="p-6 border-t bg-background/90 backdrop-blur shrink-0 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button type="submit" form="edit-teacher-form" className="font-bold px-8" disabled={mutation.isPending || isTeacherLoading || isUploadingImg || isUploadingDoc}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                    </Button>
                </div>
            </SheetContent>

            <ImageCropperModal
                open={cropModalOpen}
                imageSrc={imageToCrop}
                onClose={() => setCropModalOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </Sheet>
    );
}