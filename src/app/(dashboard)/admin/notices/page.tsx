"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NoticeService } from "@/services/notice.service";
import { DataTable } from "./data-table";
import { format } from "date-fns";
import { Plus, Link2, FileText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function NoticesPage() {
  const [page, setPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

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
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex flex-shrink-0 items-center justify-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-400">
            {row.original.link ? (
              <a href={row.original.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Link2 className="h-5 w-5" />
              </a>
            ) : (
              <FileText className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">{row.original.title}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{row.original.content}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "isPublic",
      header: "Visibility",
      cell: ({ row }) => (
        <Badge variant={row.original.isPublic ? "default" : "secondary"} className={row.original.isPublic ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5" : "bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-2 py-0.5"}>
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
            <DropdownMenuItem onClick={() => {
              setSelectedNoticeId(row.original.id);
              setIsFormModalOpen(true);
            }} className="py-2.5 cursor-pointer text-[13px] tracking-tight hover:bg-slate-50 dark:hover:bg-slate-900">
              Edit Notice
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedNoticeId(row.original.id);
              setIsDeleteModalOpen(true);
            }} className="py-2.5 cursor-pointer text-[13px] tracking-tight text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">
              Delete Notice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Notice Board</h1>
          <p className="text-sm font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-1">Manage institutional announcements</p>
        </div>
        <Button
          onClick={() => {
            setSelectedNoticeId(null);
            setIsFormModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md h-11 px-6 rounded-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Notice
        </Button>
      </div>

      <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={data?.data || []}
            pageCount={data?.meta?.totalPage || 1}
            currentPage={page}
            isLoading={isLoading}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

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
  );
}
