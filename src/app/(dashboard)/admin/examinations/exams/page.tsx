/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Edit2, Trash2, Loader2, Calendar, 
  Search, ChevronLeft, ChevronRight, BookOpen, FileText 
} from "lucide-react";
import ExamModal from "./exam-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ExamsMasterPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Examinations</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage all your school examinations and terms.</p>
        </div>
        <Button 
          onClick={() => { setSelectedExam(null); setIsModalOpen(true); }} 
          className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Create Exam
        </Button>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
        <CardHeader className="pb-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Exam Master List</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 h-10 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 focus-visible:ring-2 focus-visible:ring-primary shadow-sm transition-all"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50">
                <Search className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Exams Found</p>
              <p className="text-sm text-zinc-500 mt-1">Try adjusting your search criteria or create a new exam.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-border/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Exam Details</th>
                  <th className="px-6 py-4 font-medium">Academic Year</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium text-center">Stats</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {exams.map((exam: any) => (
                  <tr key={exam.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{exam.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{exam.type.replace("_", " ")}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-700 dark:text-zinc-300">
                      {exam.academicYear?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{formatDate(exam.startDate)} - {formatDate(exam.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md ring-1 ring-border/50">
                          <BookOpen className="h-3 w-3" /> {exam._count?.schedules || 0}
                        </div>
                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md ring-1 ring-border/50">
                          <FileText className="h-3 w-3" /> {exam._count?.results || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ring-inset", 
                        exam.status === "PUBLISHED" ? "bg-green-100 text-green-700 ring-green-200 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-900/50" : 
                        exam.status === "COMPLETED" ? "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-900/50" : 
                        exam.status === "ONGOING" ? "bg-indigo-100 text-indigo-700 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-900/50" :
                        "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-900/50"
                      )}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(exam)} className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(exam.id); }} disabled={deleteMutation.isPending} className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>

        {!isLoading && exams.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} exams
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 shadow-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Page {page} of {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 shadow-sm disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <ExamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} examToEdit={selectedExam} />
    </div>
  );
}