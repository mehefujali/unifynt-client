/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";

import { Plus, Edit2, Trash2, Loader2, CalendarRange, Clock, ShieldAlert, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Exam Schedules</h1>
        </div>

        <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-medium">Select Target</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all">
                  <SelectValue placeholder="Select Examination" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {examsList.map((exam: any) => (<SelectItem key={exam.id} value={exam.id} className="rounded-lg">{exam.name}</SelectItem>))}
                </SelectContent>
              </Select>

              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {classList.map((c: any) => (<SelectItem key={c.id} value={c.id} className="rounded-lg">{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isFilterComplete ? (
          <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 px-6">
              <CardTitle className="text-lg font-medium">Subject Timetable & Marks Setup</CardTitle>
              
              {/* 🔒 Gate for Add Subject Button (Requires Edit/Create power for Exams) */}
              <PermissionGate required={[PERMISSIONS.EXAM_CREATE, PERMISSIONS.EXAM_EDIT]}>
                <Button onClick={() => { setSelectedSchedule(null); setIsModalOpen(true); }} className="rounded-xl bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900 h-9">
                  <Plus className="mr-2 h-4 w-4" /> Add Subject
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : schedulesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                  <CalendarRange className="h-12 w-12 text-zinc-300 mb-3" />
                  <p>No subjects scheduled yet for this class.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-border/50 uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Subject Date</th>
                      <th className="px-6 py-4 font-medium">Subject Info</th>
                      <th className="px-6 py-4 font-medium">Timing</th>
                      <th className="px-6 py-4 font-medium text-center">Marks (Full / Pass)</th>
                      {canEditOrDelete && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {schedulesList.map((schedule: any) => (
                      <tr key={schedule.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(schedule.examDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                          {schedule.subject?.subjectName} <span className="text-zinc-400 font-normal">({schedule.subject?.subjectCode})</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 flex items-center gap-1.5 mt-1">
                          <Clock className="h-3.5 w-3.5" /> {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{schedule.fullMarks}</span> <span className="text-zinc-400">/</span> <span className="font-medium text-red-500">{schedule.passMarks}</span>
                        </td>
                        
                        {/* Actions Column */}
                        {canEditOrDelete && (
                            <td className="px-6 py-4 text-right space-x-2">
                                {/* 🔒 Gate for Edit Button */}
                                <PermissionGate required={PERMISSIONS.EXAM_EDIT}>
                                    <Button variant="ghost" size="icon" title="Assign Evaluators" onClick={() => handleAssignEvaluator(schedule)} className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><UserPlus className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" title="Edit Schedule" onClick={() => handleEdit(schedule)} className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Edit2 className="h-4 w-4" /></Button>
                                </PermissionGate>
                                
                                {/* 🔒 Gate for Delete Button */}
                                <PermissionGate required={PERMISSIONS.EXAM_DELETE}>
                                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(schedule.id); }} disabled={deleteMutation.isPending} className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="h-4 w-4" /></Button>
                                </PermissionGate>
                            </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        ) : (
           <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50">
              <CalendarRange className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Select Exam & Class</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">Please choose an exam and class from above to manage the schedule.</p>
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