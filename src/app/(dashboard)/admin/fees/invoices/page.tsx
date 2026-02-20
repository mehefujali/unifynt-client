/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReceiptText, Loader2, CalendarRange, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { FeesService, StudentInvoice } from "@/services/fees.service";
import { AcademicService } from "@/services/academic.service";
import { useAuth } from "@/hooks/use-auth";

// --- Local Interfaces to prevent import errors ---
interface AcademicClass {
    id: string;
    name: string;
}
interface AcademicYear {
    id: string;
    name: string;
}

const invoiceSchema = z.object({
    classId: z.string().min(1, "Please select a class"),
    academicYearId: z.string().min(1, "Please select an academic year/session"),
    invoiceTitle: z.string().min(3, "Title must be at least 3 characters"),
    invoiceMonth: z.string().min(1, "Please select an invoice month"),
    dueDate: z.string().min(1, "Please select a due date"),
});

export default function BulkInvoicesPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Safe Data Fetching ---
    const { data: classesRes } = useQuery({
        queryKey: ["classes"],
        queryFn: AcademicService.getAllClasses,
        enabled: !!user?.schoolId,
    });
    const classesData: AcademicClass[] = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || []);

    const { data: yearsRes } = useQuery({
        queryKey: ["academic-years"],
        queryFn: async () => {
            // 1. Fallback robust logic to fetch years/sessions if method is missing in AcademicService
            if ((AcademicService as any).getAllAcademicYears) {
                return (AcademicService as any).getAllAcademicYears();
            }
            try {
                const res = await api.get('/academic/years');
                return res.data;
            } catch {
                const res = await api.get('/academic/sessions'); // Alternate common route
                return res.data;
            }
        },
        enabled: !!user?.schoolId,
    });
    const yearsData: AcademicYear[] = Array.isArray(yearsRes) ? yearsRes : ((yearsRes as any)?.data || []);

    const { data: recentInvoices = [], isLoading: loadingInvoices } = useQuery<StudentInvoice[]>({
        queryKey: ["recent-invoices"],
        queryFn: () => FeesService.getStudentInvoices(),
        enabled: !!user?.schoolId,
    });

    // --- Form ---
    const form = useForm<z.infer<typeof invoiceSchema>>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: { classId: "", academicYearId: "", invoiceTitle: "", invoiceMonth: "", dueDate: "" },
    });

    // --- Submit Handler ---
    const onSubmit = async (values: z.infer<typeof invoiceSchema>) => {
        setIsGenerating(true);
        try {
            const response = await FeesService.bulkGenerateInvoices(values);
            toast.success(response.message || "Invoices generated successfully!");
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["recent-invoices"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate invoices");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-4">
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2"><CalendarRange className="h-5 w-5 text-primary" /> Bulk Generator</CardTitle>
                        <CardDescription>Generate monthly bills for an entire class.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="academicYearId" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Academic Session</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select Session" /></SelectTrigger></FormControl><SelectContent>{yearsData.map((year) => <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="classId" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Target Class</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl><SelectContent>{classesData.map((cls) => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="invoiceMonth" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Billing Month</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="e.g., MARCH_2026" /></SelectTrigger></FormControl><SelectContent><SelectItem value="JAN_2026">January 2026</SelectItem><SelectItem value="FEB_2026">February 2026</SelectItem><SelectItem value="MAR_2026">March 2026</SelectItem><SelectItem value="APR_2026">April 2026</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="invoiceTitle" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Invoice Title</FormLabel><FormControl><Input placeholder="E.g., Tuition Fee - March" {...field} className="h-11 shadow-sm" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="dueDate" render={({ field }) => (
                                    <FormItem><FormLabel className="font-bold">Due Date</FormLabel><FormControl><Input type="date" {...field} className="h-11 shadow-sm" /></FormControl><FormMessage /></FormItem>
                                )} />
                                <Button type="submit" className="w-full h-11 font-bold shadow-md" disabled={isGenerating}>
                                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />} Generate Batch Invoices
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-8">
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2"><ReceiptText className="h-5 w-5 text-primary" /> Generated Invoices Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Student</TableHead><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Title</TableHead><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Amount</TableHead><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Status</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingInvoices ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow> : recentInvoices.length > 0 ? recentInvoices.slice(0, 10).map((inv) => (
                                        <TableRow key={inv.id} className="h-14">
                                            <TableCell className="px-6 font-semibold text-sm">{inv.student?.firstName} {inv.student?.lastName} <br /><span className="text-xs text-muted-foreground">Roll: {inv.student?.rollNumber} | {inv.student?.class?.name}</span></TableCell>
                                            <TableCell className="px-6 text-sm font-medium text-muted-foreground">{inv.invoiceTitle}</TableCell>
                                            <TableCell className="px-6 font-black text-sm text-foreground">₹{inv.amountDue}</TableCell>
                                            <TableCell className="px-6"><Badge variant="outline" className={inv.status === "PAID" ? "border-emerald-500 text-emerald-600" : inv.status === "PARTIAL" ? "border-amber-500 text-amber-600" : "border-destructive text-destructive"}>{inv.status}</Badge></TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-medium">No invoices found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}