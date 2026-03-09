/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
    MoreHorizontal,
    Eye,
    Edit,
    UserCircle,
    GraduationCap,
    Phone,
} from "lucide-react";

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

import ViewStudentModal from "./view-student-modal";
import EditStudentModal from "./edit-student-modal";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

const StudentActions = ({ student }: { student: any }) => {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full transition-all">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[190px] animate-in fade-in-50 zoom-in-95 rounded-xl shadow-xl border-border/50">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-3 py-2">
                        Student Control
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="opacity-50" />

                    <PermissionGate required={PERMISSIONS.STUDENT_VIEW}>
                        <DropdownMenuItem
                            onClick={() => setIsViewModalOpen(true)}
                            className="cursor-pointer font-bold text-[13px] py-2.5"
                        >
                            <Eye className="mr-2.5 h-4 w-4 text-slate-400" /> View Profile
                        </DropdownMenuItem>
                    </PermissionGate>

                    <PermissionGate required={PERMISSIONS.STUDENT_EDIT}>
                        <DropdownMenuItem
                            onClick={() => setIsEditModalOpen(true)}
                            className="cursor-pointer font-bold text-[13px] py-2.5 text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                        >
                            <Edit className="mr-2.5 h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                    </PermissionGate>
                </DropdownMenuContent>
            </DropdownMenu>

            <ViewStudentModal
                studentId={student.id}
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
            />

            <EditStudentModal
                studentId={student.id}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />
        </>
    );
};

export const columns: ColumnDef<any>[] = [
    {
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        id: "profile",
        header: () => <span className="pl-2">Student Identity</span>,
        cell: ({ row }) => {
            const student = row.original;
            const fullName = `${student.firstName} ${student.lastName}`;
            const initials = `${student.firstName?.charAt(0) || ""}${student.lastName?.charAt(0) || ""}`;

            return (
                <div className="flex items-center gap-3 py-1 pl-2">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-border/50">
                        <AvatarImage src={student.profileImage} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black text-[10px] uppercase">
                            {initials || <UserCircle className="h-5 w-5" />}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-black text-[14px] truncate max-w-[160px] text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                            {fullName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            ID: {student.studentId || student.admissionNumber || "N/A"}
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
            <span className="font-mono text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10 tracking-widest shadow-sm">
                {row.original.rollNumber || "N/A"}
            </span>
        ),
    },
    {
        accessorFn: (row) => `${row.class?.name || ""} ${row.section?.name || ""}`,
        id: "academic",
        header: "Academics",
        cell: ({ row }) => {
            const className = row.original.class?.name;
            const sectionName = row.original.section?.name;
            return (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-primary" />
                        <span className="font-black text-[12px] text-slate-700 dark:text-slate-200 uppercase tracking-tight">
                            Class {className || "N/A"}
                        </span>
                    </div>
                    {sectionName && (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">
                            Section {sectionName}
                        </span>
                    )}
                </div>
            );
        }
    },
    {
        accessorFn: (row) => row.admissionApplication?.fatherName || row.admissionApplication?.localGuardianName || "N/A",
        id: "guardian",
        header: "Guardian",
        cell: ({ row }) => {
            const guardian = row.original.admissionApplication?.fatherName || row.original.admissionApplication?.localGuardianName;
            const phone = row.original.admissionApplication?.fatherPhone || row.original.admissionApplication?.localGuardianPhone;
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-[13px] text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {guardian || "N/A"}
                    </span>
                    {phone && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3 text-slate-300" />
                            <span className="text-[11px] font-medium text-slate-400 tracking-tight">{phone}</span>
                        </div>
                    )}
                </div>
            );
        }
    },
    {
        accessorFn: (row) => row.user?.status,
        id: "status",
        header: "System Status",
        cell: ({ row }) => {
            const status = row.original.user?.status;
            const isActive = status === "ACTIVE";
            return (
                <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-50 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
                    <span className={`text-[10px] font-black tracking-[1px] ${isActive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-6 font-black text-[11px] uppercase text-slate-400 tracking-[2px]">Manage</div>,
        cell: ({ row }) => (
            <div className="text-right pr-4">
                <StudentActions student={row.original} />
            </div>
        ),
    },
];