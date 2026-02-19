/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Receipt, Loader2, Download, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { TransactionService } from "@/services/transaction.service";

export default function BillingHistoryPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const schoolId = user?.schoolId;

    const { data: transactions, isPending, isError, error } = useQuery({
        queryKey: ["transactions", schoolId],
        queryFn: () => TransactionService.getSchoolTransactions(schoolId as string),
        enabled: !!schoolId,
    });

    // 🔥 STRICT CHECK: Wait for Auth and Query
    const isLoading = isAuthLoading || isPending || !schoolId;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col h-64 items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900">
                <AlertCircle className="h-10 w-10 mb-3" />
                <p className="font-bold text-lg">Failed to load history</p>
                <p className="text-sm font-medium">{(error as any)?.response?.data?.message || error.message}</p>
            </div>
        );
    }

    // Fallback to array if data is missing
    const txList = Array.isArray(transactions) ? transactions : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
                    <p className="text-muted-foreground mt-1">View and download your past subscription invoices.</p>
                </div>
                <Button variant="outline" className="gap-2 font-semibold shadow-sm">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            <Card className="shadow-sm border-border/50">
                <CardContent className="p-0">
                    {txList.length === 0 ? (
                        <div className="flex flex-col h-64 items-center justify-center text-muted-foreground bg-muted/10">
                            <Receipt className="h-12 w-12 mb-3 text-muted-foreground/30" />
                            <p className="font-semibold">No billing history found.</p>
                            <p className="text-sm mt-1">Your transaction records will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="font-bold h-14 px-6 text-foreground">Date</TableHead>
                                        <TableHead className="font-bold h-14 text-foreground">Plan Subscribed</TableHead>
                                        <TableHead className="font-bold h-14 text-foreground">Payment Method</TableHead>
                                        <TableHead className="font-bold h-14 text-foreground">Transaction ID</TableHead>
                                        <TableHead className="font-bold h-14 text-right text-foreground">Amount</TableHead>
                                        <TableHead className="font-bold h-14 text-center text-foreground">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {txList.map((trx: any) => (
                                        <TableRow key={trx.id} className="hover:bg-muted/40 transition-colors">
                                            <TableCell className="px-6 py-5 font-semibold">
                                                {new Date(trx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1">
                                                    {trx.plan?.name || "Custom Plan"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-5 text-sm font-medium text-muted-foreground">
                                                {trx.paymentMethod.replace("_", " ")}
                                            </TableCell>
                                            <TableCell className="py-5 text-sm font-mono font-medium text-muted-foreground">
                                                {trx.paymentId || "—"}
                                            </TableCell>
                                            <TableCell className="py-5 text-right font-extrabold text-base">
                                                ₹{trx.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="py-5 text-center">
                                                <Badge variant={trx.status === "SUCCESS" ? "default" : "secondary"} className={trx.status === "SUCCESS" ? "bg-green-500 hover:bg-green-600 font-bold" : "font-bold"}>
                                                    {trx.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}