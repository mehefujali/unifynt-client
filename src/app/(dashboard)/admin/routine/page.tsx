/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Plus, Edit, Trash2, Search, Clock, MapPin,
    User, BookOpen, Layers, FilterX, ChevronLeft,
    ChevronRight, Phone, CalendarDays, ChevronsLeft, ChevronsRight,
    GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AcademicService } from "@/services/academic.service";
import { RoutineService } from "@/services/routine.service";
import { RoutineModal } from "./routine-modal";
import { DeleteRoutineModal } from "./delete-routine-modal";

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function RoutinePage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
    const [selectedDay, setSelectedDay] = useState<string>("all");
    const [selectedTime, setSelectedTime] = useState<string>("all");

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

    const { data: serverResponse, isLoading: isRoutinesLoading } = useQuery({
        queryKey: ["routines", currentPage, limit, selectedClassId, selectedSectionId, selectedDay, selectedTime, searchTerm],
        queryFn: () => RoutineService.getAllRoutines({
            page: currentPage,
            limit: limit,
            classId: selectedClassId === "all" ? undefined : selectedClassId,
            sectionId: selectedSectionId === "all" ? undefined : selectedSectionId,
            day: selectedDay === "all" ? undefined : selectedDay,
            startTime: selectedTime === "all" ? undefined : selectedTime,
            searchTerm: searchTerm || undefined
        }),
    });

    const classList = classes?.data?.data || classes?.data || (Array.isArray(classes) ? classes : []);
    const sectionList = sections?.data?.data || sections?.data || (Array.isArray(sections) ? sections : []);
    
    const routines = serverResponse?.data || [];
    const meta = serverResponse?.meta;
    const availableTimes = meta?.availableTimes || [];

    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedClassId("all");
        setSelectedSectionId("all");
        setSelectedDay("all");
        setSelectedTime("all");
        setCurrentPage(1);
        setLimit(10);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in zoom-in-[0.99] duration-500 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-white/10">
                        <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">Routine Management</h2>
                        <p className="text-muted-foreground mt-1 text-[14px] font-medium">Efficiently manage and track all class schedules.</p>
                    </div>
                </div>
                <Button 
                    onClick={() => { setSelectedRoutine(null); setIsModalOpen(true); }} 
                    className="rounded-xl font-bold px-6 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Routine
                </Button>
            </div>

            <Card className="rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300">
                <CardHeader className="bg-white/30 dark:bg-black/10 border-b border-black/5 dark:border-white/5 pb-6 space-y-5 backdrop-blur-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search subject, teacher or phone..."
                                className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-medium text-[13px] backdrop-blur-sm rounded-xl h-10"
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                            />
                        </div>

                        <Select value={selectedClassId} onValueChange={(val) => { handleFilterChange(setSelectedClassId, val); setSelectedSectionId("all"); }}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm rounded-xl h-10">
                                <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold text-primary">All Classes</SelectItem>
                                {classList.map((c: any) => <SelectItem key={c.id} value={String(c.id)} className="font-medium">{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedSectionId} onValueChange={(val) => handleFilterChange(setSelectedSectionId, val)} disabled={selectedClassId === "all"}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm rounded-xl h-10">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold text-primary">All Sections</SelectItem>
                                {sectionList.map((s: any) => <SelectItem key={s.id} value={String(s.id)} className="font-medium">{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedDay} onValueChange={(val) => handleFilterChange(setSelectedDay, val)}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm rounded-xl h-10">
                                <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold text-primary">All Days</SelectItem>
                                {DAYS.map((d) => <SelectItem key={d} value={d} className="font-medium">{d}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedTime} onValueChange={(val) => handleFilterChange(setSelectedTime, val)}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm rounded-xl h-10">
                                <div className="flex items-center gap-2 truncate">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <SelectValue placeholder="Time" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold text-primary">All Times</SelectItem>
                                {availableTimes.map((t: string) => <SelectItem key={t} value={t} className="font-medium">{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-between items-center text-[13px]">
                        <span className="text-slate-500 font-medium">Showing <strong className="text-slate-900 dark:text-white font-extrabold">{meta?.total || 0}</strong> schedules</span>
                        {(searchTerm || selectedClassId !== "all" || selectedDay !== "all" || selectedTime !== "all") && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:bg-red-500/10 hover:text-red-600 h-8 rounded-lg font-bold transition-colors">
                                <FilterX className="mr-2 h-4 w-4" /> Clear Filters
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/30">
                                <TableRow className="hover:bg-transparent border-b-black/5 dark:border-b-white/5">
                                    <TableHead className="pl-6 h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Day & Time</TableHead>
                                    <TableHead className="h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Subject</TableHead>
                                    <TableHead className="h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Class Info</TableHead>
                                    <TableHead className="h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Teacher Info</TableHead>
                                    <TableHead className="h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Room</TableHead>
                                    <TableHead className="text-right pr-6 h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isRoutinesLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-slate-500 font-medium">Loading schedules...</TableCell>
                                    </TableRow>
                                ) : routines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="p-4 bg-white/50 dark:bg-white/5 rounded-full mb-4 ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
                                                    <CalendarDays className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="text-[14px] font-bold text-slate-500">No schedules found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    routines.map((routine: any) => (
                                        <TableRow key={routine.id} className="group hover:bg-white/60 dark:hover:bg-white/5 transition-colors border-b-black/5 dark:border-b-white/5">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <Badge variant="outline" className="w-fit font-black bg-primary/5 text-primary border-primary/20 uppercase tracking-widest text-[10px] px-2.5 py-0.5 rounded-md shadow-sm">
                                                        {routine.day}
                                                    </Badge>
                                                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-white/50 dark:bg-black/20 w-fit px-2 py-1 rounded-md border border-black/5 dark:border-white/5 shadow-sm">
                                                        <Clock className="h-3.5 w-3.5 text-primary" /> 
                                                        {routine.startTime} - {routine.endTime}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm flex-shrink-0">
                                                        <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-[14px] text-slate-900 dark:text-white leading-tight">
                                                            {routine.subject?.name}
                                                        </p>
                                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                                            CODE: {routine.subject?.code}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-bold text-[13px] text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <GraduationCap className="h-3.5 w-3.5 text-blue-500" />
                                                        {routine.class?.name}
                                                    </p>
                                                    <p className="text-[12px] font-semibold text-slate-500 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/50 w-fit px-1.5 rounded text-primary">
                                                        <Layers className="h-3 w-3" /> Section {routine.section?.name}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {routine.teacher ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center border border-blue-100 dark:border-blue-500/20 flex-shrink-0">
                                                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <p className="font-bold text-[13px] text-slate-900 dark:text-white leading-tight">
                                                                {routine.teacher.firstName} {routine.teacher.lastName}
                                                            </p>
                                                            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                                                <Phone className="h-3 w-3 text-slate-400" />
                                                                {routine.teacher.phone || "N/A"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold px-2.5 rounded-md text-[11px]">
                                                        Self Study
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-black/20 w-fit px-2.5 py-1.5 rounded-lg border border-black/5 dark:border-white/5 shadow-sm">
                                                    <MapPin className="h-4 w-4 text-rose-500" /> 
                                                    {routine.roomNo || "TBA"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition-colors bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-sm" onClick={() => { setSelectedRoutine(routine); setIsModalOpen(true); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 transition-colors bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-sm" onClick={() => { setSelectedRoutine(routine); setIsDeleteModalOpen(true); }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-md gap-4 sm:gap-0 rounded-b-[24px]">
                        <div className="flex-1 text-[13px] font-medium text-slate-500 text-center sm:text-left">
                            Showing <span className="font-bold text-slate-900 dark:text-white">{routines.length > 0 ? (currentPage - 1) * limit + 1 : 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * limit, meta?.total || 0)}</span> of <span className="font-bold text-slate-900 dark:text-white">{meta?.total || 0}</span> entries
                        </div>
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                            <div className="flex items-center space-x-2">
                                <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">Rows per page</p>
                                <Select
                                    value={`${limit}`}
                                    onValueChange={(value) => {
                                        setLimit(Number(value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-lg font-bold">
                                        <SelectValue placeholder={limit} />
                                    </SelectTrigger>
                                    <SelectContent side="top" className="rounded-xl">
                                        {[10, 20, 30, 40, 50].map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`} className="font-medium">
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex w-[100px] items-center justify-center text-[13px] font-bold text-slate-700 dark:text-slate-300">
                                Page {currentPage} of {meta?.totalPage || 1}
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm"
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(meta?.totalPage || 1, prev + 1))}
                                    disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    className="hidden h-8 w-8 p-0 lg:flex rounded-lg border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm"
                                    onClick={() => setCurrentPage(meta?.totalPage || 1)}
                                    disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0}
                                >
                                    <ChevronsRight className="h-4 w-4" />
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