/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Plus, Edit, Trash2, Search, Clock, MapPin,
    User, BookOpen, Layers, FilterX, ChevronLeft,
    ChevronRight, Phone, CalendarDays, ChevronsLeft,
    ChevronsRight, GraduationCap, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AcademicService } from "@/services/academic.service";
import { RoutineService } from "@/services/routine.service";
import { PeriodService } from "@/services/period.service";
import { RoutineModal } from "./routine-modal";
import { DeleteRoutineModal } from "./delete-routine-modal";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function RoutinePage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
    const [selectedDay, setSelectedDay] = useState<string>("all");
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null);

    const { data: classes } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses()
    });

    const { data: sections } = useQuery({
        queryKey: ["sections", selectedClassId],
        queryFn: () => AcademicService.getAllSections({ classId: selectedClassId }),
        enabled: selectedClassId !== "all"
    });

    const { data: periods } = useQuery({
        queryKey: ["periods-filter"],
        queryFn: () => PeriodService.getAllPeriods()
    });

    const { data: serverResponse, isLoading: isRoutinesLoading } = useQuery({
        queryKey: ["routines", currentPage, limit, selectedClassId, selectedSectionId, selectedDay, selectedPeriodId, searchTerm],
        queryFn: () => RoutineService.getAllRoutines({
            page: currentPage,
            limit: limit,
            classId: selectedClassId === "all" ? undefined : selectedClassId,
            sectionId: selectedSectionId === "all" ? undefined : selectedSectionId,
            day: selectedDay === "all" ? undefined : selectedDay,
            periodId: selectedPeriodId === "all" ? undefined : selectedPeriodId,
            searchTerm: searchTerm || undefined
        }),
    });

    const classList = classes?.data?.data || classes?.data || (Array.isArray(classes) ? classes : []);
    const sectionList = sections?.data?.data || sections?.data || (Array.isArray(sections) ? sections : []);
    const periodList = periods?.data || (Array.isArray(periods) ? periods : []);

    const routines = serverResponse?.data || [];
    const meta = serverResponse?.meta;

    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedClassId("all");
        setSelectedSectionId("all");
        setSelectedDay("all");
        setSelectedPeriodId("all");
        setCurrentPage(1);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in zoom-in-[0.99] duration-500 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[20px] shadow-sm border border-white/60 dark:border-white/10">
                        <CalendarDays className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Institution Schedule</h2>
                        <p className="text-muted-foreground text-[14px] font-bold opacity-80">Period-based class routine management.</p>
                    </div>
                </div>
                <Button
                    onClick={() => { setSelectedRoutine(null); setIsModalOpen(true); }}
                    className="rounded-2xl font-black px-8 py-6 shadow-xl shadow-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 bg-primary text-white"
                >
                    <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Add Schedule
                </Button>
            </div>

            <Card className="rounded-[32px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300">
                <CardHeader className="bg-white/30 dark:bg-black/10 border-b border-black/5 dark:border-white/5 p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by subject or teacher..."
                                className="pl-11 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-bold text-[13px] h-12 rounded-2xl transition-all"
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                            />
                        </div>

                        <Select value={selectedClassId} onValueChange={(val) => { handleFilterChange(setSelectedClassId, val); setSelectedSectionId("all"); }}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl">
                                <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="font-bold text-primary">All Classes</SelectItem>
                                {classList.map((c: any) => <SelectItem key={c.id} value={String(c.id)} className="font-medium">{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedSectionId} onValueChange={(val) => handleFilterChange(setSelectedSectionId, val)} disabled={selectedClassId === "all"}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="font-bold text-primary">All Sections</SelectItem>
                                {sectionList.map((s: any) => <SelectItem key={s.id} value={String(s.id)} className="font-medium">{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedDay} onValueChange={(val) => handleFilterChange(setSelectedDay, val)}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl">
                                <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="font-bold text-primary">All Days</SelectItem>
                                {DAYS.map((d) => <SelectItem key={d} value={d} className="font-medium">{d}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedPeriodId} onValueChange={(val) => handleFilterChange(setSelectedPeriodId, val)}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl max-h-[300px]">
                                <SelectItem value="all" className="font-bold text-primary">All Periods</SelectItem>
                                {periodList.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id} className="font-medium">
                                        {p.name} ({p.startTime})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <span className="text-[13px] font-bold text-slate-500">
                            Found <span className="text-primary font-black">{meta?.total || 0}</span> matches
                        </span>
                        {(searchTerm || selectedClassId !== "all" || selectedDay !== "all" || selectedPeriodId !== "all") && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:bg-red-500/10 h-9 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all">
                                <FilterX className="mr-2 h-4 w-4" /> Reset Filters
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30">
                                <TableRow className="hover:bg-transparent border-b-black/5 dark:border-b-white/5">
                                    <TableHead className="pl-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Period & Day</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Subject Details</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Class / Section</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Faculty</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Location</TableHead>
                                    <TableHead className="text-right pr-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Manage</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isRoutinesLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center text-slate-400 font-bold animate-pulse">Syncing data...</TableCell>
                                    </TableRow>
                                ) : routines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-80 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-300 dark:border-white/10 shadow-inner">
                                                    <BookOpen className="h-12 w-12 text-slate-300" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[16px] font-black text-slate-600 dark:text-slate-400">No schedules mapped</p>
                                                    <p className="text-[13px] font-medium text-slate-400">Try adjusting your filters or add a new entry.</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    routines.map((routine: any) => (
                                        <TableRow key={routine.id} className="group hover:bg-white/80 dark:hover:bg-white/5 transition-all border-b-black/5 dark:border-b-white/5">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-primary/10 text-primary border-0 font-black text-[10px] tracking-tighter rounded-lg px-2.5 py-1">
                                                            {routine.period?.name}
                                                        </Badge>
                                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{routine.day.slice(0, 3)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 dark:text-slate-300 bg-black/5 dark:bg-white/5 w-fit px-2.5 py-1 rounded-lg">
                                                        <Clock className="h-3.5 w-3.5 text-primary" />
                                                        {routine.period?.startTime} - {routine.period?.endTime}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                {routine.subject ? (
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                                                            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[15px] text-slate-900 dark:text-white leading-none mb-1.5">
                                                                {routine.subject.name}
                                                            </p>
                                                            <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-white/10 text-slate-500 rounded-md py-0 px-1.5">
                                                                CODE: {routine.subject.code}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge className="bg-orange-500/10 text-orange-600 border-0 font-black text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-xl">
                                                        <Info className="h-3.5 w-3.5 mr-1.5" /> Break Time
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                                        <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500"><GraduationCap className="h-3.5 w-3.5" /></div>
                                                        <span className="font-black text-[14px]">Class {routine.class?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <div className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400"><Layers className="h-3.5 w-3.5" /></div>
                                                        <span className="font-bold text-[12px]">Section {routine.section?.name}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                {routine.teacher ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden shadow-sm">
                                                            <User className="h-5 w-5 text-slate-400" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="font-black text-[14px] text-slate-900 dark:text-white leading-tight">
                                                                {routine.teacher.firstName} {routine.teacher.lastName}
                                                            </p>
                                                            <p className="text-[11px] font-bold text-primary flex items-center gap-1">
                                                                <Phone className="h-3 w-3" /> {routine.teacher.phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[12px] font-bold text-slate-400 italic ml-2">No faculty assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-2 text-[13px] font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 w-fit px-3 py-1.5 rounded-xl shadow-sm">
                                                    <MapPin className="h-4 w-4 text-rose-500" />
                                                    {routine.roomNo || "Open Area"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-5">
                                                <div className="flex justify-end gap-3 transition-all duration-300">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm" onClick={() => { setSelectedRoutine(routine); setIsModalOpen(true); }}>
                                                        <Edit className="h-4 w-4 stroke-[2.5]" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-500/10 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm" onClick={() => { setSelectedRoutine(routine); setIsDeleteModalOpen(true); }}>
                                                        <Trash2 className="h-4 w-4 stroke-[2.5]" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-md gap-4">
                        <div className="text-[13px] font-bold text-slate-500 order-2 sm:order-1">
                            Displaying <span className="text-slate-900 dark:text-white font-black">{routines.length}</span> of <span className="text-slate-900 dark:text-white font-black">{meta?.total || 0}</span> records
                        </div>

                        <div className="flex items-center gap-6 order-1 sm:order-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-bold text-slate-400 hidden lg:inline">Per page</span>
                                <Select value={`${limit}`} onValueChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}>
                                    <SelectTrigger className="h-9 w-[75px] rounded-xl font-black bg-white dark:bg-white/5 border-slate-200 dark:border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold">
                                        {[10, 20, 50].map(v => <SelectItem key={v} value={`${v}`}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-30"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 stroke-[3]" />
                                </Button>
                                <div className="px-4 h-9 flex items-center justify-center bg-primary text-white rounded-xl font-black text-[13px] shadow-lg shadow-primary/20">
                                    {currentPage} / {meta?.totalPage || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-30"
                                    onClick={() => setCurrentPage(prev => Math.min(meta?.totalPage || 1, prev + 1))}
                                    disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0}
                                >
                                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <RoutineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedRoutine} />
            <DeleteRoutineModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} routineId={selectedRoutine?.id || null} />
        </div>
    );
}