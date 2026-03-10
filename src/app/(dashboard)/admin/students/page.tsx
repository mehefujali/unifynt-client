/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";
import { useDebounce } from "@/hooks/use-debounce";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye, Loader2, ChevronLeft, ChevronRight, UserX, Plus, Edit, Download, ShieldAlert, GraduationCap, Phone, KeyRound, Bell } from "lucide-react";

import ViewStudentModal from "./view-student-modal";
import AddStudentModal from "./add-student-modal";
import EditStudentModal from "./edit-student-modal";
import ResetPasswordModal from "./reset-password-modal";
import SendNotificationModal from "./send-notification-modal";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

const extractData = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
};

export default function StudentsPage() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [classId, setClassId] = useState<string>("ALL");
    const [sectionId, setSectionId] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [resetStudentId, setResetStudentId] = useState<string | null>(null);
    const [notificationStudentId, setNotificationStudentId] = useState<string | null>(null);
    const [generatedPasswordInfo, setGeneratedPasswordInfo] = useState<{ email: string, password: string } | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const { data: classesRes } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses()
    });

    const { data: sectionsRes } = useQuery({
        queryKey: ["sections", classId],
        queryFn: () => AcademicService.getAllSections({ classId: classId === "ALL" ? undefined : classId }),
        enabled: classId !== "ALL"
    });

    const { data: studentsRes, isLoading } = useQuery({
        queryKey: ["students", page, debouncedSearch, classId, sectionId],
        queryFn: () => StudentService.getAllStudents({
            page, limit,
            searchTerm: debouncedSearch,
            classId: classId === "ALL" ? undefined : classId,
            sectionId: sectionId === "ALL" ? undefined : sectionId
        }),
    });

    // The password reset logic has been appropriately moved to the ResetPasswordModal component

    const handleExport = async (format: 'excel' | 'csv') => {
        try {
            setIsExporting(true);
            toast.loading("Preparing export data...", { id: "export-toast" });

            const queryParams = {
                searchTerm: debouncedSearch || undefined,
                classId: classId === "ALL" ? undefined : classId,
                sectionId: sectionId === "ALL" ? undefined : sectionId,
            };

            const res = await StudentService.exportStudents(queryParams);
            const data = res.data;

            if (!data || data.length === 0) {
                toast.error("No data found to export", { id: "export-toast" });
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Students Data");

            const fileName = `Students_Export_${new Date().toISOString().split('T')[0]}`;
            if (format === 'excel') {
                XLSX.writeFile(workbook, `${fileName}.xlsx`);
            } else {
                XLSX.writeFile(workbook, `${fileName}.csv`);
            }

            toast.success(`Exported successfully as ${format.toUpperCase()}`, { id: "export-toast" });
        } catch {
            toast.error("Failed to export data", { id: "export-toast" });
        } finally {
            setIsExporting(false);
        }
    };

    const students = studentsRes?.data || [];
    const meta = studentsRes?.meta || { total: 0, page: 1, limit, totalPage: 1 };

    const classList = extractData(classesRes);
    const sectionList = extractData(sectionsRes);

    return (
        // 🔒 Gate for Entire Directory Access
        <PermissionGate 
            required={PERMISSIONS.STUDENT_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You do not have authorization to view the student records. Please contact the administration if you require access.
                    </p>
                </div>
            }
        >
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Student Directory</h2>
                        <p className="text-muted-foreground text-sm font-bold opacity-80">Full audit of enrolled students across all wings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {generatedPasswordInfo && (
                            <div className="hidden lg:flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 px-4 py-2 rounded-xl border border-rose-100 dark:border-rose-900/30 font-bold text-[12px] shadow-sm animate-in zoom-in fade-in duration-300">
                                <KeyRound className="h-4 w-4" /> 
                                Password Reset - 
                                <span className="opacity-80">{generatedPasswordInfo.email}</span>:
                                <span className="font-mono tracking-wider ml-1 px-2 py-0.5 bg-white dark:bg-black/40 rounded border border-rose-100 dark:border-rose-900/50">{generatedPasswordInfo.password}</span>
                            </div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={isExporting} className="h-11 rounded-xl shadow-sm font-bold border-slate-200 dark:border-slate-800">
                                    {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-2 min-w-[180px]">
                                <DropdownMenuItem onClick={() => handleExport('excel')} className="font-bold cursor-pointer rounded-lg py-2.5">
                                    Export as Excel (.xlsx)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('csv')} className="font-bold cursor-pointer rounded-lg py-2.5">
                                    Export as CSV (.csv)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* 🔒 Gate for Add Student Action */}
                        <PermissionGate required={PERMISSIONS.STUDENT_CREATE}>
                            <Button onClick={() => setIsAddModalOpen(true)} className="font-black shadow-xl shadow-primary/20 h-11 px-6 rounded-xl transition-all hover:scale-[1.02]">
                                <Plus className="h-4 w-4 mr-2 stroke-[3]" /> Add Student
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                <Card className="rounded-[32px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <CardHeader className="p-4 border-b bg-muted/10">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                            <div className="relative sm:col-span-6 lg:col-span-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by name, ID or guardian..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="pl-11 h-11 bg-background rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm font-bold text-[13px]"
                                />
                            </div>
                            <div className="sm:col-span-3 lg:col-span-4">
                                <Select value={classId} onValueChange={(val) => { setClassId(val); setSectionId("ALL"); setPage(1); }}>
                                    <SelectTrigger className="h-11 bg-background rounded-2xl border-slate-200 dark:border-slate-800 font-bold">
                                        <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="ALL" className="font-black text-primary uppercase tracking-wider">All Classes</SelectItem>
                                        {classList.map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id} className="font-bold">{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-3 lg:col-span-4">
                                <Select value={sectionId} onValueChange={(val) => { setSectionId(val); setPage(1); }} disabled={classId === "ALL"}>
                                    <SelectTrigger className="h-11 bg-background rounded-2xl border-slate-200 dark:border-slate-800 font-bold">
                                        <SelectValue placeholder={classId === "ALL" ? "Select Class First" : "All Sections"} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="ALL" className="font-black text-primary uppercase tracking-wider">All Sections</SelectItem>
                                        {sectionList.map((sec: any) => (
                                            <SelectItem key={sec.id} value={sec.id} className="font-bold">Section {sec.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30">
                                    <TableRow className="border-b-black/5 dark:border-b-white/5">
                                        <TableHead className="font-black text-[11px] uppercase tracking-[2px] text-slate-400 px-8 h-14">Student Identity</TableHead>
                                        <TableHead className="font-black text-[11px] uppercase tracking-[2px] text-slate-400">Class & Roll</TableHead>
                                        <TableHead className="font-black text-[11px] uppercase tracking-[2px] text-slate-400">Guardian Details</TableHead>
                                        <TableHead className="font-black text-[11px] uppercase tracking-[2px] text-slate-400 text-center">System Status</TableHead>
                                        <TableHead className="text-right font-black text-[11px] uppercase tracking-[2px] text-slate-400 px-8">Manage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                                    ) : students.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-80 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                                                    <UserX className="h-20 w-20 mx-auto" />
                                                    <p className="font-black uppercase tracking-[3px]">Zero Students Found</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        students.map((std: any) => (
                                            <TableRow key={std.id} className="hover:bg-white/80 dark:hover:bg-white/5 transition-all group border-b-black/5 dark:border-b-white/5">
                                                <TableCell className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-border/50">
                                                            <AvatarImage src={std.profilePicture} alt={std.firstName} className="object-cover" />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-black text-lg uppercase">
                                                                {std.firstName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-[15px] text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">
                                                                {std.firstName} {std.lastName}
                                                            </span>
                                                            <span className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest bg-slate-100 dark:bg-white/5 w-fit px-1.5 rounded">ID: {std.studentId}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[13px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Class {std.class?.name} - {std.section?.name}</span>
                                                        <span className="text-[11px] font-bold text-slate-400">Roll: <span className="text-primary">{std.rollNumber}</span></span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{std.admissionApplication?.fatherName || std.admissionApplication?.localGuardianName || "N/A"}</span>
                                                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 tracking-tight">
                                                            <Phone className="h-3 w-3" /> {std.admissionApplication?.fatherPhone || std.admissionApplication?.localGuardianPhone || "N/A"}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex justify-center">
                                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${std.user?.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full ${std.user?.status === "ACTIVE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{std.user?.status || "UNKNOWN"}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-8">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {/* 🔒 Gate for Individual Actions */}
                                                        <PermissionGate required={PERMISSIONS.STUDENT_VIEW}>
                                                            <Button variant="ghost" size="icon" onClick={() => setSelectedStudentId(std.id)} className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20">
                                                                <Eye className="h-5 w-5" />
                                                            </Button>
                                                        </PermissionGate>
                                                        
                                                        <PermissionGate required={PERMISSIONS.STUDENT_EDIT}>
                                                            <Button title="Send Notification" variant="ghost" size="icon" onClick={() => setNotificationStudentId(std.id)} className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-500/20">
                                                                <Bell className="h-5 w-5" />
                                                            </Button>
                                                        </PermissionGate>

                                                        <PermissionGate required={PERMISSIONS.STUDENT_EDIT}>
                                                            <Button title="Reset Password" variant="ghost" size="icon" onClick={() => setResetStudentId(std.id)} className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 transition-all border border-transparent hover:border-rose-500/20">
                                                                <KeyRound className="h-5 w-5" />
                                                            </Button>
                                                        </PermissionGate>
                                                        
                                                        <PermissionGate required={PERMISSIONS.STUDENT_EDIT}>
                                                            <Button title="Edit Details" variant="ghost" size="icon" onClick={() => setEditingStudentId(std.id)} className="h-10 w-10 rounded-xl hover:bg-amber-500/10 hover:text-amber-600 transition-all border border-transparent hover:border-amber-500/20">
                                                                <Edit className="h-5 w-5" />
                                                            </Button>
                                                        </PermissionGate>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Footer */}
                        {!isLoading && meta.total > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t bg-slate-50/30 dark:bg-black/10 gap-4">
                                <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                                    Displaying <span className="text-slate-900 dark:text-white">{((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)}</span> of {meta.total} students
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                                        disabled={meta.page === 1} 
                                        className="h-9 rounded-xl border-slate-200 dark:border-slate-800 font-bold px-4 shadow-sm transition-all hover:bg-white"
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                                    </Button>
                                    <div className="px-5 h-9 flex items-center justify-center bg-primary text-white dark:text-black rounded-xl font-black text-[13px] shadow-lg shadow-primary/20">
                                        {meta.page} / {meta.totalPage}
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => setPage(p => p + 1)} 
                                        disabled={meta.page >= meta.totalPage} 
                                        className="h-9 rounded-xl border-slate-200 dark:border-slate-800 font-bold px-4 shadow-sm transition-all hover:bg-white"
                                    >
                                        Next <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
                <ViewStudentModal studentId={selectedStudentId} isOpen={!!selectedStudentId} onClose={() => setSelectedStudentId(null)} />
                <EditStudentModal studentId={editingStudentId} isOpen={!!editingStudentId} onClose={() => setEditingStudentId(null)} />
                <SendNotificationModal studentId={notificationStudentId} isOpen={!!notificationStudentId} onClose={() => setNotificationStudentId(null)} />
                <ResetPasswordModal studentId={resetStudentId} isOpen={!!resetStudentId} onClose={() => setResetStudentId(null)} setGeneratedPasswordInfo={setGeneratedPasswordInfo} />
            </div>
        </PermissionGate>
    );
}