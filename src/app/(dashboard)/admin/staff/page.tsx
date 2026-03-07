/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, UserCog, ShieldAlert } from "lucide-react";

import { DataTable } from "./data-table";
import { columns } from "./columns";
import { AddStaffModal } from "./add-staff-modal";
import { useDebounce } from "@/hooks/use-debounce";
import { StaffService } from "@/services/staff.service";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function StaffPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: staffList, isLoading, isError, isFetching } = useQuery({
        queryKey: ["staff"],
        queryFn: () => StaffService.getAllStaff(),
    });

    // Professional Filtering Logic
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

            if (selectedDepartment && staff.department !== selectedDepartment) return false;
            
            if (selectedRole) {
                const role = staff.user?.role || (staff.isTeacher ? "TEACHER" : "STAFF");
                if (role !== selectedRole) return false;
            }

            return true;
        });
    }, [staffList, debouncedSearchTerm, selectedDepartment, selectedRole]);

    // Client-side Pagination Logic
    const paginatedData = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return filteredData.slice(start, end);
    }, [filteredData, pagination]);

    const pageCount = Math.ceil(filteredData.length / pagination.pageSize);

    if (isLoading && !staffList) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
                <p className="text-destructive font-bold text-lg">Failed to load staff data.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="text-primary hover:underline font-medium"
                >
                    Try refreshing the page
                </button>
            </div>
        );
    }

    return (
        // 🔒 Gate for Entire Staff Directory Access
        <PermissionGate 
            required={PERMISSIONS.STAFF_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You do not have authorization to view the staff directory. Please contact the administrative department if you require access.
                    </p>
                </div>
            }
        >
            <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <UserCog className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight">Staff & Faculty</h1>
                            <p className="text-muted-foreground text-sm font-medium mt-1">
                                Manage all employees including teachers, admins, and support staff.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 w-full sm:w-auto">
                        {/* 🔒 Gate for Add Staff Action */}
                        <PermissionGate required={PERMISSIONS.STAFF_CREATE}>
                            <AddStaffModal />
                        </PermissionGate>
                    </div>
                </div>

                <div className="bg-background rounded-xl border shadow-sm p-0 overflow-hidden relative">
                    {isFetching && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-50">
                            <div className="h-full bg-primary animate-progress-loading w-full"></div>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={paginatedData}
                        pageCount={pageCount}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedRole={selectedRole}
                        setSelectedRole={setSelectedRole}
                        selectedDepartment={selectedDepartment}
                        setSelectedDepartment={setSelectedDepartment}
                    />
                </div>
            </div>
        </PermissionGate>
    );
}