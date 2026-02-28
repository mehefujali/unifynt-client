/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Clock, CalendarDays, Coffee, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PeriodService } from "@/services/period.service";
import { PeriodModal } from "./period-modal";

export default function PeriodsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<any>(null);

    const { data: serverResponse, isLoading } = useQuery({
        queryKey: ["periods"],
        queryFn: () => PeriodService.getAllPeriods(),
    });

    const periods = serverResponse?.data || [];

    return (
        <div className="p-6 space-y-6 animate-in fade-in zoom-in-[0.99] duration-500 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 dark:border-white/10">
                        <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">Class Timings</h2>
                        <p className="text-muted-foreground mt-1 text-[14px] font-medium">Manage time slots, periods, and breaks for schedules.</p>
                    </div>
                </div>
                <Button 
                    onClick={() => { setSelectedPeriod(null); setIsModalOpen(true); }} 
                    className="rounded-xl font-bold px-6 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Time Slot
                </Button>
            </div>

            <Card className="rounded-[24px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300">
                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/30">
                                <TableRow className="hover:bg-transparent border-b-black/5 dark:border-b-white/5">
                                    <TableHead className="pl-6 h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Slot Details</TableHead>
                                    <TableHead className="h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Type</TableHead>
                                    <TableHead className="h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider w-[40%]">Applicable Days</TableHead>
                                    <TableHead className="text-right pr-6 h-12 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-48 text-center text-slate-500 font-medium">Loading time slots...</TableCell>
                                    </TableRow>
                                ) : periods.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="p-4 bg-white/50 dark:bg-white/5 rounded-full mb-4 ring-1 ring-black/5 dark:ring-white/10 shadow-sm">
                                                    <Clock className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="text-[14px] font-bold text-slate-500">No time slots found. Create one to get started.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    periods.map((period: any) => (
                                        <TableRow key={period.id} className="group hover:bg-white/60 dark:hover:bg-white/5 transition-colors border-b-black/5 dark:border-b-white/5">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-extrabold text-[14px] text-slate-900 dark:text-white leading-tight">
                                                        {period.name}
                                                    </span>
                                                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 bg-white/50 dark:bg-black/20 w-fit px-2 py-1 rounded-md border border-black/5 dark:border-white/5 shadow-sm">
                                                        <Clock className="h-3 w-3 text-primary" /> 
                                                        {period.startTime} - {period.endTime}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {period.type === "CLASS" ? (
                                                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-black tracking-widest uppercase text-[10px] px-2 py-1 rounded-md">
                                                        <BookOpen className="mr-1.5 h-3 w-3" /> Class
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 font-black tracking-widest uppercase text-[10px] px-2 py-1 rounded-md">
                                                        <Coffee className="mr-1.5 h-3 w-3" /> Break
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {period.days.map((day: string) => (
                                                        <Badge key={day} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-sm">
                                                            {day.slice(0, 3)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 transition-colors bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-sm" onClick={() => { setSelectedPeriod(period); setIsModalOpen(true); }}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <PeriodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedPeriod} />
        </div>
    );
}