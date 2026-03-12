/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Edit2, Trash2, Loader2, Calendar, 
  Search, ChevronLeft, ChevronRight, BookOpen, FileText 
} from "lucide-react";
import ExamModal from "./exam-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

export default function ExamsMasterPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Check edit/delete permissions for the Actions column
  const { hasPermission } = usePermission();
  const canEditOrDelete = hasPermission([PERMISSIONS.EXAM_EDIT, PERMISSIONS.EXAM_DELETE]);

  const { data: response, isLoading } = useQuery({
    queryKey: ["exams", page, limit, debouncedSearch],
    queryFn: () => examService.getAllExams({ page, limit, searchTerm: debouncedSearch }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examService.deleteExam(id),
    onSuccess: () => {
      toast.success("Exam deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to delete exam"),
  });

  const handleEdit = (exam: any) => {
    setSelectedExam(exam);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const exams = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, limit: 10 };
  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-sidebar-border">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-sidebar rounded-xl flex items-center justify-center border border-zinc-200 dark:border-sidebar-border shadow-sm">
                    <FileText className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                Examinations
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                Configure and manage academic examinations, terms, and performance evaluations.
            </p>
        </div>
        
        {/* 🔒 Gate for Create Button */}
        <PermissionGate required={PERMISSIONS.EXAM_CREATE}>
            <Button 
                onClick={() => { setSelectedExam(null); setIsModalOpen(true); }} 
                className="h-12 px-6 text-[14px] font-black shadow-lg shadow-zinc-900/10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl transition-all"
            >
                <Plus className="mr-2 h-5 w-5" /> Create Exam Registry
            </Button>
        </PermissionGate>
      </div>

      <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-5 border-b border-zinc-100 dark:border-sidebar-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-background/40">
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100">Exam Master Registry</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by exam name or type..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10 h-11 text-[13px] font-bold bg-white dark:bg-background/20 border-zinc-200 dark:border-sidebar-border rounded-xl shadow-none focus-visible:ring-1 focus-visible:ring-zinc-400 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background/40 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">No Records Found</h3>
              <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
                We couldn&apos;t find any examination records matching your current search criteria.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/80 dark:bg-background/60 hover:bg-zinc-50 dark:hover:bg-background/60 border-b border-zinc-200 dark:border-sidebar-border uppercase">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Exam Details</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Academic Year</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Duration</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Stats</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Status</th>
                  {canEditOrDelete && <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {exams.map((exam: any) => (
                  <tr key={exam.id} className="hover:bg-zinc-50/50 dark:hover:bg-sidebar/50 border-b border-zinc-100 dark:border-sidebar-border transition-colors last:border-0">
                    <td className="px-6 py-4">
                      <p className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{exam.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-background text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-sidebar-border">
                          {exam.type.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[13px] font-black text-zinc-700 dark:text-zinc-300">
                        {exam.academicYear?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-[12px] font-bold">{formatDate(exam.startDate)} - {formatDate(exam.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30">
                          <BookOpen className="h-3 w-3" /> {exam._count?.schedules || 0}
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <FileText className="h-3 w-3" /> {exam._count?.results || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", 
                        exam.status === "PUBLISHED" ? "bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50" : 
                        exam.status === "COMPLETED" ? "bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50" : 
                        exam.status === "ONGOING" ? "bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/50" :
                        "bg-amber-50/50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50"
                      )}>
                        {exam.status}
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    {canEditOrDelete && (
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                                {/* 🔒 Gate for Edit Button */}
                                <PermissionGate required={PERMISSIONS.EXAM_EDIT}>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(exam)} className="h-9 w-9 rounded-xl text-zinc-600 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </PermissionGate>
                                
                                {/* 🔒 Gate for Delete Button */}
                                <PermissionGate required={PERMISSIONS.EXAM_DELETE}>
                                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(exam.id); }} disabled={deleteMutation.isPending} className="h-9 w-9 rounded-xl text-zinc-600 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 transition-all">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </PermissionGate>
                            </div>
                        </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isLoading && exams.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-sidebar-border bg-zinc-50/50 dark:bg-background/40">
            <div className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, meta.total)} <span className="text-zinc-400 mx-1">/</span> {meta.total} Records
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 px-3 rounded-xl bg-white dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[12px] font-bold shadow-none disabled:opacity-50 transition-all hover:bg-zinc-50 dark:hover:bg-background/40"
              >
                <ChevronLeft className="h-4 w-4 mr-1.5" /> Prev
              </Button>
              <div className="text-[12px] font-black text-zinc-900 dark:text-zinc-100 min-w-20 text-center uppercase tracking-widest">
                Page {page} <span className="text-zinc-400 mx-1">of</span> {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="h-9 px-3 rounded-xl bg-white dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[12px] font-bold shadow-none disabled:opacity-50 transition-all hover:bg-zinc-50 dark:hover:bg-background/40"
              >
                Next <ChevronRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} examToEdit={selectedExam} />
    </div>
  );
}