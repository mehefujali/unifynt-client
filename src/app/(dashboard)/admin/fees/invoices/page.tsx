/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, CalendarRange, CheckCircle, Search, ChevronLeft, ChevronRight, MessageSquare, Plus, History, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { FeesService, StudentInvoice } from "@/services/fees.service";
import { AcademicService } from "@/services/academic.service";
import { useAuth } from "@/hooks/use-auth";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { cn } from "@/lib/utils";
import { usePermission } from "@/hooks/use-permission";

const invoiceSchema = z.object({
    classId: z.string().min(1, "Please select a class"),
    academicYearId: z.string().min(1, "Please select an academic year/session"),
    invoiceTitle: z.string().min(3, "Title must be at least 3 characters"),
    invoiceMonth: z.string().min(1, "Please select an invoice month"),
    dueDate: z.string().min(1, "Please select a due date"),
    feeHeadIds: z.array(z.string()).min(1, "Select at least one fee head"),
});

const MONTHS = ["JAN_2026", "FEB_2026", "MAR_2026", "APR_2026", "MAY_2026", "JUN_2026", "JUL_2026", "AUG_2026", "SEP_2026", "OCT_2026", "NOV_2026", "DEC_2026"];

export default function InvoicesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isSmsSending, setIsSmsSending] = useState(false);

    // Permission Hooks
    const { hasPermission } = usePermission();
    const canSendSMS = hasPermission(PERMISSIONS.SMS_SEND);

    const { data: classesRes } = useQuery({ queryKey: ["classes"], queryFn: AcademicService.getAllClasses, enabled: !!user?.schoolId });
    const classesData = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data?.data || (classesRes as any)?.data || []);

    const { data: yearsRes } = useQuery({ queryKey: ["academic-years"], queryFn: async () => { try { return (await api.get('/academic/years')).data; } catch { return (await api.get('/academic/sessions')).data; } }, enabled: !!user?.schoolId });
    const yearsData = Array.isArray(yearsRes) ? yearsRes : ((yearsRes as any)?.data || []);

    const { data: headsRes } = useQuery({ queryKey: ["fee-heads"], queryFn: () => FeesService.getAllFeeHeads({ limit: 100 }), enabled: !!user?.schoolId });
    const feeHeads = Array.isArray(headsRes?.data) ? headsRes.data : [];

    const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
        queryKey: ["invoices", currentPage, selectedClassId, selectedMonth, selectedStatus, searchTerm],
        queryFn: () => FeesService.getStudentInvoices({ 
            page: currentPage, 
            limit: 10, 
            classId: selectedClassId === "all" ? undefined : selectedClassId, 
            month: selectedMonth === "all" ? undefined : selectedMonth, 
            status: selectedStatus === "all" ? undefined : selectedStatus, 
            searchTerm: searchTerm || undefined 
        }),
        enabled: !!user?.schoolId,
    });

    const invoices: StudentInvoice[] = invoicesRes?.data || [];
    const meta = invoicesRes?.meta;

    const form = useForm<z.infer<typeof invoiceSchema>>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: { classId: "", academicYearId: "", invoiceTitle: "", invoiceMonth: "", dueDate: "", feeHeadIds: [] },
    });

    const generateMutation = useMutation({
        mutationFn: FeesService.bulkGenerateInvoices,
        onSuccess: (res) => {
            toast.success(res.message || "Invoices generated successfully!");
            form.reset();
            setIsGenerateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to generate invoices"),
    });

    const handleFilterChange = (setter: any, value: any) => { setter(value); setCurrentPage(1); setSelectedInvoiceIds([]); };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const selectableIds = invoices.filter(inv => inv.status !== "PAID").map(inv => inv.id);
            setSelectedInvoiceIds(selectableIds);
        } else {
            setSelectedInvoiceIds([]);
        }
    };

    const handleSelectInvoice = (id: string, checked: boolean) => {
        if (checked) setSelectedInvoiceIds(prev => [...prev, id]);
        else setSelectedInvoiceIds(prev => prev.filter(invId => invId !== id));
    };

    const handleSendSMS = async () => {
        if (selectedInvoiceIds.length === 0) return toast.error("Select at least one pending invoice");
        setIsSmsSending(true);
        try {
            const res = await FeesService.sendFeeReminders({ invoiceIds: selectedInvoiceIds, templateId: "FEE_REMINDER_TEMPLATE" });
            toast.success(`Reminders Sent! Success: ${res.data?.successCount}, Failed: ${res.data?.failureCount}`);
            setSelectedInvoiceIds([]);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reminders");
        } finally {
            setIsSmsSending(false);
        }
    };

    const allPendingSelected = invoices.length > 0 && invoices.filter(inv => inv.status !== "PAID").every(inv => selectedInvoiceIds.includes(inv.id));

    return (
        // 🔒 Gate for Entire Page
        <PermissionGate 
            required={PERMISSIONS.INVOICE_VIEW}
            fallback={
                <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-8 text-center animate-in fade-in duration-500">
                    <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        Your administrative role does not have authorization to view student invoices.
                    </p>
                </div>
            }
        >
            <div className="flex-1 space-y-4 p-8 pt-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Fee Invoices</h2>
                        <p className="text-muted-foreground text-sm">Manage student billing and send due reminders.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PermissionGate required={PERMISSIONS.SMS_SEND}>
                            {selectedInvoiceIds.length > 0 && (
                                <Button size="sm" onClick={handleSendSMS} disabled={isSmsSending} className="font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                    {isSmsSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                                    Send SMS ({selectedInvoiceIds.length})
                                </Button>
                            )}
                        </PermissionGate>

                        <Button size="sm" variant="outline" onClick={() => router.push("/admin/fees/transactions")} className="font-bold rounded-lg border-border">
                            <History className="mr-2 h-4 w-4" /> Transactions
                        </Button>

                        <PermissionGate required={PERMISSIONS.INVOICE_CREATE}>
                            <Button size="sm" onClick={() => setIsGenerateModalOpen(true)} className="font-bold rounded-lg transition-all hover:scale-[1.02]">
                                <Plus className="mr-2 h-4 w-4" /> Generate Bulk
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search student or roll..." 
                            className="pl-9 bg-muted/20 border-border" 
                            value={searchTerm} 
                            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)} 
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <Select value={selectedClassId} onValueChange={(val) => handleFilterChange(setSelectedClassId, val)}>
                            <SelectTrigger className="w-[140px] bg-muted/20 border-border"><SelectValue placeholder="Class" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                {classesData.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedMonth} onValueChange={(val) => handleFilterChange(setSelectedMonth, val)}>
                            <SelectTrigger className="w-[140px] bg-muted/20 border-border"><SelectValue placeholder="Month" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Months</SelectItem>
                                {MONTHS.map((m) => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={(val) => handleFilterChange(setSelectedStatus, val)}>
                            <SelectTrigger className="w-[140px] bg-muted/20 border-border"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PARTIAL">Partial</SelectItem>
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
                                    <TableHead className="w-12 pl-6">
                                        <Checkbox 
                                            disabled={!canSendSMS} 
                                            checked={allPendingSelected} 
                                            onCheckedChange={handleSelectAll} 
                                        />
                                    </TableHead>
                                    <TableHead className="font-bold text-foreground">Student Info</TableHead>
                                    <TableHead className="font-bold text-foreground">Invoice Details</TableHead>
                                    <TableHead className="text-right font-bold text-foreground">Amount Due</TableHead>
                                    <TableHead className="font-bold text-foreground">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                    {loadingInvoices ? (
                                        <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-medium"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                                    ) : invoices.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-medium">No records found.</TableCell></TableRow>
                                    ) : (
                                        invoices.map((inv) => {
                                            const isPaid = inv.status === "PAID";
                                            const totalAmount = inv.amountDue + inv.fine - inv.discount;
                                            const remaining = totalAmount - inv.amountPaid;
                                            return (
                                                <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                                    <TableCell className="pl-6">
                                                        <Checkbox 
                                                            disabled={isPaid || !canSendSMS} 
                                                            checked={selectedInvoiceIds.includes(inv.id)} 
                                                            onCheckedChange={(c) => handleSelectInvoice(inv.id, !!c)} 
                                                        />
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-foreground">{inv.student?.firstName} {inv.student?.lastName}</span>
                                                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Roll: {inv.student?.rollNumber} • {inv.student?.class?.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold text-sm text-foreground/80">{inv.invoiceTitle}</span>
                                                            <Badge variant="outline" className="w-fit text-[10px] font-bold px-2 py-0 uppercase bg-muted/50 border-0">{inv.invoiceMonth.replace("_", " ")}</Badge>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6 text-right">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm text-foreground">₹{remaining.toLocaleString()}</span>
                                                            <span className="text-[10px] font-semibold text-muted-foreground">Total ₹{totalAmount.toLocaleString()}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-6">
                                                        <Badge variant="outline" className={cn(
                                                            "w-fit font-bold text-[10px] uppercase tracking-wider border-0 px-2 py-0.5",
                                                            isPaid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                                                            inv.status === "PARTIAL" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : 
                                                            "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                        )}>
                                                            {inv.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                </div>

                <div className="bg-muted/20 border-t border-border p-4 flex items-center justify-between rounded-b-xl border border-t-0 bg-card">
                    <span className="text-sm text-muted-foreground font-bold">
                        Showing <span className="text-foreground">{invoices.length}</span> of <span className="text-foreground">{meta?.total || 0}</span> records
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loadingInvoices}
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
                            disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0 || loadingInvoices}
                            className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Bulk Invoice Modal */}
                <Dialog open={isGenerateModalOpen} onOpenChange={(open) => !open && setIsGenerateModalOpen(false)}>
                    <DialogContent className="sm:max-w-lg bg-card border-border shadow-2xl rounded-2xl p-0 overflow-hidden">
                        <div className="p-6 border-b border-border bg-muted/30">
                            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                                <CalendarRange className="h-5 w-5 text-primary" />
                                Bulk Invoice Generator
                            </h3>
                        </div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((v) => generateMutation.mutate(v))} className="p-6 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <FormField control={form.control} name="academicYearId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Session</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-10 rounded-lg bg-muted/20 border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                <SelectContent>{yearsData.map((y: any) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="classId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Class</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-10 rounded-lg bg-muted/20 border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                <SelectContent>{classesData.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <FormField control={form.control} name="invoiceMonth" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Billing Month</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger className="h-10 rounded-lg bg-muted/20 border-border"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                                <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="dueDate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Due Date</FormLabel>
                                            <FormControl><Input type="date" {...field} className="h-10 rounded-lg bg-muted/20 border-border" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="invoiceTitle" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Invoice Title</FormLabel>
                                        <FormControl><Input placeholder="E.g., Tuition Fee - March" {...field} className="h-10 rounded-lg bg-muted/20 border-border" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="feeHeadIds" render={() => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fees to Include</FormLabel>
                                        <div className="grid grid-cols-2 gap-3 mt-2 p-4 border border-border bg-muted/10 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
                                            {feeHeads.map((head: any) => (
                                                <FormField key={head.id} control={form.control} name="feeHeadIds" render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl><Checkbox checked={field.value?.includes(head.id)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, head.id]) : field.onChange(field.value?.filter((val) => val !== head.id))} /></FormControl>
                                                        <FormLabel className="text-sm font-medium cursor-pointer">{head.name}</FormLabel>
                                                    </FormItem>
                                                )} />
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                    <Button variant="ghost" type="button" onClick={() => setIsGenerateModalOpen(false)} disabled={generateMutation.isPending} className="font-bold">Cancel</Button>
                                    <Button type="submit" className="font-bold px-6" disabled={generateMutation.isPending}>
                                        {generateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />} Create
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </PermissionGate>
    );
}