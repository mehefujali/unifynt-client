"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NoticeService } from "@/services/notice.service";
import { DataTable } from "./data-table";
import { format } from "date-fns";
import { Plus, Link2, FileText, MoreHorizontal, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import NoticeFormModal from "./notice-form-modal";
import DeleteNoticeModal from "./delete-notice-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeColor } from "@/providers/theme-color-provider";
import { cn } from "@/lib/utils";
import { PermissionGate } from "@/components/common/permission-gate";
import { PERMISSIONS } from "@/config/permissions";

export default function NoticesPage() {
  const [page, setPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);
  const { currentThemeId } = useThemeColor();

  const isEnhanced = currentThemeId !== "standard";
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notices", page],
    queryFn: () => NoticeService.getAllNotices({ page, limit }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-4 py-1">
          <div className={cn(
            "h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-xl transition-all border border-border shadow-sm",
            isEnhanced ? "bg-primary/5 text-primary" : "bg-muted/30 text-muted-foreground"
          )}>
            {row.original.link ? (
              <a href={row.original.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Link2 className="h-5 w-5" />
              </a>
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground leading-tight">{row.original.title}</span>
            <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[250px] font-medium">{row.original.content}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "isPublic",
      header: "Visibility",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn(
            "uppercase tracking-widest text-[9px] font-bold px-2.5 py-0.5 rounded-md",
            row.original.isPublic 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-muted text-muted-foreground border-border"
        )}>
          {row.original.isPublic ? "Public" : "Internal"}
        </Badge>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px] rounded-xl font-medium shadow-xl border-slate-100 dark:border-slate-800">
            <PermissionGate required={PERMISSIONS.NOTICE_EDIT}>
              <DropdownMenuItem onClick={() => {
                setSelectedNoticeId(row.original.id);
                setIsFormModalOpen(true);
              }} className="py-2.5 cursor-pointer text-[13px] tracking-tight hover:bg-slate-50 dark:hover:bg-slate-900">
                Edit Notice
              </DropdownMenuItem>
            </PermissionGate>
            
            <PermissionGate required={PERMISSIONS.NOTICE_DELETE}>
              <DropdownMenuItem onClick={() => {
                setSelectedNoticeId(row.original.id);
                setIsDeleteModalOpen(true);
              }} className="py-2.5 cursor-pointer text-[13px] tracking-tight text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
                Delete Notice
              </DropdownMenuItem>
            </PermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <PermissionGate 
      required={PERMISSIONS.NOTICE_VIEW}
      fallback={
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Unauthorized Access</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto font-medium">
            You do not have the required permissions to access the institutional notice board. Please contact your administrator for assistance.
          </p>
        </div>
      }
    >
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Notice Board</h1>
            <p className="text-[13px] font-medium text-muted-foreground">Manage and broadcast institutional announcements across departments.</p>
        </div>
        <PermissionGate required={PERMISSIONS.NOTICE_CREATE}>
          <Button
            onClick={() => {
              setSelectedNoticeId(null);
              setIsFormModalOpen(true);
            }}
            className="font-bold text-xs uppercase tracking-widest h-10 px-6 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Notice
          </Button>
        </PermissionGate>
      </div>

      <div className={cn(
        "rounded-2xl border border-border shadow-sm overflow-hidden bg-card transition-all duration-300",
        isEnhanced && "shadow-xl shadow-primary/5"
      )}>
        <DataTable
          columns={columns}
          data={data?.data || []}
          pageCount={data?.meta?.totalPage || 1}
          currentPage={page}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      <NoticeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedNoticeId(null);
        }}
        noticeId={selectedNoticeId}
        onSuccess={() => refetch()}
      />

      <DeleteNoticeModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedNoticeId(null);
        }}
        noticeId={selectedNoticeId}
        onSuccess={() => refetch()}
      />
      </div>
    </PermissionGate>
  );
}
