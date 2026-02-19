/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { ViewStudentModal } from "./view-student-modal";
import { EditStudentModal } from "./edit-student-modal";
import { StudentService } from "@/services/student.service";

const StudentActions = ({ student }: { student: any }) => {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => StudentService.deleteStudent(student.id),
        onSuccess: () => {
            toast.success("Student deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: () => toast.error("Failed to delete student"),
    });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px] shadow-lg">
                    <DropdownMenuLabel className="font-bold text-xs uppercase text-muted-foreground tracking-wider">Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => setIsViewModalOpen(true)} className="cursor-pointer font-medium">
                        <Eye className="mr-2 h-4 w-4 text-primary" /> View Details
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="cursor-pointer font-medium">
                        <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit Profile
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this student?")) {
                                deleteMutation.mutate();
                            }
                        }}
                        className="cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ViewStudentModal
                student={student}
                open={isViewModalOpen}
                onOpenChange={setIsViewModalOpen}
            />

            <EditStudentModal
                studentId={student.id}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
            />
        </>
    );
};

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: "profile",
        header: "Student Name",
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className="flex items-center gap-3 min-w-[200px]">
                    <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={student.profileImage} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm truncate max-w-[150px]">
                            {student.firstName} {student.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded-md mt-0.5 w-fit">
                            {student.studentId || student.admissionNumber || "No ID"}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "academic",
        header: "Class & Section",
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-primary">Class {student.class?.name || "N/A"}</span>
                    <span className="text-xs font-semibold text-muted-foreground">Sec: {student.section?.name || "N/A"} • Roll: {student.rollNumber}</span>
                </div>
            );
        }
    },
    {
        accessorKey: "guardian",
        header: "Guardian",
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{student.fatherName || student.localGuardianName || "N/A"}</span>
                    <span className="text-xs text-muted-foreground">{student.fatherPhone || student.localGuardianPhone || "No Phone"}</span>
                </div>
            );
        }
    },
    {
        accessorKey: "status",
        header: "Account Status",
        cell: ({ row }) => {
            const status = row.original.user?.status;
            return status === "ACTIVE"
                ? <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-sm">Active</Badge>
                : <Badge variant="destructive" className="shadow-sm">Suspended</Badge>;
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <StudentActions student={row.original} />,
    },
];