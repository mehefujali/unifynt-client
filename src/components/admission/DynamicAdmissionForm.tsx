/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdmissionService } from "@/services/admission.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertCircle, School } from "lucide-react";
import ProfessionalFileUpload from "@/components/ui/file-upload";

export default function DynamicAdmissionForm({ schoolId }: { schoolId: string }) {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { data: publicDataRes, isLoading } = useQuery({
        queryKey: ["publicAdmissionData", schoolId],
        queryFn: () => AdmissionService.getPublicData(schoolId),
        enabled: !!schoolId,
    });

    const form = useForm();
    const { register, handleSubmit, control, watch, reset } = form;
    const formValues = watch();

    useEffect(() => {
        const savedData = localStorage.getItem(`admission_form_${schoolId}`);
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                reset(parsedData);
            } catch (e) {
                // empty
            }
        }
    }, [schoolId, reset]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const dataToSave = { ...formValues };
            
            const fileKeys = [
                "profileImage", "birthCertificateUrl", "nationalIdDocumentUrl", "tcDocumentUrl", 
                "previousMarksheetUrl", "casteCertificateUrl", "medicalCertificateUrl", 
                "incomeCertificateUrl", "fatherPhotoUrl", "motherPhotoUrl", "guardianPhotoUrl"
            ];
            
            fileKeys.forEach(key => delete dataToSave[key]);

            Object.keys(dataToSave).forEach(key => {
                if (
                    dataToSave[key] instanceof FileList || 
                    dataToSave[key] instanceof File || 
                    (Array.isArray(dataToSave[key]) && dataToSave[key][0] instanceof File)
                ) {
                    delete dataToSave[key];
                }
            });

            if (Object.keys(dataToSave).length > 0) {
                localStorage.setItem(`admission_form_${schoolId}`, JSON.stringify(dataToSave));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formValues, schoolId]);

    const submitMutation = useMutation({
        mutationFn: (formData: FormData) => AdmissionService.submitApplication(schoolId, formData),
        onSuccess: () => {
            localStorage.removeItem(`admission_form_${schoolId}`);
            setIsSubmitted(true);
            toast.success("Application submitted successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to submit application");
        }
    });

    const onSubmit = (data: any) => {
        const formData = new FormData();
        const { profileImage, birthCertificateUrl, nationalIdDocumentUrl, tcDocumentUrl, previousMarksheetUrl, casteCertificateUrl, medicalCertificateUrl, incomeCertificateUrl, fatherPhotoUrl, motherPhotoUrl, guardianPhotoUrl, ...textData } = data;

        formData.append("data", JSON.stringify(textData));

        const fileKeys = [
            "profileImage", "birthCertificateUrl", "nationalIdDocumentUrl", "tcDocumentUrl", 
            "previousMarksheetUrl", "casteCertificateUrl", "medicalCertificateUrl", 
            "incomeCertificateUrl", "fatherPhotoUrl", "motherPhotoUrl", "guardianPhotoUrl"
        ];

        fileKeys.forEach(key => {
            if (data[key] && data[key].length > 0) {
                formData.append(key, data[key][0]);
            }
        });

        submitMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse">Loading admission form...</p>
            </div>
        );
    }

    const config = publicDataRes?.data?.config;
    const classes = publicDataRes?.data?.classes || [];
    const academicYears = publicDataRes?.data?.academicYears || [];

    if (!config || !config.isActive) {
        return (
            <Card className="max-w-md mx-auto mt-20 text-center shadow-none border-dashed border-2">
                <CardContent className="pt-10 pb-10 flex flex-col items-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Admissions Closed</h2>
                    <p className="text-sm text-muted-foreground">We are not accepting any new applications at this moment.</p>
                </CardContent>
            </Card>
        );
    }

    let parsedFields: any[] = [];
    try {
        parsedFields = typeof config.fields === "string" ? JSON.parse(config.fields) : config.fields || [];
    } catch (e) {
        parsedFields = [];
    }

    if (isSubmitted) {
        return (
            <Card className="max-w-lg mx-auto mt-20 text-center border-none shadow-xl bg-gradient-to-b from-card to-emerald-50/30 dark:to-emerald-950/10">
                <CardContent className="pt-16 pb-16 flex flex-col items-center">
                    <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">Application Received!</h2>
                    <p className="text-muted-foreground max-w-[300px] mb-8">We will review your application and contact you shortly.</p>
                    <Button onClick={() => window.location.reload()} variant="outline">Submit Another</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 md:px-0">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                    <School className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">Student Admission</h1>
                <p className="text-muted-foreground">Accurate information ensures faster processing.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card className="shadow-sm border-border overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">First Name *</Label>
                                <Input {...register("firstName", { required: true })} placeholder="John" className="h-10 bg-background" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Last Name *</Label>
                                <Input {...register("lastName", { required: true })} placeholder="Doe" className="h-10 bg-background" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Email *</Label>
                                <Input type="email" {...register("email", { required: true })} placeholder="john@example.com" className="h-10 bg-background" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Phone *</Label>
                                <Input type="tel" {...register("phone", { required: true })} placeholder="+1234567890" className="h-10 bg-background" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Admission Class *</Label>
                                <Controller
                                    control={control}
                                    name="classId"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className="h-10 bg-background">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((cls: any) => (
                                                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Academic Year (Session) *</Label>
                                <Controller
                                    control={control}
                                    name="academicYearId"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className="h-10 bg-background">
                                                <SelectValue placeholder="Select Session" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((year: any) => (
                                                    <SelectItem key={year.id} value={year.id}>{year.name || year.year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {parsedFields.length > 0 && (
                    <Card className="shadow-sm border-border overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">Additional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {parsedFields.map((field) => (
                                    <div key={field.name} className={`space-y-2 ${field.type === 'FILE' ? 'md:col-span-2' : ''}`}>
                                        {field.type !== "FILE" && (
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                                {field.label} {field.required && <span className="text-destructive">*</span>}
                                            </Label>
                                        )}
                                        
                                        {field.type === "TEXT" && <Input {...register(field.name, { required: field.required })} className="h-10 bg-background" />}
                                        {field.type === "NUMBER" && <Input type="number" {...register(field.name, { required: field.required })} className="h-10 bg-background" />}
                                        {field.type === "DATE" && <Input type="date" {...register(field.name, { required: field.required })} className="h-10 bg-background" />}
                                        {field.type === "DROPDOWN" && (
                                            <Controller
                                                control={control}
                                                name={field.name}
                                                rules={{ required: field.required }}
                                                render={({ field: selectField }) => (
                                                    <Select onValueChange={selectField.onChange} value={selectField.value || ""}>
                                                        <SelectTrigger className="h-10 bg-background">
                                                            <SelectValue placeholder={`Select ${field.label}`} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {field.options?.map((opt: string) => (
                                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        )}
                                        {field.type === "FILE" && (
                                            <Controller
                                                control={control}
                                                name={field.name}
                                                rules={{ required: field.required }}
                                                render={({ field: { onChange } }) => (
                                                    <ProfessionalFileUpload
                                                        label={`${field.label} ${field.required ? '*' : ''}`}
                                                        onFileChange={(file) => onChange(file ? [file] : [])}
                                                    />
                                                )}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" disabled={submitMutation.isPending} className="w-full md:w-auto px-10 h-12 font-bold shadow-md">
                        {submitMutation.isPending ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : "Submit Admission Form"}
                    </Button>
                </div>
            </form>
        </div>
    );
}