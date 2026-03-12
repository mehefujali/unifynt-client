/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";
import { useDebounce } from "@/hooks/use-debounce";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye, Loader2, ChevronLeft, ChevronRight, UserX, Plus, Edit, Download, ShieldAlert, GraduationCap, Phone, KeyRound, Bell, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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
            <div className="p-6 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Students Directory</h2>
                        <p className="text-muted-foreground text-sm">Manage student profiles, enrollments, and academic status across the institution.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {generatedPasswordInfo && (
                            <div className="hidden lg:flex items-center gap-2 bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-500/20 font-bold text-[12px] shadow-sm animate-in zoom-in fade-in duration-300">
                                <KeyRound className="h-4 w-4" /> 
                                Password Reset Success - {generatedPasswordInfo.email}:
                                <span className="font-mono tracking-wider ml-1 px-2 py-0.5 bg-white dark:bg-black/40 rounded border border-emerald-500/30">{generatedPasswordInfo.password}</span>
                            </div>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={isExporting} className="h-10 rounded-lg shadow-sm font-semibold border-border">
                                    {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                                <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
                                    Export as Excel (.xlsx)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
                                    Export as CSV (.csv)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <PermissionGate required={PERMISSIONS.STUDENT_CREATE}>
                            <Button onClick={() => setIsAddModalOpen(true)} className="font-bold shadow-md h-10 px-6 rounded-lg transition-all hover:translate-y-[-1px]">
                                <Plus className="h-4 w-4 mr-2" /> Add Student
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Filters Section - Following Super Admin Logic */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, ID or guardian..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9 h-10 bg-muted/20 border-border"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select value={classId} onValueChange={(val) => { setClassId(val); setSectionId("ALL"); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-muted/20">
                                <SelectValue placeholder="All Classes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Classes</SelectItem>
                                {classList.map((cls: any) => (
                                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sectionId} onValueChange={(val) => { setSectionId(val); setPage(1); }} disabled={classId === "ALL"}>
                            <SelectTrigger className="w-full sm:w-[150px] h-10 bg-muted/20">
                                <SelectValue placeholder={classId === "ALL" ? "Select Class" : "All Sections"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Sections</SelectItem>
                                {sectionList.map((sec: any) => (
                                    <SelectItem key={sec.id} value={sec.id}>Section {sec.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Data Table Section - Following Super Admin Logic */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30 border-b border-border">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold text-foreground">Student Identity</TableHead>
                                    <TableHead className="font-bold text-foreground">Class & Roll</TableHead>
                                    <TableHead className="font-bold text-foreground">Guardian Details</TableHead>
                                    <TableHead className="font-bold text-foreground">System Status</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-500">
                                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-zinc-400" />
                                                <p>Loading student database...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center text-zinc-500">
                                            <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                                                <UserX className="h-16 w-16 mx-auto" />
                                                <p className="font-bold uppercase tracking-widest text-sm">No Students Found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    students.map((std: any) => (
                                        <TableRow key={std.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-border ring-1 ring-border/20">
                                                        <AvatarImage src={std.profilePicture} alt={std.firstName} className="object-cover" />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                                            {std.firstName.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">
                                                            {std.firstName} {std.lastName}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-muted-foreground px-1.5 py-0.5 bg-muted/60 rounded-md border border-border/50 w-fit mt-0.5">
                                                            ID: {std.studentId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold text-foreground/90 tabular-nums">Class {std.class?.name}</span>
                                                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                                        Section {std.section?.name} <span className="text-border">|</span> Roll: <span className="text-primary font-bold">{std.rollNumber}</span>
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-foreground/80">{std.admissionApplication?.fatherName || std.admissionApplication?.localGuardianName || "N/A"}</span>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                                                        <Phone className="h-3 w-3" /> {std.admissionApplication?.fatherPhone || std.admissionApplication?.localGuardianPhone || "N/A"}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        std.user?.status === "ACTIVE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                                    )} />
                                                    <span className={cn(
                                                        "text-sm font-bold capitalize",
                                                        std.user?.status === "ACTIVE" ? "text-emerald-500" : "text-rose-500"
                                                    )}>
                                                        {std.user?.status?.toLowerCase() || "unknown"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[180px]">
                                                        <PermissionGate required={PERMISSIONS.STUDENT_VIEW}>
                                                            <DropdownMenuItem onClick={() => setSelectedStudentId(std.id)} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" /> View Profile
                                                            </DropdownMenuItem>
                                                        </PermissionGate>
                                                        
                                                        <PermissionGate required={PERMISSIONS.STUDENT_EDIT}>
                                                            <DropdownMenuItem onClick={() => setNotificationStudentId(std.id)} className="cursor-pointer">
                                                                <Bell className="mr-2 h-4 w-4" /> Send Notification
                                                            </DropdownMenuItem>
                                                        </PermissionGate>
  
                                                        <PermissionGate required={PERMISSIONS.STUDENT_EDIT}>
                                                            <DropdownMenuItem onClick={() => setResetStudentId(std.id)} className="cursor-pointer">
                                                                <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                                            </DropdownMenuItem>
                                                        </PermissionGate>
                                                        
                                                        <PermissionGate required={PERMISSIONS.STUDENT_EDIT}>
                                                            <DropdownMenuItem onClick={() => setEditingStudentId(std.id)} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                            </DropdownMenuItem>
                                                        </PermissionGate>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination - Following Super Admin Logic */}
                    {!isLoading && meta.total > 0 && (
                        <div className="border-t border-border bg-muted/20 p-4 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-bold">
                                Showing <span className="text-foreground">{((meta.page - 1) * meta.limit) + 1}</span> to <span className="text-foreground">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-foreground">{meta.total}</span> students
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={meta.page === 1}
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="px-3 text-xs font-bold text-foreground/70 bg-background/50 py-1 rounded-md border border-border/50">
                                    Page {meta.page} of {meta.totalPage}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={meta.page >= meta.totalPage}
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
                <ViewStudentModal studentId={selectedStudentId} isOpen={!!selectedStudentId} onClose={() => setSelectedStudentId(null)} />
                <EditStudentModal studentId={editingStudentId} isOpen={!!editingStudentId} onClose={() => setEditingStudentId(null)} />
                <SendNotificationModal studentId={notificationStudentId} isOpen={!!notificationStudentId} onClose={() => setNotificationStudentId(null)} />
                <ResetPasswordModal studentId={resetStudentId} isOpen={!!resetStudentId} onClose={() => setResetStudentId(null)} setGeneratedPasswordInfo={setGeneratedPasswordInfo} />
            </div>
        </PermissionGate>
    );
}