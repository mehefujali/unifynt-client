"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Package, Zap, Loader2, CheckCircle2, XCircle, MoreHorizontal, Edit, PauseCircle, PlayCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { SmsService, SmsPackage } from "@/services/sms.service";
import { PackageModal } from "./package-modal";

export default function SmsPackagesAdminPage() {
    const queryClient = useQueryClient();
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/40">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        <Package className="h-6 w-6 text-amber-500" />
                        Global SMS Packages
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                        Create, edit, and manage SMS credit bundles for all schools.
                    </p>
                </div>
                <Button onClick={handleOpenCreateModal} className="h-11 px-6 font-bold shadow-md hover:scale-[1.02] transition-transform">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New Package
                </Button>
            </div>

            {/* Metrics Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Packages</CardTitle>
                        <div className="p-1.5 bg-primary/10 rounded-md text-primary"><Package className="h-4 w-4" /></div>
                    </CardHeader>
                    <CardContent><div className="text-3xl font-extrabold">{packages.length}</div></CardContent>
                </Card>
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Packages</CardTitle>
                        <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>
                    </CardHeader>
                    <CardContent><div className="text-3xl font-extrabold">{packages.filter((p: SmsPackage) => p.isActive).length}</div></CardContent>
                </Card>
            </div>

            {/* Data Table Area */}
            <Card className="shadow-sm border-border bg-card">
                <CardHeader className="bg-muted/10 border-b border-border/40 pb-4">
                    <CardTitle className="text-lg font-bold">Package List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Package Name</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">SMS Credits</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Price (INR)</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-muted-foreground">Status</TableHead>
                                    <TableHead className="h-12 px-6 font-bold text-xs uppercase text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                                ) : packages.length > 0 ? (
                                    packages.map((pkg: SmsPackage) => {
                                        return (
                                            <TableRow key={pkg.id} className="h-16 border-b border-border/40 hover:bg-muted/20 transition-colors">
                                                <TableCell className="px-6 font-bold text-sm">{pkg.name}</TableCell>
                                                <TableCell className="px-6">
                                                    <Badge variant="secondary" className="font-bold bg-amber-500/10 text-amber-600 border-amber-500/20"><Zap className="h-3 w-3 mr-1" /> {pkg.credits.toLocaleString()}</Badge>
                                                </TableCell>
                                                <TableCell className="px-6 font-black text-foreground">₹{pkg.price.toLocaleString()}</TableCell>
                                                <TableCell className="px-6">
                                                    {pkg.isActive ? (
                                                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold border-0 shadow-none"><CheckCircle2 className="h-3 w-3 mr-1" /> Active</Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold border-0 shadow-none"><PauseCircle className="h-3 w-3 mr-1" /> Paused</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-6 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-border/50">
                                                            <DropdownMenuLabel className="text-xs text-muted-foreground">Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleOpenEditModal(pkg)} className="cursor-pointer font-medium">
                                                                <Edit className="mr-2 h-4 w-4 text-primary" /> Edit Package
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleStatus(pkg)} className="cursor-pointer font-medium">
                                                                {pkg.isActive ? (
                                                                    <><PauseCircle className="mr-2 h-4 w-4 text-amber-500" /> Pause Package</>
                                                                ) : (
                                                                    <><PlayCircle className="mr-2 h-4 w-4 text-emerald-500" /> Activate Package</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-border/50" />
                                                            <DropdownMenuItem onClick={() => handleDelete(pkg.id)} className="cursor-pointer font-medium text-destructive focus:text-destructive focus:bg-destructive/10">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Package
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-medium">No SMS packages created yet.</TableCell></TableRow>
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
    );
}