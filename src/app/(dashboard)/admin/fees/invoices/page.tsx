/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ReceiptText, Loader2, CalendarRange, CheckCircle, Search, FilterX, ChevronLeft, ChevronRight, MessageSquare, Plus, History } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { FeesService, StudentInvoice } from "@/services/fees.service";
import { AcademicService } from "@/services/academic.service";
import { useAuth } from "@/hooks/use-auth";

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
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isSmsSending, setIsSmsSending] = useState(false);

    const { data: classesRes } = useQuery({ queryKey: ["classes"], queryFn: AcademicService.getAllClasses, enabled: !!user?.schoolId });
    const classesData = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data?.data || (classesRes as any)?.data || []);

    const { data: yearsRes } = useQuery({ queryKey: ["academic-years"], queryFn: async () => { try { return (await api.get('/academic/years')).data; } catch { return (await api.get('/academic/sessions')).data; } }, enabled: !!user?.schoolId });
    const yearsData = Array.isArray(yearsRes) ? yearsRes : ((yearsRes as any)?.data || []);

    const { data: headsRes } = useQuery({ queryKey: ["fee-heads"], queryFn: () => FeesService.getAllFeeHeads({ limit: 100 }), enabled: !!user?.schoolId });
    const feeHeads = Array.isArray(headsRes?.data) ? headsRes.data : [];

    const { data: invoicesRes, isLoading: loadingInvoices } = useQuery({
        queryKey: ["invoices", currentPage, limit, selectedClassId, selectedMonth, selectedStatus, searchTerm],
        queryFn: () => FeesService.getStudentInvoices({ page: currentPage, limit, classId: selectedClassId === "all" ? undefined : selectedClassId, month: selectedMonth === "all" ? undefined : selectedMonth, status: selectedStatus === "all" ? undefined : selectedStatus, searchTerm: searchTerm || undefined }),
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
    const clearFilters = () => { setSearchTerm(""); setSelectedClassId("all"); setSelectedMonth("all"); setSelectedStatus("all"); setCurrentPage(1); setSelectedInvoiceIds([]); };

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
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-card border shadow-sm rounded-xl"><ReceiptText className="h-6 w-6 text-primary" /></div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Fee Invoices</h2>
                        <p className="text-muted-foreground text-sm font-medium">Manage student billing and send due reminders.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {selectedInvoiceIds.length > 0 && (
                        <Button onClick={handleSendSMS} disabled={isSmsSending} className="font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                            {isSmsSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                            Send SMS ({selectedInvoiceIds.length})
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push("/admin/fees/transactions")} className="font-bold border-2 rounded-xl h-11 px-5 shadow-sm">
                        <History className="mr-2 h-4 w-4" /> Transactions
                    </Button>
                    <Button onClick={() => setIsGenerateModalOpen(true)} className="font-bold shadow-md bg-primary text-primary-foreground rounded-xl h-11 px-5 transition-all hover:scale-[1.02]">
                        <Plus className="mr-2 h-4 w-4" /> Generate Bulk
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-border bg-card rounded-[24px] overflow-hidden">
                <CardHeader className="bg-muted/10 border-b border-border/40 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search student, roll..." className="pl-9 h-11 shadow-sm rounded-xl" value={searchTerm} onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)} />
                        </div>
                        <Select value={selectedClassId} onValueChange={(val) => handleFilterChange(setSelectedClassId, val)}>
                            <SelectTrigger className="h-11 shadow-sm rounded-xl"><SelectValue placeholder="Class" /></SelectTrigger>
                            <SelectContent className="rounded-xl"><SelectItem value="all">All Classes</SelectItem>{classesData.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={selectedMonth} onValueChange={(val) => handleFilterChange(setSelectedMonth, val)}>
                            <SelectTrigger className="h-11 shadow-sm rounded-xl"><SelectValue placeholder="Month" /></SelectTrigger>
                            <SelectContent className="rounded-xl"><SelectItem value="all">All Months</SelectItem>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={(val) => handleFilterChange(setSelectedStatus, val)}>
                            <SelectTrigger className="h-11 shadow-sm rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PARTIAL">Partial</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-12 pl-6"><Checkbox checked={allPendingSelected} onCheckedChange={handleSelectAll} /></TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground tracking-widest">Student info</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground tracking-widest">Invoice Details</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground tracking-widest text-right">Amount Due</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground tracking-widest">Status</TableHead>
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
                                            <TableRow key={inv.id} className="h-16 hover:bg-muted/30 transition-colors border-b-border/40">
                                                <TableCell className="pl-6"><Checkbox disabled={isPaid} checked={selectedInvoiceIds.includes(inv.id)} onCheckedChange={(c) => handleSelectInvoice(inv.id, !!c)} /></TableCell>
                                                <TableCell className="px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-foreground">{inv.student?.firstName} {inv.student?.lastName}</span>
                                                        <span className="text-[11px] text-muted-foreground font-medium mt-0.5 uppercase tracking-tighter">Roll: {inv.student?.rollNumber} • {inv.student?.class?.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-xs">{inv.invoiceTitle}</span>
                                                        <Badge variant="secondary" className="w-fit text-[9px] font-black px-1.5 py-0 uppercase bg-slate-100 dark:bg-slate-800">{inv.invoiceMonth.replace("_", " ")}</Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-sm text-foreground">₹{remaining.toLocaleString()}</span>
                                                        <span className="text-[10px] font-semibold text-muted-foreground">Total ₹{totalAmount.toLocaleString()}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-6">
                                                    <Badge variant="outline" className={`font-black text-[10px] uppercase px-2 py-0.5 border-none ${isPaid ? "text-emerald-600 bg-emerald-50" : inv.status === "PARTIAL" ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50"}`}>
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

                    <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/10">
                        <div className="text-xs font-bold text-muted-foreground">Showing {invoices.length} of {meta?.total || 0} invoices</div>
                        <div className="flex items-center gap-4">
                            <Select value={`${limit}`} onValueChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}>
                                <SelectTrigger className="h-9 w-[75px] text-xs font-bold rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent className="rounded-xl"><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem><SelectItem value="50">50</SelectItem></SelectContent>
                            </Select>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                                <div className="px-4 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-xl font-bold text-xs shadow-md">{currentPage} / {meta?.totalPage || 1}</div>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setCurrentPage(p => Math.min(meta?.totalPage || 1, p + 1))} disabled={currentPage === (meta?.totalPage || 1) || (meta?.totalPage || 0) === 0}><ChevronRight className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isGenerateModalOpen} onOpenChange={(open) => !open && setIsGenerateModalOpen(false)}>
                <DialogContent className="sm:max-w-[550px] shadow-lg border-border rounded-[32px]">
                    <DialogHeader className="border-b border-border/50 pb-4">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2"><CalendarRange className="h-5 w-5 text-primary" /> Bulk Invoice Generator</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((v) => generateMutation.mutate(v))} className="space-y-5 pt-2">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="academicYearId" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold text-sm">Session</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent className="rounded-xl">{yearsData.map((y: any) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="classId" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold text-sm">Class</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent className="rounded-xl">{classesData.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="invoiceMonth" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold text-sm">Billing Month</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 rounded-xl shadow-sm"><SelectValue placeholder="Select" /></SelectTrigger></FormControl><SelectContent className="rounded-xl">{MONTHS.map((m) => <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="dueDate" render={({ field }) => (
                                    <FormItem><FormLabel className="font-semibold text-sm">Due Date</FormLabel><FormControl><Input type="date" {...field} className="h-11 rounded-xl shadow-sm" /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="invoiceTitle" render={({ field }) => (
                                <FormItem><FormLabel className="font-semibold text-sm">Invoice Title</FormLabel><FormControl><Input placeholder="E.g., Tuition Fee - March" {...field} className="h-11 rounded-xl shadow-sm" /></FormControl><FormMessage /></FormItem>
                            )} />

                            <FormField control={form.control} name="feeHeadIds" render={() => (
                                <FormItem>
                                    <FormLabel className="font-semibold text-sm">Fees to Include (Multi-select)</FormLabel>
                                    <div className="grid grid-cols-2 gap-3 mt-2 p-4 border border-border/40 rounded-2xl bg-muted/20">
                                        {feeHeads.map((head: any) => (
                                            <FormField key={head.id} control={form.control} name="feeHeadIds" render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl><Checkbox checked={field.value?.includes(head.id)} onCheckedChange={(checked) => checked ? field.onChange([...field.value, head.id]) : field.onChange(field.value?.filter((val) => val !== head.id))} /></FormControl>
                                                    <FormLabel className="text-sm font-medium cursor-pointer">{head.name} <span className="text-[10px] text-muted-foreground uppercase">({head.type.charAt(0)})</span></FormLabel>
                                                </FormItem>
                                            )} />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <Button type="submit" className="w-full h-12 font-black shadow-lg shadow-primary/20 rounded-xl mt-4" disabled={generateMutation.isPending}>
                                {generateMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} Create Invoices
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}