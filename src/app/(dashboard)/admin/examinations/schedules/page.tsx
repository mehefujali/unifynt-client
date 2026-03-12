/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";

import { Plus, Edit2, Trash2, Loader2, CalendarRange, Clock, ShieldAlert, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScheduleModal from "./schedule-modal";
import AssignEvaluatorModal from "./assign-evaluator-modal";
import { toast } from "sonner";
import { AcademicService } from "@/services/academic.service";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

export default function ExamSchedulesPage() {
  const queryClient = useQueryClient();
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedScheduleForAssign, setSelectedScheduleForAssign] = useState<any>(null);

  // Check edit/delete permissions for the Actions column
  const { hasPermission } = usePermission();
  const canEditOrDelete = hasPermission([PERMISSIONS.EXAM_EDIT, PERMISSIONS.EXAM_DELETE]);

  const { data: examsResponse } = useQuery({ 
    queryKey: ["exams", "all"], 
    queryFn: () => examService.getAllExams({ limit: 100 })
  });
  
  const { data: classesResponse } = useQuery({ 
    queryKey: ["classes"], 
    queryFn: () => AcademicService.getAllClasses() 
  });

  const { data: schedulesResponse, isLoading } = useQuery({
    queryKey: ["schedules", examId, classId],
    queryFn: () => examService.getExamSchedules({ examId, classId }),
    enabled: !!examId && !!classId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examService.deleteExamSchedule(id),
    onSuccess: () => {
      toast.success("Schedule deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to delete schedule"),
  });

  const handleEdit = (schedule: any) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleAssignEvaluator = (schedule: any) => {
    setSelectedScheduleForAssign(schedule);
    setIsAssignModalOpen(true);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (time: string) => {
    if (!time) return "-";
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const isFilterComplete = examId && classId;

  // Bulletproof Data Extraction Array Mapping
  const examsList = Array.isArray(examsResponse?.data) ? examsResponse.data : (Array.isArray(examsResponse) ? examsResponse : []);
  const classList = Array.isArray(classesResponse?.data) ? classesResponse.data : (Array.isArray(classesResponse) ? classesResponse : []);
  const schedulesList = Array.isArray(schedulesResponse?.data) ? schedulesResponse.data : (Array.isArray(schedulesResponse) ? schedulesResponse : []);

  return (
    // 🔒 Gate for the Entire Page View
    <PermissionGate 
      required={PERMISSIONS.EXAM_VIEW}
      fallback={
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            You do not have permission to view exam schedules. Please contact your school administrator.
          </p>
        </div>
      }
    >
    <div className="p-4 md:p-8 space-y-8 bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-sidebar-border">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-sidebar rounded-xl flex items-center justify-center border border-zinc-200 dark:border-sidebar-border shadow-sm">
                    <CalendarRange className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                Exam Schedules
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                Create and manage subject-wise examination timetables, marks allocation and evaluator assignments.
            </p>
        </div>
      </div>      <div className="p-6 bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm space-y-5 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Select Examination</span>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all">
                <SelectValue placeholder="Select Examination" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {examsList.map((exam: any) => (<SelectItem key={exam.id} value={exam.id} className="font-medium">{exam.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Select Class</span>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classList.map((c: any) => (<SelectItem key={c.id} value={c.id} className="font-medium">{c.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

        {isFilterComplete ? (
        <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="p-5 border-b border-zinc-100 dark:border-sidebar-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-background/40">
            <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100">Subject Timetable & Marks Setup</h3>
            
            {/* 🔒 Gate for Add Subject Button (Requires Edit/Create power for Exams) */}
            <PermissionGate required={[PERMISSIONS.EXAM_CREATE, PERMISSIONS.EXAM_EDIT]}>
              <Button 
                onClick={() => { setSelectedSchedule(null); setIsModalOpen(true); }} 
                className="h-10 px-6 text-[13px] font-black shadow-lg shadow-zinc-900/10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl transition-all"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Registry Item
              </Button>
            </PermissionGate>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : schedulesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background/40 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
                  <CalendarRange className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">No Subjects Found</h3>
                <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  No subjects have been scheduled for this class and examination yet.
                </p>
              </div>
              ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50/80 dark:bg-background/60 hover:bg-zinc-50 dark:hover:bg-background/60 border-b border-zinc-200 dark:border-sidebar-border uppercase">
                  <tr>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Subject Date</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Subject Info</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Timing</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Marks (Full / Pass)</th>
                    {canEditOrDelete && <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-right">Actions</th>}
                  </tr>
                </thead>
                  <tbody className="divide-y divide-border/50">
                    {schedulesList.map((schedule: any) => (
                      <tr key={schedule.id} className="hover:bg-zinc-50/50 dark:hover:bg-sidebar/50 border-b border-zinc-100 dark:border-sidebar-border transition-colors last:border-0">
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{formatDate(schedule.examDate)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{schedule.subject?.subjectName}</p>
                          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">{schedule.subject?.subjectCode}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">
                          <div className="flex items-center gap-2">
                             <Clock className="h-3.5 w-3.5 text-zinc-400" />
                             <span className="text-[12px] font-bold uppercase">{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <span className="text-[13px] font-black text-zinc-900 dark:text-zinc-100">{schedule.fullMarks}</span>
                            <span className="text-zinc-400">/</span>
                            <span className="text-[13px] font-black text-rose-600 dark:text-rose-400">{schedule.passMarks}</span>
                          </div>
                        </td>
                        
                        {/* Actions Column */}
                        {canEditOrDelete && (
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    {/* 🔒 Gate for Edit Button */}
                                    <PermissionGate required={PERMISSIONS.EXAM_EDIT}>
                                        <Button variant="ghost" size="icon" title="Assign Evaluators" onClick={() => handleAssignEvaluator(schedule)} className="h-9 w-9 rounded-xl text-zinc-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-zinc-400 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-all">
                                            <UserPlus className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Edit Schedule" onClick={() => handleEdit(schedule)} className="h-9 w-9 rounded-xl text-zinc-600 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-all">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </PermissionGate>
                                    
                                    {/* 🔒 Gate for Delete Button */}
                                    <PermissionGate required={PERMISSIONS.EXAM_DELETE}>
                                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(schedule.id); }} disabled={deleteMutation.isPending} className="h-9 w-9 rounded-xl text-zinc-600 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/30 transition-all">
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
        ) : (
           <div className="flex flex-col items-center justify-center py-28 text-center bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm transition-colors">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background/40 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
              <CalendarRange className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Selection Required</h3>
            <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Please choose an examination and academic class from the filters above to retrieve and manage the schedules.
            </p>
          </div>
        )}

        <ScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} examId={examId} classId={classId} scheduleToEdit={selectedSchedule} />
        
        <AssignEvaluatorModal 
            isOpen={isAssignModalOpen} 
            onClose={() => setIsAssignModalOpen(false)} 
            scheduleId={selectedScheduleForAssign?.id || null} 
            subjectInfo={`${selectedScheduleForAssign?.subject?.subjectName} (${selectedScheduleForAssign?.subject?.subjectCode})`}
        />
      </div>
    </PermissionGate>
  );
}