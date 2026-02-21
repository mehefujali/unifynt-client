/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FilterX, Eye, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewSlipModal } from "./view-slip-modal";
import { UpdateStatusModal } from "./update-status-modal";

export function DataTable({ data, pageCount, pagination, onPaginationChange, searchTerm, onSearchChange, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, selectedStatus, setSelectedStatus }: any) {
    const [viewSlip, setViewSlip] = React.useState<any>(null);
    const [statusSlip, setStatusSlip] = React.useState<any>(null); // For Update Status Modal

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "teacher", header: "Teacher Details",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{row.original.teacher.firstName} {row.original.teacher.lastName}</span>
                    <span className="text-xs text-muted-foreground font-mono bg-muted inline-block w-max px-1.5 py-0.5 rounded mt-1">{row.original.teacher.employeeId}</span>
                </div>
            )
        },
        { accessorKey: "period", header: "Period", cell: ({ row }) => <Badge variant="outline" className="font-bold">{row.original.month} / {row.original.year}</Badge> },
        { accessorKey: "netSalary", header: "Net Amount", cell: ({ row }) => <div className="font-extrabold font-mono text-primary text-base">₹{row.original.netSalary.toLocaleString()}</div> },
        {
            accessorKey: "status", header: "Status",
            cell: ({ row }) => (
                <Badge className={row.original.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-0' : 'bg-amber-500/10 text-amber-600 border-0'}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewSlip(row.original)} className="shadow-sm">
                        <Eye className="h-4 w-4 mr-1" /> View Slip
                    </Button>
                    {/* Trigger Custom Modal instead of window.prompt */}
                    <Button variant="default" size="sm" onClick={() => setStatusSlip(row.original)} className="shadow-sm font-bold">
                        <CreditCard className="h-4 w-4 mr-1" /> Update Status
                    </Button>
                </div>
            )
        }
    ];

    const table = useReactTable({ data, columns, pageCount, getCoreRowModel: getCoreRowModel(), manualPagination: true, onPaginationChange, state: { pagination } });

    const handleClear = () => { onSearchChange(""); setSelectedMonth(""); setSelectedYear(""); setSelectedStatus(""); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); };

    return (
        <div className="w-full bg-card flex flex-col">
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-5 border-b">
                <div className="relative w-full xl:max-w-xs shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search name or ID..." value={searchTerm} onChange={(e) => { onSearchChange(e.target.value); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }} className="pl-9 h-11" />
                </div>
                <div className="flex items-center gap-3 w-full overflow-x-auto">
                    <Select value={selectedMonth || "all"} onValueChange={(val) => { setSelectedMonth(val === "all" ? "" : val); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }}>
                        <SelectTrigger className="w-[120px] h-11"><SelectValue placeholder="Month" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Months</SelectItem>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => <SelectItem key={m} value={String(m)}>{m}</SelectItem>)}</SelectContent>
                    </Select>

                    <Select value={selectedYear || "all"} onValueChange={(val) => { setSelectedYear(val === "all" ? "" : val); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }}>
                        <SelectTrigger className="w-[120px] h-11"><SelectValue placeholder="Year" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Years</SelectItem>{[2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                    </Select>

                    <Select value={selectedStatus || "all"} onValueChange={(val) => { setSelectedStatus(val === "all" ? "" : val); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }}>
                        <SelectTrigger className="w-[130px] h-11"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="PENDING">Pending</SelectItem><SelectItem value="PAID">Paid</SelectItem></SelectContent>
                    </Select>

                    {(searchTerm || selectedMonth || selectedYear || selectedStatus) && (
                        <Button variant="ghost" onClick={handleClear} className="shrink-0 h-11 text-muted-foreground hover:text-destructive">
                            <FilterX className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <Table className="min-w-[800px]">
                    <TableHeader className="bg-muted/30">
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>
                                {hg.headers.map(h => <TableHead key={h.id} className="h-12 font-bold text-xs uppercase tracking-wider text-muted-foreground">{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? table.getRowModel().rows.map(r => (
                            <TableRow key={r.id} className="h-16 hover:bg-muted/30">
                                {r.getVisibleCells().map(c => <TableCell key={c.id} className="px-4">{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>)}
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={columns.length} className="h-40 text-center text-muted-foreground font-medium">No payroll records found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
                <div className="flex-1 text-sm text-muted-foreground font-medium">
                    Page <span className="text-foreground">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-foreground">{table.getPageCount() || 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" className="h-8 w-8 p-0 lg:flex hidden shadow-sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" className="h-8 w-8 p-0 shadow-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" className="h-8 w-8 p-0 shadow-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
                    <Button variant="outline" className="h-8 w-8 p-0 lg:flex hidden shadow-sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Render Modals */}
            <ViewSlipModal slip={viewSlip} open={!!viewSlip} onClose={() => setViewSlip(null)} />
            <UpdateStatusModal slip={statusSlip} open={!!statusSlip} onClose={() => setStatusSlip(null)} />
        </div>
    );
}