/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { DeleteStudentModal } from "./delete-student-modal";
import ViewStudentModal from "./view-student-modal";
import EditStudentModal from "./edit-student-modal";

const StudentActions = ({ student }: { student: any }) => {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

                    <DropdownMenuItem onClick={() => setIsDeleteModalOpen(true)} className="cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* FIXED: Passed student.id, and used isOpen/onClose */}
            <ViewStudentModal
                studentId={student.id}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />

            {/* FIXED: Used isOpen/onClose */}
            <EditStudentModal
                studentId={student.id}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            {/* Delete Modal uses open/onOpenChange natively */}
            <DeleteStudentModal
                student={student}
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
            />
        </>
    );
};

export const columns: ColumnDef<any>[] = [
    {
        // FIXED: Added accessorFn to avoid Typescript errors from Tanstack Table
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: "profile",
        header: "Student Info",
        cell: ({ row }) => {
            const student = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border shadow-sm">
                        <AvatarImage src={student.profileImage} className="object-cover" />
                        {/* FIXED: Added fallback string to avoid crash if name is null */}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {student.firstName?.charAt(0) || "U"}{student.lastName?.charAt(0) || "N"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm truncate max-w-[150px]">
                            {student.firstName} {student.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {student.studentId || student.admissionNumber || "No ID"}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "rollNumber",
        header: "Roll No",
        cell: ({ row }) => (
            <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded-md border shadow-sm">
                {row.original.rollNumber || "N/A"}
            </span>
        ),
    },
    {
        accessorFn: (row) => `${row.class?.name || ""} ${row.section?.name || ""}`,
        id: "academic",
        header: "Class & Section",
        cell: ({ row }) => {
            const className = row.original.class?.name;
            const sectionName = row.original.section?.name;
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">Class {className || "N/A"}</span>
                    {sectionName && <span className="text-xs text-muted-foreground">Sec: {sectionName}</span>}
                </div>
            );
        }
    },
    {
        accessorFn: (row) => row.fatherName || row.localGuardianName || "N/A",
        id: "guardian",
        header: "Guardian",
        cell: ({ row }) => {
            const guardian = row.original.fatherName || row.original.localGuardianName;
            const phone = row.original.fatherPhone || row.original.localGuardianPhone;
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">{guardian || "N/A"}</span>
                    <span className="text-xs text-muted-foreground">{phone || "N/A"}</span>
                </div>
            );
        }
    },
    {
        accessorFn: (row) => row.user?.status,
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.user?.status;
            return status === "ACTIVE"
                ? <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                : <Badge variant="destructive">Inactive</Badge>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <StudentActions student={row.original} />,
    },
];