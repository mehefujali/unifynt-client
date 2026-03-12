/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Loader2,
    TrendingUp,
    ArrowRight,
    AlertCircle,
    Info,
    GraduationCap,
    Clock,
    UserCircle,
    History,
    CheckCircle2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";

const extractData = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
};

export default function StudentPromotionPage() {
    const queryClient = useQueryClient();

    // Source States
    const [sourceYearId, setSourceYearId] = useState<string>("");
    const [sourceClassId, setSourceClassId] = useState<string>("");
    const [sourceSectionId, setSourceSectionId] = useState<string>("");

    // Target States
    const [targetYearId, setTargetYearId] = useState<string>("");
    const [targetClassId, setTargetClassId] = useState<string>("");
    const [targetSectionId, setTargetSectionId] = useState<string>("");

    // Student Evaluation State
    const [studentsState, setStudentsState] = useState<Record<string, any>>({});

    // Modal State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    // Fetch Initial Data
    const { data: classesRes } = useQuery({ queryKey: ["classes"], queryFn: () => AcademicService.getAllClasses() });
    const { data: yearsRes } = useQuery({ queryKey: ["academicYears"], queryFn: () => AcademicService.getAllAcademicYears() });
    const { data: sourceSectionsRes } = useQuery({ queryKey: ["sections", sourceClassId], queryFn: () => AcademicService.getAllSections({ classId: sourceClassId }), enabled: !!sourceClassId });
    const { data: targetSectionsRes } = useQuery({ queryKey: ["sections", targetClassId], queryFn: () => AcademicService.getAllSections({ classId: targetClassId }), enabled: !!targetClassId });

    // Fetch Aggregated Promotion Data
    const { data: studentsRes, isLoading: isFetchingStudents } = useQuery({
        queryKey: ["promotion-preview", sourceYearId, sourceClassId, sourceSectionId],
        queryFn: () => StudentService.getPromotionPreview({ academicYearId: sourceYearId, classId: sourceClassId, sectionId: sourceSectionId }),
        enabled: !!sourceClassId && !!sourceYearId
    });

    const students = useMemo(() => extractData(studentsRes), [studentsRes]);

    useEffect(() => {
        const fetchedStudents = extractData(studentsRes);
        if (fetchedStudents && fetchedStudents.length > 0) {
            const initialState: Record<string, any> = {};
            fetchedStudents.forEach((s: any) => {
                const shouldSelect = s.status === "PASS" && !s.isAlreadyPromoted;
                initialState[s.id] = {
                    selected: shouldSelect,
                    marks: s.marks || 0,
                    totalMaxMarks: s.totalMaxMarks || 0,
                    percentage: s.percentage || 0,
                    grade: s.grade || "",
                    status: s.status || "FAIL",
                    remarks: "",
                    isAlreadyPromoted: s.isAlreadyPromoted,
                    examCount: s.examCount || 0
                };
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStudentsState(initialState);
        } else {
            setStudentsState(prev => Object.keys(prev).length === 0 ? prev : {});
        }
    }, [studentsRes]);

    const handleInputChange = (id: string, field: string, value: any) => {
        setStudentsState(prev => {
            const isUnsuccessful = field === "status" && (value === "FAIL" || value === "SUPPLEMENTARY");
            const newState = { ...prev, [id]: { ...prev[id], [field]: value } };

            // Logic: Fail/Supplementary = Uncheck & Disable, Pass/Grace = Auto Check
            if (isUnsuccessful) newState[id].selected = false;
            else if (field === "status" && !isUnsuccessful && !newState[id].isAlreadyPromoted) newState[id].selected = true;

            return newState;
        });
    };

    const toggleSelectAll = (checked: boolean) => {
        setStudentsState(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(id => {
                const s = newState[id];
                if (s.status !== "FAIL" && s.status !== "SUPPLEMENTARY" && !s.isAlreadyPromoted) {
                    newState[id].selected = checked;
                }
            });
            return newState;
        });
    };

    const bulkPromoteMutation = useMutation({
        mutationFn: (payload: any) => StudentService.promoteBulkStudents(payload),
        onSuccess: (res) => {
            toast.success(res?.message || "Students promoted successfully!");
            queryClient.invalidateQueries({ queryKey: ["promotion-preview"] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            setStudentsState({});
            setSourceClassId("");
            setSourceSectionId("");
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Promotion failed"),
    });

    const handlePromote = () => {
        const selectedStudents = Object.keys(studentsState)
            .filter(id => {
                const s = studentsState[id];
                return s.selected && s.status !== "FAIL" && s.status !== "SUPPLEMENTARY" && !s.isAlreadyPromoted;
            })
            .map(id => ({
                id,
                marks: studentsState[id].marks ? Number(studentsState[id].marks) : undefined,
                percentage: studentsState[id].percentage ? Number(studentsState[id].percentage) : undefined,
                grade: studentsState[id].grade || undefined,
                status: studentsState[id].status,
                remarks: studentsState[id].remarks || undefined,
            }));

        if (selectedStudents.length === 0) return toast.error("Select at least one passing student to promote.");

        // 1. Session Validation: Target session must be STRICTLY FUTURE than Source session
        const sourceYear = yearList.find((y: any) => y.id === sourceYearId);
        const targetYear = yearList.find((y: any) => y.id === targetYearId);
        if (sourceYear && targetYear) {
            if (new Date(targetYear.startDate) <= new Date(sourceYear.startDate)) {
                return toast.error("Target session must be a future session (e.g. 2026-27). You cannot promote to the same or a previous session.");
            }
        }

        // 2. Class Validation: Target class must be STRICTLY GREATER than Source class
        const sourceClass = classList.find((c: any) => c.id === sourceClassId);
        const targetClass = classList.find((c: any) => c.id === targetClassId);
        if (sourceClass && targetClass) {
            if (targetClass.numericValue <= sourceClass.numericValue) {
                return toast.error(`Target class (${targetClass.name}) must be a higher class than the current class (${sourceClass.name}).`);
            }
        }

        // Open Modal instead of executing directly
        setIsConfirmModalOpen(true);
        setConfirmText("");
    };

    const executePromotion = () => {
        if (confirmText !== "CONFIRM PROMOTION") {
            return toast.error("Please type CONFIRM PROMOTION and try again.");
        }

        const selectedStudents = Object.keys(studentsState)
            .filter(id => {
                const s = studentsState[id];
                return s.selected && s.status !== "FAIL" && s.status !== "SUPPLEMENTARY" && !s.isAlreadyPromoted;
            })
            .map(id => ({
                id,
                marks: studentsState[id].marks ? Number(studentsState[id].marks) : undefined,
                percentage: studentsState[id].percentage ? Number(studentsState[id].percentage) : undefined,
                grade: studentsState[id].grade || undefined,
                status: studentsState[id].status,
                remarks: studentsState[id].remarks || undefined,
            }));

        bulkPromoteMutation.mutate({
            targetAcademicYearId: targetYearId,
            targetClassId,
            targetSectionId: targetSectionId || undefined,
            students: selectedStudents,
        });

        setIsConfirmModalOpen(false);
    };

    const classList = extractData(classesRes);
    const yearList = extractData(yearsRes);
    const sourceSectionList = extractData(sourceSectionsRes);
    const targetSectionList = extractData(targetSectionsRes);

    const allSelectableCount = useMemo(() => Object.values(studentsState).filter(s => s.status !== "FAIL" && s.status !== "SUPPLEMENTARY" && !s.isAlreadyPromoted).length, [studentsState]);
    const selectedCount = useMemo(() => Object.values(studentsState).filter(s => s.selected).length, [studentsState]);

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen pb-28 bg-transparent">
            {/* Header Section */}
            <div className="flex flex-col gap-2 pb-5 border-b border-zinc-200 dark:border-zinc-800">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                    <div className="h-12 w-12 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-sm">
                        <TrendingUp className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    Student Promotion
                </h1>
                <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                    Evaluate students based on aggregate academic performance. The system automatically detects failures and absentees to ensure accurate promotion across sessions.
                </p>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative">
                {/* Step 1: Source */}
                <div className="xl:col-span-12 lg:col-span-12 p-6 bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm space-y-5 transition-colors">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-5">
                            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-sidebar-border pb-3">
                                <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center justify-center text-xs font-bold border border-zinc-200 dark:border-zinc-700">1</div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Source Configuration</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Current Session</Label>
                                    <Select onValueChange={(val) => { setSourceYearId(val); setStudentsState({}); }} value={sourceYearId || undefined}>
                                        <SelectTrigger className="h-11 text-[13px] font-bold bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border shadow-none"><SelectValue placeholder="Select Session" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{yearList.map((y: any) => (<SelectItem key={y.id} value={y.id}>{y.name || y.year}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Current Class</Label>
                                    <Select onValueChange={(val) => { setSourceClassId(val); setSourceSectionId(""); setStudentsState({}); }} value={sourceClassId || undefined} disabled={!sourceYearId}>
                                        <SelectTrigger className="h-11 text-[13px] font-bold bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border shadow-none"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{classList.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Current Section</Label>
                                    <Select onValueChange={setSourceSectionId} value={sourceSectionId || undefined} disabled={!sourceClassId}>
                                        <SelectTrigger className="h-11 text-[13px] font-bold bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border shadow-none"><SelectValue placeholder="All Sections" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{sourceSectionList.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center justify-center">
                            <div className="h-10 w-10 rounded-full bg-zinc-50 dark:bg-background/20 flex items-center justify-center text-zinc-300 dark:text-zinc-600 border border-zinc-200 dark:border-sidebar-border">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-5">
                            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-sidebar-border pb-3">
                                <div className="h-6 w-6 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-100 dark:border-blue-900/30">2</div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Target Allocation</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">New Session</Label>
                                    <Select onValueChange={setTargetYearId} value={targetYearId || undefined}>
                                        <SelectTrigger className="h-11 text-[13px] font-bold bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-none"><SelectValue placeholder="Session" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{yearList.map((y: any) => (<SelectItem key={y.id} value={y.id}>{y.name || y.year}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Promote To</Label>
                                    <Select onValueChange={(val) => { setTargetClassId(val); setTargetSectionId(""); }} value={targetClassId || undefined}>
                                        <SelectTrigger className="h-11 text-[13px] font-bold bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-none"><SelectValue placeholder="Class" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{classList.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Target Section</Label>
                                    <Select onValueChange={setTargetSectionId} value={targetSectionId || undefined} disabled={!targetClassId}>
                                        <SelectTrigger className="h-11 text-[13px] font-bold bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-none"><SelectValue placeholder="Section" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{targetSectionList.map((s: any) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Information Banner */}
            {students.length > 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                        Evaluations are strictly derived from <strong>Exam Schedules</strong> and aggregated from all results. Students who were absent in any exam or scored below pass marks in any subject are automatically flagged as <strong className="text-rose-600">FAIL / SUPPLEMENTARY</strong>. Admins can override statuses using the dropdown.
                    </p>
                </div>
            )}

            {/* Evaluation Table */}
            <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
                <div className="p-5 border-b border-zinc-100 dark:border-sidebar-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-background/40">
                    <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                        Student Performance List
                    </h3>
                    {students.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                                <GraduationCap className="h-3.5 w-3.5" /> {students.length} Total
                            </div>
                            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                    {selectedCount} <span className="font-medium opacity-70">/ {allSelectableCount} Selected</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-zinc-50/80 dark:bg-background/60 hover:bg-zinc-50 dark:hover:bg-background/60 border-zinc-200 dark:border-sidebar-border">
                                <TableHead className="w-[60px] text-center px-4">
                                    <Checkbox
                                        checked={selectedCount > 0 && selectedCount === allSelectableCount}
                                        onCheckedChange={toggleSelectAll}
                                        disabled={students.length === 0}
                                        className="data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 dark:data-[state=checked]:bg-zinc-100 dark:data-[state=checked]:border-zinc-100 dark:data-[state=checked]:text-zinc-900 shadow-none border-zinc-300 dark:border-zinc-700"
                                    />
                                </TableHead>
                                <TableHead className="h-12 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Rank & Identity</TableHead>
                                <TableHead className="h-12 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Aggregated Marks</TableHead>
                                <TableHead className="h-12 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">% & Grade</TableHead>
                                <TableHead className="h-12 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 min-w-[200px]">Result Status</TableHead>
                                <TableHead className="h-12 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 min-w-[150px]">Admin Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {isFetchingStudents ? (
                                <TableRow><TableCell colSpan={6} className="h-64 text-center text-zinc-400 font-medium"><Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" /> Aggregating records securely...</TableCell></TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                                            <div className="h-16 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                                <History className="h-8 w-8 text-zinc-400" />
                                            </div>
                                            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Select source session & class to load students</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((student: any, index: number) => {
                                    const stState = studentsState[student.id] || {};
                                    const isUnsuccessful = stState.status === "FAIL" || stState.status === "SUPPLEMENTARY";
                                    const isPromoted = stState.isAlreadyPromoted;

                                    return (
                                        <TableRow key={student.id}
                                            className={`transition-colors border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 
                                                ${isPromoted ? "opacity-60 bg-zinc-50 dark:bg-zinc-900" : ""}
                                                ${isUnsuccessful && !isPromoted ? "bg-rose-50/40 dark:bg-rose-950/10 hover:bg-rose-50/60" : ""}`}>
                                            <TableCell className="text-center px-4 py-3">
                                                <Checkbox
                                                    checked={stState.selected || false}
                                                    onCheckedChange={(val) => handleInputChange(student.id, "selected", val)}
                                                    disabled={isUnsuccessful || isPromoted}
                                                    className="data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 dark:data-[state=checked]:bg-zinc-100 dark:data-[state=checked]:border-zinc-100 dark:data-[state=checked]:text-zinc-900 shadow-none border-zinc-300 dark:border-zinc-700"
                                                />
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col items-center justify-center min-w-[32px]">
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Rank</span>
                                                        <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">#{index + 1}</span>
                                                    </div>
                                                    <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                                        <AvatarImage src={student.profilePicture} /><AvatarFallback className="bg-zinc-100 dark:bg-zinc-800"><UserCircle className="h-5 w-5 text-zinc-400" /></AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className={`font-bold text-sm truncate ${isUnsuccessful ? "text-zinc-500 line-through decoration-rose-300" : "text-zinc-900 dark:text-zinc-100"}`}>
                                                            {student.firstName} {student.lastName}
                                                        </span>
                                                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-0.5 whitespace-nowrap">
                                                            Roll: {student.rollNumber} <span className="mx-1 opacity-50">|</span> ID: {student.studentId}
                                                            {isPromoted && <span className="ml-2 px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-[9px] font-bold inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" />PROMOTED</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                        {stState.marks} <span className="text-xs text-zinc-400 font-medium">/ {stState.totalMaxMarks}</span>
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-semibold mt-0.5">from {stState.examCount} exams</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm">{stState.percentage}%</div>
                                                    <div className={`px-2 py-1 rounded font-bold text-xs uppercase shadow-sm ${isUnsuccessful ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                                                        {stState.grade || "N/A"}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 pr-4">
                                                <Select value={stState.status || "PASS"} onValueChange={(val) => handleInputChange(student.id, "status", val)} disabled={isPromoted}>
                                                    <SelectTrigger className={`h-9 text-xs font-bold shadow-sm ${stState.status === "FAIL" ? "border-rose-200 text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30" : stState.status === "SUPPLEMENTARY" ? "border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:border-amber-500/30" : "bg-white dark:bg-zinc-950"}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PASS" className="text-xs font-bold text-emerald-600">PASS</SelectItem>
                                                        <SelectItem value="PROMOTED_WITH_GRACE" className="text-xs font-bold text-blue-600">GRACE PASS</SelectItem>
                                                        <SelectItem value="SUPPLEMENTARY" className="text-xs font-bold text-amber-600">SUPPLEMENTARY</SelectItem>
                                                        <SelectItem value="FAIL" className="text-xs font-bold text-rose-600">FAIL</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="py-3 pr-4">
                                                <Input
                                                    className={`h-9 text-xs shadow-sm bg-white dark:bg-zinc-950 ${isPromoted ? "opacity-50" : ""}`}
                                                    placeholder="Reason / Remarks..."
                                                    value={stState.remarks || ""}
                                                    onChange={(e) => handleInputChange(student.id, "remarks", e.target.value)}
                                                    disabled={isPromoted}
                                                />
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
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 p-4 border-t border-zinc-200 dark:border-sidebar-border bg-white/95 dark:bg-sidebar/95 backdrop-blur-xl flex items-center justify-between z-30 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transition-colors">
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex h-10 w-10 bg-zinc-100 dark:bg-background/40 rounded-full items-center justify-center border border-zinc-200 dark:border-white/5">
                        <AlertCircle className="h-5 w-5 text-zinc-500" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">
                            Ready to promote <span className="text-blue-600 dark:text-blue-400 text-base">{selectedCount}</span> students
                        </p>
                        <p className="text-[11px] font-bold text-zinc-500 hidden sm:block uppercase tracking-wider">Verify target configuration before execution.</p>
                    </div>
                </div>
                <Button
                    onClick={handlePromote}
                    disabled={bulkPromoteMutation.isPending || selectedCount === 0 || !targetYearId || !targetClassId}
                    className="h-12 px-6 sm:px-12 text-[14px] font-black shadow-lg shadow-zinc-900/10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl transition-all"
                >
                    {bulkPromoteMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <TrendingUp className="mr-2 h-5 w-5" />}
                    Review & Execute
                </Button>
            </div>

            {/* Execution Confirmation Modal */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirm Mass Promotion
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-zinc-600">
                            You are about to permanently promote <strong>{selectedCount}</strong> students to the target session. This action updates their academic history and rolls them over.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-rose-50/50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 p-3 rounded-lg mt-2">
                        <p className="text-sm font-semibold text-rose-800 dark:text-rose-400">
                            Please type <span className="font-mono bg-rose-200 dark:bg-rose-900 px-1 rounded">CONFIRM PROMOTION</span> below to proceed.
                        </p>
                    </div>

                    <div className="py-2">
                        <Input
                            placeholder="Type CONFIRM PROMOTION here..."
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            className="font-mono text-center tracking-widest border-rose-200 focus-visible:ring-rose-500"
                        />
                    </div>

                    <DialogFooter className="mt-4 gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={executePromotion}
                            disabled={confirmText !== "CONFIRM PROMOTION" || bulkPromoteMutation.isPending}
                            className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/20"
                        >
                            {bulkPromoteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Execute Now
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
