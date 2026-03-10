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

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const { data: publicDataRes, isLoading } = useQuery({
        queryKey: ["publicAdmissionData", schoolId],
        queryFn: () => AdmissionService.getPublicData(schoolId),
        enabled: !!schoolId,
    });

    const form = useForm();
    const { register, handleSubmit, control, reset, formState: { errors } } = form;

    const verifyMutation = useMutation({
        mutationFn: (data: any) => AdmissionService.verifyPayment(schoolId, data),
        onSuccess: () => {
            reset();
            setIsSubmitted(true);
            toast.success("Payment successful! Application submitted.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Payment verification failed.");
        }
    });

    const submitMutation = useMutation({
        mutationFn: (formData: FormData) => AdmissionService.submitApplication(schoolId, formData),
        onSuccess: (response: any) => {
            const data = response?.data;
            if (data?.paymentRequired) {
                const { orderId, amount, currency, razorpayKeyId, application } = data;
                const options = {
                    key: razorpayKeyId,
                    amount: amount,
                    currency: currency,
                    name: "Admission Fee",
                    description: "Secure payment for school admission",
                    order_id: orderId,
                    handler: function (res: any) {
                        verifyMutation.mutate({
                            applicationId: application.id,
                            razorpay_order_id: res.razorpay_order_id,
                            razorpay_payment_id: res.razorpay_payment_id,
                            razorpay_signature: res.razorpay_signature
                        });
                    },
                    prefill: {
                        name: application.applicantName,
                        email: application.applicantEmail,
                        contact: application.phone
                    },
                    theme: {
                        color: "#4f46e5"
                    }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (res: any) {
                    toast.error(res.error?.description || "Payment failed or was cancelled.");
                });
                rzp.open();
            } else {
                reset();
                setIsSubmitted(true);
                toast.success("Application submitted successfully!");
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to submit application");
        }
    });

    const onSubmit = (data: any) => {
        const formData = new FormData();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <div className="max-w-2xl mx-auto mt-20 px-4">
                <Card className="text-center shadow-2xl border-none bg-white dark:bg-card/50 backdrop-blur-sm overflow-hidden rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <CardContent className="pt-20 pb-16 flex flex-col items-center">
                        <div className="h-24 w-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-8 shadow-inner">
                            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-foreground tracking-tight mb-3">Application Received!</h2>
                        <p className="text-muted-foreground text-lg max-w-md mb-10">
                            Thank you for submitting your application. We will review it carefully and reach out to you soon.
                        </p>
                        <Button 
                            onClick={() => {
                                reset();
                                setIsSubmitted(false);
                            }} 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 rounded-full shadow-lg transition-transform hover:-translate-y-1"
                        >
                            Submit Another Application
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl mb-6 shadow-sm">
                    <School className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">Student Admission</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Please fill in the form carefully with accurate information to properly process your application.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/50 overflow-hidden rounded-2xl bg-card">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-5 pt-6 px-8">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                            Basic Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground/80">First Name <span className="text-destructive">*</span></Label>
                                <Input {...register("firstName", { required: "First name is required" })} placeholder="John" className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary rounded-xl ${errors.firstName ? 'border-destructive focus-visible:ring-destructive relative z-10 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6' : ''}`} />
                                {errors.firstName && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {errors.firstName.message as string}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground/80">Last Name <span className="text-destructive">*</span></Label>
                                <Input {...register("lastName", { required: "Last name is required" })} placeholder="Doe" className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary rounded-xl ${errors.lastName ? 'border-destructive focus-visible:ring-destructive ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500' : ''}`} />
                                {errors.lastName && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {errors.lastName.message as string}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground/80">Email <span className="text-destructive">*</span></Label>
                                <Input type="email" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })} placeholder="john@example.com" className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary rounded-xl ${errors.email ? 'border-destructive focus-visible:ring-destructive ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500' : ''}`} />
                                {errors.email && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {errors.email.message as string}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground/80">Phone <span className="text-destructive">*</span></Label>
                                <Input type="tel" {...register("phone", { required: "Phone number is required", minLength: { value: 10, message: "Invalid phone number" } })} placeholder="+1234567890" className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary rounded-xl ${errors.phone ? 'border-destructive focus-visible:ring-destructive ring-1 ring-inset ring-red-300 placeholder:text-red-300 focus:ring-2 focus:ring-inset focus:ring-red-500' : ''}`} />
                                {errors.phone && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {errors.phone.message as string}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground/80">Admission Class <span className="text-destructive">*</span></Label>
                                <Controller
                                    control={control}
                                    name="classId"
                                    rules={{ required: "Class selection is required" }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus:ring-primary rounded-xl ${errors.classId ? 'border-destructive focus:ring-destructive ring-1 ring-inset ring-red-300' : ''}`}>
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl">
                                                {classes.map((cls: any) => (
                                                    <SelectItem key={cls.id} value={cls.id} className="py-2.5 cursor-pointer">{cls.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.classId && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {errors.classId.message as string}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-foreground/80">Academic Year (Session) <span className="text-destructive">*</span></Label>
                                <Controller
                                    control={control}
                                    name="academicYearId"
                                    rules={{ required: "Academic session is required" }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus:ring-primary rounded-xl ${errors.academicYearId ? 'border-destructive focus:ring-destructive ring-1 ring-inset ring-red-300' : ''}`}>
                                                <SelectValue placeholder="Select Session" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl shadow-xl">
                                                {academicYears.map((year: any) => (
                                                    <SelectItem key={year.id} value={year.id} className="py-2.5 cursor-pointer">{year.name || year.year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.academicYearId && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {errors.academicYearId.message as string}</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {parsedFields.length > 0 && (
                    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/50 overflow-hidden rounded-2xl bg-card">
                        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b pb-5 pt-6 px-8">
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                                Additional Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {parsedFields.map((field) => (
                                    <div key={field.name} className={`space-y-2 ${field.type === 'FILE' ? 'md:col-span-2' : ''}`}>
                                        {field.type !== "FILE" && (
                                            <Label className="text-sm font-semibold text-foreground/80">
                                                {field.label} {field.required && <span className="text-destructive">*</span>}
                                            </Label>
                                        )}
                                        
                                        {field.type === "TEXT" && <div className="space-y-1"><Input {...register(field.name, { required: field.required ? `${field.label} is required` : false })} className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary rounded-xl ${errors[field.name] ? 'border-destructive focus-visible:ring-destructive ring-1 ring-inset ring-red-300' : ''}`} />{errors[field.name] && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {(errors[field.name] as any).message}</span>}</div>}
                                        {field.type === "NUMBER" && <div className="space-y-1"><Input type="number" {...register(field.name, { required: field.required ? `${field.label} is required` : false })} className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary rounded-xl ${errors[field.name] ? 'border-destructive focus-visible:ring-destructive ring-1 ring-inset ring-red-300' : ''}`} />{errors[field.name] && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {(errors[field.name] as any).message}</span>}</div>}
                                        {field.type === "DATE" && <div className="space-y-1"><Input type="date" {...register(field.name, { required: field.required ? `${field.label} is required` : false })} className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary rounded-xl ${errors[field.name] ? 'border-destructive focus-visible:ring-destructive ring-1 ring-inset ring-red-300' : ''}`} />{errors[field.name] && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {(errors[field.name] as any).message}</span>}</div>}
                                        {field.type === "DROPDOWN" && (
                                            <div className="space-y-1">
                                            <Controller
                                                control={control}
                                                name={field.name}
                                                rules={{ required: field.required ? `Please select ${field.label}` : false }}
                                                render={({ field: selectField }) => (
                                                    <Select onValueChange={selectField.onChange} value={selectField.value || ""}>
                                                        <SelectTrigger className={`h-12 px-4 bg-background shadow-sm border-muted-foreground/20 focus:ring-primary rounded-xl ${errors[field.name] ? 'border-destructive focus:ring-destructive ring-1 ring-inset ring-red-300' : ''}`}>
                                                            <SelectValue placeholder={`Select ${field.label}`} />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl shadow-xl">
                                                            {field.options?.map((opt: string) => (
                                                                <SelectItem key={opt} value={opt} className="py-2.5 cursor-pointer">{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors[field.name] && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {(errors[field.name] as any).message}</span>}
                                            </div>
                                        )}
                                        {field.type === "FILE" && (
                                            <div className="space-y-1">
                                            <Controller
                                                control={control}
                                                name={field.name}
                                                rules={{ required: field.required ? `${field.label} file is required` : false }}
                                                render={({ field: { onChange } }) => (
                                                    <ProfessionalFileUpload
                                                        label={`${field.label} ${field.required ? '*' : ''}`}
                                                        onFileChange={(file) => onChange(file ? [file] : [])}
                                                    />
                                                )}
                                            />
                                            {errors[field.name] && <span className="text-sm font-medium text-destructive flex items-center gap-1.5 mt-1.5"><AlertCircle className="h-4 w-4"/> {(errors[field.name] as any).message}</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end pt-6 pb-20">
                    <Button type="submit" size="lg" disabled={submitMutation.isPending || verifyMutation.isPending} className="w-full sm:w-auto px-12 h-14 font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-lg rounded-full">
                        {submitMutation.isPending || verifyMutation.isPending ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Processing...</> : "Submit Application"}
                    </Button>
                </div>
            </form>
        </div>
    );
}