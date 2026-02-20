"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SmsService } from "@/services/sms.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, History, ArrowDownToLine, ArrowUpFromLine, Loader2, Search, Clock, ReceiptText, Banknote } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function SmsHistoryPage() {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: response, isLoading } = useQuery({
        queryKey: ["sms-transactions", page],
        queryFn: () => SmsService.getSmsTransactions({ page, limit }),
        enabled: !!user?.schoolId,
    });

    // --- BULLETPROOF DATA EXTRACTION ---
    // Since Axios wraps response in 'data', and backend sends { success, meta, data },
    // we need to safely extract the actual array.

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = response || {};

    // Safely find the array
    const transactions = Array.isArray(payload) ? payload :
        Array.isArray(payload?.data) ? payload.data :
            Array.isArray(payload?.data?.data) ? payload.data.data : [];

    // Safely find the meta object
    const meta = payload?.meta || payload?.data?.meta || { page: 1, totalPage: 1, total: 0 };

    return (
        <Card className="border-border shadow-sm bg-card animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            <CardHeader className="border-b border-border/40 bg-muted/10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-xl font-extrabold flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" /> Accounting Ledger
                    </CardTitle>
                    <CardDescription className="text-sm font-medium mt-1">
                        Track all your SMS credit top-ups and campaign usage history.
                    </CardDescription>
                </div>
                <div className="text-sm font-semibold bg-background border border-border shadow-sm px-4 py-2 rounded-full flex items-center gap-2">
                    Total Records: <Badge variant="secondary" className="text-primary font-black px-2">{meta.total}</Badge>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <Table className="min-w-[1000px]">
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-border/40">
                                <TableHead className="h-14 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground w-[200px]">Date & Time</TableHead>
                                <TableHead className="h-14 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground w-[150px]">Type</TableHead>
                                <TableHead className="h-14 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground">Transaction Details</TableHead>
                                <TableHead className="h-14 px-6 font-bold text-xs uppercase tracking-wider text-right text-muted-foreground">Amount</TableHead>
                                <TableHead className="h-14 px-6 font-bold text-xs uppercase tracking-wider text-right text-muted-foreground">Credits</TableHead>
                                <TableHead className="h-14 px-6 font-bold text-xs uppercase tracking-wider text-right text-muted-foreground w-[150px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
                                        <p className="text-sm text-muted-foreground font-medium mt-3">Syncing ledger data...</p>
                                    </TableCell>
                                </TableRow>
                            ) : transactions.length > 0 ? (
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                transactions.map((tx: any) => {
                                    const isPurchase = tx.type === "PURCHASE";
                                    const isPending = tx.paymentStatus === "PENDING";

                                    return (
                                        <TableRow key={tx.id} className="h-20 border-b border-border/40 even:bg-muted/5 hover:bg-muted/20 transition-colors">

                                            {/* Date & Time Column */}
                                            <TableCell className="px-6 font-semibold text-sm text-foreground">
                                                {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                                                    <Clock className="h-3 w-3" /> {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </TableCell>

                                            {/* Transaction Type Column */}
                                            <TableCell className="px-6">
                                                {isPurchase ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold border-0 shadow-none px-3 py-1">
                                                        <ArrowDownToLine className="h-3.5 w-3.5 mr-1.5" /> Top-up
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold border-0 shadow-none px-3 py-1">
                                                        <ArrowUpFromLine className="h-3.5 w-3.5 mr-1.5" /> Usage
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Description & Reference Column */}
                                            <TableCell className="px-6">
                                                <p className="text-sm font-semibold text-foreground max-w-[350px] truncate" title={tx.description}>
                                                    {tx.description}
                                                </p>
                                                {tx.referenceId && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 font-mono bg-muted/40 w-fit px-2 py-0.5 rounded border border-border/50">
                                                        <ReceiptText className="h-3 w-3" /> Ref: {tx.referenceId}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Amount Column (For Purchases) */}
                                            <TableCell className="px-6 text-right">
                                                {isPurchase && tx.amount > 0 ? (
                                                    <span className="font-bold text-sm text-foreground flex items-center justify-end gap-1">
                                                        <Banknote className="h-3.5 w-3.5 text-muted-foreground" /> ₹{tx.amount.toLocaleString("en-IN")}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium text-muted-foreground/50">—</span>
                                                )}
                                            </TableCell>

                                            {/* Credits Effect Column */}
                                            <TableCell className="px-6 text-right">
                                                <span className={cn(
                                                    "font-black text-[15px] px-3 py-1 rounded-lg border",
                                                    isPurchase
                                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                        : "bg-destructive/10 text-destructive border-destructive/20"
                                                )}>
                                                    {isPurchase ? "+" : "-"}{tx.credits.toLocaleString()}
                                                </span>
                                            </TableCell>

                                            {/* Payment Status Column */}
                                            <TableCell className="px-6 text-right">
                                                <Badge variant="outline" className={cn(
                                                    "font-bold uppercase tracking-wider border shadow-sm px-3 py-1",
                                                    tx.paymentStatus === "PAID"
                                                        ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                                                        : isPending
                                                            ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
                                                            : "text-destructive bg-destructive/10 border-destructive/20"
                                                )}>
                                                    {isPending && <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />}
                                                    {tx.paymentStatus}
                                                </Badge>
                                            </TableCell>

                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-muted-foreground flex-col items-center justify-center">
                                        <div className="bg-muted/30 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                            <Search className="h-8 w-8 opacity-40" />
                                        </div>
                                        <p className="font-bold text-base text-foreground">No transactions found.</p>
                                        <p className="text-sm mt-1">Your SMS top-up and usage history will appear here.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/5">
                    <div className="text-sm font-medium text-muted-foreground">
                        Page <span className="font-bold text-foreground mx-1">{meta.page}</span>
                        of <span className="font-bold text-foreground ml-1">{meta.totalPage || 1}</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="shadow-sm font-bold">
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPage || isLoading} className="shadow-sm font-bold">
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}