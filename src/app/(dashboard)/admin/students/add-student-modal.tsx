/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, UploadCloud, User, GraduationCap, Users, FileBadge } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";
import api from "@/lib/axios";
import { studentSchema, StudentFormValues } from "./schema";

export function AddStudentModal() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("academic");
    const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});

    const fileRefs = {
        profileImage: useRef<HTMLInputElement>(null),
        birthCertificateUrl: useRef<HTMLInputElement>(null),
        tcDocumentUrl: useRef<HTMLInputElement>(null),
    };

    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: { caste: "GENERAL", admissionDate: new Date().toISOString().split('T')[0] }
    });

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = form;

    const watchClassId = watch("classId");

    // --- FETCH ACADEMIC DATA ---
    const { data: academicYears, isLoading: isLoadingYears } = useQuery({
        queryKey: ["academicYears"],
        queryFn: AcademicService.getAllAcademicYears,
        enabled: open,
    });

    const { data: classes, isLoading: isLoadingClasses } = useQuery({
        queryKey: ["classes"],
        queryFn: AcademicService.getAllClasses,
        enabled: open,
    });

    const { data: sections, isLoading: isLoadingSections } = useQuery({
        queryKey: ["sections", watchClassId],
        queryFn: () => AcademicService.getAllSections(watchClassId),
        enabled: !!watchClassId && open,
    });

    const mutation = useMutation({
        mutationFn: StudentService.createStudent,
        onSuccess: () => {
            toast.success("Student enrolled successfully");
            queryClient.invalidateQueries({ queryKey: ["students"] });
            setOpen(false);
            reset();
            setActiveTab("academic");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to enroll student");
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof StudentFormValues) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(prev => ({ ...prev, [fieldName]: true }));
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

            if (res.data.success) {
                setValue(fieldName, res.data.data.url, { shouldValidate: true, shouldDirty: true });
                toast.success("Document uploaded successfully");
            }
        } catch (error: any) {
            toast.error("File upload failed");
        } finally {
            setIsUploading(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const onSubmit = (data: StudentFormValues) => {
        mutation.mutate(data);
    };

    // --- SMART ERROR HANDLING (AUTO TAB SWITCHING) ---
    const onError = (formErrors: any) => {
        const errorKeys = Object.keys(formErrors);

        const academicFields = ['academicYearId', 'classId', 'sectionId', 'rollNumber', 'admissionNumber', 'admissionDate', 'previousSchoolName'];
        const personalFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'bloodGroup', 'religion', 'caste', 'nationalId', 'address', 'phone', 'email'];
        const parentFields = ['fatherName', 'fatherPhone', 'fatherOccupation', 'motherName', 'motherPhone', 'motherOccupation', 'localGuardianName', 'localGuardianPhone', 'localGuardianRelation'];

        if (errorKeys.some(key => academicFields.includes(key))) {
            setActiveTab("academic");
        } else if (errorKeys.some(key => personalFields.includes(key))) {
            setActiveTab("personal");
        } else if (errorKeys.some(key => parentFields.includes(key))) {
            setActiveTab("parents");
        } else {
            setActiveTab("documents");
        }

        toast.error("Please fill in all mandatory fields correctly.");
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="lg" className="px-6 font-bold shadow-md">
                    <Plus className="mr-2 h-5 w-5" /> Enroll Student
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[850px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">New Student Enrollment</SheetTitle>
                        <SheetDescription className="text-sm font-medium">
                            Complete the admission form. Ensure all mandatory academic and personal fields are filled.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form id="add-student-form" onSubmit={handleSubmit(onSubmit, onError)}>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/40 p-1 rounded-xl">
                                <TabsTrigger value="academic" className="rounded-lg font-bold"><GraduationCap className="w-4 h-4 mr-2" /> Academic</TabsTrigger>
                                <TabsTrigger value="personal" className="rounded-lg font-bold"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                                <TabsTrigger value="parents" className="rounded-lg font-bold"><Users className="w-4 h-4 mr-2" /> Parents</TabsTrigger>
                                <TabsTrigger value="documents" className="rounded-lg font-bold"><FileBadge className="w-4 h-4 mr-2" /> Docs & Health</TabsTrigger>
                            </TabsList>

                            {/* TAB 1: ACADEMIC */}
                            <TabsContent value="academic" className="space-y-6 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Academic Year *</Label>
                                        <Select onValueChange={(val) => setValue("academicYearId", val, { shouldValidate: true })}>
                                            <SelectTrigger className={`h-11 shadow-sm ${errors.academicYearId ? 'border-red-500 bg-red-50/50' : 'bg-muted/10'}`}>
                                                <SelectValue placeholder={isLoadingYears ? "Loading..." : "Select Academic Year"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears?.map((year: any) => (
                                                    <SelectItem key={year.id} value={year.id}>
                                                        {year.name} {year.isCurrent && "(Active)"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.academicYearId && <p className="text-xs font-semibold text-red-500">{errors.academicYearId.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission Date</Label>
                                        <Input type="date" className="h-11 shadow-sm bg-muted/10" {...register("admissionDate")} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class *</Label>
                                        <Select onValueChange={(val) => {
                                            setValue("classId", val, { shouldValidate: true });
                                            setValue("sectionId", "", { shouldValidate: true });
                                        }}>
                                            <SelectTrigger className={`h-11 shadow-sm ${errors.classId ? 'border-red-500 bg-red-50/50' : 'bg-muted/10'}`}>
                                                <SelectValue placeholder={isLoadingClasses ? "Loading..." : "Select Class"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes?.map((cls: any) => (
                                                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.classId && <p className="text-xs font-semibold text-red-500">{errors.classId.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Section *</Label>
                                        <Select
                                            disabled={!watchClassId || isLoadingSections}
                                            value={watch("sectionId")}
                                            onValueChange={(val) => setValue("sectionId", val, { shouldValidate: true })}
                                        >
                                            <SelectTrigger className={`h-11 shadow-sm ${errors.sectionId ? 'border-red-500 bg-red-50/50' : 'bg-muted/10'}`}>
                                                <SelectValue placeholder={!watchClassId ? "Select Class First" : (isLoadingSections ? "Loading..." : "Select Section")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections?.map((sec: any) => (
                                                    <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                                                ))}
                                                {sections?.length === 0 && <div className="p-2 text-sm text-muted-foreground">No sections found</div>}
                                            </SelectContent>
                                        </Select>
                                        {errors.sectionId && <p className="text-xs font-semibold text-red-500">{errors.sectionId.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roll Number *</Label>
                                        <Input className={`h-11 shadow-sm ${errors.rollNumber ? 'border-red-500 bg-red-50/50' : 'bg-muted/10'}`} {...register("rollNumber")} />
                                        {errors.rollNumber && <p className="text-xs font-semibold text-red-500">{errors.rollNumber.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission/Reg. No</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10 font-mono placeholder:text-muted-foreground/50" placeholder="Auto-generated if empty" {...register("admissionNumber")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Previous School</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10" {...register("previousSchoolName")} />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4"><Button type="button" onClick={() => setActiveTab("personal")}>Next: Personal Details</Button></div>
                            </TabsContent>

                            {/* TAB 2: PERSONAL */}
                            <TabsContent value="personal" className="space-y-6 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name *</Label>
                                        <Input className={`h-11 shadow-sm ${errors.firstName ? 'border-red-500 bg-red-50/50' : 'bg-muted/10'}`} {...register("firstName")} />
                                        {errors.firstName && <p className="text-xs font-semibold text-red-500">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name *</Label>
                                        <Input className={`h-11 shadow-sm ${errors.lastName ? 'border-red-500 bg-red-50/50' : 'bg-muted/10'}`} {...register("lastName")} />
                                        {errors.lastName && <p className="text-xs font-semibold text-red-500">{errors.lastName.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender *</Label>
                                        <Select onValueChange={(val) => setValue("gender", val as any, { shouldValidate: true })}>
                                            <SelectTrigger className={`h-11 shadow-sm ${errors.gender ? 'border-red-500 bg-red-50/50' : 'bg-muted/10'}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-xs font-semibold text-red-500">{errors.gender.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                                        <Input type="date" className="h-11 shadow-sm bg-muted/10" {...register("dateOfBirth")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Group</Label>
                                        <Select onValueChange={(val) => setValue("bloodGroup", val as any)}>
                                            <SelectTrigger className="h-11 bg-muted/10"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {["A_POS", "A_NEG", "B_POS", "B_NEG", "O_POS", "O_NEG", "AB_POS", "AB_NEG"].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg.replace("_", "")}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Caste / Category</Label>
                                        <Select defaultValue="GENERAL" onValueChange={(val) => setValue("caste", val as any)}>
                                            <SelectTrigger className="h-11 bg-muted/10"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GENERAL">General</SelectItem>
                                                <SelectItem value="OBC">OBC</SelectItem>
                                                <SelectItem value="SC">SC</SelectItem>
                                                <SelectItem value="ST">ST</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Religion</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10" {...register("religion")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">National ID / Aadhar</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10" {...register("nationalId")} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Address</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("address")} />
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => setActiveTab("academic")}>Back</Button>
                                    <Button type="button" onClick={() => setActiveTab("parents")}>Next: Parents</Button>
                                </div>
                            </TabsContent>

                            {/* TAB 3: PARENTS */}
                            <TabsContent value="parents" className="space-y-6 animate-in fade-in duration-500">
                                <div className="p-5 border rounded-xl bg-muted/5 space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2">Father's Details</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Name</Label>
                                            <Input className="h-11 bg-background" {...register("fatherName")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Phone</Label>
                                            <Input className="h-11 bg-background" {...register("fatherPhone")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Occupation</Label>
                                            <Input className="h-11 bg-background" {...register("fatherOccupation")} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 border rounded-xl bg-muted/5 space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2">Mother's Details</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Name</Label>
                                            <Input className="h-11 bg-background" {...register("motherName")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Phone</Label>
                                            <Input className="h-11 bg-background" {...register("motherPhone")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Occupation</Label>
                                            <Input className="h-11 bg-background" {...register("motherOccupation")} />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 border rounded-xl bg-muted/5 space-y-4 border-dashed border-primary/30">
                                    <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2 text-primary">Local Guardian (If Any)</h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Name</Label>
                                            <Input className="h-11 bg-background" {...register("localGuardianName")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Phone</Label>
                                            <Input className="h-11 bg-background" {...register("localGuardianPhone")} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-muted-foreground">Relation</Label>
                                            <Input className="h-11 bg-background" {...register("localGuardianRelation")} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onClick={() => setActiveTab("personal")}>Back</Button>
                                    <Button type="button" onClick={() => setActiveTab("documents")}>Next: Docs & Health</Button>
                                </div>
                            </TabsContent>

                            {/* TAB 4: DOCS & HEALTH */}
                            <TabsContent value="documents" className="space-y-6 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical Conditions / Allergies</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. Dust allergy, Asthma" {...register("medicalConditions")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transport Route (If Appliable)</Label>
                                        <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. Route A - City Center" {...register("transportRoute")} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                    <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/5">
                                        <Avatar className="h-16 w-16 border-2">
                                            <AvatarImage src={watch("profileImage")} className="object-cover" />
                                            <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1 flex-1">
                                            <p className="font-bold text-sm">Student Photo</p>
                                            <input type="file" ref={fileRefs.profileImage} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profileImage')} />
                                            <Button type="button" variant="outline" size="sm" onClick={() => fileRefs.profileImage.current?.click()} disabled={isUploading.profileImage}>
                                                {isUploading.profileImage ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <UploadCloud className="mr-2 h-3 w-3" />} Upload
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/5">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FileBadge className="h-6 w-6" /></div>
                                        <div className="space-y-1 flex-1">
                                            <p className="font-bold text-sm">Birth Certificate</p>
                                            <input type="file" ref={fileRefs.birthCertificateUrl} className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileUpload(e, 'birthCertificateUrl')} />
                                            <Button type="button" variant="outline" size="sm" onClick={() => fileRefs.birthCertificateUrl.current?.click()} disabled={isUploading.birthCertificateUrl}>
                                                {isUploading.birthCertificateUrl ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <UploadCloud className="mr-2 h-3 w-3" />} {watch("birthCertificateUrl") ? "Uploaded" : "Upload File"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/5">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FileBadge className="h-6 w-6" /></div>
                                        <div className="space-y-1 flex-1">
                                            <p className="font-bold text-sm">Transfer Certificate (TC)</p>
                                            <input type="file" ref={fileRefs.tcDocumentUrl} className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileUpload(e, 'tcDocumentUrl')} />
                                            <Button type="button" variant="outline" size="sm" onClick={() => fileRefs.tcDocumentUrl.current?.click()} disabled={isUploading.tcDocumentUrl}>
                                                {isUploading.tcDocumentUrl ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <UploadCloud className="mr-2 h-3 w-3" />} {watch("tcDocumentUrl") ? "Uploaded" : "Upload File"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </form>
                </div>

                <div className="p-6 border-t bg-background/90 backdrop-blur shrink-0 flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" form="add-student-form" className="font-bold px-8" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save & Enroll Student
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}