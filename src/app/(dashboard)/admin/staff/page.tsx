/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
    Loader2, UserCog, Search, Plus, FilterX, 
    ShieldAlert, Mail, MoreHorizontal, Eye, Edit, Trash2,
    ChevronLeft, ChevronRight, GraduationCap, Shield, UserCircle
} from "lucide-react";
import { StaffService } from "@/services/staff.service";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { AddStaffModal } from "./add-staff-modal";
import { ViewStaffModal } from "./view-staff-modal";
import { EditStaffModal } from "./edit-staff-modal";
import { DeleteStaffModal } from "./delete-staff-modal";
import { ManagePermissionsModal } from "./manage-permissions-modal";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function StaffPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [selectedRole, setSelectedRole] = useState<string>("ALL");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");

    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Modal states
    const [viewStaff, setViewStaff] = useState<any | null>(null);
    const [editStaff, setEditStaff] = useState<any | null>(null);
    const [deleteStaff, setDeleteStaff] = useState<any | null>(null);
    const [permStaff, setPermStaff] = useState<any | null>(null);

    const { data: staffList, isLoading, isError, isFetching } = useQuery({
        queryKey: ["staff"],
        queryFn: () => StaffService.getAllStaff(),
    });

    // Filtering Logic
    const filteredData = useMemo(() => {
        if (!staffList || !Array.isArray(staffList)) return [];

        return staffList.filter((staff: any) => {
            if (debouncedSearchTerm) {
                const searchLower = debouncedSearchTerm.toLowerCase();
                const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
                const matchesSearch = 
                    fullName.includes(searchLower) ||
                    staff.employeeId?.toLowerCase().includes(searchLower) ||
                    staff.phone?.includes(debouncedSearchTerm) ||
                    staff.email?.toLowerCase().includes(searchLower) ||
                    staff.user?.email?.toLowerCase().includes(searchLower);
                
                if (!matchesSearch) return false;
            }

            if (selectedDepartment !== "ALL" && staff.department !== selectedDepartment) return false;
            
            if (selectedRole !== "ALL") {
                const role = staff.user?.role || (staff.isTeacher ? "TEACHER" : "STAFF");
                if (role !== selectedRole) return false;
            }

            return true;
        });
    }, [staffList, debouncedSearchTerm, selectedDepartment, selectedRole]);

    // Unique Departments for filter
    const departments = useMemo(() => {
        if (!staffList || !Array.isArray(staffList)) return [];
        const depts = new Set<string>();
        staffList.forEach(s => { if (s.department) depts.add(s.department); });
        return Array.from(depts).sort();
    }, [staffList]);

    // Pagination
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, page]);

    const handleClearFilters = () => {
        setSearchTerm("");
        setSelectedRole("ALL");
        setSelectedDepartment("ALL");
        setPage(1);
    };

    const hasActiveFilters = searchTerm || selectedRole !== "ALL" || selectedDepartment !== "ALL";

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
                <ShieldAlert className="h-12 w-12 text-destructive mb-2" />
                <p className="text-destructive font-bold text-lg">Failed to load staff records.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Try Refreshing</Button>
            </div>
        );
    }

    return (
        <PermissionGate 
            required={PERMISSIONS.STAFF_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Access Restricted</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You do not have authorization to view the staff directory. Please contact the administrative department if you require access.
                    </p>
                </div>
            }
        >
            <div className="p-6 space-y-6 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Personnel Directory</h2>
                        <p className="text-muted-foreground text-sm">Oversee and manage institutional employees, access rights, and profile data.</p>
                    </div>
                    <div className="shrink-0 w-full md:w-auto">
                        <PermissionGate required={PERMISSIONS.STAFF_CREATE}>
                            <AddStaffModal />
                        </PermissionGate>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full xl:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, ID, or contact..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            className="pl-9 h-10 bg-muted/20 border-border"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <Select value={selectedDepartment} onValueChange={(val) => { setSelectedDepartment(val); setPage(1); }}>
                            <SelectTrigger className="flex-1 sm:w-[180px] h-10 bg-muted/20 border-border font-semibold">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Departments</SelectItem>
                                {departments.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedRole} onValueChange={(val) => { setSelectedRole(val); setPage(1); }}>
                            <SelectTrigger className="flex-1 sm:w-[160px] h-10 bg-muted/20 border-border font-semibold">
                                <SelectValue placeholder="System Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                                <SelectItem value="TEACHER">Teacher</SelectItem>
                                <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                <SelectItem value="STAFF">Support Staff</SelectItem>
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
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">
                    {isFetching && (
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-primary/10 overflow-hidden z-10">
                            <div className="h-full bg-primary animate-pulse w-1/3"></div>
                        </div>
                    )}
                    <div className="overflow-x-auto flex-grow">
                        <Table>
                            <TableHeader className="bg-muted/30 border-b border-border">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold text-foreground">Employee Details</TableHead>
                                    <TableHead className="font-bold text-foreground">Employee ID</TableHead>
                                    <TableHead className="font-bold text-foreground">Department & Post</TableHead>
                                    <TableHead className="font-bold text-foreground">System Role</TableHead>
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
                                                <p className="font-bold uppercase tracking-widest text-xs">Synchronizing payroll data...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                                                <UserCog className="h-16 w-16 mx-auto" />
                                                <p className="font-bold uppercase tracking-widest text-sm">No Employees Found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((staff: any) => {
                                        const fullName = `${staff.firstName} ${staff.lastName}`;
                                        const role = staff.user?.role || (staff.isTeacher ? "TEACHER" : "STAFF");
                                        const isActive = (staff.user?.status || staff.status) === "ACTIVE";

                                        return (
                                            <TableRow key={staff.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border border-border ring-1 ring-border/20">
                                                            <AvatarImage src={staff.profileImage} alt={fullName} className="object-cover" />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                                                                {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-bold text-foreground">{fullName}</span>
                                                                {staff.isTeacher && (
                                                                    <div className="bg-blue-500/10 p-0.5 rounded" title="Faculty Member">
                                                                        <GraduationCap className="h-3 w-3 text-blue-600" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-semibold text-muted-foreground text-[11px] mt-0.5">
                                                                <Mail className="h-3 w-3" /> {staff.user?.email || staff.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-[11px] font-bold bg-muted/60 text-muted-foreground px-2 py-0.5 rounded border border-border/50 tracking-wider">
                                                        {staff.employeeId || "N/A"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-bold text-foreground/90 uppercase tracking-tight">{staff.department || "Unassigned"}</span>
                                                        <span className="text-[11px] font-bold text-muted-foreground uppercase opacity-80">{staff.designation || "Support"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            "font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 border shadow-none",
                                                            role === "SUPER_ADMIN" ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                                                            role === "SCHOOL_ADMIN" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                            role === "TEACHER" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" :
                                                            role === "ACCOUNTANT" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                            "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                                        )}
                                                    >
                                                        {role.replace("_", " ")}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                                        )} />
                                                        <span className={cn(
                                                            "text-[10px] font-black tracking-widest uppercase",
                                                            isActive ? "text-emerald-600" : "text-rose-600"
                                                        )}>
                                                            {isActive ? "Active" : "Blocked"}
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
                                                        <DropdownMenuContent align="end" className="w-[190px]">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-3 py-2">General Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => setViewStaff(staff)} className="cursor-pointer font-bold text-[13px]">
                                                                <Eye className="mr-2.5 h-4 w-4 text-slate-400" /> View Details
                                                            </DropdownMenuItem>
                                                            
                                                            <PermissionGate required={PERMISSIONS.STAFF_EDIT}>
                                                                <DropdownMenuItem onClick={() => setEditStaff(staff)} className="cursor-pointer font-bold text-[13px] text-blue-600 focus:text-blue-700">
                                                                    <Edit className="mr-2.5 h-4 w-4" /> Edit Profile
                                                                </DropdownMenuItem>
                                                            </PermissionGate>

                                                            <PermissionGate required={PERMISSIONS.STAFF_EDIT}>
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-3 py-2">Security</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => setPermStaff(staff)} className="cursor-pointer font-bold text-[13px] text-indigo-600 focus:text-indigo-700">
                                                                        <Shield className="mr-2.5 h-4 w-4" /> Permissions
                                                                    </DropdownMenuItem>
                                                                </>
                                                            </PermissionGate>

                                                            <PermissionGate required={PERMISSIONS.STAFF_DELETE}>
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => setDeleteStaff(staff)} className="cursor-pointer font-bold text-[13px] text-rose-600 focus:text-rose-700">
                                                                        <Trash2 className="mr-2.5 h-4 w-4" /> Delete Account
                                                                    </DropdownMenuItem>
                                                                </>
                                                            </PermissionGate>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    {!isLoading && totalItems > 0 && (
                        <div className="border-t border-border bg-muted/20 p-4 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground font-bold">
                                Showing <span className="text-foreground">{((page - 1) * pageSize) + 1}</span> to <span className="text-foreground">{Math.min(page * pageSize, totalItems)}</span> of <span className="text-foreground">{totalItems}</span> personnel
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="px-3 text-xs font-bold text-foreground/70 bg-background/50 py-1 rounded-md border border-border/50">
                                    Page {page} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <ViewStaffModal staff={viewStaff} open={!!viewStaff} onClose={() => setViewStaff(null)} />
                <EditStaffModal staff={editStaff} open={!!editStaff} onClose={() => setEditStaff(null)} />
                <DeleteStaffModal staff={deleteStaff} open={!!deleteStaff} onClose={() => setDeleteStaff(null)} />
                <ManagePermissionsModal staff={permStaff} isOpen={!!permStaff} onClose={() => setPermStaff(null)} />
            </div>
        </PermissionGate>
    );
}