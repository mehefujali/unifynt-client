 
"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FilterX, Users, Briefcase, UserCircle } from "lucide-react";

// --- Import Permissions ---
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/hooks/use-permission";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedGender: string;
    setSelectedGender: (value: string) => void;
    selectedDepartment: string;
    setSelectedDepartment: (value: string) => void;
    selectedEmploymentType: string;
    setSelectedEmploymentType: (value: string) => void;
}

const DEPARTMENTS = ["Science", "Mathematics", "English", "Social Studies", "Languages", "Arts", "Physical Education", "Computer Science", "Commerce"];

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    onPaginationChange,
    searchTerm,
    onSearchChange,
    selectedGender,
    setSelectedGender,
    selectedDepartment,
    setSelectedDepartment,
    selectedEmploymentType,
    setSelectedEmploymentType,
}: DataTableProps<TData, TValue>) {

    const { hasPermission } = usePermission();
    // Logic: Advanced filtering visibility for HR/Admins
    const canManageFaculty = hasPermission([PERMISSIONS.TEACHER_CREATE, PERMISSIONS.TEACHER_EDIT]);

    const table = useReactTable({
        data,
        columns,
        pageCount,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        onPaginationChange,
        state: { pagination },
    });

    const handleClearFilters = () => {
        onSearchChange("");
        setSelectedGender("");
        setSelectedDepartment("");
        setSelectedEmploymentType("");
        onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });
    };

    const hasActiveFilters = searchTerm || selectedGender || selectedDepartment || selectedEmploymentType;

    return (
        <div className="w-full bg-card flex flex-col min-h-[600px]">
            {/* --- Premium Filter Toolbar --- */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-5 border-b bg-muted/20">
                <div className="relative w-full xl:max-w-sm shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, ID, or phone..."
                        value={searchTerm}
                        onChange={(event) => {
                            onSearchChange(event.target.value);
                            onPaginationChange(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        className="pl-11 h-11 bg-background focus-visible:ring-primary rounded-2xl shadow-sm border-slate-200 dark:border-slate-800 font-medium text-[13px]"
                    />
                </div>

                <div className="flex items-center gap-3 w-full overflow-x-auto pb-2 xl:pb-0 custom-scrollbar">
                    {/* Department Selector */}
                    <Select value={selectedDepartment || "all"} onValueChange={(val) => { setSelectedDepartment(val === "all" ? "" : val); onPaginationChange(prev => ({ ...prev, pageIndex: 0 })); }}>
                        <SelectTrigger className="h-11 w-[170px] bg-background rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-[13px] shadow-sm">
                            <Briefcase className="mr-2 h-4 w-4 text-primary/60" />
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="font-bold text-primary">All Departments</SelectItem>
                            {DEPARTMENTS.map(dept => <SelectItem key={dept} value={dept} className="font-medium">{dept}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Employment Type Selector (Protected/Sensitive) */}
                    {canManageFaculty && (
                        <Select value={selectedEmploymentType || "all"} onValueChange={(val) => { setSelectedEmploymentType(val === "all" ? "" : val); onPaginationChange(prev => ({ ...prev, pageIndex: 0 })); }}>
                            <SelectTrigger className="h-11 w-[160px] bg-background rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-[13px] shadow-sm">
                                <SelectValue placeholder="Job Type" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="font-bold text-primary">All Types</SelectItem>
                                <SelectItem value="FULL_TIME" className="font-medium">Full Time</SelectItem>
                                <SelectItem value="PART_TIME" className="font-medium">Part Time</SelectItem>
                                <SelectItem value="CONTRACT" className="font-medium">Contract</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

                    {/* Gender Selector */}
                    <Select value={selectedGender || "all"} onValueChange={(val) => { setSelectedGender(val === "all" ? "" : val); onPaginationChange(prev => ({ ...prev, pageIndex: 0 })); }}>
                        <SelectTrigger className="h-11 w-[140px] bg-background rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-[13px] shadow-sm">
                            <UserCircle className="mr-2 h-4 w-4 text-primary/60" />
                            <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all" className="font-bold text-primary">All Genders</SelectItem>
                            <SelectItem value="MALE" className="font-medium">Male</SelectItem>
                            <SelectItem value="FEMALE" className="font-medium">Female</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button 
                            variant="ghost" 
                            onClick={handleClearFilters} 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-11 px-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all"
                        >
                            <FilterX className="h-4 w-4 mr-2" /> Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* --- Table Section --- */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-black text-[11px] uppercase text-slate-400 tracking-[2px] py-5 px-6">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow 
                                    key={row.id} 
                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800/50 h-16"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-[450px] text-center">
                                    <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in-50">
                                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                                            <Users className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-[15px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">No faculty found</p>
                                            <p className="text-[12px] font-bold text-slate-400">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- Premium Pagination Section --- */}
            <div className="p-6 border-t bg-slate-50/30 dark:bg-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 order-2 sm:order-1">
                    <div className="flex flex-col">
                        <span className="text-[13px] font-black text-slate-900 dark:text-white leading-none">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                            {data.length} records active this page
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="hidden h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900" 
                        onClick={() => table.setPageIndex(0)} 
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft className="h-4 w-4 stroke-[3]" />
                    </Button>
                    <Button 
                        variant="outline" 
                        className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900" 
                        onClick={() => table.previousPage()} 
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4 stroke-[3]" />
                    </Button>
                    
                    <div className="px-4 h-9 flex items-center justify-center bg-primary text-white dark:text-black rounded-xl font-black text-[13px] shadow-lg shadow-primary/20">
                        {table.getState().pagination.pageIndex + 1}
                    </div>

                    <Button 
                        variant="outline" 
                        className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900" 
                        onClick={() => table.nextPage()} 
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="h-4 w-4 stroke-[3]" />
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="hidden h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900" 
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight className="h-4 w-4 stroke-[3]" />
                    </Button>
                </div>
            </div>
        </div>
    );
}