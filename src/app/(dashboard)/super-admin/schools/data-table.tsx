/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    PaginationState,
    Updater,
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
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight, 
    School, 
    ShieldCheck 
} from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: PaginationState;
    onPaginationChange: (updater: Updater<PaginationState>) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    onPaginationChange,
}: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: { pagination },
        onPaginationChange,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <div className="w-full flex flex-col min-h-[500px]">
            <div className="w-full bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-black/5 dark:border-white/5">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead 
                                            key={header.id} 
                                            className="h-14 px-8 font-black text-[11px] uppercase text-slate-400 tracking-[2px] whitespace-nowrap"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
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
                                        data-state={row.getIsSelected() && "selected"}
                                        className="group hover:bg-white/80 dark:hover:bg-white/5 transition-all border-b border-black/5 dark:border-white/5 h-16"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-8 py-4">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-[400px] text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in-50 duration-500">
                                            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10 shadow-inner">
                                                <School className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-[15px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                    No registered institutions
                                                </p>
                                                <p className="text-[12px] font-bold text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                                                    There are no schools matching your current dashboard filter.
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-6 border-t border-black/5 dark:border-white/5 bg-slate-50/30 dark:bg-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 order-2 sm:order-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-black text-slate-900 dark:text-white leading-none">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                                Global Registry Management
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            className="hidden h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4 stroke-[3]" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm"
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
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4 stroke-[3]" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4 stroke-[3]" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}