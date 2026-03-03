"use client";

import { useState } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [globalFilter, setGlobalFilter] = useState("");

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        initialState: { pagination: { pageSize: 15 } }
    });

    const handleExport = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exportData = data.map((item: any) => ({
            ID: item.id,
            Action: item.action,
            Module: item.entity,
            PerformedBy: item.actorName || "System",
            Role: item.actorRole || "N/A",
            IP: item.ipAddress || "Internal",
            Date: new Date(item.createdAt).toLocaleString(),
        }));
        
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search logs by actor, module or action..."
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-10 h-12 rounded-[18px] bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-zinc-200 dark:border-zinc-800 shadow-sm focus-visible:ring-primary text-sm font-medium"
                    />
                </div>
                <Button onClick={handleExport} variant="outline" className="h-12 rounded-[18px] border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm text-xs font-black uppercase tracking-widest px-6 w-full sm:w-auto hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="rounded-[32px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xl shadow-black/5">
                <Table>
                    <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-0">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-14 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors border-0">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-6 py-5">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                                        <Search className="h-8 w-8 text-zinc-400" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">No matching logs found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Showing {table.getRowModel().rows.length} of {data.length} records
                </p>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="rounded-xl border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest h-9 px-4">
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="rounded-xl border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest h-9 px-4">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}