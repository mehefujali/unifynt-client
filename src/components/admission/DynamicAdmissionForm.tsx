/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdmissionService } from "@/services/admission.service";

// টাইপ ডেফিনিশন (Backend এর সাথে মিল রেখে)
interface FieldConfig {
    name: string;
    label: string;
    type: "TEXT" | "NUMBER" | "TEXTAREA" | "DROPDOWN" | "DATE" | "FILE";
    placeholder?: string;
    required: boolean;
    options?: string[]; // Dropdown এর জন্য
}

interface DynamicFormProps {
    schoolId: string;
    config: {
        fields: FieldConfig[];
        school: { name: string; logo?: string };
    };
}

export default function DynamicAdmissionForm({ schoolId, config }: DynamicFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // React Hook Form ইনিশিয়ালাইজেশন
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm();

    // ফাইল হ্যান্ডলার স্টেট
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFiles((prev) => ({
                ...prev,
                [fieldName]: e.target.files![0],
            }));
        }
    };

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);


            const textData = { ...data };


            await AdmissionService.submitApplication(schoolId, textData, selectedFiles);

            toast.success("Application submitted successfully!");
            router.push("/admission/success");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg border-t-4 border-t-primary">
            <CardHeader className="text-center border-b bg-secondary/10">
                <CardTitle className="text-2xl font-bold text-primary">
                    {config.school.name} Admission Form
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                    Please fill out the form carefully using English letters.
                </p>
            </CardHeader>

            <CardContent className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {config.fields.map((field) => {
                            // ফাইল ফিল্ডের জন্য স্পেশাল রেন্ডারিং
                            if (field.type === "FILE") {
                                return (
                                    <div key={field.name} className="col-span-full">
                                        <Label className="mb-2 block font-medium">
                                            {field.label} {field.required && <span className="text-red-500">*</span>}
                                        </Label>
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer relative">
                                            <Input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                onChange={(e) => onFileChange(e, field.name)}
                                                required={field.required}
                                            />
                                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm font-medium">
                                                {selectedFiles[field.name]
                                                    ? selectedFiles[field.name].name
                                                    : "Click to upload or drag and drop"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Supported: JPG, PNG, PDF (Max 5MB)
                                            </p>
                                        </div>
                                    </div>
                                );
                            }

                            // অন্যান্য ফিল্ড রেন্ডারিং
                            return (
                                <div
                                    key={field.name}
                                    className={field.type === "TEXTAREA" ? "col-span-full" : "col-span-1"}
                                >
                                    <Label htmlFor={field.name} className="mb-2 block font-medium">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </Label>

                                    {field.type === "DROPDOWN" ? (
                                        <Select
                                            onValueChange={(val) => setValue(field.name, val)}
                                            required={field.required}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Select ${field.label}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : field.type === "TEXTAREA" ? (
                                        <Textarea
                                            {...register(field.name, { required: field.required })}
                                            placeholder={field.placeholder}
                                            className="resize-none h-32"
                                        />
                                    ) : (
                                        <Input
                                            type={field.type === "NUMBER" ? "number" : field.type === "DATE" ? "date" : "text"}
                                            {...register(field.name, { required: field.required })}
                                            placeholder={field.placeholder}
                                        />
                                    )}

                                    {errors[field.name] && (
                                        <p className="text-red-500 text-xs mt-1">This field is required</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-6 border-t mt-6">
                        <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                                </>
                            ) : (
                                "Submit Application"
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}