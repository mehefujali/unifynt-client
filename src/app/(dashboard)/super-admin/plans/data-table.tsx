/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Zap } from "lucide-react";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
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
                                            <Zap className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-[15px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                Subscription Vault Empty
                                            </p>
                                            <p className="text-[12px] font-bold text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                                                No plans have been configured for the SaaS marketplace yet.
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}