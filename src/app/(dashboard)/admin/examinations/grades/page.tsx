/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import GradeModal from "./grade-modal";
import { toast } from "sonner";

export default function ExamGradesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>(null);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Grading Scale</h1>
        <Button onClick={() => { setSelectedGrade(null); setIsModalOpen(true); }} className="rounded-xl bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900">
          <Plus className="mr-2 h-4 w-4" /> Add Grade
        </Button>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 px-6">
          <CardTitle className="text-lg font-medium">Exam Grades Setup</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-border/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Grade</th>
                  <th className="px-6 py-4 font-medium">Min Marks (%)</th>
                  <th className="px-6 py-4 font-medium">Max Marks (%)</th>
                  <th className="px-6 py-4 font-medium">Grade Point</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {grades?.map((grade: any) => (
                  <tr key={grade.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{grade.name}</td>
                    <td className="px-6 py-4 text-zinc-600">{grade.minMarks}</td>
                    <td className="px-6 py-4 text-zinc-600">{grade.maxMarks}</td>
                    <td className="px-6 py-4 text-zinc-600">{grade.gradePoint || "-"}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(grade)} className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(grade.id); }} disabled={deleteMutation.isPending} className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <GradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} gradeToEdit={selectedGrade} />
    </div>
  );
}