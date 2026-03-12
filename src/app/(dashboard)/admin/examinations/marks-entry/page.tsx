/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { examService } from "@/services/exam.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardEdit, ShieldAlert } from "lucide-react";
import MarksGrid from "./marks-grid";
import { AcademicService } from "@/services/academic.service";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function MarksEntryPage() {
  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [scheduleId, setScheduleId] = useState("");

  const { data: examsResponse, isLoading: isExamsLoading } = useQuery({
    queryKey: ["exams", "all"],
    queryFn: () => examService.getAllExams({ limit: 100 }),
  });

  const { data: classesResponse, isLoading: isClassesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => AcademicService.getAllClasses(),
  });

  const { data: schedulesResponse, isLoading: isSchedulesLoading } = useQuery({
    queryKey: ["schedules", examId, classId],
    queryFn: () => examService.getExamSchedules({ examId, classId }),
    enabled: !!examId && !!classId,
  });

  const examsList = Array.isArray(examsResponse?.data) ? examsResponse.data : (Array.isArray(examsResponse) ? examsResponse : []);
  const classList = Array.isArray(classesResponse?.data) ? classesResponse.data : (Array.isArray(classesResponse) ? classesResponse : []);
  const schedulesList = Array.isArray(schedulesResponse?.data) ? schedulesResponse.data : (Array.isArray(schedulesResponse) ? schedulesResponse : []);

  const isFilterComplete = examId && classId && scheduleId;

  return (
    // 🔒 Gate for the Entire Page View
    <PermissionGate 
      required={[PERMISSIONS.EXAM_VIEW, PERMISSIONS.MARKS_ENTRY]}
      fallback={
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            You do not have permission to view or enter exam marks. Please contact your school administrator if you believe this is an error.
          </p>
        </div>
      }
    >
    <div className="p-4 md:p-8 space-y-8 bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-sm">
                    <ClipboardEdit className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                Marks Entry
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                Record and manage student academic performance for specific examinations and subjects.
            </p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm space-y-5 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Select Examination</span>
            <Select value={examId} onValueChange={(val) => { setExamId(val); setScheduleId(""); }}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all">
                <SelectValue placeholder={isExamsLoading ? "Loading..." : "Select Exam"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {examsList.map((exam: any) => (
                  <SelectItem key={exam.id} value={exam.id} className="font-medium">
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Select Class</span>
            <Select value={classId} onValueChange={(val) => { setClassId(val); setScheduleId(""); }} disabled={!examId}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all disabled:opacity-50">
                <SelectValue placeholder={isClassesLoading ? "Loading..." : "Select Class"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classList.map((c: any) => (
                  <SelectItem key={c.id} value={c.id} className="font-medium">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Select Subject</span>
            <Select value={scheduleId} onValueChange={setScheduleId} disabled={!classId || schedulesList.length === 0}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all disabled:opacity-50">
                <SelectValue placeholder={isSchedulesLoading ? "Loading subjects..." : schedulesList.length === 0 && classId ? "No subjects found" : "Select Subject"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {schedulesList.map((schedule: any) => (
                  <SelectItem key={schedule.id} value={schedule.id} className="font-medium">
                    {schedule.subject?.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

        {isFilterComplete ? (
          <MarksGrid key={scheduleId} scheduleId={scheduleId} />
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm transition-colors">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background/40 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
              <ClipboardEdit className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Selection Required</h3>
            <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Please choose an examination, academic class, and subject from the filters above to retrieve and manage the student marks registry.
            </p>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}