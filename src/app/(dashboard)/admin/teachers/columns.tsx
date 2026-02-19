/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
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
import { ViewTeacherModal } from "./view-teacher-modal";
import { EditTeacherModal } from "./edit-teacher-modal";

// Actions Cell Component to manage local state cleanly
const TeacherActions = ({ teacher }: { teacher: any }) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
          <DropdownMenuItem className="cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Teacher
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Integrate Modals */}
      <ViewTeacherModal
        teacher={teacher}
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
      />

      <EditTeacherModal
        teacherId={teacher.id}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  );
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "profile",
    header: "Teacher Info",
    cell: ({ row }) => {
      const teacher = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border shadow-sm">
            <AvatarImage src={teacher.profileImage} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm truncate max-w-[150px]">
              {teacher.firstName} {teacher.lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {teacher.user?.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "employeeId",
    header: "EMP ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-bold bg-muted px-2 py-1 rounded-md border shadow-sm">
        {row.original.employeeId || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "designation",
    header: "Designation",
    cell: ({ row }) => {
      const designation = row.original.designation;
      const dept = row.original.department;
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{designation || "N/A"}</span>
          {dept && <span className="text-xs text-muted-foreground">{dept}</span>}
        </div>
      );
    }
  },
  {
    accessorKey: "employmentType",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.employmentType;
      if (type === "FULL_TIME") return <Badge className="bg-blue-500/10 text-blue-600 border-0">Full Time</Badge>;
      if (type === "PART_TIME") return <Badge className="bg-orange-500/10 text-orange-600 border-0">Part Time</Badge>;
      if (type === "CONTRACT") return <Badge className="bg-purple-500/10 text-purple-600 border-0">Contract</Badge>;
      return <Badge variant="outline">{type}</Badge>;
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.user?.status;
      return status === "ACTIVE"
        ? <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">Active</Badge>
        : <Badge variant="destructive">Blocked</Badge>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <TeacherActions teacher={row.original} />,
  },
];