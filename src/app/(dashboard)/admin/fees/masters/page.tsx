/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Settings, Layers, Loader2, Table2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { FeesService, FeeHead, FeeStructure } from "@/services/fees.service";
import { AcademicService } from "@/services/academic.service";
import { useAuth } from "@/hooks/use-auth";

// --- Local Interfaces to prevent import errors ---
interface AcademicClass {
    id: string;
    name: string;
}

// --- Zod Schemas ---
const feeHeadSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["MONTHLY", "YEARLY", "ONE_TIME"], { required_error: "Please select a type" }),
});

const feeStructureSchema = z.object({
    feeHeadId: z.string().min(1, "Please select a Fee Head"),
    classId: z.string().min(1, "Please select a Class"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

export default function FeeMastersPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isSubmittingHead, setIsSubmittingHead] = useState(false);
    const [isSubmittingStruct, setIsSubmittingStruct] = useState(false);

    // --- Data Fetching ---
    const { data: feeHeads = [], isLoading: loadingHeads } = useQuery<FeeHead[]>({
        queryKey: ["fee-heads"],
        queryFn: FeesService.getAllFeeHeads,
        enabled: !!user?.schoolId,
    });

    const { data: feeStructures = [], isLoading: loadingStructs } = useQuery<FeeStructure[]>({
        queryKey: ["fee-structures"],
        queryFn: () => FeesService.getFeeStructures(),
        enabled: !!user?.schoolId,
    });

    // Safe fetch for classes
    const { data: classesRes } = useQuery({
        queryKey: ["classes"],
        queryFn: AcademicService.getAllClasses,
        enabled: !!user?.schoolId,
    });
    const classesData: AcademicClass[] = Array.isArray(classesRes) ? classesRes : ((classesRes as any)?.data || []);

    // --- Forms ---
    const headForm = useForm<z.infer<typeof feeHeadSchema>>({
        resolver: zodResolver(feeHeadSchema),
        defaultValues: { name: "", type: "MONTHLY" },
    });

    const structForm = useForm<z.infer<typeof feeStructureSchema>>({
        resolver: zodResolver(feeStructureSchema),
        defaultValues: { feeHeadId: "", classId: "", amount: 0 },
    });

    // --- Submit Handlers ---
    const onSubmitHead = async (values: z.infer<typeof feeHeadSchema>) => {
        setIsSubmittingHead(true);
        try {
            await FeesService.createFeeHead(values);
            toast.success("Fee Head created successfully!");
            headForm.reset();
            queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create Fee Head");
        } finally {
            setIsSubmittingHead(false);
        }
    };

    const onSubmitStruct = async (values: z.infer<typeof feeStructureSchema>) => {
        setIsSubmittingStruct(true);
        try {
            await FeesService.createFeeStructure(values);
            toast.success("Fee Structure saved successfully!");
            structForm.reset({ ...values, amount: 0 });
            queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save Fee Structure");
        } finally {
            setIsSubmittingStruct(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Tabs defaultValue="heads" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2 h-12 bg-muted/40 border border-border/50 rounded-xl mb-6 p-1">
                    <TabsTrigger value="heads" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Settings className="h-4 w-4 mr-2" /> Fee Heads
                    </TabsTrigger>
                    <TabsTrigger value="structures" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Layers className="h-4 w-4 mr-2" /> Class Structures
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="heads" className="m-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4">
                            <Card className="shadow-sm border-border bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                                    <CardTitle className="text-lg font-bold">Create Fee Head</CardTitle>
                                    <CardDescription>E.g., Tuition Fee, Transport Fee, Lab Fee.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <Form {...headForm}>
                                        <form onSubmit={headForm.handleSubmit(onSubmitHead)} className="space-y-4">
                                            <FormField control={headForm.control} name="name" render={({ field }) => (
                                                <FormItem><FormLabel className="font-bold">Head Name</FormLabel><FormControl><Input placeholder="E.g., Tuition Fee" {...field} className="h-11 shadow-sm" /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={headForm.control} name="type" render={({ field }) => (
                                                <FormItem><FormLabel className="font-bold">Frequency Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl><SelectContent><SelectItem value="MONTHLY">Monthly</SelectItem><SelectItem value="YEARLY">Yearly</SelectItem><SelectItem value="ONE_TIME">One Time</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                                            )} />
                                            <Button type="submit" className="w-full h-11 font-bold shadow-md" disabled={isSubmittingHead}>
                                                {isSubmittingHead ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />} Save Fee Head
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-8">
                            <Card className="shadow-sm border-border bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2"><Table2 className="h-5 w-5 text-primary" /> Active Fee Heads</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="w-full overflow-x-auto custom-scrollbar">
                                        <Table>
                                            <TableHeader className="bg-muted/30"><TableRow><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Head Name</TableHead><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Frequency</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {loadingHeads ? <TableRow><TableCell colSpan={2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow> : feeHeads.length > 0 ? feeHeads.map((head) => (
                                                    <TableRow key={head.id} className="h-14"><TableCell className="px-6 font-bold text-sm">{head.name}</TableCell><TableCell className="px-6"><Badge variant="outline" className="font-bold text-xs">{head.type}</Badge></TableCell></TableRow>
                                                )) : <TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground font-medium">No fee heads created yet.</TableCell></TableRow>}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="structures" className="m-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4">
                            <Card className="shadow-sm border-border bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                                    <CardTitle className="text-lg font-bold">Define Structure</CardTitle>
                                    <CardDescription>Assign fee amount to a specific class.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <Form {...structForm}>
                                        <form onSubmit={structForm.handleSubmit(onSubmitStruct)} className="space-y-4">
                                            <FormField control={structForm.control} name="classId" render={({ field }) => (
                                                <FormItem><FormLabel className="font-bold">Select Class</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Choose a class" /></SelectTrigger></FormControl><SelectContent>{classesData.map((cls) => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={structForm.control} name="feeHeadId" render={({ field }) => (
                                                <FormItem><FormLabel className="font-bold">Select Fee Head</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Choose a fee head" /></SelectTrigger></FormControl><SelectContent>{feeHeads.map((head) => <SelectItem key={head.id} value={head.id}>{head.name} ({head.type})</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                            )} />
                                            <FormField control={structForm.control} name="amount" render={({ field }) => (
                                                <FormItem><FormLabel className="font-bold">Amount (₹)</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} className="h-11 shadow-sm font-bold text-primary" /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <Button type="submit" className="w-full h-11 font-bold shadow-md" disabled={isSubmittingStruct}>
                                                {isSubmittingStruct ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />} Save Structure
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-8">
                            <Card className="shadow-sm border-border bg-card">
                                <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2"><Table2 className="h-5 w-5 text-primary" /> Configured Structures</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="w-full overflow-x-auto custom-scrollbar">
                                        <Table>
                                            <TableHeader className="bg-muted/30"><TableRow><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Class</TableHead><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Fee Head</TableHead><TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground text-right">Amount</TableHead></TableRow></TableHeader>
                                            <TableBody>
                                                {loadingStructs ? <TableRow><TableCell colSpan={3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow> : feeStructures.length > 0 ? feeStructures.map((struct) => (
                                                    <TableRow key={struct.id} className="h-14"><TableCell className="px-6 font-bold text-sm text-foreground">{struct.class?.name}</TableCell><TableCell className="px-6 text-sm font-semibold text-muted-foreground">{struct.feeHead?.name}</TableCell><TableCell className="px-6 font-black text-sm text-right text-primary">₹{struct.amount}</TableCell></TableRow>
                                                )) : <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground font-medium">No fee structures defined yet.</TableCell></TableRow>}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}