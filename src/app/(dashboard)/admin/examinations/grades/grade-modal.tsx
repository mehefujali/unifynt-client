/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gradeToEdit?: any;
}

export default function GradeModal({ isOpen, onClose, gradeToEdit }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: "", minMarks: "", maxMarks: "", gradePoint: "", remarks: "" });

  useEffect(() => {
    if (gradeToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: gradeToEdit.name,
        minMarks: gradeToEdit.minMarks.toString(),
        maxMarks: gradeToEdit.maxMarks.toString(),
        gradePoint: gradeToEdit.gradePoint?.toString() || "",
        remarks: gradeToEdit.remarks || "",
      });
    } else {
      setFormData({ name: "", minMarks: "", maxMarks: "", gradePoint: "", remarks: "" });
    }
  }, [gradeToEdit, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => (gradeToEdit ? examService.updateExamGrade(gradeToEdit.id, data) : examService.createExamGrade(data)),
    onSuccess: () => {
      toast.success(gradeToEdit ? "Grade updated successfully" : "Grade created successfully");
      queryClient.invalidateQueries({ queryKey: ["examGrades"] });
      onClose();
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Something went wrong"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      minMarks: Number(formData.minMarks),
      maxMarks: Number(formData.maxMarks),
      gradePoint: formData.gradePoint ? Number(formData.gradePoint) : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-0 ring-1 ring-border/50 shadow-xl bg-white dark:bg-zinc-950 sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-4 border-b border-border/50">
            <DialogTitle className="text-lg font-medium">{gradeToEdit ? "Edit Exam Grade" : "Add New Grade"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Grade Name (e.g., A+)</label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Min Marks (%)</label>
                <Input type="number" required value={formData.minMarks} onChange={(e) => setFormData({ ...formData, minMarks: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Max Marks (%)</label>
                <Input type="number" required value={formData.maxMarks} onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Grade Point (Optional)</label>
              <Input type="number" step="0.01" value={formData.gradePoint} onChange={(e) => setFormData({ ...formData, gradePoint: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="rounded-xl px-6 bg-primary text-primary-foreground">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}