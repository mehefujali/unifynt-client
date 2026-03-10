/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { examService } from "@/services/exam.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Calculator,
    FileText,
    Trophy,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Search,
    Medal,
    AlertCircle,
    User
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
    const [pageSize, setPageSize] = useState(10);

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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Exam Results</h1>
                    <p className="text-sm text-zinc-500 mt-1">Generate marksheets and manage class-wise performance.</p>
                </div>
            </div>

            <Card className="border-0 shadow-md ring-1 ring-border/50 rounded-[24px] bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/50 bg-zinc-50/30 dark:bg-zinc-900/30 px-6">
                    <CardTitle className="text-lg font-bold uppercase tracking-tight">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Academic Year</label>
                            <Select value={academicYearId} onValueChange={setAcademicYearId}>
                                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50">
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {academicYears?.data?.map((year: any) => (
                                        <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Examination</label>
                            <Select value={examId} onValueChange={setExamId}>
                                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50">
                                    <SelectValue placeholder="Select Exam" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {examsList.map((exam: any) => (
                                        <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Class</label>
                            <Select value={classId} onValueChange={setClassId}>
                                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {classList.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={() => calculateMutation.mutate({ examId, classId, academicYearId })}
                            disabled={!isFilterComplete || calculateMutation.isPending}
                            className="rounded-xl h-11 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-bold shadow-lg dark:bg-zinc-100 dark:text-zinc-900 transition-all"
                        >
                            {calculateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                            Process Results
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isFilterComplete && (
                <Card className="border-0 shadow-lg ring-1 ring-border/50 rounded-[28px] bg-white dark:bg-zinc-950 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 px-8">
                        <CardTitle className="text-lg font-bold flex items-center gap-3 uppercase tracking-tight">
                            <Trophy className="h-6 w-6 text-amber-500 fill-amber-500/10" />
                            Class Rankings
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-2">Total Students: {resultsList.length}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isResultsLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : resultsList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="h-20 w-20 rounded-3xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-6 ring-1 ring-border">
                                    <AlertCircle className="h-10 w-10 text-zinc-300" />
                                </div>
                                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">No Data Calculated</p>
                                <p className="text-sm text-zinc-500 mt-1">Click the &quot;Process Results&quot; button to generate rankings.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-[11px] text-zinc-400 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-border uppercase tracking-widest font-black">
                                        <tr>
                                            <th className="px-8 py-5 border-r border-border/50 text-center w-24">Rank</th>
                                            <th className="px-8 py-5 border-r border-border/50">Student Information</th>
                                            <th className="px-8 py-5 border-r border-border/50 text-center">Section</th>
                                            <th className="px-8 py-5 border-r border-border/50 text-center w-36">Marks Score</th>
                                            <th className="px-8 py-5 border-r border-border/50 text-center w-24">Grade</th>
                                            <th className="px-8 py-5 border-r border-border/50 text-center w-32">Status</th>
                                            <th className="px-8 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {paginatedResults.map((res: any) => (
                                            <tr key={res.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all duration-200">
                                                <td className="px-8 py-4 border-r border-border/50">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs mx-auto ring-1 ring-inset shadow-sm",
                                                        res.rankPosition === 1 ? "bg-amber-100 text-amber-700 ring-amber-200" :
                                                            res.rankPosition === 2 ? "bg-zinc-100 text-zinc-600 ring-zinc-200" :
                                                                res.rankPosition === 3 ? "bg-orange-50 text-orange-700 ring-orange-200" :
                                                                    "bg-white text-zinc-400 ring-border dark:bg-zinc-900"
                                                    )}>
                                                        {res.rankPosition <= 3 ? <Medal className="h-4 w-4" /> : `#${res.rankPosition}`}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 border-r border-border/50">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 rounded-xl ring-1 ring-border shadow-sm">
                                                            <AvatarFallback className="bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase">
                                                                {res.student.firstName.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-none">{res.student.firstName} {res.student.lastName}</p>
                                                            <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase tracking-tighter">Roll No: {res.student.rollNumber}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 border-r border-border/50 text-center font-bold text-zinc-600">
                                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg ring-1 ring-border text-xs uppercase">
                                                        Sec {res.section?.name || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 border-r border-border/50 text-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-zinc-900 dark:text-zinc-100 text-base leading-none">{res.marksObtained}</span>
                                                        <span className="text-[10px] font-bold text-zinc-400 mt-1">/ {res.totalMarks} ({res.percentage}%)</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 border-r border-border/50 text-center">
                                                    <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{res.grade || "-"}</span>
                                                </td>
                                                <td className="px-8 py-4 border-r border-border/50 text-center">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
                                                        res.status === "PASS"
                                                            ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/50"
                                                            : "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-900/50"
                                                    )}>
                                                        {res.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={selectedStudentId === res.studentId}
                                                        onClick={() => setSelectedStudentId(res.studentId)}
                                                        className="rounded-xl bg-white hover:bg-zinc-50 dark:text-white text-zinc-900 border-0 ring-1 ring-inset ring-border/50 font-bold text-[11px] uppercase tracking-tight shadow-sm"
                                                    >
                                                        {selectedStudentId === res.studentId ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin text-zinc-400" /> : <FileText className="h-3.5 w-3.5 mr-2 text-zinc-400" />}
                                                        Marksheet
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>

                    {resultsList.length > pageSize && (
                        <div className="flex items-center justify-between px-8 py-5 border-t border-border/50 bg-zinc-50/30 dark:bg-zinc-900/30">
                            <div className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, resultsList.length)} of {resultsList.length}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-10 w-10 rounded-xl border-0 ring-1 ring-border hover:bg-zinc-100 disabled:opacity-40 shadow-sm"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-1.5 mx-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <Button
                                            key={p}
                                            variant={currentPage === p ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => setCurrentPage(p)}
                                            className={cn(
                                                "h-10 w-10 rounded-xl font-black text-xs border-0 ring-1 transition-all",
                                                currentPage === p
                                                    ? "bg-zinc-900 text-white ring-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
                                                    : "bg-white text-zinc-400 ring-border hover:bg-zinc-50 hover:text-zinc-900"
                                            )}
                                        >
                                            {p}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-10 w-10 rounded-xl border-0 ring-1 ring-border hover:bg-zinc-100 disabled:opacity-40 shadow-sm"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            <DirectPrintHandler
                examId={examId}
                studentId={selectedStudentId}
                onComplete={() => setSelectedStudentId(null)}
            />
        </div>
    );
}