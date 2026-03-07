/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    PlusCircle, 
    Package, 
    Zap, 
    Loader2, 
    CheckCircle2, 
    XCircle, 
    MoreHorizontal, 
    Edit, 
    PauseCircle, 
    PlayCircle, 
    Trash2,
    ShieldAlert,
    Lock
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

import { SmsService, SmsPackage } from "@/services/sms.service";
import { PackageModal } from "./package-modal";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

export default function SmsPackagesAdminPage() {
    const queryClient = useQueryClient();
    const { hasPermission } = usePermission();
    
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingPackage, setEditingPackage] = useState<SmsPackage | null>(null);

    const { data: packages = [], isLoading } = useQuery<SmsPackage[]>({
        queryKey: ["sms-packages"],
        queryFn: SmsService.getPackages,
    });

    const handleOpenCreateModal = () => {
        setEditingPackage(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (pkg: SmsPackage) => {
        setEditingPackage(pkg);
        setIsModalOpen(true);
    };

    const handleToggleStatus = async (pkg: SmsPackage) => {
        try {
            await SmsService.updatePackage(pkg.id, { isActive: !pkg.isActive });
            toast.success(`Package successfully ${!pkg.isActive ? 'activated' : 'paused'}!`);
            queryClient.invalidateQueries({ queryKey: ["sms-packages"] });
        } catch (error) {
            toast.error("Failed to change package status.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package? This action cannot be undone.")) return;
        try {
            await SmsService.deletePackage(id);
            toast.success("Package deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["sms-packages"] });
        } catch (error) {
            toast.error("Failed to delete package.");
        }
    };

    // Logical check for management actions
    const canManage = hasPermission(PERMISSIONS.SMS_MANAGE);

    return (
        // 🔒 Global Gate: Entire SMS Marketplace Access
        <PermissionGate 
            required={PERMISSIONS.SMS_MANAGE}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50/50 dark:ring-amber-500/5">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Access Restricted</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You do not have the clearance level required to manage global SMS credit bundles.
                    </p>
                </div>
            }
        >
            <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10 px-4 md:px-8">
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/40">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 uppercase italic">
                            <Package className="h-8 w-8 text-amber-500" />
                            Global SMS Bundles
                        </h1>
                        <p className="text-sm font-bold text-muted-foreground mt-1 opacity-80 uppercase tracking-wider">
                            Marketplace Configuration for SMS Credit Inventory
                        </p>
                    </div>
                    <Button 
                        onClick={handleOpenCreateModal} 
                        className="h-12 px-6 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <PlusCircle className="mr-2 h-5 w-5 stroke-[3]" /> Add New Package
                    </Button>
                </div>

                {/* Metrics Area */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="shadow-sm border-border bg-card rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between bg-muted/5">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Inventory</CardTitle>
                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><Package className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pt-4"><div className="text-4xl font-black tracking-tighter tabular-nums">{packages.length}</div></CardContent>
                    </Card>
                    <Card className="shadow-sm border-border bg-card rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between bg-muted/5">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Market Active</CardTitle>
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pt-4"><div className="text-4xl font-black tracking-tighter tabular-nums text-emerald-600">{packages.filter((p: SmsPackage) => p.isActive).length}</div></CardContent>
                    </Card>
                </div>

                {/* Data Table Area */}
                <Card className="shadow-2xl shadow-black/5 border-border bg-card rounded-[32px] overflow-hidden border-none">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/40 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            Provisioning Ledger
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="w-full overflow-x-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-950/30">
                                    <TableRow className="border-none">
                                        <TableHead className="h-14 px-8 font-black text-[11px] uppercase tracking-[2px] text-slate-400">Package Name</TableHead>
                                        <TableHead className="h-14 px-8 font-black text-[11px] uppercase tracking-[2px] text-slate-400">SMS Credits</TableHead>
                                        <TableHead className="h-14 px-8 font-black text-[11px] uppercase tracking-[2px] text-slate-400">Price (INR)</TableHead>
                                        <TableHead className="h-14 px-8 font-black text-[11px] uppercase tracking-[2px] text-slate-400">Status</TableHead>
                                        <TableHead className="h-14 px-8 font-black text-[11px] uppercase tracking-[2px] text-right text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/30" /></TableCell></TableRow>
                                    ) : packages.length > 0 ? (
                                        packages.map((pkg: SmsPackage) => (
                                            <TableRow key={pkg.id} className="group h-20 border-b border-black/5 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all">
                                                <TableCell className="px-8 py-4">
                                                    <span className="font-black text-[15px] tracking-tight text-slate-900 dark:text-white uppercase">{pkg.name}</span>
                                                </TableCell>
                                                <TableCell className="px-8">
                                                    <Badge variant="outline" className="font-black text-[11px] px-3 py-1 bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none uppercase tracking-wider">
                                                        <Zap className="h-3 w-3 mr-1.5 fill-current" /> {pkg.credits.toLocaleString()} Credits
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-8">
                                                    <span className="font-black text-[17px] text-slate-900 dark:text-white tracking-tighter tabular-nums">₹{pkg.price.toLocaleString()}</span>
                                                </TableCell>
                                                <TableCell className="px-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${pkg.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${pkg.isActive ? "text-emerald-600" : "text-amber-600"}`}>
                                                            {pkg.isActive ? "Live" : "Paused"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-8 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-muted group-hover:scale-110 transition-transform">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-2xl border-border/50 p-2 animate-in fade-in-50 zoom-in-95">
                                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 px-3 py-2">Management</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleOpenEditModal(pkg)} className="cursor-pointer font-bold text-[13px] py-2.5 rounded-xl">
                                                                <Edit className="mr-2.5 h-4 w-4 text-blue-500" /> Edit Package
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(pkg)} className="cursor-pointer font-bold text-[13px] py-2.5 rounded-xl">
                                                                {pkg.isActive ? (
                                                                    <><PauseCircle className="mr-2.5 h-4 w-4 text-amber-500" /> Pause Listing</>
                                                                ) : (
                                                                    <><PlayCircle className="mr-2.5 h-4 w-4 text-emerald-500" /> Resume Listing</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="opacity-50" />
                                                            <DropdownMenuItem onClick={() => handleDelete(pkg.id)} className="cursor-pointer font-bold text-[13px] py-2.5 rounded-xl text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                                                                <Trash2 className="mr-2.5 h-4 w-4" /> Delete Forever
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-300 font-black uppercase tracking-[0.3em] italic opacity-40">Zero Bundles Provisioned</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <PackageModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialData={editingPackage}
                />
            </div>
        </PermissionGate>
    );
}