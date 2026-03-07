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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    FilterX,
    Users,
    ShieldCheck,
} from "lucide-react";

// --- Import Permissions ---
import { PERMISSIONS } from "@/config/permissions";
import { usePermission } from "@/hooks/use-permission";
import { PermissionGate } from "@/components/common/permission-gate";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    onPaginationChange: (pagination: any) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedRole: string;
    setSelectedRole: (value: string) => void;
    selectedDepartment: string;
    setSelectedDepartment: (value: string) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pagination,
    onPaginationChange,
    searchTerm,
    onSearchChange,
    selectedRole,
    setSelectedRole,
    selectedDepartment,
    setSelectedDepartment,
}: DataTableProps<TData, TValue>) {
    const { hasPermission } = usePermission();
    
    // 💡 Logic: Only Admins can filter by specific Roles
    const canFilterByRole = hasPermission([PERMISSIONS.STAFF_CREATE, PERMISSIONS.STAFF_EDIT]);

    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        onPaginationChange: onPaginationChange,
        state: {
            pagination,
        },
    });

    return (
        <div className="w-full flex flex-col min-h-[600px]">
            {/* Header & Filters Section */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 border-b bg-muted/20">
                <div className="relative w-full lg:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search name, email or ID..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-11 bg-background focus-visible:ring-primary h-11 rounded-2xl shadow-sm border-slate-200 dark:border-slate-800 font-medium text-[13px]"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        
                        {/* 🔒 Gate for Role Filter: Hide or show based on administrative power */}
                        {canFilterByRole && (
                            <Select
                                value={selectedRole || "all"}
                                onValueChange={(val) => setSelectedRole(val === "all" ? "" : val)}
                            >
                                <SelectTrigger className="w-full sm:w-[150px] bg-background h-11 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-[13px] shadow-sm">
                                    <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="all" className="font-bold text-primary">All Roles</SelectItem>
                                    <SelectItem value="SCHOOL_ADMIN" className="font-medium">Admin</SelectItem>
                                    <SelectItem value="TEACHER" className="font-medium">Teacher</SelectItem>
                                    <SelectItem value="ACCOUNTANT" className="font-medium">Accountant</SelectItem>
                                    <SelectItem value="STAFF" className="font-medium">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        <Select
                            value={selectedDepartment || "all"}
                            onValueChange={(val) => setSelectedDepartment(val === "all" ? "" : val)}
                        >
                            <SelectTrigger className="w-full sm:w-[150px] bg-background h-11 rounded-2xl border-slate-200 dark:border-slate-800 font-bold text-[13px] shadow-sm">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="font-bold text-primary">All Dept.</SelectItem>
                                <SelectItem value="Bangla" className="font-medium">Bangla</SelectItem>
                                <SelectItem value="English" className="font-medium">English</SelectItem>
                                <SelectItem value="Mathematics" className="font-medium">Math</SelectItem>
                                <SelectItem value="Science" className="font-medium">Science</SelectItem>
                                <SelectItem value="Office" className="font-medium">Office</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(searchTerm || selectedRole || selectedDepartment) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                onSearchChange("");
                                setSelectedRole("");
                                setSelectedDepartment("");
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-11 px-4 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all"
                        >
                            <FilterX className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="font-black text-[11px] uppercase text-slate-400 tracking-[2px] py-5 px-6">
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
                                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-4 px-6">
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
                                    className="h-[450px] text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                                            <Users className="h-10 w-10 text-slate-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-[15px] text-slate-600 dark:text-slate-400">No staff results</p>
                                            <p className="text-[12px] font-bold text-slate-400">Adjust filters or try a different search term.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Section */}
            <div className="p-6 border-t bg-slate-50/30 dark:bg-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 order-2 sm:order-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-black text-slate-900 dark:text-white leading-none">
                            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                            Total {data.length} entries shown
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-6 lg:gap-8 order-1 sm:order-2">
                    <div className="flex items-center gap-3">
                        <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider hidden sm:block">Rows</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-9 w-[75px] rounded-xl font-black bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs shadow-sm">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent align="end" className="rounded-xl font-bold">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="hidden h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4 stroke-[3]" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
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
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4 stroke-[3]" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
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