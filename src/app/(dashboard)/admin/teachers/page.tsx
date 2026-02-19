"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { TeacherService } from "@/services/teacher.service";
import { DataTable } from "./data-table";
import { AddTeacherModal } from "./add-teacher-modal";

export default function TeachersPage() {
    const { data: teachers, isLoading, isError } = useQuery({
        queryKey: ["teachers"],
        queryFn: TeacherService.getAllTeachers,
    });

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center text-destructive">
                Failed to load teachers data.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
                    <p className="text-muted-foreground">
                        Manage and view all registered teachers.
                    </p>
                </div>
                <AddTeacherModal />
            </div>
            <DataTable data={teachers || []} />
        </div>
    );
}