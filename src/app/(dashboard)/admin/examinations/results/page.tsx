/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { examService } from "@/services/exam.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Calculator,
    FileText,
    Trophy,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Medal,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DirectPrintHandler } from "./direct-print-handler";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AcademicService } from "@/services/academic.service";

export default function ResultsPage() {
    const queryClient = useQueryClient();
    const [academicYearId, setAcademicYearId] = useState("");
    const [examId, setExamId] = useState("");
    const [classId, setClassId] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const { data: academicYears } = useQuery({
        queryKey: ["academicYears"],
        queryFn: () => AcademicService.getAllAcademicYears(),
    });

    const { data: examsResponse } = useQuery({
        queryKey: ["exams"],
        queryFn: () => examService.getAllExams(),
    });

    const { data: classesResponse } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses(),
    });

    const { data: response, isLoading: isResultsLoading } = useQuery({
        queryKey: ["classResults", examId, classId],
        queryFn: () => examService.getClassResults({ examId, classId }),
        enabled: !!examId && !!classId,
    });

    const calculateMutation = useMutation({
        mutationFn: (payload: any) => examService.calculateResults(payload),
        onSuccess: (res) => {
            toast.success(res.message || "Results calculated successfully");
            queryClient.invalidateQueries({ queryKey: ["classResults"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to calculate results");
        },
    });

    const examsList = Array.isArray(examsResponse?.data) ? examsResponse.data : (Array.isArray(examsResponse) ? examsResponse : []);
    const classList = Array.isArray(classesResponse?.data) ? classesResponse.data : (Array.isArray(classesResponse) ? classesResponse : []);
    const resultsList = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

    const paginatedResults = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return resultsList.slice(startIndex, startIndex + pageSize);
    }, [resultsList, currentPage, pageSize]);

    const totalPages = Math.ceil(resultsList.length / pageSize);
    const isFilterComplete = examId && classId;

    return (
    <div className="p-4 md:p-8 space-y-8 bg-transparent">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-sidebar-border">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-sidebar rounded-xl flex items-center justify-center border border-zinc-200 dark:border-sidebar-border shadow-sm">
                    <Trophy className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                Examination Results
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                Generate rankings, process academic performance scores, and manage student marksheets for examinations.
            </p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm space-y-5 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Academic Year</span>
            <Select value={academicYearId} onValueChange={setAcademicYearId}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {academicYears?.data?.map((year: any) => (
                    <SelectItem key={year.id} value={year.id} className="font-medium">{year.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Examination</span>
            <Select value={examId} onValueChange={setExamId}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {examsList.map((exam: any) => (
                    <SelectItem key={exam.id} value={exam.id} className="font-medium">{exam.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Class</span>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none focus:ring-1 focus:ring-zinc-400 transition-all">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {classList.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="font-medium">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => calculateMutation.mutate({ examId, classId, academicYearId })}
            disabled={!isFilterComplete || calculateMutation.isPending}
            className="h-11 px-6 text-[14px] font-black shadow-lg shadow-zinc-900/10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl transition-all"
          >
            {calculateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
            Process & Calculate
          </Button>
        </div>
      </div>

        {isFilterComplete && (
            <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
                <div className="p-5 border-b border-zinc-100 dark:border-sidebar-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-background/40">
                    <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">Academic Performance Rankings</h3>
                    </div>
                    <div className="px-3 py-1 bg-zinc-100 dark:bg-background rounded-lg border border-zinc-200 dark:border-sidebar-border">
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Student Count: {resultsList.length}</span>
                    </div>
                </div>
                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    {isResultsLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                        </div>
                    ) : resultsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background/40 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
                                <AlertCircle className="h-8 w-8 text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">No Data Processed</h3>
                            <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                                No result rankings have been calculated yet. Please click the Process & Calculate button to generate standings.
                            </p>
                        </div>
                        ) : (
                            <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50/80 dark:bg-background/60 hover:bg-zinc-50 dark:hover:bg-background/60 border-b border-zinc-200 dark:border-sidebar-border uppercase">
                                    <tr>
                                        <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center w-24">Rank</th>
                                        <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Student Info</th>
                                        <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Section</th>
                                        <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Marks Registry</th>
                                        <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Grade</th>
                                        <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center">Outcome</th>
                                        <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {paginatedResults.map((res: any) => (
                                            <tr key={res.id} className="hover:bg-zinc-50/50 dark:hover:bg-sidebar/50 border-b border-zinc-100 dark:border-sidebar-border transition-colors last:border-0">
                                                <td className="px-8 py-4">
                                                    <div className={cn(
                                                        "h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-[13px] font-black border shadow-sm transition-all",
                                                        res.rankPosition === 1 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50 shadow-amber-500/10" :
                                                        res.rankPosition === 2 ? "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700" :
                                                        res.rankPosition === 3 ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800/30" :
                                                        "bg-white text-zinc-400 border-zinc-100 dark:bg-sidebar dark:border-zinc-800"
                                                    )}>
                                                        {res.rankPosition <= 3 ? (
                                                            <Medal className={cn("h-5 w-5", 
                                                                res.rankPosition === 1 ? "text-amber-500" : 
                                                                res.rankPosition === 2 ? "text-zinc-400" : 
                                                                "text-amber-700"
                                                            )} />
                                                        ) : (
                                                            <span className="opacity-50 tracking-tighter">#{res.rankPosition}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                                            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase">
                                                                {res.student.firstName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{res.student.firstName} {res.student.lastName}</p>
                                                            <p className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest mt-0.5">Roll No: {res.student.rollNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase">
                                                        Sec {res.section?.name || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[15px] font-black text-zinc-900 dark:text-zinc-100 uppercase">{res.marksObtained} Marks</span>
                                                        <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">{res.percentage}% Score</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">{res.grade || "F"}</span>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                        res.status === "PASS"
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50 shadow-emerald-500/10"
                                                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/50 shadow-rose-500/10"
                                                    )}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={selectedStudentId === res.studentId}
                                                        onClick={() => setSelectedStudentId(res.studentId)}
                                                        className="h-9 px-4 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 font-black text-[11px] uppercase tracking-tight border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all"
                                                    >
                                                        {selectedStudentId === res.studentId ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-zinc-400" /> : <FileText className="h-3.5 w-3.5 mr-2" />}
                                                        Generate Sheet
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
 
                    {resultsList.length > pageSize && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-6 border-t border-zinc-100 dark:border-sidebar-border bg-zinc-50/30 dark:bg-background/40">
                            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-500 order-2 sm:order-1">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, resultsList.length)} of {resultsList.length} Records
                            </div>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-10 w-10 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 transition-all"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                
                                <div className="flex items-center gap-1.5 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <Button
                                            key={p}
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setCurrentPage(p)}
                                            className={cn(
                                                "h-10 w-10 rounded-xl font-black text-xs transition-all border shadow-sm",
                                                currentPage === p
                                                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                                                    : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 dark:bg-sidebar dark:text-zinc-400 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                            )}
                                        >
                                            {p}
                                        </Button>
                                    ))}
                                </div>
 
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-10 w-10 rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 transition-all"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <DirectPrintHandler
                examId={examId}
                studentId={selectedStudentId}
                onComplete={() => setSelectedStudentId(null)}
            />
        </div>
    );
}