/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  UserCircle, 
  Briefcase, 
  Mail,
  ShieldCheck
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
import { Badge } from "@/components/ui/badge";
import { ViewTeacherModal } from "./view-teacher-modal";
import { EditTeacherModal } from "./edit-teacher-modal";
import { DeleteTeacherModal } from "./delete-teacher-modal";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

const TeacherActions = ({ teacher }: { teacher: any }) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { hasPermission } = usePermission();
  const canModify = hasPermission([PERMISSIONS.TEACHER_EDIT, PERMISSIONS.TEACHER_DELETE]);

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
            Faculty Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="opacity-50" />

          <PermissionGate required={PERMISSIONS.TEACHER_VIEW}>
            <DropdownMenuItem 
              onClick={() => setIsViewModalOpen(true)} 
              className="cursor-pointer font-bold text-[13px] py-2.5"
            >
              <Eye className="mr-2.5 h-4 w-4 text-slate-400" /> View Profile
            </DropdownMenuItem>
          </PermissionGate>

          <PermissionGate required={PERMISSIONS.TEACHER_EDIT}>
            <DropdownMenuItem 
              onClick={() => setIsEditModalOpen(true)} 
              className="cursor-pointer font-bold text-[13px] py-2.5 text-blue-600 focus:text-blue-700 focus:bg-blue-50"
            >
              <Edit className="mr-2.5 h-4 w-4" /> Edit Details
            </DropdownMenuItem>
          </PermissionGate>

          {canModify && <DropdownMenuSeparator className="opacity-50" />}

          <PermissionGate required={PERMISSIONS.TEACHER_DELETE}>
            <DropdownMenuItem 
              onClick={() => setIsDeleteModalOpen(true)} 
              className="cursor-pointer font-bold text-[13px] py-2.5 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
            >
              <Trash2 className="mr-2.5 h-4 w-4" /> Remove Faculty
            </DropdownMenuItem>
          </PermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewTeacherModal
        teacherId={teacher.id}
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      />

      <EditTeacherModal
        teacherId={teacher.id}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />

      <DeleteTeacherModal
        teacher={teacher}
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
    </>
  );
};

export const columns: ColumnDef<any>[] = [
  {
    id: "profile",
    header: () => <span className="pl-2">Faculty Member</span>,
    cell: ({ row }) => {
      const teacher = row.original;
      const fullName = `${teacher.firstName} ${teacher.lastName}`;
      const initials = `${teacher.firstName?.charAt(0) || ""}${teacher.lastName?.charAt(0) || ""}`;
      
      return (
        <div className="flex items-center gap-3 py-1 pl-2">
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-border/50">
            <AvatarImage src={teacher.profileImage} className="object-cover" />
            <AvatarFallback className="bg-primary/5 text-primary font-black text-[10px] uppercase">
              {initials || <UserCircle className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-black text-[14px] truncate max-w-[160px] text-slate-900 dark:text-white tracking-tight leading-none mb-1">
              {fullName}
            </span>
            <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-300" />
                <span className="text-[11px] font-bold text-slate-400 truncate max-w-[170px]">
                    {teacher.user?.email || "No email provided"}
                </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "employeeId",
    header: "EMP ID",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 px-2.5 py-1 rounded border border-slate-200 dark:border-white/10 tracking-widest shadow-sm">
        {row.original.employeeId || "N/A"}
      </span>
    ),
  },
  {
    id: "position",
    header: "Position",
    cell: ({ row }) => {
      const designation = row.original.designation;
      const dept = row.original.department;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
            <Briefcase className="h-3.5 w-3.5 text-primary/60" />
            <span className="font-black text-[12px] uppercase tracking-tight">
                {designation || "N/A"}
            </span>
          </div>
          {dept && (
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-5">
                {dept}
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "employmentType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.employmentType;
      const typeConfig: Record<string, string> = {
        FULL_TIME: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        PART_TIME: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        CONTRACT: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      };

      const config = typeConfig[type] || "bg-slate-500/10 text-slate-600 border-slate-500/20";

      return (
        <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 border shadow-none transition-all ${config}`}>
          {type ? type.replace("_", " ") : "N/A"}
        </Badge>
      );
    }
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.user?.status;
      const isActive = status === "ACTIVE";
      return (
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
          <span className={`text-[10px] font-black tracking-[1px] ${isActive ? "text-emerald-600" : "text-rose-600"}`}>
            {isActive ? "ACTIVE" : "BLOCKED"}
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
        <TeacherActions teacher={row.original} />
      </div>
    ),
  },
];