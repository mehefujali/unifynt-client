/* eslint-disable react/no-unescaped-entities */
"use client";

import { useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, User, GraduationCap, Users, HeartPulse, FileText, Calendar, Printer, QrCode } from "lucide-react";
import { format } from "date-fns";

interface ViewStudentModalProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    student: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewStudentModal({ student, open, onOpenChange }: ViewStudentModalProps) {
    const idCardRef = useRef<HTMLDivElement>(null);

    if (!student) return null;

    const handlePrintID = () => {
        const printContent = idCardRef.current;
        if (printContent) {
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContent.innerHTML;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[750px] w-full p-0 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50 border-l-0 shadow-2xl">
                <div className="bg-background border-b px-8 py-8 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                    <SheetHeader>
                        <div className="flex items-start gap-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={student.profileImage} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-3">
                                    <SheetTitle className="text-3xl font-extrabold tracking-tight">
                                        {student.firstName} {student.lastName}
                                    </SheetTitle>
                                    <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-sm border-0">
                                        {student.user?.status || "ACTIVE"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                                    <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                        Class {student.class?.name} - {student.section?.name}
                                    </span>
                                    <span>•</span>
                                    <span>Roll: {student.rollNumber}</span>
                                    <span>•</span>
                                    <span>ID: {student.studentId || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1 rounded-xl shadow-inner shrink-0">
                            <TabsTrigger value="overview" className="rounded-lg font-bold">Overview</TabsTrigger>
                            <TabsTrigger value="idcard" className="rounded-lg font-bold">ID Card</TabsTrigger>
                            <TabsTrigger value="parents" className="rounded-lg font-bold">Parents</TabsTrigger>
                            <TabsTrigger value="health" className="rounded-lg font-bold">Health & Docs</TabsTrigger>
                        </TabsList>

                        {/* ID CARD TAB */}
                        <TabsContent value="idcard" className="space-y-6">
                            <div className="flex justify-end mb-4">
                                <Button onClick={handlePrintID} variant="outline" className="shadow-sm font-bold">
                                    <Printer className="w-4 h-4 mr-2" /> Print ID Card
                                </Button>
                            </div>
                            <div className="flex justify-center items-center py-6">
                                <div ref={idCardRef} className="w-[320px] h-[480px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 overflow-hidden relative flex flex-col print:shadow-none print:border-slate-300">
                                    <div className="h-28 bg-primary w-full absolute top-0 left-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0% 100%)' }}></div>

                                    <div className="relative z-10 flex flex-col items-center pt-6 px-6">
                                        <h2 className="text-white font-black text-lg tracking-wider uppercase text-center drop-shadow-md">
                                            {student.school?.name || "STUDENT ID CARD"}
                                        </h2>

                                        <div className="mt-6 p-1 bg-white rounded-full shadow-lg">
                                            <Avatar className="h-28 w-28 border-4 border-white">
                                                <AvatarImage src={student.profileImage} className="object-cover" />
                                                <AvatarFallback className="bg-muted text-3xl font-black text-muted-foreground">{student.firstName?.charAt(0)}{student.lastName?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="text-center mt-4 w-full">
                                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{student.firstName} {student.lastName}</h3>
                                            <p className="text-primary font-bold text-sm tracking-widest mt-1 uppercase bg-primary/10 inline-block px-3 py-1 rounded-md">ID: {student.studentId || student.admissionNumber}</p>
                                        </div>

                                        <div className="w-full mt-6 space-y-2.5">
                                            <div className="grid grid-cols-3 text-xs font-semibold border-b border-slate-100 pb-2">
                                                <div className="text-slate-500 uppercase">Class</div>
                                                <div className="col-span-2 text-slate-800 text-right">{student.class?.name} - {student.section?.name}</div>
                                            </div>
                                            <div className="grid grid-cols-3 text-xs font-semibold border-b border-slate-100 pb-2">
                                                <div className="text-slate-500 uppercase">DOB</div>
                                                <div className="col-span-2 text-slate-800 text-right">{student.dateOfBirth ? format(new Date(student.dateOfBirth), "dd/MM/yyyy") : "N/A"}</div>
                                            </div>
                                            <div className="grid grid-cols-3 text-xs font-semibold border-b border-slate-100 pb-2">
                                                <div className="text-slate-500 uppercase">Blood</div>
                                                <div className="col-span-2 text-red-500 font-bold text-right">{student.bloodGroup ? student.bloodGroup.replace("_", "") : "N/A"}</div>
                                            </div>
                                            <div className="grid grid-cols-3 text-xs font-semibold">
                                                <div className="text-slate-500 uppercase">Contact</div>
                                                <div className="col-span-2 text-slate-800 text-right">{student.fatherPhone || student.localGuardianPhone || "N/A"}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                                        <QrCode className="text-slate-400 h-10 w-10" />
                                        <div className="text-center">
                                            <div className="w-20 h-0.5 bg-slate-800 mx-auto mb-1"></div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Principal</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* OTHER TABS */}
                        <TabsContent value="overview" className="space-y-6">
                            <Card className="shadow-sm border-border/60">
                                <CardContent className="p-6 space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2"><User className="w-4 h-4" /> Personal Info</h4>
                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Gender & DOB</p><p className="text-sm font-semibold capitalize">{student.gender?.toLowerCase()} • {student.dateOfBirth ? format(new Date(student.dateOfBirth), "dd MMM yyyy") : "N/A"}</p></div>
                                        <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Demographics</p><p className="text-sm font-semibold">{student.religion || "N/A"} • {student.caste}</p></div>
                                        <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Phone</p><p className="text-sm font-semibold flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {student.phone || "N/A"}</p></div>
                                        <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Email</p><p className="text-sm font-semibold flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {student.user?.email || student.email || "N/A"}</p></div>
                                        <div className="space-y-1 col-span-2"><p className="text-xs font-bold text-muted-foreground uppercase">Address</p><p className="text-sm font-semibold flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5" /> {student.address || "N/A"}</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm border-border/60">
                                <CardContent className="p-6 space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Academic Details</h4>
                                    <div className="grid grid-cols-2 gap-6 pt-2">
                                        <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Admission Date</p><p className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {student.admissionDate ? format(new Date(student.admissionDate), "dd MMM yyyy") : "N/A"}</p></div>
                                        <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Previous School</p><p className="text-sm font-semibold">{student.previousSchoolName || "N/A"}</p></div>
                                        <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Academic Year</p><p className="text-sm font-semibold">{student.academicYear?.name || "Current"}</p></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="parents" className="space-y-6">
                            <Card className="shadow-sm border-border/60 bg-muted/5">
                                <CardContent className="p-6 space-y-4">
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2"><Users className="w-4 h-4" /> Guardian Records</h4>
                                    <div className="space-y-6 pt-2">
                                        <div className="grid grid-cols-3 gap-4 bg-background p-4 rounded-lg border shadow-sm">
                                            <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Father's Name</p><p className="text-sm font-semibold">{student.fatherName || "N/A"}</p></div>
                                            <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Phone</p><p className="text-sm font-semibold">{student.fatherPhone || "N/A"}</p></div>
                                            <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Occupation</p><p className="text-sm font-semibold">{student.fatherOccupation || "N/A"}</p></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 bg-background p-4 rounded-lg border shadow-sm">
                                            <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Mother's Name</p><p className="text-sm font-semibold">{student.motherName || "N/A"}</p></div>
                                            <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Phone</p><p className="text-sm font-semibold">{student.motherPhone || "N/A"}</p></div>
                                            <div className="space-y-1"><p className="text-xs font-bold text-muted-foreground uppercase">Occupation</p><p className="text-sm font-semibold">{student.motherOccupation || "N/A"}</p></div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="health" className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="shadow-sm border-border/60">
                                    <CardContent className="p-5 flex flex-col gap-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5 text-red-500" /> Blood Group</p>
                                        <p className="text-lg font-black text-primary">{student.bloodGroup ? student.bloodGroup.replace("_", "") : "Unknown"}</p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm border-border/60">
                                    <CardContent className="p-5 flex flex-col gap-2">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Medical Conditions</p>
                                        <p className="text-sm font-semibold text-destructive">{student.medicalConditions || "None reported"}</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card className="shadow-sm border-border/60">
                                <CardContent className="p-6">
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-4 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Digital Locker</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                                            <p className="font-bold text-sm">Birth Certificate</p>
                                            {student.birthCertificateUrl ? <a href={student.birthCertificateUrl} target="_blank" className="text-xs font-bold text-primary hover:underline">View File</a> : <span className="text-xs text-muted-foreground">Not uploaded</span>}
                                        </div>
                                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/10">
                                            <p className="font-bold text-sm">Transfer Certificate</p>
                                            {student.tcDocumentUrl ? <a href={student.tcDocumentUrl} target="_blank" className="text-xs font-bold text-primary hover:underline">View File</a> : <span className="text-xs text-muted-foreground">Not uploaded</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}