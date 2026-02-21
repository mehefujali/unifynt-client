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
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FilterX } from "lucide-react";

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
        <div className="w-full bg-card flex flex-col">
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-5 border-b bg-card">
                <div className="relative w-full xl:max-w-md shrink-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                    <Input
                        placeholder="Search by name, ID, or phone..."
                        value={searchTerm}
                        onChange={(event) => {
                            onSearchChange(event.target.value);
                            onPaginationChange(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        className="pl-10 h-11 w-full bg-muted/20 border-border/60 shadow-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-lg font-medium"
                    />
                </div>

                <div className="flex items-center gap-3 w-full overflow-x-auto pb-2 xl:pb-0 custom-scrollbar">
                    <Select value={selectedDepartment || "all"} onValueChange={(val) => { setSelectedDepartment(val === "all" ? "" : val); onPaginationChange(prev => ({ ...prev, pageIndex: 0 })); }}>
                        <SelectTrigger className="h-11 w-[160px] bg-background shadow-sm border-border/60"><SelectValue placeholder="Department" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {DEPARTMENTS.map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={selectedEmploymentType || "all"} onValueChange={(val) => { setSelectedEmploymentType(val === "all" ? "" : val); onPaginationChange(prev => ({ ...prev, pageIndex: 0 })); }}>
                        <SelectTrigger className="h-11 w-[150px] bg-background shadow-sm border-border/60"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="GUEST">Guest</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedGender || "all"} onValueChange={(val) => { setSelectedGender(val === "all" ? "" : val); onPaginationChange(prev => ({ ...prev, pageIndex: 0 })); }}>
                        <SelectTrigger className="h-11 w-[130px] bg-background shadow-sm border-border/60"><SelectValue placeholder="Gender" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={handleClearFilters} className="h-11 px-3 text-muted-foreground hover:text-destructive shrink-0 transition-colors">
                            <FilterX className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar bg-card relative">
                <Table className="w-full min-w-[900px] border-collapse">
                    <TableHeader className="bg-muted/60 sticky top-0 z-20 backdrop-blur-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/60">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-12 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="transition-colors h-16 border-b border-border/60 even:bg-muted/30 odd:bg-card hover:bg-muted/70 group">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-3 whitespace-nowrap font-medium text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length} className="h-[400px] text-center bg-card">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground animate-in fade-in-50">
                                        <Search className="h-16 w-16 opacity-20 mb-4" />
                                        <p className="font-bold text-lg text-foreground">No teachers found</p>
                                        <Button variant="link" onClick={handleClearFilters} className="mt-4 text-primary font-bold">Clear Filters</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-card text-sm font-medium text-muted-foreground">
                <div className="flex-1 whitespace-nowrap">
                    Page <span className="font-bold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-bold text-foreground">{table.getPageCount() || 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="icon" className="h-8 w-8 lg:flex hidden shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md flex items-center gap-1" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /> Previous</Button>
                    <Button variant="outline" size="sm" className="h-8 px-3 shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md flex items-center gap-1" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next <ChevronRight className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 lg:flex hidden shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
    );
}