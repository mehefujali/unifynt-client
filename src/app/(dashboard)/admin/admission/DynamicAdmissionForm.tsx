/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AdmissionService } from "@/services/admission.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, UploadCloud, GraduationCap, UserSquare2, CheckCircle2, AlertCircle, CalendarDays, BookOpen } from "lucide-react";

interface DynamicAdmissionFormProps {
    schoolId: string;
}

export function DynamicAdmissionForm({ schoolId }: DynamicAdmissionFormProps) {
    const router = useRouter();
    const { register, handleSubmit, control, formState: { errors } } = useForm();
    const [files, setFiles] = useState<Record<string, File>>({});

    const { data: publicDataRes, isLoading: isConfigLoading } = useQuery({
        queryKey: ["publicAdmissionData", schoolId],
        queryFn: () => AdmissionService.getPublicData(schoolId),
    });

    const submitMutation = useMutation({
        mutationFn: (formData: FormData) => AdmissionService.submitApplication(schoolId, formData),
        onSuccess: () => {
            toast.success("Application submitted successfully!");
            router.push("/admission/success");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to submit application. Please try again.");
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles((prev) => ({ ...prev, [fieldName]: e.target.files![0] }));
        }
    };

    const onSubmit = (data: any) => {
        const formData = new FormData();
        const payload = {
            applicantName: `${data.firstName} ${data.lastName || ""}`.trim(),
            applicantEmail: data.email,
            ...data,
        };

        formData.append("data", JSON.stringify(payload));

        Object.entries(files).forEach(([key, file]) => {
            formData.append(key, file);
        });

        submitMutation.mutate(formData);
    };

    if (isConfigLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="h-14 w-14 animate-spin text-blue-600 relative z-10" />
                </div>
                <p className="text-slate-600 font-medium text-lg animate-pulse">Initializing Admission Portal...</p>
            </div>
        );
    }

    const config = publicDataRes?.data?.config;
    const classesList = publicDataRes?.data?.classes || [];
    const academicYearsList = publicDataRes?.data?.academicYears || [];
    const dynamicFields = Array.isArray(config?.fields) ? config.fields : [];

    if (config && config.isActive === false) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center shadow-2xl border-0 rounded-3xl bg-white">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Admissions Closed</h2>
                    <p className="text-slate-500 leading-relaxed">
                        We are not accepting any new applications at this moment. Please check back later for the next academic session.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
            <Card className="shadow-2xl border-0 bg-white overflow-hidden rounded-[2rem] ring-1 ring-slate-100">
                <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-10 pt-12 px-6 sm:px-12 text-center">
                    <CardTitle className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Student Admission
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Please provide accurate information to process your application smoothly. Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-12 px-6 sm:px-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">

                        {/* Core Details Section */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <UserSquare2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Personal Details</h3>
                                    <p className="text-sm text-slate-500">{`Applicant's basic information`}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">First Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        {...register("firstName", { required: true })}
                                        placeholder="e.g. John"
                                        className={`h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all ${errors.firstName ? 'border-red-500 bg-red-50/50 focus-visible:ring-red-500' : 'hover:border-slate-300'}`}
                                    />
                                    {errors.firstName && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Required</span>}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">Last Name</Label>
                                    <Input
                                        {...register("lastName")}
                                        placeholder="e.g. Doe"
                                        className="h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus-visible:ring-blue-500 hover:border-slate-300 transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">Email Address <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="email"
                                        {...register("email", { required: true })}
                                        placeholder="parent@example.com"
                                        className={`h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus-visible:ring-blue-500 transition-all ${errors.email ? 'border-red-500 bg-red-50/50 focus-visible:ring-red-500' : 'hover:border-slate-300'}`}
                                    />
                                    {errors.email && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Valid email is required</span>}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700">Gender <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={`h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus:ring-blue-500 transition-all ${errors.gender ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'hover:border-slate-300'}`}>
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl">
                                                    <SelectItem value="MALE" className="py-3">Male</SelectItem>
                                                    <SelectItem value="FEMALE" className="py-3">Female</SelectItem>
                                                    <SelectItem value="OTHER" className="py-3">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.gender && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Required</span>}
                                </div>
                            </div>
                        </section>

                        {/* Academic Section */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900">Academic Target</h3>
                                    <p className="text-sm text-slate-500">Select session and class</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-slate-400" /> Academic Session <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="academicYearId"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={`h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus:ring-indigo-500 transition-all ${errors.academicYearId ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'hover:border-slate-300'}`}>
                                                    <SelectValue placeholder="Select Session" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl">
                                                    {academicYearsList.map((year: any) => (
                                                        <SelectItem key={year.id} value={year.id} className="py-3 font-medium">{year.year}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.academicYearId && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Required</span>}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-400" /> Admission Class <span className="text-red-500">*</span></Label>
                                    <Controller
                                        name="classId"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className={`h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus:ring-indigo-500 transition-all ${errors.classId ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'hover:border-slate-300'}`}>
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl">
                                                    {classesList.map((c: any) => (
                                                        <SelectItem key={c.id} value={c.id} className="py-3 font-medium">{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.classId && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Required</span>}
                                </div>
                            </div>
                        </section>

                        {/* Dynamic Fields Section */}
                        {dynamicFields.length > 0 && (
                            <section className="space-y-8">
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-900">Additional Information</h3>
                                        <p className="text-sm text-slate-500">Custom requirements by the school</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                    {dynamicFields.map((field: any, index: number) => (
                                        <div key={index} className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </Label>

                                            {field.type === "TEXT" || field.type === "NUMBER" || field.type === "DATE" ? (
                                                <Input
                                                    type={field.type.toLowerCase()}
                                                    {...register(field.name, { required: field.required })}
                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    className={`h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus-visible:ring-purple-500 transition-all ${errors[field.name] ? 'border-red-500 bg-red-50/50 focus-visible:ring-red-500' : 'hover:border-slate-300'}`}
                                                />
                                            ) : field.type === "DROPDOWN" ? (
                                                <Controller
                                                    name={field.name}
                                                    control={control}
                                                    rules={{ required: field.required }}
                                                    render={({ field: controllerField }) => (
                                                        <Select onValueChange={controllerField.onChange} value={controllerField.value}>
                                                            <SelectTrigger className={`h-14 bg-slate-50 border-slate-200 text-base px-4 rounded-xl focus:ring-purple-500 transition-all ${errors[field.name] ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'hover:border-slate-300'}`}>
                                                                <SelectValue placeholder={`Select ${field.label}`} />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl shadow-xl">
                                                                {field.options?.map((opt: string) => (
                                                                    <SelectItem key={opt} value={opt} className="py-3">{opt}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            ) : field.type === "FILE" ? (
                                                <div className="relative">
                                                    <div className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all ${files[field.name] ? 'border-purple-500 bg-purple-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-purple-300'} ${errors[field.name] && !files[field.name] ? 'border-red-500 bg-red-50/50' : ''}`}>
                                                        <Input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                            onChange={(e) => handleFileChange(e, field.name)}
                                                            required={field.required && !files[field.name]}
                                                        />
                                                        <div className="flex flex-col items-center gap-2 text-slate-500 px-4 text-center pointer-events-none">
                                                            {files[field.name] ? (
                                                                <>
                                                                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-purple-700 truncate max-w-full">
                                                                        {files[field.name].name}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UploadCloud className="h-8 w-8 text-slate-400" />
                                                                    <span className="text-sm font-medium">Click or drag file to upload</span>
                                                                    <span className="text-xs text-slate-400">PDF or Images up to 5MB</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null}
                                            {errors[field.name] && <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> Required</span>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </form>
                </CardContent>

                <CardFooter className="bg-slate-50/80 border-t border-slate-100 px-6 sm:px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Please review all details before submitting.
                    </div>
                    <Button
                        type="button"
                        onClick={handleSubmit(onSubmit)}
                        disabled={submitMutation.isPending}
                        className="w-full sm:w-auto px-10 h-14 rounded-xl text-lg font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {submitMutation.isPending ? (
                            <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Processing...</>
                        ) : (
                            "Submit Application"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}