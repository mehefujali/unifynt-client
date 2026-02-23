/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { StudentService } from "@/services/student.service";
import { format } from "date-fns";

import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Phone, GraduationCap, CalendarDays, UserSquare2, Link as LinkIcon, AlertCircle } from "lucide-react";

interface Props {
    studentId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const formatKeyLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
const isImageUrl = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url.toLowerCase());

export default function ViewStudentModal({ studentId, isOpen, onClose }: Props) {
    const { data: res, isLoading } = useQuery({
        queryKey: ["student", studentId],
        queryFn: () => StudentService.getStudentById(studentId!),
        enabled: !!studentId && isOpen,
    });

    const student = res?.data;
    const admissionData = student?.admissionApplication;

    const renderDynamicFields = (dataObj: any, excludeKeys: string[] = []) => {
        if (!dataObj) return null;
        const validEntries = Object.entries(dataObj).filter(([key, value]) => 
            !excludeKeys.includes(key) && value !== null && value !== undefined && value !== "" && value !== "null"
        );

        if (validEntries.length === 0) return <div className="text-sm text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4"/> No data available.</div>;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {validEntries.map(([key, value]) => {
                    const strValue = String(value);
                    const isLink = strValue.startsWith("http");

                    return (
                        <div key={key} className="space-y-1.5 p-3 sm:p-3.5 bg-muted/20 rounded-xl border border-border/50">
                            <Label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{formatKeyLabel(key)}</Label>
                            {isLink ? (
                                isImageUrl(strValue) ? (
                                    <a href={strValue} target="_blank" rel="noreferrer" className="block hover:opacity-80 transition-opacity">
                                        <img src={strValue} alt={key} className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-lg border shadow-sm" />
                                    </a>
                                ) : (
                                    <a href={strValue} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline break-all">
                                        <LinkIcon className="h-4 w-4 shrink-0" /> <span className="line-clamp-1">View Document</span>
                                    </a>
                                )
                            ) : (
                                <p className="text-sm font-semibold text-foreground break-words">
                                    {key.toLowerCase().includes("date") && !isNaN(Date.parse(strValue)) ? format(new Date(strValue), "dd MMM yyyy") : strValue}
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
            <SheetContent side="right" className="w-full max-w-[100vw] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[800px] p-0 flex flex-col h-[100dvh] bg-background border-l shadow-2xl">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading comprehensive profile...</p>
                    </div>
                ) : student ? (
                    <>
                        <SheetHeader className="p-4 sm:p-6 border-b bg-gradient-to-br from-muted/50 to-background shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none hidden sm:block">
                                <UserSquare2 className="h-40 w-40" />
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10">
                                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg shrink-0">
                                    <AvatarImage src={student.profilePicture} className="object-cover" />
                                    <AvatarFallback className="text-3xl bg-primary/10 text-primary font-bold">
                                        {student.firstName?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2 pt-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{student.firstName} {student.lastName}</h2>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm font-medium text-muted-foreground">
                                                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20">{student.studentId}</Badge>
                                                <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4"/> Class {student.class?.name} - {student.section?.name} (Roll: {student.rollNumber})</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={`w-fit ${student.user?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                                            {student.user?.status}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 mt-3 text-xs sm:text-sm font-medium text-foreground">
                                        <span className="flex items-center gap-1.5 sm:gap-2 break-all"><Mail className="h-4 w-4 text-muted-foreground shrink-0"/> {student.email}</span>
                                        <span className="flex items-center gap-1.5 sm:gap-2"><Phone className="h-4 w-4 text-muted-foreground shrink-0"/> {student.phone || "N/A"}</span>
                                        <span className="flex items-center gap-1.5 sm:gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground shrink-0"/> {student.academicYear?.name || "Current Session"}</span>
                                    </div>
                                </div>
                            </div>
                        </SheetHeader>

                        {/* Flex container for tabs to manage scroll perfectly */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <Tabs defaultValue="overview" className="flex-1 flex flex-col w-full h-full">
                                <div className="w-full border-b bg-muted/5 shrink-0 overflow-x-auto no-scrollbar">
                                    <TabsList className="h-12 bg-transparent flex w-max min-w-full justify-start space-x-2 px-4">
                                        <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 font-semibold whitespace-nowrap">Overview</TabsTrigger>
                                        <TabsTrigger value="guardian" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 font-semibold whitespace-nowrap">Parents & Guardian</TabsTrigger>
                                        <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 font-semibold whitespace-nowrap">Academic History</TabsTrigger>
                                        <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 font-semibold whitespace-nowrap">Docs & Custom Data</TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* Main scrollable area for content */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                                    <TabsContent value="overview" className="m-0 space-y-6 animate-in fade-in">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground border-b pb-2 mb-4 uppercase tracking-wide">Personal Information</h3>
                                            {renderDynamicFields(admissionData, [
                                                "id", "schoolId", "studentId", "classId", "academicYearId", "createdAt", "updatedAt", "status", "customData",
                                                "fatherName", "fatherPhone", "fatherEmail", "fatherOccupation", "fatherEducation", "fatherIncome", "fatherNationalId", "fatherPhotoUrl",
                                                "motherName", "motherPhone", "motherEmail", "motherOccupation", "motherEducation", "motherIncome", "motherNationalId", "motherPhotoUrl",
                                                "localGuardianName", "localGuardianPhone", "localGuardianRelation", "guardianEmail", "guardianOccupation", "guardianAddress", "guardianPhotoUrl",
                                                "birthCertificateUrl", "nationalIdDocumentUrl", "tcDocumentUrl", "previousMarksheetUrl", "casteCertificateUrl", "medicalCertificateUrl", "incomeCertificateUrl"
                                            ])}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="guardian" className="m-0 space-y-8 animate-in fade-in">
                                        {["Father", "Mother", "Guardian"].map((type) => {
                                            const prefix = type === "Guardian" ? "localGuardian" : type.toLowerCase();
                                            const hasData = admissionData && Object.keys(admissionData).some(k => k.startsWith(prefix) && admissionData[k]);
                                            
                                            if (!hasData && type !== "Father") return null;

                                            return (
                                                <div key={type}>
                                                    <h3 className="text-sm font-bold text-foreground border-b pb-2 mb-4 uppercase tracking-wide">{type} Details</h3>
                                                    {renderDynamicFields(
                                                        Object.fromEntries(Object.entries(admissionData || {}).filter(([k]) => k.toLowerCase().includes(type.toLowerCase()))),
                                                        []
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </TabsContent>

                                    <TabsContent value="history" className="m-0 animate-in fade-in">
                                        <h3 className="text-sm font-bold text-foreground border-b pb-2 mb-4 uppercase tracking-wide">Promotion History</h3>
                                        {student.academicHistories && student.academicHistories.length > 0 ? (
                                            <div className="space-y-4">
                                                {student.academicHistories.map((history: any) => (
                                                    <div key={history.id} className="p-4 rounded-xl border bg-card flex flex-col sm:flex-row justify-between gap-4 shadow-sm">
                                                        <div>
                                                            <h4 className="font-bold text-foreground">{history.academicYear?.name}</h4>
                                                            <p className="text-sm text-muted-foreground mt-1">Class {history.class?.name} - {history.section?.name} (Roll: {history.rollNumber})</p>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium">
                                                            {history.totalMarks && <Badge variant="secondary">Marks: {history.totalMarks}</Badge>}
                                                            {history.percentage && <Badge variant="secondary">{history.percentage}%</Badge>}
                                                            {history.grade && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shadow-none border-emerald-200">Grade {history.grade}</Badge>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/10">
                                                <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                                                <p className="text-sm font-medium text-muted-foreground">No academic history found for this student.</p>
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="documents" className="m-0 space-y-8 animate-in fade-in">
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground border-b pb-2 mb-4 uppercase tracking-wide">Uploaded Documents</h3>
                                            {renderDynamicFields(admissionData, Object.keys(admissionData || {}).filter(k => !k.toLowerCase().includes("url")))}
                                        </div>
                                        
                                        {admissionData?.customData && Object.keys(admissionData.customData).length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground border-b pb-2 mb-4 uppercase tracking-wide">Custom Form Fields</h3>
                                                {renderDynamicFields(admissionData.customData, ["schoolId", "studentId", "classId", "academicYearId", "id"])}
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}