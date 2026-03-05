/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { 
    History, 
    Search, 
    Download, 
    CreditCard, 
    ArrowLeft, 
    ChevronRight, 
    ChevronLeft,
    FileText,
    Table as TableIcon
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeesService } from "@/services/fees.service";

export default function TransactionHistoryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const { data: transactionsRes, isLoading } = useQuery({
        queryKey: ["fee-transactions", searchTerm, currentPage, limit],
        queryFn: () => FeesService.getTransactions({ searchTerm, page: currentPage, limit }),
    });

    const transactions = transactionsRes?.data || [];
    const meta = transactionsRes?.meta;

    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500 min-h-screen bg-slate-50/40 dark:bg-transparent">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <button onClick={() => router.push("/admin")} className="hover:text-primary transition-colors">Dashboard</button>
                <ChevronRight className="h-3 w-3" />
                <button onClick={() => router.push("/admin/fees/invoices")} className="hover:text-primary transition-colors">Fees Management</button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-600 dark:text-slate-300">Transaction History</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-5">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => router.back()}
                        className="rounded-2xl border-slate-200 dark:border-slate-800 h-12 w-12 shadow-sm hover:scale-110 transition-all bg-white dark:bg-slate-900"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-inner">
                                <History className="h-6 w-6" />
                            </div>
                            Transaction Ledger
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1 ml-1 opacity-80">Full audit trail of institutional revenue</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:scale-105 transition-all">
                                <Download className="mr-2 h-4 w-4 stroke-[3]" /> Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border-border/50 shadow-2xl p-2 min-w-[160px]">
                            <DropdownMenuItem className="rounded-xl h-10 font-bold cursor-pointer focus:bg-emerald-50 focus:text-emerald-600 transition-colors">
                                <TableIcon className="mr-3 h-4 w-4" /> Download Excel (.xlsx)
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl h-10 font-bold cursor-pointer focus:bg-blue-50 focus:text-blue-600 transition-colors">
                                <FileText className="mr-3 h-4 w-4" /> Download CSV (.csv)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Main Table Card */}
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] overflow-hidden">
                <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Student name, roll, or ID..." 
                            className="pl-11 h-12 font-bold border-slate-200 dark:border-slate-800 rounded-2xl shadow-none focus-visible:ring-primary/20 bg-white dark:bg-slate-950"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="px-8 h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Date & Timeline</TableHead>
                                    <TableHead className="px-8 h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Student Identity</TableHead>
                                    <TableHead className="px-8 h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Billed Invoice</TableHead>
                                    <TableHead className="px-8 h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Payment Mode</TableHead>
                                    <TableHead className="px-8 h-14 font-black text-[10px] uppercase tracking-widest text-right text-slate-400">Amount</TableHead>
                                    <TableHead className="px-8 h-14 font-black text-[10px] uppercase tracking-widest text-right text-slate-400">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-64 text-center text-slate-300 font-bold animate-pulse">Syncing Ledger Data...</TableCell></TableRow>
                                ) : transactions.length > 0 ? (
                                    transactions.map((tx: any) => (
                                        <TableRow key={tx.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800/50">
                                            <TableCell className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[14px] text-slate-700 dark:text-slate-200 tracking-tight">{new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase mt-0.5">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {tx.invoice?.student?.firstName} {tx.invoice?.student?.lastName}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">Roll: {tx.invoice?.student?.rollNumber} • Class {tx.invoice?.student?.class?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-xs text-slate-500">{tx.invoice?.invoiceTitle}</span>
                                                    <Badge className="w-fit bg-slate-100 dark:bg-slate-800 text-slate-500 border-none text-[8px] font-black h-4 uppercase px-1 shadow-none">
                                                        Ref: {tx.referenceNo || "POS_COLLECT"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-500/20">
                                                        <CreditCard className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-black text-[11px] uppercase text-slate-600 dark:text-slate-400 tracking-widest">{tx.paymentMode}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                <span className="font-black text-[17px] text-emerald-600 tracking-tighter tabular-nums">₹{tx.amount.toLocaleString('en-IN')}</span>
                                            </TableCell>
                                            <TableCell className="px-8 py-5 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => router.push(`/admin/fees/collection?id=${tx.invoice?.id}`)}
                                                    className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all border-none"
                                                >
                                                    View Details <ChevronRight className="ml-1 h-3 w-3 stroke-[3]" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={6} className="h-64 text-center text-slate-300 font-black uppercase text-[11px] tracking-[0.3em] italic opacity-40">Zero Transaction Logged</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Server-Side Pagination Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-black/10 gap-4">
                        <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest">
                            Showing <span className="text-slate-900 dark:text-white">{transactions.length}</span> of <span className="text-slate-900 dark:text-white">{meta?.total || 0}</span> logs
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Rows</span>
                                <Select value={`${limit}`} onValueChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}>
                                    <SelectTrigger className="h-9 w-[75px] rounded-xl font-black bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs shadow-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold">
                                        {[10, 20, 50, 100].map(v => <SelectItem key={v} value={`${v}`} className="text-xs">{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-30" 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 stroke-[3]" />
                                </Button>
                                <div className="px-4 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-xl font-black text-xs shadow-lg shadow-primary/20">
                                    {currentPage} / {meta?.totalPage || 1}
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-30" 
                                    onClick={() => setCurrentPage(p => Math.min(meta?.totalPage || 1, p + 1))} 
                                    disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0}
                                >
                                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Totals Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-7 bg-white dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                         <History className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Total Revenue Collected</p>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">₹{transactions.reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString('en-IN')}</h4>
                    </div>
                </div>
            </div>
        </div>
    );
}