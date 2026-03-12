/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Clock, BookOpen, Coffee, FilterX, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PeriodService } from "@/services/period.service";
import { PeriodModal } from "./period-modal";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";

export default function PeriodsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const { hasPermission } = usePermission();
    const canEdit = hasPermission(PERMISSIONS.ROUTINE_EDIT);

    const { data: serverResponse, isLoading } = useQuery({
        queryKey: ["periods"],
        queryFn: () => PeriodService.getAllPeriods(),
    });

    const periods = serverResponse?.data || [];

    // Local filtering since Periods don't usually have server-side search implemented in the same way as students
    const filteredPeriods = periods.filter((period: any) => {
        const matchesSearch = period.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "ALL" || period.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const handleClearFilters = () => {
        setSearchTerm("");
        setTypeFilter("ALL");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Clock className="h-6 w-6 text-primary" /> Class Timings
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">Manage time slots, periods, and breaks for schedules.</p>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                    <PermissionGate required={PERMISSIONS.ROUTINE_CREATE}>
                        <Button 
                            onClick={() => { setSelectedPeriod(null); setIsModalOpen(true); }} 
                            className="w-full md:w-auto px-6 font-bold shadow-md"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Add Time Slot
                        </Button>
                    </PermissionGate>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full xl:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search periods..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-10 bg-muted/20 border-border"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="flex-1 sm:w-[180px] h-10 bg-muted/20 border-border font-semibold">
                            <SelectValue placeholder="Period Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="CLASS">Class Sessions</SelectItem>
                            <SelectItem value="BREAK">Intervals/Breaks</SelectItem>
                        </SelectContent>
                    </Select>

                    {(searchTerm || typeFilter !== "ALL") && (
                        <Button variant="ghost" onClick={handleClearFilters} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-10 px-4 rounded-lg font-bold text-xs uppercase tracking-widest">
                            <FilterX className="h-4 w-4 mr-2" /> Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="overflow-x-auto flex-grow">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border uppercase">
                            <TableRow>
                                <TableHead className="px-6 py-4 font-bold text-foreground">Slot Name & Time</TableHead>
                                <TableHead className="px-6 py-4 font-bold text-foreground">Type</TableHead>
                                <TableHead className="px-6 py-4 font-bold text-foreground w-[40%]">Operating Days</TableHead>
                                {canEdit && <th className="px-6 py-4 font-bold text-foreground text-right pr-8">Actions</th>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={canEdit ? 4 : 3} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-zinc-400" />
                                            <p className="font-bold uppercase tracking-widest text-xs">Accessing timetable schedules...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPeriods.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={canEdit ? 4 : 3} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                                            <Clock className="h-16 w-16 mx-auto" />
                                            <p className="font-bold uppercase tracking-widest text-sm">No Time Slots Found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPeriods.map((period: any) => (
                                    <TableRow key={period.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="font-bold text-foreground text-base">{period.name}</span>
                                                <div className="flex items-center gap-1.5 font-bold text-primary text-[11px] bg-primary/5 w-fit px-2 py-0.5 rounded border border-primary/10 tracking-wider">
                                                    <Clock className="h-3 w-3" /> {period.startTime} - {period.endTime}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant="outline" className={cn(
                                                "font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 border shadow-none",
                                                period.type === "CLASS" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                            )}>
                                                {period.type === "CLASS" ? (
                                                    <><BookOpen className="mr-1.5 h-3 w-3" /> SESSION</>
                                                ) : (
                                                    <><Coffee className="mr-1.5 h-3 w-3" /> BREAK</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {period.days.map((day: string) => (
                                                    <span key={day} className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border border-border/50 tracking-tight uppercase">
                                                        {day.slice(0, 3)}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        
                                        {canEdit && (
                                            <TableCell className="px-6 py-4 text-right pr-6">
                                                <PermissionGate required={PERMISSIONS.ROUTINE_EDIT}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg group" onClick={() => { setSelectedPeriod(period); setIsModalOpen(true); }}>
                                                        <Edit className="h-4 w-4 transition-transform group-hover:scale-110" />
                                                    </Button>
                                                </PermissionGate>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Footer simple summary if data exists */}
                {!isLoading && filteredPeriods.length > 0 && (
                    <div className="border-t border-border bg-muted/20 p-4">
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                            {filteredPeriods.length} Time Slots active in system
                        </span>
                    </div>
                )}
            </div>

            <PeriodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedPeriod} />
        </div>
    );
}

// Minimal loader component for query states
function Loader2({ className, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin", className)}
            {...props}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}