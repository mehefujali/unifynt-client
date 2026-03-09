/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Loader2,
    TrendingUp,
    Search,
    UserCircle,
    History,
    CheckCircle2,
    ArrowRight,
    AlertCircle,
    Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";

export default function StudentPromotionPage() {
    const queryClient = useQueryClient();

    // Source States
    const [sourceClassId, setSourceClassId] = useState<string>("");
    const [sourceSectionId, setSourceSectionId] = useState<string>("");

    // Target States
    const [targetYearId, setTargetYearId] = useState<string>("");
    const [targetClassId, setTargetClassId] = useState<string>("");
    const [targetSectionId, setTargetSectionId] = useState<string>("");

    // Student Evaluation State
    const [studentsState, setStudentsState] = useState<Record<string, any>>({});

    // Fetch Initial Data
    const { data: classesRes } = useQuery({ queryKey: ["classes"], queryFn: () => AcademicService.getAllClasses() });
    const { data: yearsRes } = useQuery({ queryKey: ["academicYears"], queryFn: () => AcademicService.getAllAcademicYears() });
    const { data: sourceSectionsRes } = useQuery({ queryKey: ["sections", sourceClassId], queryFn: () => AcademicService.getAllSections({ classId: sourceClassId }), enabled: !!sourceClassId });
    const { data: targetSectionsRes } = useQuery({ queryKey: ["sections", targetClassId], queryFn: () => AcademicService.getAllSections({ classId: targetClassId }), enabled: !!targetClassId });

    const { data: studentsRes, isLoading: isFetchingStudents } = useQuery({
        queryKey: ["students", sourceClassId, sourceSectionId],
        queryFn: () => StudentService.getAllStudents({ classId: sourceClassId, sectionId: sourceSectionId, limit: 200 }),
        enabled: !!sourceClassId
    });

    const students = studentsRes?.data || [];

    // 🟢 FIXED: Infinite loop solved by checking dependencies properly and updating state conditionally
    useEffect(() => {
        const fetchedStudents = studentsRes?.data;
        if (fetchedStudents && fetchedStudents.length > 0) {
            const initialState: Record<string, any> = {};
            fetchedStudents.forEach((s: any) => {
                initialState[s.id] = { selected: true, marks: "", percentage: "", grade: "", status: "PASS", remarks: "" };
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStudentsState(initialState);
        } else {
            // Only update if it's not already empty to prevent re-renders
            setStudentsState(prev => Object.keys(prev).length === 0 ? prev : {});
        }
    }, [studentsRes?.data]);

    const handleInputChange = (id: string, field: string, value: any) => {
        setStudentsState(prev => {
            const isFail = field === "status" && value === "FAIL";
            const newState = { ...prev, [id]: { ...prev[id], [field]: value } };

            // Business Logic: Fail = Uncheck & Disable, Pass = Auto Check
            if (isFail) newState[id].selected = false;
            else if (field === "status" && value !== "FAIL") newState[id].selected = true;

            return newState;
        });
    };

    const toggleSelectAll = (checked: boolean) => {
        setStudentsState(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(id => {
                if (newState[id].status !== "FAIL") newState[id].selected = checked;
            });
            return newState;
        });
    };

    const bulkPromoteMutation = useMutation({
        mutationFn: (payload: any) => StudentService.promoteBulkStudents(payload),
        onSuccess: (res) => {
            toast.success(res?.message || "Students promoted successfully!");
            queryClient.invalidateQueries({ queryKey: ["students"] });
            setStudentsState({});
            setSourceClassId("");
            setSourceSectionId("");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => toast.error(error?.response?.data?.message || "Promotion failed"),
    });

    const handlePromote = () => {
        const selectedStudents = Object.keys(studentsState)
            .filter(id => studentsState[id].selected && studentsState[id].status !== "FAIL")
            .map(id => ({
                id,
                marks: studentsState[id].marks ? Number(studentsState[id].marks) : undefined,
                percentage: studentsState[id].percentage ? Number(studentsState[id].percentage) : undefined,
                grade: studentsState[id].grade || undefined,
                status: studentsState[id].status,
                remarks: studentsState[id].remarks || undefined,
            }));

        if (selectedStudents.length === 0) return toast.error("Select at least one passing student to promote.");

        bulkPromoteMutation.mutate({
            targetAcademicYearId: targetYearId,
            targetClassId,
            targetSectionId: targetSectionId || undefined,
            students: selectedStudents,
        });
    };

    const classList = classesRes?.data?.data || classesRes?.data || [];
    const yearList = yearsRes?.data?.data || yearsRes?.data || [];
    const sourceSectionList = sourceSectionsRes?.data?.data || sourceSectionsRes?.data || [];
    const targetSectionList = targetSectionsRes?.data?.data || targetSectionsRes?.data || [];

    const allSelectableCount = useMemo(() => Object.values(studentsState).filter(s => s.status !== "FAIL").length, [studentsState]);
    const selectedCount = useMemo(() => Object.values(studentsState).filter(s => s.selected).length, [studentsState]);

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen pb-28 bg-zinc-50/30 dark:bg-zinc-950">
            {/* Header Section */}
            <div className="flex flex-col gap-2 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Bulk Promotion Manager
                </h1>
                <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                    Evaluate students from their current class and seamlessly upgrade them to the next academic session. Leave marks empty to auto-calculate from exam records.
                </p>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
                {/* Step 1: Source */}
                <div className="xl:col-span-5 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-5">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Select Source</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Current Class *</Label>
                            {/* 🟢 FIXED: Added || undefined to handle Radix UI select empty state */}
                            <Select onValueChange={(val) => { setSourceClassId(val); setSourceSectionId(""); }} value={sourceClassId || undefined}>
                                <SelectTrigger className="h-11 text-sm bg-zinc-50 dark:bg-zinc-950/50 shadow-none"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent>{classList.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Current Section (Opt)</Label>
                            <Select onValueChange={setSourceSectionId} value={sourceSectionId || undefined} disabled={!sourceClassId}>
                                <SelectTrigger className="h-11 text-sm bg-zinc-50 dark:bg-zinc-950/50 shadow-none"><SelectValue placeholder="All Sections" /></SelectTrigger>
                                <SelectContent>{sourceSectionList.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Arrow Indicator (Desktop) */}
                <div className="hidden xl:flex xl:col-span-2 items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border-4 border-zinc-50 dark:border-zinc-950 z-10">
                        <ArrowRight className="h-6 w-6" />
                    </div>
                </div>

                {/* Step 2: Target */}
                <div className="xl:col-span-5 p-6 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/30 rounded-2xl shadow-sm space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="flex items-center gap-2 border-b border-emerald-100/50 dark:border-emerald-900/30 pb-3 relative z-10">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">2</div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800 dark:text-emerald-400">Target Allocation</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-500">New Session *</Label>
                            <Select onValueChange={setTargetYearId} value={targetYearId || undefined}>
                                <SelectTrigger className="h-11 text-sm border-emerald-200/60 dark:border-emerald-800/50 bg-white dark:bg-zinc-950 shadow-none"><SelectValue placeholder="Session" /></SelectTrigger>
                                <SelectContent>{yearList.map((y: any) => (<SelectItem key={y.id} value={y.id}>{y.name || y.year}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-500">Promote To *</Label>
                            <Select onValueChange={(val) => { setTargetClassId(val); setTargetSectionId(""); }} value={targetClassId || undefined}>
                                <SelectTrigger className="h-11 text-sm border-emerald-200/60 dark:border-emerald-800/50 bg-white dark:bg-zinc-950 shadow-none"><SelectValue placeholder="Class" /></SelectTrigger>
                                <SelectContent>{classList.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-500">Section (Opt)</Label>
                            <Select onValueChange={setTargetSectionId} value={targetSectionId || undefined} disabled={!targetClassId}>
                                <SelectTrigger className="h-11 text-sm border-emerald-200/60 dark:border-emerald-800/50 bg-white dark:bg-zinc-950 shadow-none"><SelectValue placeholder="Section" /></SelectTrigger>
                                <SelectContent>{targetSectionList.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Banner */}
            {students.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                        Leave the <strong>Marks</strong>, <strong>%</strong>, and <strong>Grade</strong> inputs empty to let the system automatically aggregate data from the student&apos;s exam records. Students marked as <strong className="text-rose-500">FAIL</strong> will be excluded from promotion.
                    </p>
                </div>
            )}

            {/* Evaluation Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-zinc-900/50">
                    <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                        Student Evaluation List
                    </h3>
                    {students.length > 0 && (
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg shadow-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                {selectedCount} <span className="font-medium text-zinc-400">/ {students.length} Selected</span>
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800">
                                <TableHead className="w-[60px] text-center px-4">
                                    <Checkbox
                                        checked={selectedCount > 0 && selectedCount === allSelectableCount}
                                        onCheckedChange={toggleSelectAll}
                                        disabled={students.length === 0}
                                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                </TableHead>
                                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Student Identity</TableHead>
                                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Marks</TableHead>
                                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-zinc-500">%</TableHead>
                                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-zinc-500">Grade</TableHead>
                                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-zinc-500 w-[180px]">Result Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {isFetchingStudents ? (
                                <TableRow><TableCell colSpan={6} className="h-64 text-center text-zinc-400 font-medium animate-pulse">Synchronizing records...</TableCell></TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                                            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                                <Search className="h-8 w-8 text-zinc-400" />
                                            </div>
                                            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Select a source class to load students</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student: any) => {
                                    const isFailed = studentsState[student.id]?.status === "FAIL";
                                    return (
                                        <TableRow key={student.id} className={`transition-colors border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 ${isFailed ? "bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/60" : ""}`}>
                                            <TableCell className="text-center px-4 py-3">
                                                <Checkbox
                                                    checked={studentsState[student.id]?.selected || false}
                                                    onCheckedChange={(val) => handleInputChange(student.id, "selected", val)}
                                                    disabled={isFailed}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700">
                                                        <AvatarImage src={student.profilePicture} /><AvatarFallback className="bg-zinc-100 dark:bg-zinc-800"><UserCircle className="h-5 w-5 text-zinc-400" /></AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`font-bold text-sm truncate ${isFailed ? "text-zinc-500 line-through decoration-rose-300" : "text-zinc-900 dark:text-zinc-100"}`}>
                                                            {student.firstName} {student.lastName}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5">
                                                            Roll: {student.rollNumber} <span className="mx-1 opacity-50">|</span> ID: {student.studentId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Input
                                                    className={`h-9 w-20 text-xs font-mono shadow-sm bg-white dark:bg-zinc-950 ${isFailed ? "opacity-50" : ""}`}
                                                    placeholder="Auto"
                                                    value={studentsState[student.id]?.marks || ""}
                                                    onChange={(e) => handleInputChange(student.id, "marks", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Input
                                                    className={`h-9 w-20 text-xs font-mono shadow-sm bg-white dark:bg-zinc-950 ${isFailed ? "opacity-50" : ""}`}
                                                    placeholder="Auto"
                                                    value={studentsState[student.id]?.percentage || ""}
                                                    onChange={(e) => handleInputChange(student.id, "percentage", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <Input
                                                    className={`h-9 w-16 text-xs font-bold uppercase text-center shadow-sm bg-white dark:bg-zinc-950 ${isFailed ? "opacity-50 text-rose-500" : "text-emerald-600"}`}
                                                    placeholder="Auto"
                                                    value={studentsState[student.id]?.grade || ""}
                                                    onChange={(e) => handleInputChange(student.id, "grade", e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="py-3 pr-5">
                                                <Select value={studentsState[student.id]?.status || "PASS"} onValueChange={(val) => handleInputChange(student.id, "status", val)}>
                                                    <SelectTrigger className={`h-9 text-xs font-bold shadow-sm ${isFailed ? "border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30" : "bg-white dark:bg-zinc-950"}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PASS" className="text-xs font-bold text-emerald-600">PASS</SelectItem>
                                                        <SelectItem value="PROMOTED_WITH_GRACE" className="text-xs font-bold text-blue-600">GRACE PASS</SelectItem>
                                                        <SelectItem value="FAIL" className="text-xs font-bold text-rose-600">FAIL</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex h-10 w-10 bg-zinc-100 dark:bg-zinc-900 rounded-full items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                            Ready to promote <span className="text-emerald-600 dark:text-emerald-400 text-base">{selectedCount}</span> students
                        </p>
                        <p className="text-[11px] font-medium text-zinc-500 hidden sm:block">Please verify target session and class before executing.</p>
                    </div>
                </div>
                <Button
                    onClick={handlePromote}
                    disabled={bulkPromoteMutation.isPending || selectedCount === 0 || !targetYearId || !targetClassId}
                    className="h-11 px-6 sm:px-10 text-sm font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all"
                >
                    {bulkPromoteMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <TrendingUp className="mr-2 h-5 w-5" />}
                    Execute Promotion
                </Button>
            </div>
        </div>
    );
}