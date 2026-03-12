 
"use client";

import { useQuery } from "@tanstack/react-query";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
    Mail, Phone, MapPin, User, Briefcase, GraduationCap,
    Calendar, Building, Link as LinkIcon, FileText, AlertCircle, Clock,
    Banknote, Landmark, CreditCard, Hash, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { TeacherService } from "@/services/teacher.service";

interface ViewTeacherModalProps {
    teacherId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewTeacherModal({ teacherId, open, onOpenChange }: ViewTeacherModalProps) {
    // API Call only when modal is open and ID is available
    const { data: teacherRes, isLoading } = useQuery({
        queryKey: ["teacher", teacherId],
        queryFn: () => TeacherService.getSingleTeacher(teacherId as string),
        enabled: !!teacherId && open,
    });

    const teacher = teacherRes?.data?.id ? teacherRes.data : teacherRes?.id ? teacherRes : null;

    const getEmploymentBadge = (type: string) => {
        switch (type) {
            case "FULL_TIME": return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-0">Full Time</Badge>;
            case "PART_TIME": return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-0">Part Time</Badge>;
            case "CONTRACT": return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-0">Contract Base</Badge>;
            case "GUEST": return <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-0">Guest Lecturer</Badge>;
            default: return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[650px] w-full p-0 flex flex-col h-full bg-white dark:bg-slate-950/50 border-l-0 shadow-2xl">
                <div className="bg-background border-b px-8 py-8 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                    <SheetHeader>
                        <div className="flex items-start gap-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={teacher?.profileImage} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                                    {teacher ? `${teacher.firstName?.charAt(0)}${teacher.lastName?.charAt(0)}` : <User />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-3">
                                    <SheetTitle className="text-3xl font-extrabold tracking-tight">
                                        {teacher ? `${teacher.firstName} ${teacher.lastName}` : "Loading..."}
                                    </SheetTitle>
                                    {teacher?.user?.status === "ACTIVE" ? (
                                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-sm">Active</Badge>
                                    ) : teacher ? (
                                        <Badge variant="destructive" className="shadow-sm">Blocked</Badge>
                                    ) : null}
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {teacher?.designation || "N/A"}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {teacher?.department || "General"}</span>
                                </div>
                            </div>
                        </div>
                    </SheetHeader>
                </div>

                {isLoading || !teacher ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-muted/10">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">Loading full profile...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-8">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-8 bg-muted/50 p-1 rounded-xl shadow-inner">
                                <TabsTrigger value="overview" className="rounded-lg font-bold">Overview</TabsTrigger>
                                <TabsTrigger value="professional" className="rounded-lg font-bold">Professional</TabsTrigger>
                                <TabsTrigger value="payroll" className="rounded-lg font-bold">Payroll</TabsTrigger>
                                <TabsTrigger value="documents" className="rounded-lg font-bold">Documents</TabsTrigger>
                            </TabsList>

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
                                <Card className="shadow-sm border-border/60">
                                    <CardContent className="p-6 space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2"><User className="w-4 h-4" /> Contact & Personal</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</p>
                                                <p className="text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {teacher.user?.email || teacher.email}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</p>
                                                <p className="text-sm font-semibold flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {teacher.phone || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Gender & DOB</p>
                                                <p className="text-sm font-semibold flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span className="capitalize">{teacher.gender?.toLowerCase()}</span>
                                                    {teacher.dateOfBirth && ` • ${format(new Date(teacher.dateOfBirth), "dd MMM yyyy")}`}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Residential Address</p>
                                                <p className="text-sm font-semibold flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> {teacher.address || "N/A"}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
                                    <CardContent className="p-6 space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-900/30 pb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Emergency Contact</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Person</p>
                                                <p className="text-sm font-semibold">{teacher.emergencyContactName || "Not Provided"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact Number</p>
                                                <p className="text-sm font-semibold">{teacher.emergencyContactPhone || "Not Provided"}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PROFESSIONAL TAB */}
                            <TabsContent value="professional" className="space-y-6 animate-in fade-in duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="shadow-sm border-border/60">
                                        <CardContent className="p-5 flex flex-col gap-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Employee ID</p>
                                            <p className="text-lg font-black font-mono text-primary">{teacher.employeeId || "N/A"}</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="shadow-sm border-border/60">
                                        <CardContent className="p-5 flex flex-col gap-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Employment Type</p>
                                            <div>{getEmploymentBadge(teacher.employmentType)}</div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card className="shadow-sm border-border/60">
                                    <CardContent className="p-6 space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Academic & Work Profile</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Highest Qualification</p>
                                                <p className="text-sm font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4 text-muted-foreground" /> {teacher.qualification || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Experience</p>
                                                <p className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /> {teacher.experienceYears ? `${teacher.experienceYears} Years` : "Fresher"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Joining Date</p>
                                                <p className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /> {teacher.joiningDate ? format(new Date(teacher.joiningDate), "dd MMM yyyy") : "N/A"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Assigned Section</p>
                                                <p className="text-sm font-semibold flex items-center gap-2">
                                                    <Building className="w-4 h-4 text-muted-foreground" />
                                                    {teacher.assignedSection ? `${teacher.assignedSection.class?.name} - ${teacher.assignedSection.name}` : "Not Assigned"}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* PAYROLL TAB */}
                            <TabsContent value="payroll" className="space-y-6 animate-in fade-in duration-500">
                                <Card className="shadow-sm border-border/60">
                                    <CardContent className="p-6 space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-2 flex items-center gap-2">
                                            <Banknote className="w-4 h-4" /> Financial Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                            <div className="col-span-1 md:col-span-2 p-4 bg-primary/5 rounded-xl border border-primary/10 flex flex-col gap-1">
                                                <p className="text-xs font-bold text-primary uppercase tracking-wider">Basic Salary (Monthly)</p>
                                                <p className="text-3xl font-black font-mono text-foreground">₹{teacher.basicSalary?.toLocaleString() || "0"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Bank Name</p>
                                                <p className="text-sm font-semibold flex items-center gap-2"><Landmark className="w-4 h-4 text-muted-foreground" /> {teacher.bankName || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Number</p>
                                                <p className="text-sm font-semibold font-mono flex items-center gap-2"><CreditCard className="w-4 h-4 text-muted-foreground" /> {teacher.accountNumber || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">IFSC Code</p>
                                                <p className="text-sm font-semibold font-mono flex items-center gap-2"><Hash className="w-4 h-4 text-muted-foreground" /> {teacher.ifscCode || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">PAN Number</p>
                                                <p className="text-sm font-semibold font-mono flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground" /> {teacher.panNumber || "N/A"}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* DOCUMENTS TAB */}
                            <TabsContent value="documents" className="space-y-6 animate-in fade-in duration-500">
                                <Card className="shadow-sm border-border/60">
                                    <CardContent className="p-6">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary border-b pb-4 mb-6 flex items-center gap-2"><FileText className="w-4 h-4" /> Attached Assets</h4>
                                        <div className="space-y-6">
                                            {/* Resume */}
                                            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">Curriculum Vitae (CV)</p>
                                                        <p className="text-xs text-muted-foreground">{teacher.resumeUrl ? "Document verified and attached" : "No document uploaded"}</p>
                                                    </div>
                                                </div>
                                                {teacher.resumeUrl && (
                                                    <a href={teacher.resumeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-sm hover:bg-primary/90 transition-colors">
                                                        View / Download
                                                    </a>
                                                )}
                                            </div>

                                            {/* LinkedIn */}
                                            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2]">
                                                        <LinkIcon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">LinkedIn Profile</p>
                                                        <p className="text-xs text-muted-foreground">{teacher.linkedinUrl ? "Professional network linked" : "No link provided"}</p>
                                                    </div>
                                                </div>
                                                {teacher.linkedinUrl && (
                                                    <a href={teacher.linkedinUrl} target="_blank" rel="noreferrer" className="text-xs font-bold border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/10 px-4 py-2 rounded-md transition-colors">
                                                        Visit Profile
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                        </Tabs>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}