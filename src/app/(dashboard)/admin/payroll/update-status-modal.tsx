/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, CheckCircle, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PayrollService } from "@/services/payroll.service";

export function UpdateStatusModal({ slip, open, onClose }: { slip: any, open: boolean, onClose: () => void }) {
    const [status, setStatus] = useState("PENDING");
    const [method, setMethod] = useState("BANK_TRANSFER");
    const [transactionId, setTransactionId] = useState("");
    const queryClient = useQueryClient();

    useEffect(() => {
        if (slip) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus(slip.status || "PENDING");
            setMethod(slip.paymentMethod || "BANK_TRANSFER");
            setTransactionId(slip.transactionId || "");
        }
    }, [slip]);

    const mutation = useMutation({
        mutationFn: (data: any) => PayrollService.updateSalaryStatus(slip.id, data),
        onSuccess: () => {
            toast.success("Payment status updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["payroll"] });
            onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update status"),
    });

    const handleSave = () => {
        mutation.mutate({
            status,
            paymentMethod: status === "PAID" ? method : undefined,
            transactionId: status === "PAID" ? transactionId : undefined
        });
    };

    if (!slip) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-extrabold text-primary flex items-center gap-2">
                        <CreditCard className="h-5 w-5" /> Disburse Payment
                    </DialogTitle>
                    <DialogDescription>Update the payment status for {slip.teacher?.firstName} {slip.teacher?.lastName}.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
                        <span className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Net Amount</span>
                        <span className="font-extrabold text-2xl font-mono text-primary">₹{slip.netSalary?.toLocaleString()}</span>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold">Payment Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-11 shadow-sm border-border/80"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="OVERDUE">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {status === "PAID" && (
                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                                <Label className="font-bold">Payment Method</Label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger className="h-11 shadow-sm border-border/80"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                        <SelectItem value="CASH">Cash</SelectItem>
                                        <SelectItem value="UPI">UPI</SelectItem>
                                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold">Transaction / Reference ID</Label>
                                <Input
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="e.g. TXN123456789"
                                    className="h-11 shadow-sm font-mono border-border/80"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    <Button onClick={handleSave} disabled={mutation.isPending} className="font-bold">
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Confirm Update
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}