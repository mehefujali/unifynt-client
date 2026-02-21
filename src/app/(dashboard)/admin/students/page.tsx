// src/app/(dashboard)/admin/students/page.tsx
"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Loader2, GraduationCap } from "lucide-react";
import { StudentService } from "@/services/student.service";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { AddStudentModal } from "./add-student-modal";
import { useDebounce } from "@/hooks/use-debounce";

export default function StudentsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Advanced Filter State
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedSectionId, setSelectedSectionId] = useState<string>("");

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: response, isLoading, isError, isFetching } = useQuery({
        queryKey: ["students", pagination.pageIndex, pagination.pageSize, debouncedSearchTerm, selectedClassId, selectedSectionId],
        queryFn: () => StudentService.getAllStudents({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            searchTerm: debouncedSearchTerm || undefined,
            classId: selectedClassId || undefined,
            sectionId: selectedSectionId || undefined,
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
                <p className="text-destructive font-bold text-lg">Failed to load students data.</p>
                <p className="text-muted-foreground text-sm">Please check your connection or try again later.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Student Directory</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">
                            Manage student enrollments, academic records, and profiles.
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <AddStudentModal />
                </div>
            </div>

            <div className="bg-background rounded-xl border shadow-sm p-0 overflow-hidden relative">
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
                    selectedClassId={selectedClassId}
                    setSelectedClassId={setSelectedClassId}
                    selectedSectionId={selectedSectionId}
                    setSelectedSectionId={setSelectedSectionId}
                />
            </div>
        </div>
    );
}