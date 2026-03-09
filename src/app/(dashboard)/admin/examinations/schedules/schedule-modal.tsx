/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AcademicService } from "@/services/academic.service";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  classId: string;
  scheduleToEdit?: any;
}

export default function ScheduleModal({ isOpen, onClose, examId, classId, scheduleToEdit }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subjectId: "", examDate: "", startTime: "", endTime: "", fullMarks: "100", passMarks: "40",
    hasTheory: true, hasPractical: true, hasViva: true
  });


  const { data: subjectsResponse, isFetching: isSubjectsLoading } = useQuery({
    queryKey: ["subjects", classId],
    queryFn: () => AcademicService.getAllSubjects({ classId }),
    enabled: !!classId && isOpen,
  });

  const subjectsList = Array.isArray(subjectsResponse?.data) ? subjectsResponse.data : (Array.isArray(subjectsResponse) ? subjectsResponse : []);

  useEffect(() => {
    if (scheduleToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        subjectId: scheduleToEdit.subjectId,
        examDate: new Date(scheduleToEdit.examDate).toISOString().split('T')[0],
        startTime: scheduleToEdit.startTime,
        endTime: scheduleToEdit.endTime,
        fullMarks: scheduleToEdit.fullMarks.toString(),
        passMarks: scheduleToEdit.passMarks.toString(),
        hasTheory: scheduleToEdit.hasTheory ?? true,
        hasPractical: scheduleToEdit.hasPractical ?? true,
        hasViva: scheduleToEdit.hasViva ?? true,
      });
    } else {
      setFormData({
        subjectId: "", examDate: "", startTime: "", endTime: "", fullMarks: "100", passMarks: "40",
        hasTheory: true, hasPractical: true, hasViva: true
      });
    }
  }, [scheduleToEdit, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => (scheduleToEdit ? examService.updateExamSchedule(scheduleToEdit.id, data) : examService.createExamSchedule(data)),
    onSuccess: () => {
      toast.success(scheduleToEdit ? "Schedule updated successfully" : "Schedule created successfully");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      onClose();
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Something went wrong"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      examId,
      classId,
      examDate: new Date(formData.examDate).toISOString(),
      fullMarks: Number(formData.fullMarks),
      passMarks: Number(formData.passMarks),
      hasTheory: formData.hasTheory,
      hasPractical: formData.hasPractical,
      hasViva: formData.hasViva,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-0 ring-1 ring-border/50 shadow-xl bg-white dark:bg-zinc-950 sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-4 border-b border-border/50">
            <DialogTitle className="text-lg font-medium">{scheduleToEdit ? "Edit Subject Schedule" : "Add Subject Schedule"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Subject</label>
              <Select value={formData.subjectId} onValueChange={(val) => setFormData({ ...formData, subjectId: val })} disabled={isSubjectsLoading}>
                <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50">
                  <SelectValue placeholder={isSubjectsLoading ? "Loading subjects..." : "Select Subject"} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {subjectsList.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.subjectName} ({s.subjectCode})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Exam Date</label>
              <Input type="date" required value={formData.examDate} onChange={(e) => setFormData({ ...formData, examDate: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Start Time</label>
                <Input type="time" required value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">End Time</label>
                <Input type="time" required value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Full Marks</label>
                <Input type="number" required value={formData.fullMarks} onChange={(e) => setFormData({ ...formData, fullMarks: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Pass Marks</label>
                <Input type="number" required value={formData.passMarks} onChange={(e) => setFormData({ ...formData, passMarks: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
            </div>

            {/* Component Enables */}
            <div className="space-y-4 pt-2 pb-2">
              <label className="text-sm font-medium text-zinc-500">Enable Exam Components</label>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="hasTheory" checked={formData.hasTheory} onCheckedChange={(c) => setFormData({ ...formData, hasTheory: !!c })} />
                  <label htmlFor="hasTheory" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Theory</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hasPractical" checked={formData.hasPractical} onCheckedChange={(c) => setFormData({ ...formData, hasPractical: !!c })} />
                  <label htmlFor="hasPractical" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Practical</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hasViva" checked={formData.hasViva} onCheckedChange={(c) => setFormData({ ...formData, hasViva: !!c })} />
                  <label htmlFor="hasViva" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Viva</label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending || !formData.subjectId || isSubjectsLoading} className="rounded-xl px-6 bg-primary text-primary-foreground">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}