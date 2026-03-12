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
        <div className="w-full flex flex-col">
            <div className="w-full overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="border-b border-border">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead 
                                            key={header.id} 
                                            className="h-12 px-8 font-bold text-foreground text-[11px] uppercase tracking-wider whitespace-nowrap"
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
                                        className="group hover:bg-muted/10 transition-colors border-b border-border last:border-0 h-16"
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
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="p-6 bg-muted rounded-xl border border-dashed border-border">
                                                <School className="h-10 w-10 text-muted-foreground/30" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm uppercase tracking-wider">
                                                    No registered institutions
                                                </p>
                                                <p className="text-xs text-muted-foreground max-w-[250px] mx-auto leading-relaxed">
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

                <div className="p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 order-2 sm:order-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[13px] font-bold leading-none">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">
                                Global Registry Management
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                            variant="outline"
                            className="hidden h-9 w-9 p-0 rounded-lg border-border bg-background shadow-sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-lg border-border bg-background shadow-sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="px-4 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-lg font-bold text-[13px] shadow-sm">
                            {table.getState().pagination.pageIndex + 1}
                        </div>

                        <Button
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-lg border-border bg-background shadow-sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-9 w-9 p-0 rounded-lg border-border bg-background shadow-sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}