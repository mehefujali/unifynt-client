/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, UploadCloud, FileText, User, Briefcase, FileBadge } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { TeacherService } from "@/services/teacher.service";
import api from "@/lib/axios";

export function AddTeacherModal() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("personal");
    const [isUploadingImg, setIsUploadingImg] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    const imgInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<any>({
        defaultValues: { employmentType: "FULL_TIME", experienceYears: 0 }
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            type === 'image' ? setIsUploadingImg(true) : setIsUploadingDoc(true);
            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.success) {
                if (type === 'image') setValue("profileImage", res.data.data.url, { shouldDirty: true });
                if (type === 'document') setValue("resumeUrl", res.data.data.url, { shouldDirty: true });
                toast.success(`${type === 'image' ? 'Profile picture' : 'Resume'} uploaded successfully`);
            }
        } catch (error: any) {
            toast.error("File upload failed");
        } finally {
            type === 'image' ? setIsUploadingImg(false) : setIsUploadingDoc(false);
        }
    };

    const onSubmit = (data: any) => {
        data.experienceYears = Number(data.experienceYears);
        mutation.mutate(data);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="lg" className="px-6 font-bold shadow-md">
                    <Plus className="mr-2 h-5 w-5" /> Onboard Teacher
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[750px] overflow-y-auto p-0 border-l-0 shadow-2xl">
                <div className="p-8 pb-4 bg-muted/20 border-b">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">Teacher Onboarding</SheetTitle>
                        <SheetDescription className="text-sm font-medium">
                            Enter complete profile details. An invitation email with login credentials will be sent automatically.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/40 p-1 rounded-xl">
                            <TabsTrigger value="personal" className="rounded-lg font-bold data-[state=active]:shadow-sm"><User className="w-4 h-4 mr-2" /> Personal</TabsTrigger>
                            <TabsTrigger value="professional" className="rounded-lg font-bold data-[state=active]:shadow-sm"><Briefcase className="w-4 h-4 mr-2" /> Professional</TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-lg font-bold data-[state=active]:shadow-sm"><FileBadge className="w-4 h-4 mr-2" /> Documents</TabsTrigger>
                        </TabsList>

                        {/* TAB 1: PERSONAL INFO */}
                        <TabsContent value="personal" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">First Name *</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("firstName", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Name *</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("lastName", { required: true })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</Label>
                                    <Input type="email" className="h-11 shadow-sm bg-muted/10" {...register("email", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number *</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" {...register("phone", { required: true })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender *</Label>
                                    <Select onValueChange={(val) => setValue("gender", val)}>
                                        <SelectTrigger className="h-11 bg-muted/10"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth *</Label>
                                    <Input type="date" className="h-11 shadow-sm bg-muted/10" {...register("dateOfBirth", { required: true })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Residential Address</Label>
                                <Input className="h-11 shadow-sm bg-muted/10" {...register("address")} />
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="button" onClick={() => setActiveTab("professional")}>Next: Professional Details</Button>
                            </div>
                        </TabsContent>

                        {/* TAB 2: PROFESSIONAL INFO */}
                        <TabsContent value="professional" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employee ID</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10 font-mono placeholder:text-muted-foreground/50" placeholder="e.g. EMP-001" {...register("employeeId")} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. Science, Arts" {...register("department")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Designation *</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. Senior Teacher" {...register("designation", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Highest Qualification *</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. M.Sc in Physics" {...register("qualification", { required: true })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employment Type</Label>
                                    <Select defaultValue="FULL_TIME" onValueChange={(val) => setValue("employmentType", val)}>
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
                                    <Input type="number" className="h-11 shadow-sm bg-muted/10" {...register("experienceYears")} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Joining Date *</Label>
                                    <Input type="date" className="h-11 shadow-sm bg-muted/10" {...register("joiningDate", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">LinkedIn Profile</Label>
                                    <Input className="h-11 shadow-sm bg-muted/10" placeholder="https://linkedin.com/in/..." {...register("linkedinUrl")} />
                                </div>
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button type="button" variant="outline" onClick={() => setActiveTab("personal")}>Back</Button>
                                <Button type="button" onClick={() => setActiveTab("documents")}>Next: Documents</Button>
                            </div>
                        </TabsContent>

                        {/* TAB 3: DOCUMENTS & FINAL SUBMIT */}
                        <TabsContent value="documents" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

                            {/* Profile Image Section */}
                            <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                <Avatar className="h-20 w-20 border-2 shadow-sm">
                                    <AvatarImage src={watchProfileImage} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold"><User className="h-8 w-8" /></AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-bold text-sm uppercase tracking-wider">Profile Picture</h4>
                                    <p className="text-xs text-muted-foreground">Upload a professional, square image (1:1 ratio).</p>
                                    <input type="file" ref={imgInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                                    <Button type="button" variant="outline" size="sm" onClick={() => imgInputRef.current?.click()} disabled={isUploadingImg}>
                                        {isUploadingImg ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                        {isUploadingImg ? "Uploading..." : "Browse Image"}
                                    </Button>
                                </div>
                            </div>

                            {/* Resume Upload Section */}
                            <div className="flex items-center gap-6 p-5 border rounded-xl bg-muted/5">
                                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <h4 className="font-bold text-sm uppercase tracking-wider">Curriculum Vitae (CV)</h4>
                                    <p className="text-xs text-muted-foreground">Upload the resume or CV in PDF format.</p>
                                    <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'document')} />
                                    <Button type="button" variant="outline" size="sm" onClick={() => docInputRef.current?.click()} disabled={isUploadingDoc}>
                                        {isUploadingDoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                        {isUploadingDoc ? "Uploading..." : (watchResumeUrl ? "Change Document" : "Upload Document")}
                                    </Button>
                                    {watchResumeUrl && <span className="ml-3 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Document Attached</span>}
                                </div>
                            </div>

                            {/* Emergency Contact */}
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

                            <div className="flex justify-between pt-6 border-t">
                                <Button type="button" variant="outline" onClick={() => setActiveTab("professional")}>Back</Button>
                                <Button type="submit" size="lg" className="px-8 font-bold" disabled={mutation.isPending}>
                                    {mutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    Complete Onboarding
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </SheetContent>
        </Sheet>
    );
}