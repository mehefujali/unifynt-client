/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Banknote, Loader2, CheckCircle } from "lucide-react";
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

    // States
    const [searchQuery, setSearchQuery] = useState("");
    const [activeInvoice, setActiveInvoice] = useState<StudentInvoice | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [referenceNo, setReferenceNo] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch PENDING and PARTIAL invoices
    const { data: invoices = [], isLoading } = useQuery<StudentInvoice[]>({
        queryKey: ["due-invoices"],
        queryFn: () => FeesService.getStudentInvoices(), // Fetch all, we filter in frontend for simplicity
        enabled: !!user?.schoolId,
    });

    // Filter logic
    const dueInvoices = invoices.filter(inv => inv.status === "PENDING" || inv.status === "PARTIAL" || inv.status === "OVERDUE");
    const filteredInvoices = dueInvoices.filter(inv =>
        inv.student?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.student?.rollNumber?.includes(searchQuery)
    );

    // Handle Payment
    const handleCollectPayment = async () => {
        if (!activeInvoice) return;
        const amount = Number(paymentAmount);
        const maxPayable = (activeInvoice.amountDue + activeInvoice.fine) - activeInvoice.discount - activeInvoice.amountPaid;

        if (amount <= 0 || amount > maxPayable) {
            toast.error(`Invalid amount. Maximum payable is ₹${maxPayable}`);
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment collection failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const openPaymentModal = (invoice: StudentInvoice) => {
        setActiveInvoice(invoice);
        const remaining = (invoice.amountDue + invoice.fine) - invoice.discount - invoice.amountPaid;
        setPaymentAmount(remaining.toString()); // Auto-fill full remaining amount
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* Search Bar */}
            <Card className="shadow-sm border-border bg-card">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Student Name or Roll No..."
                            className="pl-10 h-11 bg-muted/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground ml-auto bg-muted/40 px-4 py-2 rounded-lg border border-border/50">
                        Total Due Records: <span className="text-primary">{filteredInvoices.length}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Due Invoices Table */}
            <Card className="shadow-sm border-border bg-card">
                <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary" /> Pending Fee Collections
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Student Info</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Invoice Title</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Total Billed</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Paid Amount</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-primary">Remaining Due</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-right text-muted-foreground">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                                ) : filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((inv) => {
                                        const remaining = (inv.amountDue + inv.fine) - inv.discount - inv.amountPaid;
                                        return (
                                            <TableRow key={inv.id} className="h-16">
                                                <TableCell className="px-6 font-semibold text-sm">
                                                    {inv.student?.firstName} {inv.student?.lastName} <br />
                                                    <span className="text-xs text-muted-foreground">Roll: {inv.student?.rollNumber} | {inv.student?.class?.name}</span>
                                                </TableCell>
                                                <TableCell className="px-6 text-sm font-medium text-muted-foreground">
                                                    {inv.invoiceTitle} <br />
                                                    <Badge variant="outline" className="mt-1 text-[10px]">{inv.status}</Badge>
                                                </TableCell>
                                                <TableCell className="px-6 font-bold text-sm text-foreground">₹{inv.amountDue}</TableCell>
                                                <TableCell className="px-6 font-bold text-sm text-emerald-600">₹{inv.amountPaid}</TableCell>
                                                <TableCell className="px-6 font-black text-sm text-destructive">₹{remaining}</TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <Button size="sm" onClick={() => openPaymentModal(inv)} className="font-bold shadow-sm">Collect Payment</Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-medium">No pending dues found matching your search.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* --- Collection Modal --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-primary" /> Receive Payment
                        </DialogTitle>
                    </DialogHeader>
                    {activeInvoice && (
                        <div className="space-y-6 pt-4">
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm">
                                <div className="flex justify-between mb-2"><span className="text-muted-foreground font-semibold">Student:</span> <span className="font-bold">{activeInvoice.student?.firstName} {activeInvoice.student?.lastName}</span></div>
                                <div className="flex justify-between mb-2"><span className="text-muted-foreground font-semibold">Invoice:</span> <span className="font-bold">{activeInvoice.invoiceTitle}</span></div>
                                <div className="flex justify-between border-t border-border/40 pt-2 mt-2"><span className="text-muted-foreground font-bold">Total Payable Due:</span> <span className="font-black text-destructive text-lg">₹{(activeInvoice.amountDue + activeInvoice.fine) - activeInvoice.discount - activeInvoice.amountPaid}</span></div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Receiving Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="h-11 font-black text-lg text-primary shadow-sm"
                                    />
                                    <p className="text-[10px] text-muted-foreground font-medium">You can enter a partial amount if the parent is not paying in full.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-bold">Payment Mode</Label>
                                        <Select value={paymentMode} onValueChange={setPaymentMode}>
                                            <SelectTrigger className="h-11 shadow-sm"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CASH" className="font-medium">Cash</SelectItem>
                                                <SelectItem value="ONLINE" className="font-medium">Online Transfer</SelectItem>
                                                <SelectItem value="CHEQUE" className="font-medium">Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Reference No. (Optional)</Label>
                                        <Input
                                            placeholder="e.g., UTR / Cheque No"
                                            value={referenceNo}
                                            onChange={(e) => setReferenceNo(e.target.value)}
                                            className="h-11 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button onClick={handleCollectPayment} className="w-full h-12 font-bold shadow-md" disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />} Confirm Payment & Generate Receipt
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}