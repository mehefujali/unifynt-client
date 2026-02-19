"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Users } from "lucide-react";
import { TeacherService } from "@/services/teacher.service";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { AddTeacherModal } from "./add-teacher-modal";

export default function TeachersPage() {
    const { data: teachers, isLoading, isError } = useQuery({
        queryKey: ["teachers"],
        queryFn: () => TeacherService.getAllTeachers(), // Pass required query params if any
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
                <p className="text-destructive font-bold text-lg">Failed to load teachers data.</p>
                <p className="text-muted-foreground text-sm">Please check your connection or try again later.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Teacher Management</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">
                            Manage records, credentials, and access for all educators.
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <AddTeacherModal />
                </div>
            </div>

            <div className="bg-background rounded-xl border shadow-sm p-4">
                <DataTable columns={columns} data={teachers || []} />
            </div>
        </div>
    );
}