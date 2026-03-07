/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FilterX, Eye, CreditCard, MoreHorizontal,  CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewSlipModal } from "./view-slip-modal";
import { UpdateStatusModal } from "./update-status-modal";
import { AddAdjustmentModal } from "./add-adjustment-modal";

const MONTHS = [
    { value: "1", label: "January" }, { value: "2", label: "February" },
    { value: "3", label: "March" }, { value: "4", label: "April" },
    { value: "5", label: "May" }, { value: "6", label: "June" },
    { value: "7", label: "July" }, { value: "8", label: "August" },
    { value: "9", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" }
];

// Generate years dynamically (e.g., from 2024 to current year + 1)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

export function DataTable({ data, pageCount, pagination, onPaginationChange, searchTerm, onSearchChange, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, selectedStatus, setSelectedStatus }: any) {
    const [viewSlip, setViewSlip] = React.useState<any>(null);
    const [statusSlip, setStatusSlip] = React.useState<any>(null); 
    const [adjustmentSlip, setAdjustmentSlip] = React.useState<any>(null); 

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "employee", header: "Employee Details",
            cell: ({ row }) => {
                const emp = row.original.teacher || row.original.staff;
                const type = row.original.teacher ? "Teacher" : "Staff";
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">{emp?.firstName} {emp?.lastName}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground font-mono bg-muted inline-block px-1.5 py-0.5 rounded border">{emp?.employeeId}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">{type}</span>
                        </div>
                    </div>
                )
            }
        },
        { 
            accessorKey: "period", header: "Salary Period", 
            cell: ({ row }) => {
                const monthName = MONTHS.find(m => m.value === String(row.original.month))?.label || row.original.month;
                return (
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>{monthName}, {row.original.year}</span>
                    </div>
                )
            }
        },
        { 
            accessorKey: "netSalary", header: "Net Payable", 
            cell: ({ row }) => <div className="font-extrabold font-mono text-primary text-base">₹{row.original.netSalary.toLocaleString()}</div> 
        },
        {
            accessorKey: "status", header: "Status",
            cell: ({ row }) => (
                <Badge className={row.original.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none' : 'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none'}>
                    {row.original.status}
                </Badge>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewSlip(row.original)} className="shadow-sm hidden md:flex">
                        <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button variant="default" size="sm" onClick={() => setStatusSlip(row.original)} className="shadow-sm font-bold hidden md:flex">
                        <CreditCard className="h-4 w-4 mr-1" /> Pay
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 border shadow-sm">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setViewSlip(row.original)} className="md:hidden"><Eye className="mr-2 h-4 w-4" /> View Slip</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusSlip(row.original)} className="md:hidden"><CreditCard className="mr-2 h-4 w-4" /> Update Status</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setAdjustmentSlip(row.original)} className="font-medium text-primary cursor-pointer">
                                 Adjust Salary
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const table = useReactTable({ data, columns, pageCount, getCoreRowModel: getCoreRowModel(), manualPagination: true, onPaginationChange, state: { pagination } });

    const handleClear = () => { 
        onSearchChange(""); 
        setSelectedMonth(""); 
        setSelectedYear(""); 
        setSelectedStatus(""); 
        onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); 
    };

    const isFiltered = searchTerm || selectedMonth || selectedYear || selectedStatus;

    return (
        <div className="w-full bg-card flex flex-col">
            {/* 🔴 Professional Filter Section 🔴 */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 p-5 border-b bg-muted/10">
                <div className="relative w-full xl:max-w-sm shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search employee by name or ID..." 
                        value={searchTerm} 
                        onChange={(e) => { onSearchChange(e.target.value); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }} 
                        className="pl-9 h-11 bg-background shadow-sm border-muted-foreground/20" 
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Month Filter */}
                    <Select value={selectedMonth || "all"} onValueChange={(val) => { setSelectedMonth(val === "all" ? "" : val); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }}>
                        <SelectTrigger className="w-[140px] h-11 bg-background shadow-sm font-medium">
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold text-primary">All Months</SelectItem>
                            {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Year Filter */}
                    <Select value={selectedYear || "all"} onValueChange={(val) => { setSelectedYear(val === "all" ? "" : val); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }}>
                        <SelectTrigger className="w-[120px] h-11 bg-background shadow-sm font-medium">
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold text-primary">All Years</SelectItem>
                            {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={selectedStatus || "all"} onValueChange={(val) => { setSelectedStatus(val === "all" ? "" : val); onPaginationChange((p: any) => ({ ...p, pageIndex: 0 })); }}>
                        <SelectTrigger className="w-[130px] h-11 bg-background shadow-sm font-medium">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-bold text-primary">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Clear Filter Button */}
                    {isFiltered && (
                        <Button variant="ghost" onClick={handleClear} className="h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                            <FilterX className="h-4 w-4 mr-2" /> Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Section */}
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
                            <TableRow key={r.id} className="h-16 hover:bg-muted/30 transition-colors">
                                {r.getVisibleCells().map(c => <TableCell key={c.id} className="px-4">{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>)}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                                        <CalendarDays className="h-8 w-8 mb-2 opacity-50" />
                                        <span className="font-medium text-base">No payroll records found.</span>
                                        <span className="text-sm opacity-80 mt-1">Try adjusting the filters to see more results.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Section */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
                <div className="flex-1 text-sm text-muted-foreground font-medium">
                    Showing page <span className="text-foreground font-bold">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-foreground font-bold">{table.getPageCount() || 1}</span>
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
            <AddAdjustmentModal slip={adjustmentSlip} open={!!adjustmentSlip} onClose={() => setAdjustmentSlip(null)} />
        </div>
    );
}