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
    Table as TableIcon,
    ShieldAlert
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { FeesService } from "@/services/fees.service";

export default function TransactionHistoryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: transactionsRes, isLoading } = useQuery({
        queryKey: ["fee-transactions", searchTerm, currentPage],
        queryFn: () => FeesService.getTransactions({ searchTerm, page: currentPage, limit: 10 }),
    });

    const transactions = transactionsRes?.data || [];
    const meta = transactionsRes?.meta;

    const handleSearch = (val: string) => {
        setSearchTerm(val);
        setCurrentPage(1);
    };

    return (
        // 🔒 Gate for Entire Ledger Access
        <PermissionGate 
            required={PERMISSIONS.FEE_VIEW}
            fallback={
                <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in duration-500">
                    <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Your administrative role does not have authorization to view the transaction ledger.
                    </p>
                    <Button variant="outline" className="mt-8 rounded-lg" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            }
        >
            <div className="flex-1 space-y-4 p-8 pt-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between space-y-2">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => router.back()}
                            className="rounded-lg h-9 w-9 border-border bg-card shadow-sm"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Transaction Ledger</h2>
                            <p className="text-muted-foreground text-sm">Full audit trail of institutional revenue collection.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" className="font-bold rounded-lg shadow-sm">
                                    <Download className="mr-2 h-4 w-4" /> Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="rounded-xl border-border/50 shadow-xl p-2 min-w-[160px]">
                                <DropdownMenuItem className="rounded-lg cursor-pointer h-9 font-medium">
                                    <TableIcon className="mr-3 h-4 w-4 text-muted-foreground" /> Download Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg cursor-pointer h-9 font-medium">
                                    <FileText className="mr-3 h-4 w-4 text-muted-foreground" /> Download CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input 
                            placeholder="Student name, roll, or ID..." 
                            className="w-full flex h-10 rounded-lg border border-border bg-muted/20 px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-muted/30 border-b border-border">
                                <TableRow>
                                    <TableHead className="font-bold text-foreground">Date & Time</TableHead>
                                    <TableHead className="font-bold text-foreground">Student Identity</TableHead>
                                    <TableHead className="font-bold text-foreground">Billed Invoice</TableHead>
                                    <TableHead className="font-bold text-foreground">Payment Mode</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">Amount</TableHead>
                                    <TableHead className="text-right font-bold text-foreground px-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={6} className="h-64 text-center text-muted-foreground font-medium animate-pulse">Syncing ledger records...</TableCell></TableRow>
                                    ) : transactions.length > 0 ? (
                                        transactions.map((tx: any) => (
                                            <TableRow key={tx.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground uppercase tracking-tight text-[13px]">{new Date(tx.createdAt).toLocaleDateString('en-GB')}</span>
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground">
                                                            {tx.invoice?.student?.firstName} {tx.invoice?.student?.lastName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Roll: {tx.invoice?.student?.rollNumber} • {tx.invoice?.student?.class?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-sm text-foreground/80">{tx.invoice?.invoiceTitle}</span>
                                                        <Badge variant="outline" className="w-fit text-[9px] font-bold border-0 bg-muted/60 px-2 py-0 uppercase">
                                                            Ref: {tx.referenceNo || "POS"}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-500/20">
                                                            <CreditCard className="h-3 w-3" />
                                                        </div>
                                                        <span className="font-bold text-xs uppercase text-muted-foreground tracking-wider">{tx.paymentMode}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4 text-right">
                                                    <span className="font-bold text-base text-emerald-600 tabular-nums tracking-tighter">₹{tx.amount.toLocaleString('en-IN')}</span>
                                                </TableCell>
                                                <TableCell className="py-4 text-right px-6">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => router.push(`/admin/fees/collection?id=${tx.invoice?.id}`)}
                                                        className="h-8 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        Details <ChevronRight className="ml-1 h-3 w-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={6} className="h-64 text-center text-muted-foreground font-bold uppercase text-[11px] tracking-widest opacity-40">Zero Transaction Logged</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                </div>

                <div className="bg-muted/20 border-t border-border p-4 flex items-center justify-between rounded-b-xl border border-t-0 bg-card">
                    <span className="text-sm text-muted-foreground font-bold">
                        Showing <span className="text-foreground">{transactions.length}</span> of <span className="text-foreground">{meta?.total || 0}</span> logs
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-3 text-xs font-bold text-foreground/70 bg-background/50 py-1 rounded-md border border-border/50">
                            Page {currentPage} of {meta?.totalPage || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(meta?.totalPage || 1, p + 1))}
                            disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0 || isLoading}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Revenue Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-card rounded-xl border border-border shadow-sm flex items-center gap-5">
                        <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                             <History className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Total Revenue</p>
                            <h4 className="text-2xl font-bold text-foreground tabular-nums tracking-tighter">₹{transactions.reduce((acc: number, curr: any) => acc + curr.amount, 0).toLocaleString('en-IN')}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </PermissionGate>
    );
}