/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Plus, Edit, Trash2, Search, Clock, MapPin,
    User, BookOpen, Layers, FilterX, ChevronLeft,
    ChevronRight, Phone, CalendarDays
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
        queryFn: () => AcademicService.getAllSections(selectedClassId),
        enabled: selectedClassId !== "all"
    });

    const { data: serverResponse, isLoading: isRoutinesLoading } = useQuery({
        queryKey: ["routines", currentPage, selectedClassId, selectedSectionId, selectedDay, selectedTime, searchTerm],
        queryFn: () => RoutineService.getAllRoutines({
            page: currentPage,
            limit: 10,
            classId: selectedClassId === "all" ? undefined : selectedClassId,
            sectionId: selectedSectionId === "all" ? undefined : selectedSectionId,
            day: selectedDay === "all" ? undefined : selectedDay,
            startTime: selectedTime === "all" ? undefined : selectedTime,
            searchTerm: searchTerm || undefined
        }),
    });

    // ✅ এপিআই রেসপন্স অনুযায়ী ডাটা ডিকনস্ট্রাকশন
    // আপনার এপিআই "data" অবজেক্টের ভেতর "data" অ্যারে এবং "meta" পাঠাচ্ছে
    const routines = serverResponse?.data?.data || [];
    const meta = serverResponse?.data?.meta;
    const availableTimes = meta?.availableTimes || [];

    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm(""); setSelectedClassId("all"); setSelectedSectionId("all");
        setSelectedDay("all"); setSelectedTime("all"); setCurrentPage(1);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">Routine Management</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Efficiently manage and track all class schedules.</p>
                </div>
                <Button onClick={() => { setSelectedRoutine(null); setIsModalOpen(true); }} className="shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Add Routine
                </Button>
            </div>

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="bg-muted/20 border-b border-border/40 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search subject, teacher or phone..."
                                className="pl-9 bg-background focus:ring-1"
                                value={searchTerm}
                                onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                            />
                        </div>

                        <Select value={selectedClassId} onValueChange={(val) => { handleFilterChange(setSelectedClassId, val); setSelectedSectionId("all"); }}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Class" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                {Array.isArray(classes) && classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedSectionId} onValueChange={(val) => handleFilterChange(setSelectedSectionId, val)} disabled={selectedClassId === "all"}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Section" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sections</SelectItem>
                                {Array.isArray(sections) && sections.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedDay} onValueChange={(val) => handleFilterChange(setSelectedDay, val)}>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Day" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Days</SelectItem>
                                {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={selectedTime} onValueChange={(val) => handleFilterChange(setSelectedTime, val)}>
                            <SelectTrigger className="bg-background">
                                <div className="flex items-center gap-2 truncate">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="Time" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Times</SelectItem>
                                {availableTimes.map((t: string) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Showing <strong className="text-foreground">{meta?.total || 0}</strong> schedules</span>
                        {(searchTerm || selectedClassId !== "all" || selectedDay !== "all" || selectedTime !== "all") && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:bg-destructive/10 h-8">
                                <FilterX className="mr-2 h-4 w-4" /> Clear Filters
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="pl-6">Day & Time</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Class Info</TableHead>
                                    <TableHead>Teacher Info</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isRoutinesLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-48 text-center">Loading schedules...</TableCell></TableRow>
                                ) : routines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <CalendarDays className="h-10 w-10 mb-4 opacity-10" />
                                                <p className="text-lg font-semibold text-foreground">No records found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    routines.map((routine: any) => (
                                        <TableRow key={routine.id} className="group hover:bg-muted/40 transition-colors">
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col gap-1">
                                                    <Badge variant="outline" className="w-fit font-bold bg-primary/5 text-primary border-primary/20">{routine.day}</Badge>
                                                    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> {routine.startTime} - {routine.endTime}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4 text-emerald-500" />
                                                    {routine.subject?.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="font-medium text-foreground">{routine.class?.name}</p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="h-3 w-3" />Section {routine.section?.name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {routine.teacher ? (
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-sm flex items-center gap-2">
                                                            <User className="h-3.5 w-3.5 text-blue-500" />
                                                            {routine.teacher.firstName} {routine.teacher.lastName}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                                                            <Phone className="h-3 w-3 text-emerald-600" />
                                                            {routine.teacher.phone || "N/A"}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-0">No Teacher</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                                    <MapPin className="h-3.5 w-3.5 text-rose-500" /> {routine.roomNo || "N/A"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => { setSelectedRoutine(routine); setIsModalOpen(true); }}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => { setSelectedRoutine(routine); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {meta && meta.totalPage > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-border/40">
                            <p className="text-xs text-muted-foreground font-medium">Total {meta.total} records</p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center px-3 text-xs font-bold border rounded-md bg-background">
                                    {currentPage} / {meta.totalPage}
                                </div>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(meta.totalPage, p + 1))}
                                    disabled={currentPage === meta.totalPage}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <RoutineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedRoutine} />
            <DeleteRoutineModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} routineId={selectedRoutine?.id || null} />
        </div>
    );
}