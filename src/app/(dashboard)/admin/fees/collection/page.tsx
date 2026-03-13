/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Banknote, Loader2, CheckCircle, ChevronLeft, ChevronRight, ShieldAlert, Mail } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { FeesService, StudentInvoice } from "@/services/fees.service";
import { useAuth } from "@/hooks/use-auth";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-permission";

export default function CollectionPOSPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const [activeInvoice, setActiveInvoice] = useState<StudentInvoice | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState("CASH");
    const [referenceNo, setReferenceNo] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Permission Check for Actions
    const { hasPermission } = usePermission();
    const canCollect = hasPermission(PERMISSIONS.FEE_COLLECT);

    const { data: invoicesRes, isLoading } = useQuery({
        queryKey: ["studentInvoices", searchTerm, selectedStatus, currentPage],
        queryFn: () => FeesService.getStudentInvoices({ 
            searchTerm, 
            status: selectedStatus, 
            page: currentPage, 
            limit: 10
        }),
        enabled: !!user?.schoolId,
    });

    // Email Reminder Mutation
    const sendEmailReminderMutation = useMutation({
        mutationFn: (invoiceId: string) => FeesService.sendFeeEmailReminders({ invoiceIds: [invoiceId] }),
        onSuccess: (data) => {
            if (data.successCount > 0) {
                toast.success("Professional email reminder sent successfully!");
            } else {
                toast.error("Failed to send email. Check if student email is valid.");
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to initiate email reminder.");
        }
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
        // 🔒 Gate for Entire POS Access
        <PermissionGate 
            required={PERMISSIONS.FEE_VIEW}
            fallback={
                <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in duration-500">
                    <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Your administrative role does not have authorization to access the finance portal.
                    </p>
                </div>
            }
        >
            <div className="flex-1 space-y-4 p-8 pt-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Fee Collection (POS)</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search student or roll number..."
                            className="pl-9 bg-muted/20 border-border"
                            value={searchTerm}
                            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Select value={selectedStatus} onValueChange={(val) => handleFilterChange(setSelectedStatus, val)}>
                            <SelectTrigger className="w-full sm:w-[150px] bg-muted/20 border-border">
                                <SelectValue placeholder="Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PARTIAL">Partial</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <Table>
                            <TableHeader className="bg-muted/30 border-b border-border">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold text-foreground">Student Details</TableHead>
                                    <TableHead className="font-bold text-foreground">Invoice Title</TableHead>
                                    <TableHead className="font-bold text-foreground">Total Billed</TableHead>
                                    <TableHead className="font-bold text-foreground">Amount Paid</TableHead>
                                    <TableHead className="font-bold text-foreground">Remaining Due</TableHead>
                                    {canCollect && <TableHead className="text-right font-bold text-foreground"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={canCollect ? 6 : 5} className="h-64 text-center text-slate-400 font-bold animate-pulse">Loading fee records...</TableCell></TableRow>
                                    ) : invoicesList.length > 0 ? (
                                        invoicesList.map((inv) => {
                                            const remaining = (inv.amountDue + inv.fine) - inv.discount - inv.amountPaid;
                                            const isPaid = inv.status === "PAID";
                                            
                                            return (
                                                <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-foreground">
                                                                {inv.student?.firstName} {inv.student?.lastName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                Roll: {inv.student?.rollNumber} | {inv.student?.class?.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="font-bold text-sm text-foreground/80">{inv.invoiceTitle}</span>
                                                            <Badge variant="outline" className={cn(
                                                                "w-fit font-bold text-[10px] uppercase tracking-wider border-0 px-2 py-0.5",
                                                                isPaid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                                                                inv.status === "PARTIAL" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : 
                                                                "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                            )}>
                                                                {inv.status}
                                                            </Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-sm text-foreground/80">
                                                        ₹{inv.amountDue.toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-sm text-emerald-500">
                                                        ₹{inv.amountPaid.toLocaleString('en-IN')}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-sm text-rose-500">
                                                        ₹{remaining.toLocaleString('en-IN')}
                                                    </TableCell>
                                                    
                                                    {/* Actions Column */}
                                                    {canCollect && (
                                                        <TableCell className="text-right pr-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {!isPaid && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8 rounded-lg border-border hover:bg-primary/10 hover:text-primary transition-all"
                                                                        onClick={() => sendEmailReminderMutation.mutate(inv.id)}
                                                                        disabled={sendEmailReminderMutation.isPending || !inv.student?.email}
                                                                        title={inv.student?.email ? `Send email reminder to ${inv.student.email}` : "No email available"}
                                                                    >
                                                                        {sendEmailReminderMutation.isPending && sendEmailReminderMutation.variables === inv.id ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            <Mail className="h-4 w-4" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                                <PermissionGate required={PERMISSIONS.FEE_COLLECT}>
                                                                    <Button 
                                                                        size="sm"
                                                                        variant={isPaid ? "outline" : "default"}
                                                                        onClick={() => openPaymentModal(inv)} 
                                                                        disabled={isPaid}
                                                                        className="rounded-lg font-bold"
                                                                    >
                                                                        {isPaid ? "Paid" : "Collect"}
                                                                    </Button>
                                                                </PermissionGate>
                                                            </div>
                                                        </TableCell>
                                                    )}
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow><TableCell colSpan={canCollect ? 6 : 5} className="h-64 text-center text-slate-400 font-bold">No due records found matching your criteria.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                </div>

                <div className="bg-muted/20 border-t border-border p-4 flex items-center justify-between rounded-b-xl border border-t-0 bg-card">
                    <span className="text-sm text-muted-foreground font-bold">
                        Showing <span className="text-foreground">{invoicesList.length}</span> of <span className="text-foreground">{meta?.total || 0}</span> records
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                            onClick={() => setCurrentPage(prev => Math.min(meta?.totalPage || 1, prev + 1))}
                            disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0 || isLoading}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
                    <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                                <Banknote className="h-5 w-5 text-primary" />
                                Receive Payment
                            </h3>
                        </div>
                        {activeInvoice && (
                            <div className="p-6 space-y-6">
                                <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Student</span>
                                        <span className="font-bold">{activeInvoice.student?.firstName} {activeInvoice.student?.lastName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Invoice</span>
                                        <span className="font-medium">{activeInvoice.invoiceTitle}</span>
                                    </div>
                                    <div className="h-px bg-border my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Due</span>
                                        <span className="text-lg font-black text-rose-500">₹{((activeInvoice.amountDue + activeInvoice.fine) - activeInvoice.discount - activeInvoice.amountPaid).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Receiving Amount (₹)</Label>
                                        <Input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="h-12 font-bold text-lg bg-muted/20 border-border"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mode</Label>
                                            <Select value={paymentMode} onValueChange={setPaymentMode}>
                                                <SelectTrigger className="h-11 bg-muted/20 border-border font-medium"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CASH">Cash</SelectItem>
                                                    <SelectItem value="ONLINE">Online</SelectItem>
                                                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reference</Label>
                                            <Input
                                                placeholder="Optional"
                                                value={referenceNo}
                                                onChange={(e) => setReferenceNo(e.target.value)}
                                                className="h-11 bg-muted/20 border-border font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isProcessing} className="font-bold">Cancel</Button>
                                    <Button onClick={handleCollectPayment} className="font-bold px-6" disabled={isProcessing}>
                                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />} Confirm
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </PermissionGate>
    );
}