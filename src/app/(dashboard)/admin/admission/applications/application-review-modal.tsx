"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdmissionService } from "@/services/admission.service";
import axiosInstance from "@/lib/axios";
import { format } from "date-fns";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CheckCircle2, User, Link as LinkIcon, Mail, Phone, GraduationCap, CalendarDays } from "lucide-react";

interface Props {
    applicationId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const EXCLUDED_KEYS = [
    "id", "schoolId", "studentId", "classId", "academicYearId", 
    "customData", "createdAt", "updatedAt", "status", "school", 
    "className", "academicYearName", "applicantName", "applicantEmail", 
    "firstName", "lastName", "email", "phone", "profileImage"
];

const formatKeyLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const isImageUrl = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url.toLowerCase());

export default function ApplicationReviewModal({ applicationId, isOpen, onClose }: Props) {
    const queryClient = useQueryClient();
    const [sectionId, setSectionId] = useState<string>("");

    const { data: appRes, isLoading } = useQuery({
        queryKey: ["application", applicationId],
        queryFn: () => AdmissionService.getApplicationById(applicationId!),
        enabled: !!applicationId,
    });

    const application = appRes?.data;

    const { data: sectionsRes, isLoading: loadingSections } = useQuery({
        queryKey: ["sections", application?.classId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/academic/sections`, { params: { classId: application?.classId } });
            return res.data;
        },
        enabled: !!application?.classId,
    });

    const approveMutation = useMutation({
        mutationFn: () => AdmissionService.approveApplication({ id: applicationId!, sectionId }),
        onSuccess: () => {
            toast.success("Application approved and student created successfully!");
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            onClose();
            setSectionId("");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to approve application");
        }
    });

    const handleApprove = () => {
        if (!sectionId) return toast.error("Please assign a section to the student.");
        approveMutation.mutate();
    };

    const renderDataFields = (dataObj: any) => {
        if (!dataObj) return null;
        
        const validEntries = Object.entries(dataObj).filter(([key, value]) => {
            if (EXCLUDED_KEYS.includes(key)) return false;
            if (value === null || value === undefined || value === "" || value === "null") return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
        });

        if (validEntries.length === 0) return null;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {validEntries.map(([key, value]) => {
                    const strValue = String(value);
                    const isLink = strValue.startsWith("http");

                    return (
                        <div key={key} className="space-y-1 p-3 bg-muted/20 rounded-lg border border-border/50">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">{formatKeyLabel(key)}</Label>
                            {isLink ? (
                                isImageUrl(strValue) ? (
                                    <a href={strValue} target="_blank" rel="noreferrer" className="block mt-1 hover:opacity-80 transition-opacity">
                                        <img src={strValue} alt={key} className="h-16 w-16 object-cover rounded-md border shadow-sm" />
                                    </a>
                                ) : (
                                    <a href={strValue} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-1 text-sm font-semibold text-primary hover:underline">
                                        <LinkIcon className="h-3.5 w-3.5" /> View Document
                                    </a>
                                )
                            ) : (
                                <p className="text-sm font-medium text-foreground">
                                    {key.toLowerCase().includes("date") && !isNaN(Date.parse(strValue)) 
                                        ? format(new Date(strValue), "dd MMM yyyy") 
                                        : strValue}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-[100dvh] bg-background border-l shadow-2xl overflow-hidden">
                <SheetHeader className="p-4 sm:p-6 border-b bg-muted/10 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <SheetTitle className="text-lg font-bold flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> Application Review
                        </SheetTitle>
                        {application && (
                            <Badge variant="outline" className={
                                application.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                application.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-200" :
                                "bg-amber-50 text-amber-600 border-amber-200"
                            }>
                                {application.status}
                            </Badge>
                        )}
                    </div>

                    {application && !isLoading && (
                        <div className="flex items-center gap-4 bg-background p-4 rounded-xl border shadow-sm">
                            <Avatar className="h-16 w-16 border-2 shadow-sm">
                                <AvatarImage src={application.profileImage} />
                                <AvatarFallback className="text-xl bg-primary/10 text-primary font-bold">
                                    {application.applicantName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <h2 className="text-lg font-bold truncate">{application.applicantName}</h2>
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1.5 text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5"/> {application.applicantEmail}</span>
                                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5"/> {application.phone || "N/A"}</span>
                                    <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-primary"/> Class: {application.className}</span>
                                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-primary"/> Session: {application.academicYearName}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                    {isLoading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground font-medium">Fetching application data...</p>
                        </div>
                    ) : application ? (
                        <div className="space-y-8 pb-10">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-foreground border-b pb-2">Additional Information</h3>
                                {renderDataFields(application)}
                            </div>

                            {application.customData && Object.keys(application.customData).length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-foreground border-b pb-2">Custom Form Fields</h3>
                                    {renderDataFields(application.customData)}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>

                {application?.status === "PENDING" && (
                    <div className="p-4 sm:p-6 border-t bg-muted/10 shrink-0 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-foreground uppercase">Assign Section <span className="text-destructive">*</span></Label>
                            <Select value={sectionId} onValueChange={setSectionId} disabled={loadingSections}>
                                <SelectTrigger className="h-11 bg-background">
                                    <SelectValue placeholder={loadingSections ? "Loading sections..." : "Select a section for the student"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionsRes?.data?.map((sec: any) => (
                                        <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground font-medium">A new student profile and secure portal account will be automatically generated upon approval.</p>
                        </div>
                        
                        <Button 
                            onClick={handleApprove} 
                            disabled={!sectionId || approveMutation.isPending} 
                            className="w-full h-11 font-bold text-sm shadow-sm"
                        >
                            {approveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Approve & Admit Student
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}