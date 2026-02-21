/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, UploadCloud, User, GraduationCap, Users, FileBadge, Save } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { ImageCropperModal } from "@/components/ui/image-cropper";

interface EditStudentModalProps {
    studentId: string | null;
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

// 1. Parent Component: Handles Fetching and Modal State
export function EditStudentModal({ studentId, open, onOpenChange }: EditStudentModalProps) {
    const { data: studentRes, isFetching: isStudentFetching } = useQuery({
        queryKey: ["student", studentId],
        queryFn: () => StudentService.getSingleStudent(studentId as string),
        enabled: !!studentId && open,
    });

    const studentData: any = studentRes?.data?.id ? studentRes.data : studentRes?.id ? studentRes : null;
    const isCoreDataLoading = isStudentFetching || (!studentData && open);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[850px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">Edit Student Profile</SheetTitle>
                        <SheetDescription className="text-sm font-medium">Update academic, personal, or guardian records.</SheetDescription>
                    </SheetHeader>
                </div>

                {isCoreDataLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Loading student records...</p>
                    </div>
                ) : studentData ? (
                    // 2. We only render the form when the data is 100% available
                    <EditStudentForm
                        key={studentId}
                        studentId={studentId as string}
                        studentData={studentData}
                        onOpenChange={onOpenChange}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-muted-foreground">Student data not found.</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

// 3. Child Component: Contains Form Logic (Mounts ONLY when data is ready)
function EditStudentForm({ studentId, studentData, onOpenChange }: { studentId: string; studentData: any; onOpenChange: (open: boolean) => void; }) {
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("academic");
    const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string>("");
    const [activeImageField, setActiveImageField] = useState<keyof StudentFormValues | null>(null);

    const fileRefs = {
        profileImage: useRef<HTMLInputElement>(null),
        birthCertificateUrl: useRef<HTMLInputElement>(null),
        tcDocumentUrl: useRef<HTMLInputElement>(null),
    };

    const metadata = studentData?.metadata || {};
    const yearsList: any[] = metadata.academicYears || [];
    const classesList: any[] = metadata.classes || [];

    // Since this component mounts AFTER data arrives, defaultValues will perfectly initialize
    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema) as any,
        defaultValues: {
            academicYearId: studentData.academicYearId || "",
            classId: studentData.classId || "",
            sectionId: studentData.sectionId || "",
            rollNumber: studentData.rollNumber || "",
            admissionNumber: studentData.admissionNumber || "",
            admissionDate: safeDate(studentData.admissionDate),
            firstName: studentData.firstName || "",
            lastName: studentData.lastName || "",
            gender: studentData.gender || "MALE",
            dateOfBirth: safeDate(studentData.dateOfBirth),
            bloodGroup: studentData.bloodGroup || "",
            religion: studentData.religion || "",
            caste: studentData.caste || "GENERAL",
            nationalId: studentData.nationalId || "",
            address: studentData.address || "",
            phone: studentData.phone || "",
            email: studentData.user?.email || studentData.email || "",
            fatherName: studentData.fatherName || "",
            fatherPhone: studentData.fatherPhone || "",
            fatherOccupation: studentData.fatherOccupation || "",
            motherName: studentData.motherName || "",
            motherPhone: studentData.motherPhone || "",
            motherOccupation: studentData.motherOccupation || "",
            localGuardianName: studentData.localGuardianName || "",
            localGuardianPhone: studentData.localGuardianPhone || "",
            localGuardianRelation: studentData.localGuardianRelation || "",
            previousSchoolName: studentData.previousSchoolName || "",
            transferCertificateNo: studentData.transferCertificateNo || "",
            medicalConditions: studentData.medicalConditions || "",
            transportRoute: studentData.transportRoute || "",
            profileImage: studentData.profileImage || "",
            birthCertificateUrl: studentData.birthCertificateUrl || "",
            tcDocumentUrl: studentData.tcDocumentUrl || "",
        }
    });

    const { register, handleSubmit, setValue, watch, control, formState: { errors } } = form;

    const watchClassId = watch("classId");

    const { data: dynamicSectionsRes, isFetching: isSectionsFetching } = useQuery({
        queryKey: ["sections", watchClassId],
        queryFn: () => AcademicService.getAllSections(watchClassId),
        enabled: !!watchClassId && watchClassId !== studentData?.classId,
    });

    const sectionsList: any[] = (watchClassId === studentData?.classId)
        ? (metadata.sections || [])
        : (Array.isArray(dynamicSectionsRes?.data) ? dynamicSectionsRes.data : Array.isArray(dynamicSectionsRes) ? dynamicSectionsRes : []);

    const mutation = useMutation({
        mutationFn: async (data: StudentFormValues) => {
            return await StudentService.updateStudent(studentId, data);
        },
        onSuccess: () => {
            toast.success("Student profile updated successfully");
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["student", studentId] });
            onOpenChange(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Update failed"),
    });

    const uploadFile = async (file: File | Blob, fieldName: keyof StudentFormValues) => {
        try {
            setIsUploading(prev => ({ ...prev, [fieldName]: true }));
            const formData = new FormData();
            formData.append("file", file as File);

            const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

            if (res.data.success) {
                setValue(fieldName, res.data.data.url, { shouldValidate: true, shouldDirty: true });
                toast.success("File uploaded successfully");
            }
        } catch (error: any) {
            toast.error("File upload failed");
        } finally {
            setIsUploading(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof StudentFormValues) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (fieldName === "profileImage") {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
                setActiveImageField(fieldName);
                setCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        } else {
            uploadFile(file, fieldName);
        }
        e.target.value = "";
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropModalOpen(false);
        if (activeImageField) {
            const file = new File([croppedBlob], "profile-crop.png", { type: "image/png" });
            await uploadFile(file, activeImageField);
        }
    };

    const onSubmit = (data: StudentFormValues) => mutation.mutate(data);

    const onError = (formErrors: any) => {
        const errorKeys = Object.keys(formErrors);
        const academicFields = ['academicYearId', 'classId', 'sectionId', 'rollNumber', 'admissionNumber', 'admissionDate'];
        const personalFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'bloodGroup', 'religion', 'caste', 'nationalId', 'address', 'phone', 'email'];
        const parentFields = ['fatherName', 'fatherPhone', 'fatherOccupation', 'motherName', 'motherPhone', 'motherOccupation', 'localGuardianName', 'localGuardianPhone', 'localGuardianRelation'];

        if (errorKeys.some(key => academicFields.includes(key))) setActiveTab("academic");
        else if (errorKeys.some(key => personalFields.includes(key))) setActiveTab("personal");
        else if (errorKeys.some(key => parentFields.includes(key))) setActiveTab("parents");
        else setActiveTab("documents");

        toast.error("Please fill in all mandatory fields correctly.");
    };

    return (
        <>
            <div className="flex-1 overflow-y-auto p-8">
                <form id="edit-student-form" onSubmit={handleSubmit(onSubmit, onError)}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/40 p-1 rounded-xl">
                            <TabsTrigger value="academic" className="rounded-lg font-bold"><GraduationCap className="w-4 h-4 mr-2" /> Academic</TabsTrigger>
                            <TabsTrigger value="personal" className="rounded-lg font-bold"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                            <TabsTrigger value="parents" className="rounded-lg font-bold"><Users className="w-4 h-4 mr-2" /> Parents</TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-lg font-bold"><FileBadge className="w-4 h-4 mr-2" /> Docs</TabsTrigger>
                        </TabsList>

                        <TabsContent value="academic" className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Academic Year *</Label>
                                    <Controller
                                        control={control}
                                        name="academicYearId"
                                        render={({ field }) => (
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
                                                <SelectTrigger className={`h-11 shadow-sm ${errors.academicYearId ? 'border-red-500' : 'bg-muted/10'}`}>
                                                    <SelectValue placeholder="Select Academic Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {yearsList.map((year: any) => (
                                                        <SelectItem key={year.id} value={String(year.id)}>{year.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission Date</Label>
                                    <Input type="date" className="h-11 shadow-sm bg-muted/10" {...register("admissionDate")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class *</Label>
                                    <Controller
                                        control={control}
                                        name="classId"
                                        render={({ field }) => (
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={(val) => {
                                                field.onChange(val);
                                                setValue("sectionId", "", { shouldValidate: true });
                                            }}>
                                                <SelectTrigger className={`h-11 shadow-sm ${errors.classId ? 'border-red-500' : 'bg-muted/10'}`}>
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classesList.map((cls: any) => (<SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Section *</Label>
                                    <Controller
                                        control={control}
                                        name="sectionId"
                                        render={({ field }) => (
                                            <Select
                                                disabled={!watchClassId || isSectionsFetching}
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className={`h-11 shadow-sm ${errors.sectionId ? 'border-red-500' : 'bg-muted/10'}`}>
                                                    <SelectValue placeholder={isSectionsFetching ? "Loading..." : "Select Section"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sectionsList.map((sec: any) => (<SelectItem key={sec.id} value={String(sec.id)}>{sec.name}</SelectItem>))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roll Number *</Label>
                                    <Input className={`h-11 shadow-sm ${errors.rollNumber ? 'border-red-500' : 'bg-muted/10'}`} {...register("rollNumber")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admission/Reg. No</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10 font-mono" {...register("admissionNumber")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Previous School</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("previousSchoolName")} />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="personal" className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name *</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("firstName")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name *</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("lastName")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender *</Label>
                                    <Controller
                                        control={control}
                                        name="gender"
                                        render={({ field }) => (
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
                                                <SelectTrigger className="h-11 bg-muted/10"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem><SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</Label>
                                    <Input type="date" className="h-11 shadow-sm bg-muted/10" {...register("dateOfBirth")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Blood Group</Label>
                                    <Controller
                                        control={control}
                                        name="bloodGroup"
                                        render={({ field }) => (
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
                                                <SelectTrigger className="h-11 bg-muted/10"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    {["A_POS", "A_NEG", "B_POS", "B_NEG", "O_POS", "O_NEG", "AB_POS", "AB_NEG"].map(bg => (
                                                        <SelectItem key={bg} value={bg}>{bg.replace("_", "")}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Caste / Category</Label>
                                    <Controller
                                        control={control}
                                        name="caste"
                                        render={({ field }) => (
                                            <Select value={field.value ? String(field.value) : undefined} onValueChange={field.onChange}>
                                                <SelectTrigger className="h-11 bg-muted/10"><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="GENERAL">General</SelectItem><SelectItem value="OBC">OBC</SelectItem><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
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
                        </TabsContent>

                        <TabsContent value="parents" className="space-y-6 animate-in fade-in duration-500">
                            <div className="p-5 border rounded-xl bg-muted/5 space-y-4">
                                <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2">Father&apos;s Details</h4>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2"><Label className="text-xs font-bold text-muted-foreground">Name</Label><Input className="h-11 bg-background" {...register("fatherName")} /></div>
                                    <div className="space-y-2"><Label className="text-xs font-bold text-muted-foreground">Phone</Label><Input className="h-11 bg-background" {...register("fatherPhone")} /></div>
                                    <div className="space-y-2"><Label className="text-xs font-bold text-muted-foreground">Occupation</Label><Input className="h-11 bg-background" {...register("fatherOccupation")} /></div>
                                </div>
                            </div>
                            <div className="p-5 border rounded-xl bg-muted/5 space-y-4">
                                <h4 className="font-bold text-sm uppercase tracking-wider border-b pb-2">Mother&apos;s Details</h4>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2"><Label className="text-xs font-bold text-muted-foreground">Name</Label><Input className="h-11 bg-background" {...register("motherName")} /></div>
                                    <div className="space-y-2"><Label className="text-xs font-bold text-muted-foreground">Phone</Label><Input className="h-11 bg-background" {...register("motherPhone")} /></div>
                                    <div className="space-y-2"><Label className="text-xs font-bold text-muted-foreground">Occupation</Label><Input className="h-11 bg-background" {...register("motherOccupation")} /></div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-6 animate-in fade-in duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical Conditions / Allergies</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("medicalConditions")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transport Route</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("transportRoute")} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/5">
                                    <Avatar className="h-16 w-16 border-2"><AvatarImage src={watch("profileImage")} className="object-cover" /><AvatarFallback><User /></AvatarFallback></Avatar>
                                    <div className="space-y-1 flex-1">
                                        <p className="font-bold text-sm">Student Photo</p>
                                        <input type="file" ref={fileRefs.profileImage} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'profileImage')} />
                                        <Button type="button" variant="outline" size="sm" onClick={() => fileRefs.profileImage.current?.click()} disabled={isUploading.profileImage}>
                                            {isUploading.profileImage ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <UploadCloud className="mr-2 h-3 w-3" />} Update
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/5">
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary"><FileBadge className="h-6 w-6" /></div>
                                    <div className="space-y-1 flex-1">
                                        <p className="font-bold text-sm">Birth Certificate</p>
                                        <input type="file" ref={fileRefs.birthCertificateUrl} className="hidden" accept=".pdf,.jpg,.png" onChange={(e) => handleFileSelect(e, 'birthCertificateUrl')} />
                                        <Button type="button" variant="outline" size="sm" onClick={() => fileRefs.birthCertificateUrl.current?.click()} disabled={isUploading.birthCertificateUrl}>
                                            {isUploading.birthCertificateUrl ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <UploadCloud className="mr-2 h-3 w-3" />} {watch("birthCertificateUrl") ? "Update File" : "Upload File"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>

            <div className="p-6 border-t bg-background/90 backdrop-blur shrink-0 flex justify-between">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" form="edit-student-form" className="font-bold px-8" disabled={mutation.isPending || Object.values(isUploading).some(Boolean)}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Changes
                </Button>
            </div>

            <ImageCropperModal
                open={cropModalOpen}
                imageSrc={imageToCrop}
                onClose={() => setCropModalOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </>
    );
}