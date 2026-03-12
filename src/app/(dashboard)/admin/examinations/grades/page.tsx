/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import GradeModal from "./grade-modal";
import { toast } from "sonner";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

export default function ExamGradesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);

  // Check edit/delete permissions for the Actions column
  const { hasPermission } = usePermission();
  const canEditOrDelete = hasPermission([PERMISSIONS.EXAM_EDIT, PERMISSIONS.EXAM_DELETE]);

  const { data: grades, isLoading } = useQuery({
    queryKey: ["examGrades"],
    queryFn: () => examService.getAllExamGrades(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examService.deleteExamGrade(id),
    onSuccess: () => {
      toast.success("Grade deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["examGrades"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to delete grade"),
  });

  const handleEdit = (grade: any) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-sidebar-border">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-sidebar rounded-xl flex items-center justify-center border border-zinc-200 dark:border-sidebar-border shadow-sm">
                    <Plus className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                Grading Scale
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                Configure the academic grading system and performance scales for examinations.
            </p>
        </div>
        
        {/* 🔒 Gate for Create Button */}
        <PermissionGate required={PERMISSIONS.EXAM_CREATE}>
            <Button 
                onClick={() => { setSelectedGrade(null); setIsModalOpen(true); }} 
                className="h-12 px-6 text-[14px] font-black shadow-lg shadow-zinc-900/10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl transition-all"
            >
                <Plus className="mr-2 h-5 w-5" /> Add New Grade
            </Button>
        </PermissionGate>
      </div>

      <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
        <div className="p-5 border-b border-zinc-100 dark:border-sidebar-border bg-zinc-50/30 dark:bg-background/40">
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100">Grade Configuration</h3>
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/80 dark:bg-background/60 hover:bg-zinc-50 dark:hover:bg-background/60 border-b border-zinc-200 dark:border-sidebar-border uppercase">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Grade Name</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center text-rose-500 dark:text-rose-400">Min Marks (%)</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center text-emerald-500 dark:text-emerald-400">Max Marks (%)</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Grade Point</th>
                  {canEditOrDelete && <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {grades?.map((grade: any) => (
                  <tr key={grade.id} className="hover:bg-zinc-50/50 dark:hover:bg-sidebar/50 border-b border-zinc-100 dark:border-sidebar-border transition-colors last:border-0">
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-100 dark:bg-background text-[16px] font-black text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-sidebar-border shadow-sm">
                        {grade.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[14px] font-black text-rose-600 dark:text-rose-400">
                        {grade.minMarks}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400">
                        {grade.maxMarks}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[14px] font-black text-zinc-900 dark:text-zinc-100">
                        {grade.gradePoint || "0.00"}
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    {canEditOrDelete && (
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                                {/* 🔒 Gate for Edit Button */}
                                <PermissionGate required={PERMISSIONS.EXAM_EDIT}>
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(grade)} className="h-10 w-10 rounded-xl text-zinc-600 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </PermissionGate>
                                
                                {/* 🔒 Gate for Delete Button */}
                                <PermissionGate required={PERMISSIONS.EXAM_DELETE}>
                                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(grade.id); }} disabled={deleteMutation.isPending} className="h-10 w-10 rounded-xl text-zinc-600 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 transition-all">
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
      </div>

      <GradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} gradeToEdit={selectedGrade} />
    </div>
  );
}