/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Search, FilterX, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { AcademicService } from "@/services/academic.service";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedClassId: string;
    setSelectedClassId: (id: string) => void;
    selectedSectionId: string;
    setSelectedSectionId: (id: string) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    onPaginationChange,
    searchTerm,
    onSearchChange,
    selectedClassId,
    setSelectedClassId,
    selectedSectionId,
    setSelectedSectionId,
}: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        pageCount,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        onPaginationChange,
        state: {
            pagination,
        },
    });

    // Fetch Classes
    const { data: classesList } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses(),
    });

    // Fetch Sections based on Selected Class
    const { data: sectionsList } = useQuery({
        queryKey: ["sections", selectedClassId],
        queryFn: () => AcademicService.getAllSections(selectedClassId),
        enabled: !!selectedClassId && selectedClassId !== "all",
    });

    const handleClearFilters = () => {
        onSearchChange("");
        setSelectedClassId("");
        setSelectedSectionId("");
        onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });
    };

    return (
        <div className="space-y-0">
            {/* Enterprise Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-b bg-muted/10">
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search student..."
                        value={searchTerm}
                        onChange={(event) => {
                            onSearchChange(event.target.value);
                            onPaginationChange(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        className="pl-9 h-11 bg-background border-border/80 shadow-sm transition-colors focus-visible:bg-background"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
                    <Select
                        value={selectedClassId || "all"}
                        onValueChange={(val) => {
                            setSelectedClassId(val === "all" ? "" : val);
                            setSelectedSectionId(""); // Reset section when class changes
                            onPaginationChange(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                    >
                        <SelectTrigger className="h-11 w-[160px] bg-background shadow-sm">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {Array.isArray(classesList) && classesList.map((cls: any) => (
                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedSectionId || "all"}
                        onValueChange={(val) => {
                            setSelectedSectionId(val === "all" ? "" : val);
                            onPaginationChange(prev => ({ ...prev, pageIndex: 0 }));
                        }}
                        disabled={!selectedClassId || selectedClassId === "all"}
                    >
                        <SelectTrigger className="h-11 w-[160px] bg-background shadow-sm">
                            <SelectValue placeholder="All Sections" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Sections</SelectItem>
                            {Array.isArray(sectionsList) && sectionsList.map((sec: any) => (
                                <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {(searchTerm || selectedClassId || selectedSectionId) && (
                        <Button
                            variant="ghost"
                            onClick={handleClearFilters}
                            className="h-11 px-3 text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                            title="Clear all filters"
                        >
                            <FilterX className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Core */}
            <div className="overflow-hidden bg-background">
                <Table>
                    <TableHeader className="bg-muted/30">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="transition-colors hover:bg-muted/10 h-16"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <Search className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="font-semibold">No students found.</p>
                                        <p className="text-sm">Try adjusting your filters or search criteria.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Advanced Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
                <div className="flex-1 text-sm text-muted-foreground font-medium">
                    Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                    <span className="text-foreground">{table.getPageCount() || 1}</span>
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex shadow-sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 shadow-sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 shadow-sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex shadow-sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}