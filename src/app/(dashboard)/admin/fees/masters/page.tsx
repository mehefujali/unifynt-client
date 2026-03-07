/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Settings, Layers, Loader2, Table2, Pencil, Trash2, X, ShieldAlert } from "lucide-react";
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

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

interface AcademicClass {
    id: string;
    name: string;
}

const feeHeadSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.enum(["MONTHLY", "YEARLY", "ONE_TIME"], { required_error: "Please select a type" }),
});

const feeStructureSchema = z.object({
    feeHeadId: z.string().min(1, "Please select a Fee Head"),
    classId: z.string().min(1, "Please select a Class"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return [];
};

export default function FeeMastersPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const [editHeadId, setEditHeadId] = useState<string | null>(null);
    const [editStructId, setEditStructId] = useState<string | null>(null);

    // Permission Hooks
    const { hasPermission } = usePermission();
    const canCreateOrEdit = hasPermission([PERMISSIONS.FEE_CREATE, PERMISSIONS.FEE_EDIT]);
    const canEditOrDelete = hasPermission([PERMISSIONS.FEE_EDIT, PERMISSIONS.FEE_DELETE]);

    const { data: headsRes, isLoading: loadingHeads } = useQuery({
        queryKey: ["fee-heads"],
        queryFn: () => FeesService.getAllFeeHeads({ limit: 1000 }),
        enabled: !!user?.schoolId,
    });
    const feeHeads: FeeHead[] = extractArray(headsRes);

    const { data: structsRes, isLoading: loadingStructs } = useQuery({
        queryKey: ["fee-structures"],
        queryFn: () => FeesService.getFeeStructures({ limit: 1000 }),
        enabled: !!user?.schoolId,
    });
    const feeStructures: FeeStructure[] = extractArray(structsRes);

    const { data: classesRes } = useQuery({
        queryKey: ["classes"],
        queryFn: AcademicService.getAllClasses,
        enabled: !!user?.schoolId,
    });
    const classesData: AcademicClass[] = extractArray(classesRes);

    const headForm = useForm<z.infer<typeof feeHeadSchema>>({
        resolver: zodResolver(feeHeadSchema) as any,
        defaultValues: { name: "", type: "MONTHLY" },
    });

    const structForm = useForm<z.infer<typeof feeStructureSchema>>({
        resolver: zodResolver(feeStructureSchema) as any,
        defaultValues: { feeHeadId: "", classId: "", amount: 0 },
    });

    const createHeadMutation = useMutation({
        mutationFn: FeesService.createFeeHead,
        onSuccess: () => {
            toast.success("Fee Head created successfully!");
            headForm.reset();
            queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create Fee Head"),
    });

    const updateHeadMutation = useMutation({
        mutationFn: (data: any) => FeesService.updateFeeHead(editHeadId!, data),
        onSuccess: () => {
            toast.success("Fee Head updated successfully!");
            cancelEditHead();
            queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update Fee Head"),
    });

    const deleteHeadMutation = useMutation({
        mutationFn: FeesService.deleteFeeHead,
        onSuccess: () => {
            toast.success("Fee Head deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["fee-heads"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete Fee Head"),
    });

    const createStructMutation = useMutation({
        mutationFn: FeesService.createFeeStructure,
        onSuccess: () => {
            toast.success("Fee Structure saved successfully!");
            structForm.reset({ ...structForm.getValues(), amount: 0 });
            queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to save Fee Structure"),
    });

    const updateStructMutation = useMutation({
        mutationFn: (data: any) => FeesService.updateFeeStructure(editStructId!, { amount: data.amount }),
        onSuccess: () => {
            toast.success("Fee Structure updated successfully!");
            cancelEditStruct();
            queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to update Fee Structure"),
    });

    const deleteStructMutation = useMutation({
        mutationFn: FeesService.deleteFeeStructure,
        onSuccess: () => {
            toast.success("Fee Structure deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["fee-structures"] });
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete Fee Structure"),
    });

    const onSubmitHead = (values: z.infer<typeof feeHeadSchema>) => {
        if (editHeadId) updateHeadMutation.mutate(values);
        else createHeadMutation.mutate(values);
    };

    const onSubmitStruct = (values: z.infer<typeof feeStructureSchema>) => {
        if (editStructId) updateStructMutation.mutate(values);
        else createStructMutation.mutate(values);
    };

    const handleEditHead = (head: FeeHead) => {
        setEditHeadId(head.id);
        headForm.reset({ name: head.name, type: head.type });
    };

    const cancelEditHead = () => {
        setEditHeadId(null);
        headForm.reset({ name: "", type: "MONTHLY" });
    };

    const handleEditStruct = (struct: FeeStructure) => {
        setEditStructId(struct.id);
        structForm.reset({ feeHeadId: struct.feeHeadId, classId: struct.classId, amount: struct.amount });
    };

    const cancelEditStruct = () => {
        setEditStructId(null);
        structForm.reset({ feeHeadId: "", classId: "", amount: 0 });
    };

    return (
        // 🔒 Gate for Entire Master Configuration Access
        <PermissionGate 
            required={PERMISSIONS.FEE_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You do not have permission to view or configure fee masters. Please contact your finance head or administrator.
                    </p>
                </div>
            }
        >
            <div className="space-y-6 animate-in fade-in duration-500 p-6">
                <Tabs defaultValue="heads" className="w-full">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2 h-12 bg-muted/40 border border-border/50 rounded-xl mb-6 p-1">
                        <TabsTrigger value="heads" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            <Settings className="h-4 w-4 mr-2" /> Fee Heads
                        </TabsTrigger>
                        <TabsTrigger value="structures" className="rounded-lg font-bold data-[state=active]:bg-card data-[state=active]:shadow-sm">
                            <Layers className="h-4 w-4 mr-2" /> Class Structures
                        </TabsTrigger>
                    </TabsList>

                    {/* --- TAB: Fee Heads --- */}
                    <TabsContent value="heads" className="m-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4">
                                <PermissionGate required={[PERMISSIONS.FEE_CREATE, PERMISSIONS.FEE_EDIT]}>
                                    <Card className="shadow-sm border-border bg-card">
                                        <CardHeader className="bg-muted/10 border-b border-border/40 pb-4 flex flex-row justify-between items-center">
                                            <div>
                                                <CardTitle className="text-lg font-bold">{editHeadId ? "Update Fee Head" : "Create Fee Head"}</CardTitle>
                                                <CardDescription>{editHeadId ? "Modify existing fee category." : "E.g., Tuition Fee, Transport Fee."}</CardDescription>
                                            </div>
                                            {editHeadId && (
                                                <Button variant="ghost" size="icon" onClick={cancelEditHead} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <Form {...headForm}>
                                                <form onSubmit={headForm.handleSubmit(onSubmitHead)} className="space-y-4">
                                                    <FormField control={headForm.control} name="name" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-bold">Head Name</FormLabel>
                                                            <FormControl><Input placeholder="E.g., Tuition Fee" {...field} className="h-11 shadow-sm" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={headForm.control} name="type" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-bold">Frequency Type</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value}>
                                                                <FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                                    <SelectItem value="YEARLY">Yearly</SelectItem>
                                                                    <SelectItem value="ONE_TIME">One Time</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <Button type="submit" className="w-full h-11 font-bold shadow-md" disabled={createHeadMutation.isPending || updateHeadMutation.isPending}>
                                                        {(createHeadMutation.isPending || updateHeadMutation.isPending) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : editHeadId ? <Settings className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                                                        {editHeadId ? "Update Category" : "Save Fee Head"}
                                                    </Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </PermissionGate>
                                {!canCreateOrEdit && (
                                    <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 opacity-60">
                                        <Lock className="h-10 w-10 text-muted-foreground mb-3" />
                                        <p className="text-sm font-bold text-muted-foreground leading-relaxed">Management actions are restricted based on your role.</p>
                                    </div>
                                )}
                            </div>
                            <div className="lg:col-span-8">
                                <Card className="shadow-sm border-border bg-card h-full">
                                    <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2"><Table2 className="h-5 w-5 text-primary" /> Active Fee Heads</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="w-full overflow-x-auto custom-scrollbar">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow>
                                                        <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Head Name</TableHead>
                                                        <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Frequency</TableHead>
                                                        {canEditOrDelete && <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground text-right">Actions</TableHead>}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {loadingHeads ? (
                                                        <TableRow><TableCell colSpan={canEditOrDelete ? 3 : 2} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                                                    ) : feeHeads.length > 0 ? (
                                                        feeHeads.map((head) => (
                                                            <TableRow key={head.id} className="h-14">
                                                                <TableCell className="px-6 font-bold text-sm text-foreground">{head.name}</TableCell>
                                                                <TableCell className="px-6"><Badge variant="outline" className="font-bold text-[11px] border-border">{head.type.replace("_", " ")}</Badge></TableCell>
                                                                
                                                                {canEditOrDelete && (
                                                                    <TableCell className="px-6 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <PermissionGate required={PERMISSIONS.FEE_EDIT}>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditHead(head)}><Pencil className="h-4 w-4" /></Button>
                                                                            </PermissionGate>
                                                                            <PermissionGate required={PERMISSIONS.FEE_DELETE}>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={() => { if (window.confirm("Are you sure you want to delete this Fee Head?")) deleteHeadMutation.mutate(head.id); }}><Trash2 className="h-4 w-4" /></Button>
                                                                            </PermissionGate>
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow><TableCell colSpan={canEditOrDelete ? 3 : 2} className="h-24 text-center text-muted-foreground font-medium">No fee heads created yet.</TableCell></TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* --- TAB: Class Structures --- */}
                    <TabsContent value="structures" className="m-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4">
                                <PermissionGate required={[PERMISSIONS.FEE_CREATE, PERMISSIONS.FEE_EDIT]}>
                                    <Card className="shadow-sm border-border bg-card">
                                        <CardHeader className="bg-muted/10 border-b border-border/40 pb-4 flex flex-row justify-between items-center">
                                            <div>
                                                <CardTitle className="text-lg font-bold">{editStructId ? "Update Structure" : "Define Structure"}</CardTitle>
                                                <CardDescription>{editStructId ? "Modify allocated amount." : "Assign fee amount to a class."}</CardDescription>
                                            </div>
                                            {editStructId && (
                                                <Button variant="ghost" size="icon" onClick={cancelEditStruct} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <Form {...structForm}>
                                                <form onSubmit={structForm.handleSubmit(onSubmitStruct)} className="space-y-4">
                                                    <FormField control={structForm.control} name="classId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-bold">Select Class</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value} disabled={!!editStructId}>
                                                                <FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Choose a class" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {classesData.map((cls) => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={structForm.control} name="feeHeadId" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-bold">Select Fee Head</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value} disabled={!!editStructId}>
                                                                <FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Choose a fee head" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {feeHeads.map((head) => <SelectItem key={head.id} value={head.id}>{head.name} ({head.type.replace("_", " ")})</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={structForm.control} name="amount" render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="font-bold">Amount (₹)</FormLabel>
                                                            <FormControl><Input type="number" placeholder="0.00" {...field} className="h-11 shadow-sm font-bold text-primary" /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <Button type="submit" className="w-full h-11 font-bold shadow-md" disabled={createStructMutation.isPending || updateStructMutation.isPending}>
                                                        {(createStructMutation.isPending || updateStructMutation.isPending) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : editStructId ? <Settings className="h-4 w-4 mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                                                        {editStructId ? "Update Structure" : "Save Structure"}
                                                    </Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </PermissionGate>
                                {!canCreateOrEdit && (
                                    <div className="p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-muted/5 opacity-60">
                                        <Lock className="h-10 w-10 text-muted-foreground mb-3" />
                                        <p className="text-sm font-bold text-muted-foreground leading-relaxed">Financial configurations are locked based on your access level.</p>
                                    </div>
                                )}
                            </div>
                            <div className="lg:col-span-8">
                                <Card className="shadow-sm border-border bg-card h-full">
                                    <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2"><Table2 className="h-5 w-5 text-primary" /> Configured Structures</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="w-full overflow-x-auto custom-scrollbar">
                                            <Table>
                                                <TableHeader className="bg-muted/30">
                                                    <TableRow>
                                                        <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Class</TableHead>
                                                        <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Fee Head</TableHead>
                                                        <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Amount</TableHead>
                                                        {canEditOrDelete && <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground text-right">Actions</TableHead>}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {loadingStructs ? (
                                                        <TableRow><TableCell colSpan={canEditOrDelete ? 4 : 3} className="h-24 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                                                    ) : feeStructures.length > 0 ? (
                                                        feeStructures.map((struct) => (
                                                            <TableRow key={struct.id} className="h-14">
                                                                <TableCell className="px-6 font-bold text-sm text-foreground">{struct.class?.name}</TableCell>
                                                                <TableCell className="px-6 text-sm font-semibold text-muted-foreground">{struct.feeHead?.name}</TableCell>
                                                                <TableCell className="px-6 font-black text-sm text-emerald-600 dark:text-emerald-400">₹{struct.amount}</TableCell>
                                                                
                                                                {canEditOrDelete && (
                                                                    <TableCell className="px-6 text-right">
                                                                        <div className="flex justify-end gap-2">
                                                                            <PermissionGate required={PERMISSIONS.FEE_EDIT}>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditStruct(struct)}><Pencil className="h-4 w-4" /></Button>
                                                                            </PermissionGate>
                                                                            <PermissionGate required={PERMISSIONS.FEE_DELETE}>
                                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={() => { if (window.confirm("Are you sure you want to delete this structure?")) deleteStructMutation.mutate(struct.id); }}><Trash2 className="h-4 w-4" /></Button>
                                                                            </PermissionGate>
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow><TableCell colSpan={canEditOrDelete ? 4 : 3} className="h-24 text-center text-muted-foreground font-medium">No fee structures defined yet.</TableCell></TableRow>
                                                    )}
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
        </PermissionGate>
    );
}

// Helper icons
function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}