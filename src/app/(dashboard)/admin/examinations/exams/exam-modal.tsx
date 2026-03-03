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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examToEdit?: any;
}

export default function ExamModal({ isOpen, onClose, examToEdit }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ academicYearId: "", name: "", type: "TERM", startDate: "", endDate: "", status: "UPCOMING" });

  const { data: academicYears } = useQuery({ queryKey: ["academicYears"], queryFn: () => AcademicService.getAllAcademicYears() });

  useEffect(() => {
    if (academicYears?.length > 0 && !formData.academicYearId && !examToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({ ...prev, academicYearId: academicYears.find((y: any) => y.status === "ACTIVE")?.id || academicYears[0].id }));
    }
  }, [academicYears, examToEdit, formData.academicYearId]);

  useEffect(() => {
    if (examToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        academicYearId: examToEdit.academicYearId,
        name: examToEdit.name,
        type: examToEdit.type,
        startDate: new Date(examToEdit.startDate).toISOString().split('T')[0],
        endDate: new Date(examToEdit.endDate).toISOString().split('T')[0],
        status: examToEdit.status,
      });
    } else {
      setFormData((prev) => ({ ...prev, name: "", type: "TERM", startDate: "", endDate: "", status: "UPCOMING" }));
    }
  }, [examToEdit, isOpen]);

  const mutation = useMutation({
    mutationFn: (data: any) => (examToEdit ? examService.updateExam(examToEdit.id, data) : examService.createExam(data)),
    onSuccess: () => {
      toast.success(examToEdit ? "Exam updated successfully" : "Exam created successfully");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      onClose();
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Something went wrong"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ ...formData, startDate: new Date(formData.startDate).toISOString(), endDate: new Date(formData.endDate).toISOString() });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl border-0 ring-1 ring-border/50 shadow-xl bg-white dark:bg-zinc-950 sm:max-w-125">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="pb-4 border-b border-border/50">
            <DialogTitle className="text-lg font-medium">{examToEdit ? "Edit Examination" : "Create New Examination"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Academic Year</label>
              <Select value={formData.academicYearId} onValueChange={(val) => setFormData({ ...formData, academicYearId: val })}>
                <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50"><SelectValue placeholder="Select Year" /></SelectTrigger>
                <SelectContent className="rounded-xl">{academicYears?.data?.map((y: any) => (<SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500">Exam Name</label>
              <Input required placeholder="e.g. First Term Examination" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Exam Type</label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["TERM", "UNIT_TEST", "PRACTICAL", "CUSTOM"].map((t) => (<SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Status</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["UPCOMING", "ONGOING", "COMPLETED", "PUBLISHED"].map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">Start Date</label>
                <Input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-500">End Date</label>
                <Input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
              </div>
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