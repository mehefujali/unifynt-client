/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdmissionService } from "@/services/admission.service";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Plus, Trash2, Save, Settings2, Sparkles, FileText, Image as ImageIcon, Lock, CheckCircle2, CreditCard, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { FinancialService } from "@/services/financial.service";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";

const FIXED_CORE_FIELDS = ["First Name", "Last Name", "Email Address", "Phone Number", "Class", "Academic Year"];

const SUGGESTED_CATEGORIES = [
    {
        category: "Personal & Address",
        fields: [
            { label: "Date of Birth", name: "dateOfBirth", type: "DATE", icon: <FileText className="w-4 h-4" /> },
            { label: "Gender", name: "gender", type: "DROPDOWN", options: ["MALE", "FEMALE", "OTHER"], icon: <Sparkles className="w-4 h-4" /> },
            { label: "Alternate Phone", name: "alternatePhone", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Nationality", name: "nationality", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother Tongue", name: "motherTongue", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Present Address", name: "presentAddress", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Permanent Address", name: "permanentAddress", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "City", name: "city", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "State", name: "state", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Zip / Pin Code", name: "zipCode", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Country", name: "country", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
        ]
    },
    {
        category: "Parents & Guardian",
        fields: [
            { label: "Father's Name", name: "fatherName", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Father's Phone", name: "fatherPhone", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Father's Email", name: "fatherEmail", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Father's Occupation", name: "fatherOccupation", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Father's Education", name: "fatherEducation", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Father's Income", name: "fatherIncome", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Father's National ID", name: "fatherNationalId", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother's Name", name: "motherName", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother's Phone", name: "motherPhone", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother's Email", name: "motherEmail", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother's Occupation", name: "motherOccupation", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother's Education", name: "motherEducation", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother's Income", name: "motherIncome", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Mother's National ID", name: "motherNationalId", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Local Guardian Name", name: "localGuardianName", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Local Guardian Phone", name: "localGuardianPhone", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Guardian Relation", name: "localGuardianRelation", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Guardian Email", name: "guardianEmail", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Guardian Occupation", name: "guardianOccupation", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Guardian Address", name: "guardianAddress", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
        ]
    },
    {
        category: "Academic & Previous School",
        fields: [
            { label: "Previous School Name", name: "previousSchoolName", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Previous Class", name: "previousClass", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Board of Education", name: "boardOfEducation", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Year of Passing", name: "yearOfPassing", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Transfer Certificate No", name: "transferCertificateNo", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Last Exam Marks (%)", name: "lastMarks", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
        ]
    },
    {
        category: "Health & Medical",
        fields: [
            { label: "Blood Group", name: "bloodGroup", type: "DROPDOWN", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], icon: <Sparkles className="w-4 h-4" /> },
            { label: "Medical Conditions", name: "medicalConditions", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Doctor's Name", name: "doctorName", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Doctor's Phone", name: "doctorPhone", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Physical Disability", name: "physicalDisability", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
        ]
    },
    {
        category: "Documents (File Uploads)",
        fields: [
            { label: "Student Profile Picture", name: "profileImage", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Birth Certificate", name: "birthCertificateUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "National ID Document", name: "nationalIdDocumentUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Transfer Certificate", name: "tcDocumentUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Previous Marksheet", name: "previousMarksheetUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Caste Certificate", name: "casteCertificateUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Medical Certificate", name: "medicalCertificateUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Income Certificate", name: "incomeCertificateUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Father Photo", name: "fatherPhotoUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Mother Photo", name: "motherPhotoUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
            { label: "Guardian Photo", name: "guardianPhotoUrl", type: "FILE", icon: <ImageIcon className="w-4 h-4" /> },
        ]
    },
    {
        category: "Transport & Miscellaneous",
        fields: [
            { label: "Religion", name: "religion", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Caste / Category", name: "caste", type: "DROPDOWN", options: ["GENERAL", "OBC", "SC", "ST", "OTHER"], icon: <Sparkles className="w-4 h-4" /> },
            { label: "National ID (Aadhar/SSN)", name: "nationalId", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Transport Route", name: "transportRoute", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Transport Stop", name: "transportStop", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Hostel Room", name: "hostelRoom", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Extracurricular Interests", name: "extracurriculars", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Sibling Name", name: "siblingName", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Sibling Class", name: "siblingClass", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
            { label: "Sibling ID", name: "siblingId", type: "TEXT", icon: <FileText className="w-4 h-4" /> },
        ]
    }
];

const FLAT_SUGGESTED_FIELDS = SUGGESTED_CATEGORIES.flatMap(c => c.fields);

const SMART_ALIASES: Record<string, string> = {
    "dob": "dateOfBirth", "birthdate": "dateOfBirth", "dateofbirth": "dateOfBirth", "jonmotarikh": "dateOfBirth",
    "blood": "bloodGroup", "bg": "bloodGroup", "bloodgroup": "bloodGroup",
    "gender": "gender", "sex": "gender",
    "nationality": "nationality", "religion": "religion", "caste": "caste", "category": "caste",
    "mothertongue": "motherTongue", "language": "motherTongue",
    "address": "presentAddress", "presentaddress": "presentAddress", "currentaddress": "presentAddress", "thikana": "presentAddress",
    "permanentaddress": "permanentAddress",
    "city": "city", "state": "state", "zip": "zipCode", "zipcode": "zipCode", "pincode": "zipCode", "country": "country",
    "fathername": "fatherName", "fathersname": "fatherName", "babarname": "fatherName", "babarnam": "fatherName",
    "fatherphone": "fatherPhone", "fatheremail": "fatherEmail", "fatheroccupation": "fatherOccupation",
    "mothername": "motherName", "mothersname": "motherName", "mayername": "motherName", "mayernam": "motherName",
    "motherphone": "motherPhone", "motheremail": "motherEmail",
    "guardianname": "localGuardianName", "localguardianname": "localGuardianName", "guardianphone": "localGuardianPhone",
    "previousschool": "previousSchoolName", "lastschool": "previousSchoolName",
    "photo": "profileImage", "image": "profileImage", "profilepicture": "profileImage", "picture": "profileImage", "passportphoto": "profileImage",
    "birthcertificate": "birthCertificateUrl", "aadhar": "nationalId", "aadharcard": "nationalId", "nationalid": "nationalId", "nid": "nationalId",
    "tc": "tcDocumentUrl", "transfercertificate": "tcDocumentUrl",
    "medical": "medicalConditions", "disease": "medicalConditions",
    "route": "transportRoute", "busstop": "transportStop"
};

const getLevenshteinDistance = (a: string, b: string): number => {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const arr = [];
    for (let i = 0; i <= b.length; i++) {
        arr[i] = [i];
        if (i === 0) continue;
        for (let j = 1; j <= a.length; j++) {
            arr[0][j] = j;
            if (b[i - 1] === a[j - 1]) {
                arr[i][j] = arr[i - 1][j - 1];
            } else {
                arr[i][j] = Math.min(
                    arr[i - 1][j - 1] + 1,
                    Math.min(arr[i][j - 1] + 1, arr[i - 1][j] + 1)
                );
            }
        }
    }
    return arr[b.length][a.length];
};

export default function FormBuilderSettingsPage() {
    const queryClient = useQueryClient();
    const [isClient, setIsClient] = useState(false);

    // Permission check
    const { hasPermission } = usePermission();
    const canEditSettings = hasPermission([PERMISSIONS.ADMISSION_CREATE, PERMISSIONS.ADMISSION_EDIT]);

    useEffect(() => { setIsClient(true); }, []);

    const { data: configRes, isLoading: isFetching } = useQuery({
        queryKey: ["admissionConfig"],
        queryFn: AdmissionService.getConfig,
    });

    // Fetch payment gateway status to check if it's configured
    const { data: gatewayStatus } = useQuery({
        queryKey: ["payment-gateway-status"],
        queryFn: FinancialService.getGatewayStatus,
    });

    const [showGatewayModal, setShowGatewayModal] = useState(false);

    const form = useForm({
        defaultValues: {
            isActive: true,
            collectAdmissionFee: false,
            admissionFeeAmount: "" as any,
            fields: [] as any[],
        }
    });

    const { control, handleSubmit, reset, watch, setValue } = form;
    const { fields, append, remove } = useFieldArray({ control, name: "fields" });

    useEffect(() => {
        if (configRes?.data) {
            let parsedFields = [];
            try {
                parsedFields = typeof configRes.data.fields === "string" ? JSON.parse(configRes.data.fields) : configRes.data.fields || [];
            } catch (e) {
                console.error(e);
            }
            reset({
                isActive: configRes.data.isActive,
                collectAdmissionFee: configRes.data.collectAdmissionFee ?? false,
                admissionFeeAmount: configRes.data.admissionFeeAmount ?? "",
                fields: parsedFields,
            });
        }
    }, [configRes, reset]);

    const saveMutation = useMutation({
        mutationFn: AdmissionService.updateConfig,
        onSuccess: () => {
            toast.success("Admission configuration saved successfully.");
            queryClient.invalidateQueries({ queryKey: ["admissionConfig"] });
            queryClient.invalidateQueries({ queryKey: ["publicAdmissionData"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to save configuration.");
        }
    });

    const onSubmit = (data: any) => {
        const cleanedFields = data.fields.map((f: any) => ({
            ...f,
            options: f.type === "DROPDOWN" ? (Array.isArray(f.options) ? f.options : f.options?.split(",").map((o: string) => o.trim()).filter(Boolean)) : undefined
        }));
        saveMutation.mutate({
            isActive: data.isActive,
            fields: JSON.stringify(cleanedFields),
            collectAdmissionFee: data.collectAdmissionFee,
            admissionFeeAmount: data.collectAdmissionFee ? parseFloat(data.admissionFeeAmount) || null : null,
        });
    };

    // Handler for the fee toggle — block if gateway not configured
    const handleFeeToggle = (checked: boolean, onChange: (val: boolean) => void) => {
        if (checked && (!gatewayStatus?.isConfigured || !gatewayStatus?.isPaymentEnabled)) {
            setShowGatewayModal(true);
            return;
        }
        onChange(checked);
    };

    const addSuggestedField = (suggested: any) => {
        if (fields.some(f => f.name === suggested.name)) {
            toast.error(`${suggested.label} is already added.`);
            return;
        }
        append({
            label: suggested.label, name: suggested.name, type: suggested.type,
            required: false, options: suggested.options || [], isSystem: true
        });
    };

    const addCustomField = () => {
        append({
            label: "", name: `custom_${Date.now()}`, type: "TEXT",
            required: false, options: [], isSystem: false
        });
    };

    const handleLabelChange = (index: number, value: string) => {
        setValue(`fields.${index}.label`, value);

        const normalizedInput = value.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!normalizedInput) return;

        let targetSystemName = SMART_ALIASES[normalizedInput];

        if (!targetSystemName && normalizedInput.length >= 4) {
            let bestMatch = "";
            let lowestDistance = 3;

            for (const alias of Object.keys(SMART_ALIASES)) {
                if (Math.abs(alias.length - normalizedInput.length) > 2) continue;
                const dist = getLevenshteinDistance(normalizedInput, alias);
                if (dist < lowestDistance) {
                    lowestDistance = dist;
                    bestMatch = alias;
                }
            }
            if (bestMatch) {
                targetSystemName = SMART_ALIASES[bestMatch];
            }
        }

        const matchedField = FLAT_SUGGESTED_FIELDS.find(f => f.name === targetSystemName);

        if (matchedField) {
            setValue(`fields.${index}.name`, matchedField.name);
            setValue(`fields.${index}.type`, matchedField.type);
            if (matchedField.options) setValue(`fields.${index}.options`, matchedField.options);
            setValue(`fields.${index}.isSystem`, true);
        } else {
            const customKey = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
            setValue(`fields.${index}.name`, customKey ? `custom_${customKey}` : `custom_field_${index}`);
            setValue(`fields.${index}.isSystem`, false);
        }
    };

    if (!isClient) return null;

    if (isFetching) {
        return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <>
        <div className="p-6 md:p-8 max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Settings2 className="h-6 w-6 text-muted-foreground" /> Admission Form Builder
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Configure your public admission form. Core fields are locked by default.</p>
                </div>
                {/* 🔒 Gate for Save Button */}
                <PermissionGate required={[PERMISSIONS.ADMISSION_CREATE, PERMISSIONS.ADMISSION_EDIT]}>
                    <Button onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending} className="font-semibold px-6 shadow-sm">
                        {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Configuration
                    </Button>
                </PermissionGate>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                <div className="lg:col-span-8 space-y-6">
                    <Card className="shadow-none border-border">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <CardTitle className="text-base font-semibold">Form Layout</CardTitle>
                            <CardDescription>Drag, drop, and configure fields for the public form.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6 border-b bg-slate-50 dark:bg-slate-900/40">
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Lock className="h-3.5 w-3.5" /> Core Fields (Permanently Required)
                                </h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {FIXED_CORE_FIELDS.map(name => (
                                        <div key={name} className="px-3 py-2 border rounded-md bg-white dark:bg-black text-xs font-semibold text-muted-foreground flex items-center gap-2 cursor-not-allowed shadow-sm">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6">
                                {fields.length === 0 ? (
                                    <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
                                        <Settings2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                                        <h3 className="text-sm font-semibold text-foreground">No extra fields added</h3>
                                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">Start building your form by adding suggested fields from the right panel or creating custom ones.</p>
                                    </div>
                                ) : (
                                    <Accordion type="multiple" className="space-y-4">
                                        {fields.map((field, index) => (
                                            <AccordionItem key={field.id} value={field.id} className="border rounded-xl bg-card shadow-sm data-[state=open]:border-primary/40 transition-all overflow-hidden">
                                                <div className="relative group">
                                                    <AccordionTrigger className="px-5 py-4 hover:bg-muted/30 transition-colors [&[data-state=open]>div>div>span.icon-chevron]:rotate-180 hover:no-underline">
                                                        <div className="flex items-center gap-4 flex-1 text-left mr-12">
                                                            <span className="font-semibold text-sm min-w-[120px]">{watch(`fields.${index}.label`) || "Untitled Field"}</span>
                                                            <Badge variant="outline" className="text-[10px] uppercase font-mono text-muted-foreground hidden sm:inline-flex">{watch(`fields.${index}.name`)}</Badge>
                                                            {watch(`fields.${index}.isSystem`) && (
                                                                <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">
                                                                    <Sparkles className="h-3 w-3 mr-1" /> Auto Mapped
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </AccordionTrigger>
                                                    {canEditSettings && (
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="absolute right-12 top-2 h-8 w-8 text-destructive hover:bg-destructive/10 z-10" 
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); remove(index); }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <AccordionContent className="p-5 border-t bg-slate-50/50 dark:bg-slate-900/20">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <Label className="text-xs font-bold text-muted-foreground uppercase">Field Label *</Label>
                                                                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground bg-muted/30 border-dashed rounded px-1.5 py-0">
                                                                    key: {watch(`fields.${index}.name`)}
                                                                </Badge>
                                                            </div>
                                                            <Input 
                                                                value={watch(`fields.${index}.label`)}
                                                                onChange={(e) => handleLabelChange(index, e.target.value)}
                                                                placeholder="e.g. Type something..." 
                                                                className="h-9 text-sm bg-background" 
                                                                disabled={!canEditSettings}
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="text-xs font-bold text-muted-foreground uppercase">Field Type</Label>
                                                            <Controller
                                                                control={control}
                                                                name={`fields.${index}.type` as const}
                                                                render={({ field: { onChange, value } }) => (
                                                                    <Select onValueChange={onChange} value={value} disabled={!canEditSettings || watch(`fields.${index}.isSystem`)}>
                                                                        <SelectTrigger className="h-9 text-sm bg-background">
                                                                            <SelectValue placeholder="Select type" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="TEXT">Short Text</SelectItem>
                                                                            <SelectItem value="NUMBER">Number</SelectItem>
                                                                            <SelectItem value="DATE">Date Picker</SelectItem>
                                                                            <SelectItem value="DROPDOWN">Dropdown</SelectItem>
                                                                            <SelectItem value="FILE">File Upload</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="space-y-2 flex flex-col justify-end pb-1 sm:col-span-2 lg:col-span-1">
                                                            <Controller
                                                                control={control}
                                                                name={`fields.${index}.required` as const}
                                                                render={({ field: { onChange, value } }) => (
                                                                    <div className={cn("flex items-center gap-3 bg-background border px-4 h-9 rounded-md w-max shadow-sm", !canEditSettings && "opacity-60")}>
                                                                        <Switch checked={value} onCheckedChange={onChange} id={`req-${index}`} className="scale-90" disabled={!canEditSettings} />
                                                                        <Label htmlFor={`req-${index}`} className="text-xs font-semibold cursor-pointer">{value ? 'Required Field' : 'Optional Field'}</Label>
                                                                    </div>
                                                                )}
                                                            />
                                                        </div>

                                                        {watch(`fields.${index}.type`) === "DROPDOWN" && (
                                                            <div className="col-span-1 sm:col-span-2 space-y-2 mt-2 p-4 bg-muted/20 rounded-md border border-dashed">
                                                                <Label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                                                                    Dropdown Options <span className="text-muted-foreground normal-case font-medium">(Comma separated)</span>
                                                                </Label>
                                                                <Controller
                                                                    control={control}
                                                                    name={`fields.${index}.options` as const}
                                                                    render={({ field: { onChange, value } }) => (
                                                                        <Input 
                                                                            value={Array.isArray(value) ? value.join(", ") : value || ""} 
                                                                            onChange={(e) => onChange(e.target.value)} 
                                                                            placeholder="e.g. Option A, Option B, Option C" 
                                                                            className="h-9 text-sm bg-background"
                                                                            disabled={!canEditSettings || watch(`fields.${index}.isSystem`)}
                                                                        />
                                                                    )}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}

                                {canEditSettings && (
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={addCustomField} 
                                        className="w-full mt-6 border-dashed h-12 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add Custom Field
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <div className="sticky top-6 flex flex-col gap-6 h-[calc(100vh-3rem)] pb-6">
                        <Card className="shrink-0 shadow-none border-border">
                            <CardHeader className="pb-4 border-b bg-muted/30">
                                <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Status</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-bold text-foreground">Accept Applications</Label>
                                        <p className="text-xs text-muted-foreground">Toggle to open/close public form.</p>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="isActive"
                                        render={({ field: { onChange, value } }) => (
                                            <Switch 
                                                checked={value} 
                                                onCheckedChange={onChange} 
                                                className="data-[state=checked]:bg-emerald-500" 
                                                disabled={!canEditSettings}
                                            />
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Online Admission Fee Card */}
                        <Card className="shrink-0 shadow-none border-border">
                            <CardHeader className="pb-4 border-b bg-muted/30">
                                <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="h-3.5 w-3.5 text-primary" /> Online Admission Fee
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5 space-y-4">
                                {/* Toggle */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold text-foreground">Collect Fee Online</Label>
                                        <p className="text-xs text-muted-foreground">Applicants must pay before submitting.</p>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="collectAdmissionFee"
                                        render={({ field: { onChange, value } }) => (
                                            <Switch
                                                checked={value}
                                                onCheckedChange={(checked) => handleFeeToggle(checked, onChange)}
                                                className="data-[state=checked]:bg-primary"
                                                disabled={!canEditSettings}
                                            />
                                        )}
                                    />
                                </div>

                                {/* Amount input — only shows when enabled */}
                                {watch("collectAdmissionFee") && (
                                    <div className="space-y-2 pt-1 border-t">
                                        <Label className="text-xs font-bold text-muted-foreground uppercase">Fee Amount (₹)</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-bold">₹</span>
                                            <Controller
                                                control={control}
                                                name="admissionFeeAmount"
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        type="number"
                                                        min="1"
                                                        step="0.01"
                                                        placeholder="e.g. 500"
                                                        className="pl-7 h-10 text-sm"
                                                        disabled={!canEditSettings}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">This amount will be charged to every applicant via Razorpay.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="flex-1 shadow-none border-border flex flex-col overflow-hidden">
                            <CardHeader className="shrink-0 pb-4 border-b bg-muted/30">
                                <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" /> Suggested Library
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-0">
                                <ScrollArea className="h-full">
                                    <Accordion type="multiple" className="w-full">
                                        {SUGGESTED_CATEGORIES.map((category, idx) => (
                                            <AccordionItem value={`item-${idx}`} key={idx} className="border-b-0">
                                                <AccordionTrigger className="px-5 py-4 hover:bg-muted/20 hover:no-underline text-sm font-semibold">
                                                    {category.category}
                                                </AccordionTrigger>
                                                <AccordionContent className="px-5 pb-4 pt-0">
                                                    <div className="flex flex-col gap-2 mt-2">
                                                        {category.fields.map((field) => {
                                                            const isAdded = fields.some(f => f.name === field.name);
                                                            return (
                                                                <Button 
                                                                    key={field.name} 
                                                                    type="button" 
                                                                    variant="outline" 
                                                                    className={`justify-start h-9 px-3 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all ${isAdded || !canEditSettings ? 'opacity-40 cursor-not-allowed border-solid bg-muted/50 hover:bg-muted/50 hover:border-border' : ''}`}
                                                                    onClick={() => !isAdded && canEditSettings && addSuggestedField(field)}
                                                                    disabled={isAdded || !canEditSettings}
                                                                >
                                                                    <div className="flex items-center gap-2 w-full text-muted-foreground">
                                                                        {field.icon}
                                                                        <span className="text-xs font-semibold">{field.label}</span>
                                                                        <Plus className="h-3.5 w-3.5 ml-auto opacity-70" />
                                                                    </div>
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>

        {/* Gateway Not Configured Modal */}
        <AlertDialog open={showGatewayModal} onOpenChange={setShowGatewayModal}>
            <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" /> Payment Gateway Required
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2 text-sm">
                        <p>To collect admission fees online, you need to first connect your school&apos;s Razorpay account.</p>
                        <p className="text-muted-foreground">Go to <strong className="text-foreground">Administration → Payment Gateway</strong> and enter your Razorpay Key ID and Secret.</p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Link href="/admin/settings/payment" className="inline-flex items-center gap-2">
                            <ExternalLink className="h-3.5 w-3.5" /> Setup Payment Gateway
                        </Link>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}