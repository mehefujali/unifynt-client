"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    Plus, 
    Package, 
    Zap, 
    Loader2, 
    MoreHorizontal, 
    Edit, 
    PauseCircle, 
    PlayCircle, 
    Trash2,
    Search,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

export default function SmsPackagesAdminPage() {
    const queryClient = useQueryClient();
    const { hasPermission } = usePermission();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<SmsPackage | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: packages = [], isLoading, isError } = useQuery<SmsPackage[]>({
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
            toast.success(`Package ${!pkg.isActive ? 'activated' : 'paused'} successfully`);
            queryClient.invalidateQueries({ queryKey: ["sms-packages"] });
        } catch (error) {
            toast.error("Failed to update package status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            await SmsService.deletePackage(id);
            toast.success("Package deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["sms-packages"] });
        } catch (error) {
            toast.error("Failed to delete package");
        }
    };

    const filteredPackages = packages.filter(pkg => 
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground font-medium">Loading packages...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Failed to load packages</h3>
                            <p className="text-sm text-muted-foreground">There was an error connecting to the server.</p>
                        </div>
                        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["sms-packages"] })}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PermissionGate 
            required={PERMISSIONS.SMS_MANAGE}
            fallback={
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold">Access Restricted</h3>
                            <p className="text-sm text-muted-foreground">You don't have permission to manage SMS bundles.</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">SMS Bundles</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage SMS credit packages available for schools.
                        </p>
                    </div>
                    <Button onClick={handleOpenCreateModal} className="h-10">
                        <Plus className="mr-2 h-4 w-4" /> Add Package
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bundles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-muted/20"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-lg border border-border">
                            <Package className="h-4 w-4" />
                            <span>{packages.length} Total</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>{packages.filter(p => p.isActive).length} Active</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border">
                            <TableRow>
                                <TableHead className="font-bold text-foreground py-4">Bundle Name</TableHead>
                                <TableHead className="font-bold text-foreground">Credits</TableHead>
                                <TableHead className="font-bold text-foreground">Price</TableHead>
                                <TableHead className="font-bold text-foreground">Status</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPackages.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <p className="text-muted-foreground text-sm font-medium">No bundles found.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPackages.map((pkg) => (
                                    <TableRow key={pkg.id} className="hover:bg-muted/10 transition-colors border-b border-border last:border-0">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Package className="h-4.5 w-4.5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">{pkg.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ID: {pkg.id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 font-bold text-foreground">
                                                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                                {pkg.credits.toLocaleString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-foreground">₹{pkg.price.toLocaleString()}</span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    pkg.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-muted-foreground/30"
                                                )} />
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    pkg.isActive ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {pkg.isActive ? "Active" : "On Hold"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[180px]">
                                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Options</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleOpenEditModal(pkg)} className="cursor-pointer font-medium">
                                                        <Edit className="mr-2 h-4 w-4" /> Edit Bundle
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(pkg)} className="cursor-pointer font-medium">
                                                        {pkg.isActive ? (
                                                            <><PauseCircle className="mr-2 h-4 w-4" /> Deactivate</>
                                                        ) : (
                                                            <><PlayCircle className="mr-2 h-4 w-4" /> Activate</>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDelete(pkg.id)} className="cursor-pointer font-medium text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <PackageModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialData={editingPackage}
                />
            </div>
        </PermissionGate>
    );
}