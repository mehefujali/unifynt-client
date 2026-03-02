/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { 
    CheckCircle2, AlertCircle, Loader2, ArrowRight, 
    CalendarDays, Info, UploadCloud, File as FileIcon, X
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

import { CustomFormService } from "@/services/form.service";
import api from "@/lib/axios";

export default function PublicFormPage() {
    const params = useParams();
    const domain = params.domain as string; 
    const slug = params.slug as string;
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});

    const { data: formResponse, isLoading, error } = useQuery({
        queryKey: ["public-form", slug],
        queryFn: () => CustomFormService.getFormBySlug(slug),
        retry: 1,
    });

    const form = formResponse?.data;
    const school = form?.school;
    const fields = form?.fields || [];

    const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm();

    const submitMutation = useMutation({
        mutationFn: async (answers: any) => {
            const response = await api.post(`/forms/submit/${form.id}`, { answers });
            return response.data;
        },
        onSuccess: () => {
            setIsSubmitted(true);
            toast.success("Response submitted successfully!");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFields(prev => ({ ...prev, [fieldId]: true }));
        
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const fileUrl = response.data?.data?.url || response.data?.url;
            
            if (fileUrl) {
                setValue(fieldId, fileUrl, { shouldValidate: true });
                toast.success("File uploaded successfully");
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            toast.error("Failed to upload file. Please try again.");
            e.target.value = "";
        } finally {
            setUploadingFields(prev => ({ ...prev, [fieldId]: false }));
        }
    };

    const onSubmit = (data: any) => {
        submitMutation.mutate(data);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-bold">Loading securely for {domain}...</p>
                </div>
            </div>
        );
    }

    if (error || !form || !school) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <Card className="max-w-md w-full rounded-[32px] shadow-xl border-0 overflow-hidden text-center bg-white dark:bg-slate-900">
                    <div className="bg-red-50 dark:bg-red-500/10 p-8 flex justify-center"><AlertCircle className="h-16 w-16 text-red-500" /></div>
                    <CardContent className="p-8 space-y-4">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Form Not Available</h2>
                        <p className="text-slate-500 font-medium text-[15px]">This form may have been closed, expired, or you are using an incorrect link.</p>
                        <Button onClick={() => window.location.href = '/'} variant="outline" className="mt-4 rounded-xl">Go Back Home</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
            <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                        {school.logo ? (
                            <img src={school.logo} alt={school.name} className="h-12 w-auto object-contain" />
                        ) : (
                            <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
                                {school.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{school.name}</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            Back to Home
                        </Link>
                        <ModeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-100/50 dark:from-indigo-900/20 to-transparent -z-10"></div>
                
                <div className="max-w-3xl mx-auto relative z-10">
                    {isSubmitted ? (
                        <Card className="w-full rounded-[32px] shadow-2xl border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-center overflow-hidden mt-10 animate-in zoom-in duration-500">
                            <div className="bg-emerald-500/10 p-10 flex justify-center">
                                <div className="h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <CheckCircle2 className="h-12 w-12 text-white" />
                                </div>
                            </div>
                            <CardContent className="p-10 space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Thank You!</h2>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-[16px]">
                                    Your response has been successfully recorded. You may now close this window or return to the home page.
                                </p>
                                <Button onClick={() => window.location.href = '/'} className="mt-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 h-12 px-8">Return Home</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="mb-10 text-center space-y-4">
                                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold text-sm border border-indigo-100 dark:border-indigo-500/20 tracking-wide">
                                    Application Form
                                </div>
                                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl">
                                    {form.title}
                                </h1>
                                {form.description && (
                                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed whitespace-pre-wrap mt-4">
                                        {form.description}
                                    </p>
                                )}
                            </div>

                            <Card className="rounded-[32px] border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-xl overflow-hidden">
                                <CardContent className="p-6 sm:p-10">
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                        {fields.map((field: any, index: number) => {
                                            const isError = errors[field.id];
                                            const fileValue = watch(field.id);
                                            const isUploading = uploadingFields[field.id];

                                            return (
                                                <div key={field.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                                                    <Label className="text-[15px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </Label>
                                                    
                                                    {["TEXT", "EMAIL", "NUMBER"].includes(field.type) && (
                                                        <Input 
                                                            type={field.type.toLowerCase()} 
                                                            placeholder={field.placeholder || "Enter your answer"} 
                                                            className={`h-14 rounded-2xl font-medium bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-600/20 ${isError ? "border-red-500 ring-red-500/20" : ""}`}
                                                            {...register(field.id, { required: field.required ? "This field is required" : false })} 
                                                        />
                                                    )}

                                                    {field.type === "TEXTAREA" && (
                                                        <Textarea 
                                                            placeholder={field.placeholder || "Type here..."} 
                                                            className={`min-h-[120px] rounded-2xl font-medium bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-600/20 resize-none ${isError ? "border-red-500" : ""}`}
                                                            {...register(field.id, { required: field.required ? "This field is required" : false })} 
                                                        />
                                                    )}

                                                    {field.type === "FILE" && (
                                                        <div className="w-full">
                                                            {fileValue ? (
                                                                <div className="flex items-center justify-between p-4 border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                                        <div className="h-10 w-10 shrink-0 bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center rounded-xl">
                                                                            <FileIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                                        </div>
                                                                        <a href={fileValue} target="_blank" rel="noreferrer" className="text-[14px] font-semibold text-indigo-700 dark:text-indigo-300 truncate hover:underline">
                                                                            View Uploaded File
                                                                        </a>
                                                                    </div>
                                                                    <Button 
                                                                        type="button" 
                                                                        variant="ghost" 
                                                                        size="icon"
                                                                        onClick={() => setValue(field.id, "", { shouldValidate: true })}
                                                                        className="h-8 w-8 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg shrink-0"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl transition-colors ${isError ? "border-red-300 bg-red-50/50" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900"}`}>
                                                                    {isUploading ? (
                                                                        <div className="flex flex-col items-center gap-2">
                                                                            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                                                                            <span className="text-[13px] font-bold text-slate-500">Uploading to server...</span>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                                                                            <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-400">
                                                                                <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer">Click to upload</span> or drag and drop
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                    <input 
                                                                        type="file" 
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                                                                        disabled={isUploading}
                                                                        onChange={(e) => handleFileUpload(e, field.id)}
                                                                        accept="image/*,.pdf,.doc,.docx"
                                                                    />
                                                                </div>
                                                            )}
                                                            <input type="hidden" {...register(field.id, { required: field.required ? "This field is required" : false })} />
                                                        </div>
                                                    )}

                                                    {field.type === "SELECT" && (
                                                        <Controller
                                                            name={field.id}
                                                            control={control}
                                                            rules={{ required: field.required ? "Please select an option" : false }}
                                                            render={({ field: { onChange, value } }) => (
                                                                <Select onValueChange={onChange} value={value}>
                                                                    <SelectTrigger className={`h-14 rounded-2xl font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-600/20 ${isError ? "border-red-500" : ""}`}>
                                                                        <SelectValue placeholder="Choose an option..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="rounded-2xl">
                                                                        {field.options?.map((opt: string) => (
                                                                            <SelectItem key={opt} value={opt} className="font-semibold">{opt}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    )}

                                                    {field.type === "RADIO" && (
                                                        <Controller
                                                            name={field.id}
                                                            control={control}
                                                            rules={{ required: field.required ? "Please choose one" : false }}
                                                            render={({ field: { onChange, value } }) => (
                                                                <RadioGroup onValueChange={onChange} value={value} className="space-y-3 mt-2">
                                                                    {field.options?.map((opt: string) => (
                                                                        <div key={opt} className={`flex items-center space-x-3 bg-white dark:bg-slate-950 border p-4 rounded-2xl cursor-pointer transition-all ${value === opt ? "border-indigo-600 bg-indigo-600/5" : "border-slate-200 dark:border-slate-800"}`} onClick={() => onChange(opt)}>
                                                                            <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                                                                            <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer font-bold text-[14px] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{opt}</Label>
                                                                        </div>
                                                                    ))}
                                                                </RadioGroup>
                                                            )}
                                                        />
                                                    )}

                                                    {field.type === "CHECKBOX" && (
                                                        <div className="space-y-3 mt-2">
                                                            {field.options?.map((opt: string) => (
                                                                <div key={opt} className="flex items-center space-x-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-indigo-600/50 transition-colors">
                                                                    <Checkbox 
                                                                        id={`${field.id}-${opt}`} 
                                                                        value={opt}
                                                                        {...register(`${field.id}`)}
                                                                    />
                                                                    <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer font-bold text-[14px] leading-none">{opt}</Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {field.type === "DATE" && (
                                                        <div className="relative">
                                                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                            <Input 
                                                                type="date" 
                                                                className={`h-14 pl-12 rounded-2xl font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-600/20 ${isError ? "border-red-500" : ""}`}
                                                                {...register(field.id, { required: field.required ? "Date is required" : false })} 
                                                            />
                                                        </div>
                                                    )}

                                                    {isError && (
                                                        <p className="text-[12px] font-bold text-red-500 flex items-center gap-1 mt-1.5">
                                                            <Info className="h-3 w-3" /> {(isError as any).message || "This field is required"}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-8">
                                            <Button 
                                                type="submit" 
                                                disabled={submitMutation.isPending || Object.values(uploadingFields).some(Boolean)}
                                                className="w-full h-14 rounded-2xl font-black text-[16px] bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:-translate-y-0.5 transition-all"
                                            >
                                                {submitMutation.isPending ? (
                                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                                                ) : (
                                                    <>Submit Application <ArrowRight className="ml-2 h-5 w-5 stroke-[3]" /></>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </main>

            <footer className="bg-white dark:bg-slate-900 py-8 text-center border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300">
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} {school.name}. All rights reserved.
                </p>
            </footer>
        </div>
    );
}