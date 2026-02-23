/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";
import { AdmissionService } from "@/services/admission.service";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, UserPlus, FileUp } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const extractData = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
};

export default function AddStudentModal({ isOpen, onClose }: Props) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, control, formState: { errors }, watch, reset, setValue } = useForm();
    const [activeTab, setActiveTab] = useState("core");

    const { data: configRes } = useQuery({ queryKey: ["admissionConfig"], queryFn: AdmissionService.getConfig });
    const { data: classesRes } = useQuery({ queryKey: ["classes"], queryFn: () => AcademicService.getAllClasses() });
    const { data: yearsRes } = useQuery({ queryKey: ["academicYears"], queryFn: () => AcademicService.getAllAcademicYears() });
    const { data: sectionsRes } = useQuery({ queryKey: ["allSections"], queryFn: () => AcademicService.getAllSections({}) });

    const selectedClassId = watch("classId");

    const createMutation = useMutation({
        mutationFn: (formData: FormData) => StudentService.createStudent(formData),
        onSuccess: () => {
            toast.success("Student added successfully!");
            queryClient.invalidateQueries({ queryKey: ["students"] });
            reset();
            onClose();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to add student");
        }
    });

    const onSubmit = (data: any) => {
        const formData = new FormData();
        const fileKeys = parsedFields.filter((f: any) => f.type === "FILE").map((f: any) => f.name);
        
        const textData = { ...data };
        fileKeys.forEach((k: string) => delete textData[k]);
        
        formData.append("data", JSON.stringify(textData));
        
        fileKeys.forEach((key: string) => {
            if (data[key] && data[key].length > 0) {
                formData.append(key, data[key][0]);
            }
        });

        createMutation.mutate(formData);
    };

    let parsedFields: any[] = [];
    try {
        parsedFields = typeof configRes?.data?.fields === "string" ? JSON.parse(configRes.data.fields) : configRes?.data?.fields || [];
    } catch (e) {}

    const classList = extractData(classesRes);
    const yearList = extractData(yearsRes);
    const allSections = extractData(sectionsRes);

    const filteredSections = allSections.filter((sec: any) => sec.classId === selectedClassId);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-full sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px] p-0 flex flex-col h-full bg-background border-l shadow-2xl overflow-hidden">
                <SheetHeader className="p-4 sm:p-6 border-b bg-muted/10 shrink-0">
                    <SheetTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" /> Admit New Student
                    </SheetTitle>
                    <SheetDescription className="text-xs sm:text-sm">Manually enter student details and assign them to a class.</SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 w-full">
                        <div className="w-full border-b bg-muted/5 shrink-0 overflow-x-auto no-scrollbar">
                            <TabsList className="h-12 bg-transparent flex w-max min-w-full justify-start space-x-2 px-4">
                                <TabsTrigger value="core" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 font-semibold whitespace-nowrap">Core Information</TabsTrigger>
                                {parsedFields.length > 0 && (
                                    <TabsTrigger value="additional" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 font-semibold whitespace-nowrap">Additional Details</TabsTrigger>
                                )}
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-4 sm:p-6 scroll-smooth">
                            <TabsContent value="core" className="m-0 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">First Name *</Label>
                                        <Input {...register("firstName", { required: true })} className="h-10 bg-background" />
                                        {errors.firstName && <span className="text-[10px] text-destructive font-semibold">Required</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Last Name</Label>
                                        <Input {...register("lastName")} className="h-10 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Email</Label>
                                        <Input type="email" {...register("email")} className="h-10 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Phone</Label>
                                        <Input type="tel" {...register("phone")} className="h-10 bg-background" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Session *</Label>
                                        <Controller
                                            control={control} name="academicYearId" rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                    <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Select Session" /></SelectTrigger>
                                                    <SelectContent position="popper">
                                                        {yearList.map((year: any) => <SelectItem key={year.id} value={year.id}>{year.name || year.year}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYearId && <span className="text-[10px] text-destructive font-semibold">Required</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Class *</Label>
                                        <Controller
                                            control={control} name="classId" rules={{ required: true }}
                                            render={({ field }) => (
                                                <Select 
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        setValue("sectionId", "");
                                                    }} 
                                                    value={field.value || undefined}
                                                >
                                                    <SelectTrigger className="h-10 bg-background"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                                    <SelectContent position="popper">
                                                        {classList.map((cls: any) => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.classId && <span className="text-[10px] text-destructive font-semibold">Required</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Section</Label>
                                        <Controller
                                            control={control} name="sectionId"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!selectedClassId || filteredSections.length === 0}>
                                                    <SelectTrigger className="h-10 bg-background">
                                                        <SelectValue placeholder={!selectedClassId ? "Select Class First" : filteredSections.length === 0 ? "No Sections Found" : "Select Section"} />
                                                    </SelectTrigger>
                                                    <SelectContent position="popper">
                                                        {filteredSections.map((sec: any) => <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                                {parsedFields.length > 0 && (
                                    <div className="pt-4 flex justify-end">
                                        <Button type="button" variant="outline" onClick={() => setActiveTab("additional")}>Next: Additional Details</Button>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="additional" className="m-0 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {parsedFields.map((field: any) => (
                                        <div key={field.name} className={`space-y-2 ${field.type === 'FILE' ? 'sm:col-span-2' : ''}`}>
                                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                                {field.label} {field.required && <span className="text-destructive">*</span>}
                                            </Label>
                                            {field.type === "TEXT" && <Input {...register(field.name, { required: field.required })} className="h-10 bg-background" />}
                                            {field.type === "NUMBER" && <Input type="number" {...register(field.name, { required: field.required })} className="h-10 bg-background" />}
                                            {field.type === "DATE" && <Input type="date" {...register(field.name, { required: field.required })} className="h-10 bg-background" />}
                                            {field.type === "DROPDOWN" && (
                                                <Controller
                                                    control={control} name={field.name} rules={{ required: field.required }}
                                                    render={({ field: selectField }) => (
                                                        <Select onValueChange={selectField.onChange} value={selectField.value || undefined}>
                                                            <SelectTrigger className="h-10 bg-background"><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                                                            <SelectContent position="popper">
                                                                {field.options?.map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            )}
                                            {field.type === "FILE" && (
                                                <div className="relative border-2 border-dashed rounded-xl p-6 hover:bg-muted/30 transition-colors bg-background flex flex-col items-center justify-center text-center">
                                                    <FileUp className="h-6 w-6 text-muted-foreground mb-2" />
                                                    <div className="text-sm font-semibold">Upload {field.label}</div>
                                                    <input type="file" {...register(field.name, { required: field.required })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </ScrollArea>

                        <div className="p-4 sm:p-6 border-t bg-muted/10 shrink-0 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending} className="font-bold shadow-sm px-8">
                                {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Save Student"}
                            </Button>
                        </div>
                    </Tabs>
                </form>
            </SheetContent>
        </Sheet>
    );
}