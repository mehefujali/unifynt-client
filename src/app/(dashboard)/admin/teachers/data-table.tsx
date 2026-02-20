"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

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
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ListFilter } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    onPaginationChange,
    searchTerm,
    onSearchChange,
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

    return (
        <div className="w-full bg-card border rounded-[var(--radius-xl)] shadow-sm overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b bg-card">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                    <Input
                        placeholder="Search by name, ID, or roll number..."
                        value={searchTerm}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="pl-10 h-10 w-full bg-muted/20 border-border/60 shadow-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-lg font-medium"
                    />
                </div>
                <Button variant="outline" size="sm" className="h-10 font-semibold text-muted-foreground hover:text-foreground border-border/60 bg-muted/20 hover:bg-muted/40 rounded-lg">
                    <ListFilter className="mr-2 h-4 w-4" /> Filters & Views
                </Button>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar bg-card relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-b from-black/[0.02] to-transparent dark:from-white/[0.02] pointer-events-none z-10"></div>

                <Table className="w-full min-w-[900px] border-collapse">
                    <TableHeader className="bg-muted/60 sticky top-0 z-20 backdrop-blur-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border/60">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap select-none">
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
                                    className="transition-colors h-16 border-b border-border/60 even:bg-muted/30 odd:bg-card hover:bg-muted/70 data-[state=selected]:bg-primary/10 group"
                                >
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
                                        <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                            <Search className="h-8 w-8 opacity-40" />
                                        </div>
                                        <p className="font-bold text-lg text-foreground">No students found</p>
                                        <p className="text-sm max-w-xs mx-auto mt-1">We couldn&apos;t find any data matching your current search or filters.</p>
                                        <Button variant="link" onClick={() => onSearchChange("")} className="mt-4 text-primary font-bold">
                                            Clear Search
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-card text-sm font-medium text-muted-foreground">
                <div className="flex-1 whitespace-nowrap">
                    Page <span className="font-bold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{" "}
                    <span className="font-bold text-foreground">{table.getPageCount() || 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 lg:flex hidden shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md flex items-center gap-1"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md flex items-center gap-1"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 lg:flex hidden shadow-sm border-border/60 bg-muted/20 hover:bg-muted/40 rounded-md"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}