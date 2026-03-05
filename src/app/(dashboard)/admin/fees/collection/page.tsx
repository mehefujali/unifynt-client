/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Banknote, Loader2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FeesService, StudentInvoice } from "@/services/fees.service";
import { useAuth } from "@/hooks/use-auth";

export default function CollectionPOSPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("PENDING");

    const [activeInvoice, setActiveInvoice] = useState<StudentInvoice | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [referenceNo, setReferenceNo] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: invoicesRes, isLoading } = useQuery({
        queryKey: ["due-invoices", currentPage, limit, searchTerm, selectedStatus],
        queryFn: () => FeesService.getStudentInvoices({
            page: currentPage,
            limit,
            searchTerm: searchTerm || undefined,
            status: selectedStatus === "all" ? undefined : selectedStatus,
        }),
        enabled: !!user?.schoolId,
    });

    const invoicesList: StudentInvoice[] = invoicesRes?.data || [];
    const meta = invoicesRes?.meta;

    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    const handleCollectPayment = async () => {
        if (!activeInvoice) return;
        const amount = Number(paymentAmount);
        const maxPayable = (activeInvoice.amountDue + activeInvoice.fine) - activeInvoice.discount - activeInvoice.amountPaid;

        if (amount <= 0 || amount > maxPayable) {
            toast.error(`Invalid amount. Maximum payable is ₹${maxPayable.toLocaleString('en-IN')}`);
            return;
        }

        setIsProcessing(true);
        try {
            await FeesService.collectPayment({
                studentInvoiceId: activeInvoice.id,
                amount,
                paymentMode,
                referenceNo,
            });
            toast.success("Payment collected successfully!");
            setIsModalOpen(false);
            setPaymentAmount("");
            setReferenceNo("");
            queryClient.invalidateQueries({ queryKey: ["due-invoices"] });
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["fee-stats"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment collection failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const openPaymentModal = (invoice: StudentInvoice) => {
        setActiveInvoice(invoice);
        const remaining = (invoice.amountDue + invoice.fine) - invoice.discount - invoice.amountPaid;
        setPaymentAmount(remaining.toString()); 
        setPaymentMode("CASH");
        setReferenceNo("");
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-[0.99] duration-500 ease-out p-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[20px] shadow-sm border border-white/60 dark:border-white/10">
                    <Banknote className="h-7 w-7 text-primary" />
                </div>
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Fee Collection (POS)</h2>
                    <p className="text-muted-foreground text-[14px] font-bold opacity-80">Search students and collect pending fee payments.</p>
                </div>
            </div>

            <Card className="rounded-[32px] bg-white/40 dark:bg-black/20 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
                <CardHeader className="bg-white/30 dark:bg-black/10 border-b border-black/5 dark:border-white/5 p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by Student Name or Roll No..."
                            className="pl-11 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold text-[13px] h-12 rounded-2xl transition-all"
                            value={searchTerm}
                            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Select value={selectedStatus} onValueChange={(val) => handleFilterChange(setSelectedStatus, val)}>
                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl w-full md:w-[200px]">
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                <SelectItem value="all" className="font-bold text-primary">All Status</SelectItem>
                                <SelectItem value="PENDING" className="font-medium">Pending</SelectItem>
                                <SelectItem value="PARTIAL" className="font-medium">Partial</SelectItem>
                                <SelectItem value="OVERDUE" className="font-medium">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30">
                                <TableRow className="hover:bg-transparent border-b-black/5 dark:border-b-white/5">
                                    <TableHead className="pl-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Student Info</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Invoice Title</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Total Billed</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Paid Amount</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-primary uppercase tracking-[2px]">Remaining Due</TableHead>
                                    <TableHead className="text-right pr-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-64 text-center text-slate-400 font-bold animate-pulse">Loading fee records...</TableCell></TableRow>
                                ) : invoicesList.length > 0 ? (
                                    invoicesList.map((inv) => {
                                        const remaining = (inv.amountDue + inv.fine) - inv.discount - inv.amountPaid;
                                        const isPaid = inv.status === "PAID";
                                        
                                        return (
                                            <TableRow key={inv.id} className="hover:bg-white/80 dark:hover:bg-white/5 transition-all border-b-black/5 dark:border-b-white/5">
                                                <TableCell className="pl-8 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-[14px] text-slate-900 dark:text-white">
                                                            {inv.student?.firstName} {inv.student?.lastName}
                                                        </span>
                                                        <span className="text-[12px] font-bold text-slate-500 mt-0.5">
                                                            Roll: {inv.student?.rollNumber} | Class {inv.student?.class?.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-bold text-[13px] text-slate-700 dark:text-slate-300">{inv.invoiceTitle}</span>
                                                        <Badge variant="outline" className={`w-fit text-[10px] font-black tracking-wider uppercase border-0 px-2 py-0.5 ${isPaid ? "bg-emerald-500/10 text-emerald-600" : inv.status === "PARTIAL" ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"}`}>
                                                            {inv.status}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5 font-black text-[14px] text-slate-800 dark:text-slate-200">
                                                    ₹{inv.amountDue.toLocaleString('en-IN')}
                                                </TableCell>
                                                <TableCell className="py-5 font-black text-[14px] text-emerald-600 dark:text-emerald-400">
                                                    ₹{inv.amountPaid.toLocaleString('en-IN')}
                                                </TableCell>
                                                <TableCell className="py-5 font-black text-[15px] text-rose-600 dark:text-rose-400">
                                                    ₹{remaining.toLocaleString('en-IN')}
                                                </TableCell>
                                                <TableCell className="text-right pr-8 py-5">
                                                    <Button 
                                                        onClick={() => openPaymentModal(inv)} 
                                                        disabled={isPaid}
                                                        className="rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-xl bg-primary text-white dark:text-black"
                                                    >
                                                        {isPaid ? "Fully Paid" : "Collect Payment"}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow><TableCell colSpan={6} className="h-64 text-center text-slate-400 font-bold">No due records found matching your criteria.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t border-black/5 dark:border-white/5 bg-white/30 dark:bg-black/10 backdrop-blur-md gap-4">
                        <div className="text-[13px] font-bold text-slate-500">
                            Showing <span className="text-slate-900 dark:text-white font-black">{invoicesList.length}</span> of <span className="text-slate-900 dark:text-white font-black">{meta?.total || 0}</span> records
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-bold text-slate-400 hidden lg:inline">Per page</span>
                                <Select value={`${limit}`} onValueChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}>
                                    <SelectTrigger className="h-9 w-[75px] rounded-xl font-black bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl font-bold">
                                        {[10, 20, 50].map(v => <SelectItem key={v} value={`${v}`}>{v}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 disabled:opacity-30" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4 stroke-[3]" />
                                </Button>
                                <div className="px-4 h-9 flex items-center justify-center bg-primary text-white dark:text-black rounded-xl font-black text-[13px] shadow-lg shadow-primary/20">
                                    {currentPage} / {meta?.totalPage || 1}
                                </div>
                                <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-white/10 disabled:opacity-30" onClick={() => setCurrentPage(prev => Math.min(meta?.totalPage || 1, prev + 1))} disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0}>
                                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
                <DialogContent className="sm:max-w-md border-white/20 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-[32px] p-0">
                    <DialogHeader className="p-8 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                        <DialogTitle className="text-[22px] font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm"><Banknote className="h-5 w-5" /></div>
                            Receive Payment
                        </DialogTitle>
                    </DialogHeader>
                    {activeInvoice && (
                        <div className="p-8 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-500 font-bold">Student Name</span> 
                                    <span className="font-black text-slate-900 dark:text-white text-[15px]">{activeInvoice.student?.firstName} {activeInvoice.student?.lastName}</span>
                                </div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-slate-500 font-bold">Invoice Title</span> 
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{activeInvoice.invoiceTitle}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                                    <span className="text-slate-500 font-bold uppercase tracking-wider">Total Payable Due</span> 
                                    <span className="font-black text-rose-600 text-xl">₹{((activeInvoice.amountDue + activeInvoice.fine) - activeInvoice.discount - activeInvoice.amountPaid).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2.5">
                                    <Label className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Receiving Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="h-14 font-black text-2xl text-primary shadow-sm rounded-2xl bg-white/50 dark:bg-slate-900/50"
                                    />
                                    <p className="text-[11px] text-slate-500 font-bold">You can enter a partial amount if the parent is not paying in full.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <Label className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Payment Mode</Label>
                                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                                            <SelectTrigger className="h-12 shadow-sm rounded-2xl bg-white/50 dark:bg-slate-900/50 font-bold"><SelectValue /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="CASH" className="font-semibold">Cash</SelectItem>
                                                <SelectItem value="ONLINE" className="font-semibold">Online Transfer</SelectItem>
                                                <SelectItem value="CHEQUE" className="font-semibold">Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Reference (Optional)</Label>
                                        <Input
                                            placeholder="UTR / Cheque No"
                                            value={referenceNo}
                                            onChange={(e) => setReferenceNo(e.target.value)}
                                            className="h-12 shadow-sm rounded-2xl bg-white/50 dark:bg-slate-900/50 font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 mt-2 border-t border-black/5 dark:border-white/5">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isProcessing} className="rounded-2xl font-bold h-12 px-6">Cancel</Button>
                                <Button onClick={handleCollectPayment} className="rounded-2xl font-black px-8 shadow-xl shadow-primary/20 h-12" disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />} Confirm & Receipt
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}