"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    CalendarDays, Plus, Trash2, CalendarX2, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AcademicService } from "@/services/academic.service";
// import { PermissionGate } from "@/components/common/permission-gate";
// import { PERMISSIONS } from "@/config/permissions";

interface Holiday {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    description?: string;
}

export default function HolidaysPage() {
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Add Form State
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");

    // Fetch Holidays
    const { data: response, isLoading } = useQuery({
        queryKey: ["holidays"],
        queryFn: () => AcademicService.getAllHolidays()
    });

    const holidays = response?.data || [];

    // Add Mutation
    const addMutation = useMutation({
        mutationFn: AcademicService.createHoliday,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            toast.success("Holiday added successfully");
            setIsAddModalOpen(false);
            setTitle(""); setStartDate(""); setEndDate(""); setDescription("");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to add holiday");
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: AcademicService.deleteHoliday,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["holidays"] });
            toast.success("Holiday removed successfully");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete holiday");
        }
    });

    const handleAddHoliday = () => {
        if (!title.trim() || !startDate || !endDate) {
            toast.error("Title, Start Date, and End Date are required.");
            return;
        }
        if (new Date(endDate) < new Date(startDate)) {
            toast.error("End date cannot be before start date.");
            return;
        }

        addMutation.mutate({
            title: title.trim(),
            startDate,
            endDate,
            description: description.trim()
        });
    };

    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
                        <CalendarDays className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                        Holiday Management
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Declare school closure dates. These automatically enforce nikhut attendance calculations.
                    </p>
                </div>
                {/* 
                  Add PermissionGate if you strictly want to guard the 'Add Holiday' button 
                  For now we show it for ADMIN profiles.
                */}
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-10 rounded-xl bg-slate-900 px-4 font-bold text-white shadow hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Declare Holiday
                    </Button>
                </div>
            </div>

            {/* List Section */}
            <Card className="rounded-2xl border-slate-200/60 shadow-sm dark:border-slate-800">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                        </div>
                    ) : holidays.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                <CalendarX2 className="h-6 w-6 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Upcoming Holidays</h3>
                            <p className="mt-1 max-w-sm text-sm font-medium text-slate-500">
                                There are no declared holidays for the current academic session. 
                                Click &quot;Declare Holiday&quot; above to add one.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                                    <TableHead className="font-bold text-slate-900 dark:text-slate-300">Holiday Name</TableHead>
                                    <TableHead className="font-bold text-slate-900 dark:text-slate-300">Duration</TableHead>
                                    <TableHead className="font-bold text-slate-900 dark:text-slate-300 hidden md:table-cell">Duration (Days)</TableHead>
                                    <TableHead className="font-bold text-slate-900 dark:text-slate-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {holidays.map((holiday: Holiday) => {
                                    const start = new Date(holiday.startDate);
                                    const end = new Date(holiday.endDate);
                                    const diffTime = Math.abs(end.getTime() - start.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                                    return (
                                        <TableRow key={holiday.id} className="group border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{holiday.title}</span>
                                                    {holiday.description && (
                                                        <span className="text-xs font-medium text-slate-500 line-clamp-1 mt-0.5 max-w-sm">
                                                            {holiday.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            {format(start, "MMM dd, yyyy")}
                                                        </span>
                                                        {diffDays > 1 && (
                                                            <span className="text-xs font-medium text-slate-500">
                                                                to {format(end, "MMM dd, yyyy")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 font-bold text-xs ring-1 ring-inset ring-indigo-600/10">
                                                    {diffDays} {diffDays === 1 ? 'Day' : 'Days'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to remove '${holiday.title}'?`)) {
                                                            deleteMutation.mutate(holiday.id);
                                                        }
                                                    }}
                                                    className="h-8 w-8 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Holiday Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">Declare New Holiday</DialogTitle>
                        <DialogDescription className="text-[13px] font-medium text-slate-500 mt-1">
                            Add a public holiday or school closure. Teachers cannot mark attendance on these dates.
                        </DialogDescription>
                    </div>
                    
                    <div className="p-6 space-y-5 bg-white dark:bg-slate-950">
                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Holiday Title <span className="text-rose-500">*</span></Label>
                            <Input 
                                placeholder="e.g. Durga Puja, Summer Vacation" 
                                className="h-11 rounded-xl text-sm font-medium"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Start Date <span className="text-rose-500">*</span></Label>
                                <Input 
                                    type="date" 
                                    className="h-11 rounded-xl text-sm font-medium"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">End Date <span className="text-rose-500">*</span></Label>
                                <Input 
                                    type="date" 
                                    className="h-11 rounded-xl text-sm font-medium"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 border border-blue-100 dark:border-blue-900/30">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                                If it&apos;s a single day holiday, pick the same date for both Start and End Date.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Description (Optional)</Label>
                            <Textarea 
                                placeholder="Add any details or circular reference..." 
                                className="rounded-xl text-sm font-medium resize-none"
                                rows={3}
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                        <Button 
                            variant="outline" 
                            className="rounded-xl font-bold h-10 px-5"
                            onClick={() => setIsAddModalOpen(false)}
                            disabled={addMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 px-6 shadow-sm disabled:opacity-50"
                            onClick={handleAddHoliday}
                            disabled={addMutation.isPending}
                        >
                            {addMutation.isPending ? "Saving..." : "Save Holiday"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
