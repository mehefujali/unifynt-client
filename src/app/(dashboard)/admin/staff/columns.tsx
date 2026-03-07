/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  GraduationCap, 
  Shield, 
  UserCircle 
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

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

import { ManagePermissionsModal } from "./manage-permissions-modal";
import { ViewStaffModal } from "./view-staff-modal";
import { EditStaffModal } from "./edit-staff-modal";
import { DeleteStaffModal } from "./delete-staff-modal";

const ActionCell = ({ staff }: { staff: any }) => {
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px] animate-in fade-in-50 zoom-in-95 rounded-xl shadow-xl border-border/50">
          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-3 py-2">General Actions</DropdownMenuLabel>
          
          <DropdownMenuItem 
            className="cursor-pointer font-bold text-[13px] py-2.5"
            onClick={() => setIsViewModalOpen(true)}
          >
            <Eye className="mr-2.5 h-4 w-4 text-slate-400" /> View Details
          </DropdownMenuItem>

          <PermissionGate required={PERMISSIONS.STAFF_EDIT}>
            <DropdownMenuItem 
                className="cursor-pointer font-bold text-[13px] py-2.5 text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                onClick={() => setIsEditModalOpen(true)}
            >
                <Edit className="mr-2.5 h-4 w-4" /> Edit Profile
            </DropdownMenuItem>
          </PermissionGate>
          
          <PermissionGate required={PERMISSIONS.STAFF_EDIT}>
            <>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-3 py-2">Security & Access</DropdownMenuLabel>
                <DropdownMenuItem 
                    className="cursor-pointer font-bold text-[13px] py-2.5 text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50"
                    onClick={() => setIsPermModalOpen(true)}
                >
                    <Shield className="mr-2.5 h-4 w-4" /> Manage Permissions
                </DropdownMenuItem>
            </>
          </PermissionGate>
          
          <PermissionGate required={PERMISSIONS.STAFF_DELETE}>
            <>
                <DropdownMenuSeparator className="opacity-50" />
                <DropdownMenuItem 
                    className="cursor-pointer font-bold text-[13px] py-2.5 text-rose-600 focus:text-rose-700 focus:bg-rose-50"
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    <Trash2 className="mr-2.5 h-4 w-4" /> Delete Account
                </DropdownMenuItem>
            </>
          </PermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewStaffModal staff={staff} open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
      <EditStaffModal staff={staff} open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
      <DeleteStaffModal staff={staff} open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} />
      
      {isPermModalOpen && (
        <ManagePermissionsModal 
          staff={staff} 
          isOpen={isPermModalOpen} 
          onClose={() => setIsPermModalOpen(false)} 
        />
      )}
    </>
  );
};

export const columns: ColumnDef<any>[] = [
  {
    id: "profile",
    header: "Employee Details",
    cell: ({ row }) => {
      const staff = row.original;
      const fullName = `${staff.firstName} ${staff.lastName}`;
      const initials = `${staff.firstName?.charAt(0) || ""}${staff.lastName?.charAt(0) || ""}`;
      
      return (
        <div className="flex items-center gap-3 py-1">
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-border/50">
            <AvatarImage src={staff.profileImage} alt={fullName} />
            <AvatarFallback className="bg-primary/5 text-primary font-black text-[10px] uppercase">
              {initials || <UserCircle className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-[14px] truncate max-w-[140px] text-slate-900 dark:text-white tracking-tight">
                {fullName}
              </span>
              {staff.isTeacher && (
                <div className="bg-blue-500/10 p-0.5 rounded shadow-sm" title="Faculty Member">
                  <GraduationCap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-400 truncate max-w-[170px]">
              {staff.user?.email || staff.email || "No email assigned"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "employeeId",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-1 rounded border border-slate-200 dark:border-white/10 tracking-widest">
        {row.original.employeeId || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => {
      const designation = row.original.designation;
      const dept = row.original.department;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-black text-[12px] text-slate-700 dark:text-slate-200 uppercase tracking-tight">
            {dept || "Unassigned"}
          </span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
            {designation || "General Staff"}
          </span>
        </div>
      );
    }
  },
  {
    id: "role",
    header: "System Role",
    cell: ({ row }) => {
      const role = row.original.user?.role;
      
      const roleConfig: Record<string, string> = {
        SUPER_ADMIN: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        SCHOOL_ADMIN: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        TEACHER: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        ACCOUNTANT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        STAFF: "bg-slate-500/10 text-slate-600 border-slate-500/20",
      };

      const currentRole = role || (row.original.isTeacher ? "TEACHER" : "STAFF");
      const config = roleConfig[currentRole] || roleConfig.STAFF;

      return (
        <Badge variant="outline" className={`font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5 border shadow-none transition-all ${config}`}>
          {currentRole.replace("_", " ")}
        </Badge>
      );
    }
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.user?.status || row.original.status;
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
        <ActionCell staff={row.original} />
      </div>
    ),
  },
];