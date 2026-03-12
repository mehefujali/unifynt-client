/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { 
    Loader2, Users, Search, Plus, FilterX, Briefcase, 
    UserCircle, Mail, MoreHorizontal, Eye, Edit, Trash2,
    ChevronLeft, ChevronRight, Phone, ShieldAlert
} from "lucide-react";
import { TeacherService } from "@/services/teacher.service";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { AddTeacherModal } from "./add-teacher-modal";
import { ViewTeacherModal } from "./view-teacher-modal";
import { EditTeacherModal } from "./edit-teacher-modal";
import { DeleteTeacherModal } from "./delete-teacher-modal";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

const DEPARTMENTS = ["Science", "Mathematics", "English", "Social Studies", "Languages", "Arts", "Physical Education", "Computer Science", "Commerce"];

export default function TeachersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [selectedGender, setSelectedGender] = useState<string>("ALL");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
    const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>("ALL");

    const [page, setPage] = useState(1);
    const limit = 10;

    // Modal states
    const [viewTeacherId, setViewTeacherId] = useState<string | null>(null);
    const [editTeacherId, setEditTeacherId] = useState<string | null>(null);
    const [deleteTeacher, setDeleteTeacher] = useState<any | null>(null);

    const { data: response, isLoading, isError } = useQuery({
        queryKey: [
            "teachers",
            page,
            debouncedSearchTerm,
            selectedGender,
            selectedDepartment,
            selectedEmploymentType
        ],
        queryFn: () => TeacherService.getAllTeachers({
            page,
            limit,
            searchTerm: debouncedSearchTerm || undefined,
            gender: selectedGender === "ALL" ? undefined : selectedGender,
            department: selectedDepartment === "ALL" ? undefined : selectedDepartment,
            employmentType: selectedEmploymentType === "ALL" ? undefined : selectedEmploymentType,
        }),
        placeholderData: keepPreviousData,
    });

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedGender("ALL");
        setSelectedDepartment("ALL");
        setSelectedEmploymentType("ALL");
        setPage(1);
    };

    const hasActiveFilters = searchTerm || selectedGender !== "ALL" || selectedDepartment !== "ALL" || selectedEmploymentType !== "ALL";

    const teachers = response?.data || [];
    const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPage: 1 };

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
                <ShieldAlert className="h-12 w-12 text-destructive mb-2" />
                <p className="text-destructive font-bold text-lg">Failed to load faculty data.</p>
                <p className="text-muted-foreground text-sm">Please check your connection or try again later.</p>
            </div>
        );
    }

    return (
        <PermissionGate 
            required={PERMISSIONS.TEACHER_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Unauthorized Access</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You do not have the required permissions to view the faculty directory. Please contact your administrator.
                    </p>
                </div>
            }
        >
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Faculty Directory</h2>
                        <p className="text-muted-foreground text-sm">Manage records, credentials, and access for all institutional educators.</p>
                    </div>
                    <div className="shrink-0 w-full md:w-auto">
                        <PermissionGate required={PERMISSIONS.TEACHER_CREATE}>
                            <AddTeacherModal />
                        </PermissionGate>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full xl:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="pl-9 h-10 bg-muted/20 border-border"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setPage(1); }}>
                            <SelectTrigger className="flex-1 sm:w-[180px] h-10 bg-muted/20 border-border font-semibold">
                                <Briefcase className="mr-2 h-4 w-4 text-primary/60" />
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Departments</SelectItem>
                                {DEPARTMENTS.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedEmploymentType} onValueChange={(val) => { setSelectedEmploymentType(val); setPage(1); }}>
                            <SelectTrigger className="flex-1 sm:w-[160px] h-10 bg-muted/20 border-border font-semibold">
                                <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Types</SelectItem>
                                <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                <SelectItem value="PART_TIME">Part Time</SelectItem>
                                <SelectItem value="CONTRACT">Contract</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedGender} onValueChange={(val) => { setSelectedGender(val); setPage(1); }}>
                            <SelectTrigger className="flex-1 sm:w-[140px] h-10 bg-muted/20 border-border font-semibold">
                                <UserCircle className="mr-2 h-4 w-4 text-primary/60" />
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Genders</SelectItem>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={handleClearFilters} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-10 px-4 rounded-lg font-bold text-xs uppercase tracking-widest">
                                <FilterX className="h-4 w-4 mr-2" /> Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Data Table Section */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                    <div className="overflow-x-auto flex-grow">
                        <Table>
                            <TableHeader className="bg-muted/30 border-b border-border">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold text-foreground">Faculty Member</TableHead>
                                    <TableHead className="font-bold text-foreground">EMP ID</TableHead>
                                    <TableHead className="font-bold text-foreground">Position & Dept</TableHead>
                                    <TableHead className="font-bold text-foreground">Job Type</TableHead>
                                    <TableHead className="font-bold text-foreground">Status</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-zinc-500">
                                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-zinc-400" />
                                                <p className="font-bold uppercase tracking-widest text-xs">Accessing personnel records...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : teachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                                                <Users className="h-16 w-16 mx-auto" />
                                                <p className="font-bold uppercase tracking-widest text-sm">No Faculty Found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teachers.map((teacher: any) => (
                                        <TableRow key={teacher.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-border ring-1 ring-border/20">
                                                        <AvatarImage src={teacher.profileImage} alt={teacher.firstName} className="object-cover" />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                                            {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">
                                                            {teacher.firstName} {teacher.lastName}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 font-semibold text-muted-foreground text-[11px] mt-0.5">
                                                            <Mail className="h-3 w-3" /> {teacher.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-mono text-[11px] font-bold bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/50 tracking-wider">
                                                    {teacher.employeeId || "N/A"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-bold text-foreground/90 uppercase tracking-tight">{teacher.designation || "N/A"}</span>
                                                    <span className="text-[11px] font-bold text-primary tracking-widest opacity-80">{teacher.department || "No Dept"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 border shadow-none",
                                                        teacher.employmentType === "FULL_TIME" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                        teacher.employmentType === "PART_TIME" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                                                        "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                                    )}
                                                >
                                                    {teacher.employmentType?.replace("_", " ") || "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "h-2 w-2 rounded-full",
                                                        teacher.user?.status === "ACTIVE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                                    )} />
                                                    <span className={cn(
                                                        "text-sm font-bold capitalize",
                                                        teacher.user?.status === "ACTIVE" ? "text-emerald-600" : "text-rose-600"
                                                    )}>
                                                        {teacher.user?.status?.toLowerCase() || "unknown"}
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
                                                        <PermissionGate required={PERMISSIONS.TEACHER_VIEW}>
                                                            <DropdownMenuItem onClick={() => setViewTeacherId(teacher.id)} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" /> View Profile
                                                            </DropdownMenuItem>
                                                        </PermissionGate>
                                                        
                                                        <PermissionGate required={PERMISSIONS.TEACHER_EDIT}>
                                                            <DropdownMenuItem onClick={() => setEditTeacherId(teacher.id)} className="cursor-pointer text-blue-600 focus:text-blue-700">
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                            </DropdownMenuItem>
                                                        </PermissionGate>

                                                        <PermissionGate required={PERMISSIONS.TEACHER_DELETE}>
                                                            <DropdownMenuItem onClick={() => setDeleteTeacher(teacher)} className="cursor-pointer text-rose-600 focus:text-rose-700">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Remove Faculty
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

                    {/* Pagination Footer */}
                    {!isLoading && meta.total > 0 && (
                        <div className="border-t border-border bg-muted/20 p-4 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-bold">
                                Showing <span className="text-foreground">{((meta.page - 1) * meta.limit) + 1}</span> to <span className="text-foreground">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-foreground">{meta.total}</span> faculty records
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
                <ViewTeacherModal
                    teacherId={viewTeacherId || ""}
                    open={!!viewTeacherId}
                    onOpenChange={(open) => !open && setViewTeacherId(null)}
                />

                <EditTeacherModal
                    teacherId={editTeacherId || ""}
                    open={!!editTeacherId}
                    onOpenChange={(open) => !open && setEditTeacherId(null)}
                />

                <DeleteTeacherModal
                    teacher={deleteTeacher}
                    open={!!deleteTeacher}
                    onOpenChange={(open) => !open && setDeleteTeacher(null)}
                />
            </div>
        </PermissionGate>
    );
}