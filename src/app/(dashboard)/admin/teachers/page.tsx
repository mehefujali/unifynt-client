 
"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Loader2, Users, ShieldAlert } from "lucide-react";
import { TeacherService } from "@/services/teacher.service";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { AddTeacherModal } from "./add-teacher-modal";
import { useDebounce } from "@/hooks/use-debounce";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function TeachersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [selectedGender, setSelectedGender] = useState<string>("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>("");

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: response, isLoading, isError, isFetching } = useQuery({
        queryKey: [
            "teachers",
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearchTerm,
            selectedGender,
            selectedDepartment,
            selectedEmploymentType
        ],
        queryFn: () => TeacherService.getAllTeachers({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            searchTerm: debouncedSearchTerm || undefined,
            gender: selectedGender || undefined,
            department: selectedDepartment || undefined,
            employmentType: selectedEmploymentType || undefined,
        }),
        placeholderData: keepPreviousData,
    });

    if (isLoading && !response) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
                <p className="text-destructive font-bold text-lg">Failed to load teachers data.</p>
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
            <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight uppercase">Teacher Management</h1>
                            <p className="text-muted-foreground text-sm font-medium mt-1">
                                Manage records, credentials, and access for all educators.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <PermissionGate required={PERMISSIONS.TEACHER_CREATE}>
                            <AddTeacherModal />
                        </PermissionGate>
                    </div>
                </div>

                <div className="bg-background rounded-xl border shadow-sm p-0 overflow-hidden relative transition-all">
                    {isFetching && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-50 overflow-hidden">
                            <div className="h-full bg-primary/60 animate-pulse w-1/2 rounded-full"></div>
                        </div>
                    )}

                    <DataTable
                        columns={columns}
                        data={response?.data || []}
                        pageCount={response?.meta?.totalPage || -1}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedGender={selectedGender}
                        setSelectedGender={setSelectedGender}
                        selectedDepartment={selectedDepartment}
                        setSelectedDepartment={setSelectedDepartment}
                        selectedEmploymentType={selectedEmploymentType}
                        setSelectedEmploymentType={setSelectedEmploymentType}
                    />
                </div>
            </div>
        </PermissionGate>
    );
}