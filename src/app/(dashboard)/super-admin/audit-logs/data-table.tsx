/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Dispatch, SetStateAction } from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, FileText, FileSpreadsheet, CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/axios";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    meta: { total: number; page: number; limit: number; totalPage: number };
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    actionFilter: string;
    setActionFilter: Dispatch<SetStateAction<string>>;
    setPage: Dispatch<SetStateAction<number>>;
}

export function DataTable<TData, TValue>({ 
    columns, data, meta, searchTerm, setSearchTerm, actionFilter, setActionFilter, setPage 
}: DataTableProps<TData, TValue>) {
    
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState(false);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: meta.totalPage,
    });

    const generateCSV = (exportData: any[]) => {
        const headers = Object.keys(exportData[0]).join(",");
        const rows = exportData.map(row => Object.values(row).map(val => `"${val}"`).join(","));
        const csvContent = [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Audit_Logs_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateExcel = (exportData: any[]) => {
        let tableHTML = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table><thead><tr>`;
        Object.keys(exportData[0]).forEach(header => {
            tableHTML += `<th style="background-color: #f3f4f6; padding: 10px; border: 1px solid #d1d5db;">${header}</th>`;
        });
        tableHTML += "</tr></thead><tbody>";
        exportData.forEach(row => {
            tableHTML += "<tr>";
            Object.values(row).forEach(val => {
                tableHTML += `<td style="padding: 8px; border: 1px solid #e5e7eb;">${val}</td>`;
            });
            tableHTML += "</tr>";
        });
        tableHTML += "</tbody></table></body></html>";
        const blob = new Blob([tableHTML], { type: "application/vnd.ms-excel" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `Audit_Logs_${new Date().getTime()}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = async (type: "csv" | "excel") => {
        try {
            setIsExporting(true);
            const res = await api.get("/audit-logs/export", {
                params: { startDate: startDate || undefined, endDate: endDate || undefined }
            });

            const fetchedData = res.data?.data;
            if (!fetchedData || fetchedData.length === 0) {
                toast.error("No logs found for the selected date range");
                setIsExporting(false);
                return;
            }

            const exportData = fetchedData.map((item: any) => ({
                "Transaction ID": item.id,
                "Action Type": item.action,
                "Module Context": item.entity,
                "Entity ID": item.entityId || "N/A",
                "Actor Name": item.actorName || "System Process",
                "Actor Role": item.actorRole || "SYSTEM",
                "Network IP": item.ipAddress || "Internal",
                "Timestamp": new Date(item.createdAt).toLocaleString(),
            }));

            if (type === "csv") generateCSV(exportData);
            else generateExcel(exportData);

            toast.success(`Exported ${fetchedData.length} records successfully`);
            setExportModalOpen(false);
        } catch (error) {
            toast.error("Failed to export data");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9 h-10 rounded-lg bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm text-sm"
                        />
                    </div>
                    <Select value={actionFilter} onValueChange={(val) => { setActionFilter(val); setPage(1); }}>
                        <SelectTrigger className="h-10 w-[140px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm">
                            <SelectValue placeholder="Action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Actions</SelectItem>
                            <SelectItem value="CREATE">Create</SelectItem>
                            <SelectItem value="UPDATE">Update</SelectItem>
                            <SelectItem value="DELETE">Delete</SelectItem>
                            <SelectItem value="LOGIN">Auth/Login</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="h-10 rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm text-xs font-semibold px-4 w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4 text-zinc-500" /> Export Data
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Download className="h-5 w-5 text-indigo-500" /> Export Audit Logs
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5"><CalendarIcon className="h-3 w-3"/> Start Date</label>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 text-xs bg-zinc-50 dark:bg-zinc-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5"><CalendarIcon className="h-3 w-3"/> End Date</label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 text-xs bg-zinc-50 dark:bg-zinc-900" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button onClick={() => handleExport("csv")} disabled={isExporting} variant="outline" className="flex-1 h-11 border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4 text-emerald-500" />} CSV
                                </Button>
                                <Button onClick={() => handleExport("excel")} disabled={isExporting} variant="outline" className="flex-1 h-11 border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800">
                                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-500" />} Excel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-11 px-5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors border-0">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-5 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2 opacity-50">
                                        <Search className="h-6 w-6 text-zinc-400" />
                                        <p className="text-sm font-medium text-zinc-500">No matching logs found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-1 pt-2">
                <p className="text-xs font-medium text-zinc-500">
                    Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{table.getRowModel().rows.length}</span> of {meta.total} records
                </p>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={meta.page === 1} className="rounded-lg h-8 px-3 text-xs font-medium border-zinc-200 dark:border-zinc-800 shadow-sm">
                        Previous
                    </Button>
                    <div className="px-3 text-xs font-medium text-zinc-500">
                        Page {meta.page} of {meta.totalPage || 1}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={meta.page >= meta.totalPage} className="rounded-lg h-8 px-3 text-xs font-medium border-zinc-200 dark:border-zinc-800 shadow-sm">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}