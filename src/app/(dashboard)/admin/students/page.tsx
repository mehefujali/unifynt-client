"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, GraduationCap } from "lucide-react";
import { StudentService } from "@/services/student.service";

import { AddStudentModal } from "./add-student-modal";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function StudentsPage() {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [searchTerm, setSearchTerm] = useState("");

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ["students", pagination.pageIndex, pagination.pageSize, debouncedSearchTerm],
        queryFn: () => StudentService.getAllStudents({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            searchTerm: debouncedSearchTerm
        }),
    });

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
                <p className="text-destructive font-bold text-lg">Failed to load student data.</p>
                <p className="text-muted-foreground text-sm">Please check your connection or try again later.</p>
            </div>
        );
    }

    const students = response?.data || [];
    const meta = response?.meta || { total: 0, totalPage: 0, page: 1, limit: 10 };

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
                            Manage enrollments, academic records, and parent information.
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <AddStudentModal />
                </div>
            </div>

            <div className="bg-background rounded-xl border shadow-sm p-4">
                <DataTable
                    columns={columns}
                    data={students}
                    pageCount={meta.totalPage}
                    pagination={pagination}
                    setPagination={setPagination}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    totalRecords={meta.total}
                />
            </div>
        </div>
    );
}