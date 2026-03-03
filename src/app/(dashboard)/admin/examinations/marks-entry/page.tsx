/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { examService } from "@/services/exam.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardEdit } from "lucide-react";
import MarksGrid from "./marks-grid";
import { AcademicService } from "@/services/academic.service";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Marks Entry</h1>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="text-lg font-medium">Select Subject</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={examId} onValueChange={(val) => { setExamId(val); setScheduleId(""); }}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all">
                <SelectValue placeholder={isExamsLoading ? "Loading..." : "Select Exam"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {examsList.map((exam: any) => (
                  <SelectItem key={exam.id} value={exam.id} className="rounded-lg">
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={classId} onValueChange={(val) => { setClassId(val); setScheduleId(""); }} disabled={!examId}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all disabled:opacity-50">
                <SelectValue placeholder={isClassesLoading ? "Loading..." : "Select Class"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classList.map((c: any) => (
                  <SelectItem key={c.id} value={c.id} className="rounded-lg">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scheduleId} onValueChange={setScheduleId} disabled={!classId || schedulesList.length === 0}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all disabled:opacity-50">
                <SelectValue placeholder={isSchedulesLoading ? "Loading subjects..." : schedulesList.length === 0 && classId ? "No subjects found" : "Select Subject"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {schedulesList.map((schedule: any) => (
                  <SelectItem key={schedule.id} value={schedule.id} className="rounded-lg">
                    {schedule.subject?.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isFilterComplete ? (
        <MarksGrid key={scheduleId} scheduleId={scheduleId} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50">
            <ClipboardEdit className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Select Exam Details</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">
            Please choose an exam, class, and subject to start entering marks for students.
          </p>
        </div>
      )}
    </div>
  );
}