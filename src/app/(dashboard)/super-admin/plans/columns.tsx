"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle2, Package, MoreHorizontal, PauseCircle, PlayCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlanService } from "@/services/plan.service";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";

export type PlanColumn = {
    id: string;
    name: string;
    pricePerMonth: number;
    studentLimit: number;
    features: string[];
    isActive: boolean;
    extraOffers?: string;
};

const ActionCell = ({ row, onEdit }: { row: { original: PlanColumn }; onEdit: (plan: PlanColumn) => void }) => {
    const queryClient = useQueryClient();
    const plan = row.original;
    const { hasPermission } = usePermission();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => PlanService.deletePlan(id),
        onSuccess: () => {
            toast.success("Subscription plan removed");
            queryClient.invalidateQueries({ queryKey: ["plans"] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Failed to delete plan");
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: async () => {
            return await PlanService.updatePlan(plan.id, { isActive: !plan.isActive });
        },
        onSuccess: () => {
            toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'} successfully`);
            queryClient.invalidateQueries({ queryKey: ["plans"] });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Failed to update status");
        },
    });

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to permanently delete this plan?")) {
            deleteMutation.mutate(plan.id);
        }
    };

    const canModify = hasPermission([PERMISSIONS.PLAN_EDIT, PERMISSIONS.PLAN_DELETE]);

    if (!canModify) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <PermissionGate required={PERMISSIONS.PLAN_EDIT}>
                    <DropdownMenuItem onClick={() => onEdit(plan)} className="cursor-pointer font-medium">
                        <Edit className="mr-2 h-4 w-4" /> Edit Tier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleStatusMutation.mutate()} className="cursor-pointer font-medium">
                        {plan.isActive ? (
                            <><PauseCircle className="mr-2 h-4 w-4" /> Deactivate</>
                        ) : (
                            <><PlayCircle className="mr-2 h-4 w-4" /> Activate</>
                        )}
                    </DropdownMenuItem>
                </PermissionGate>
                <PermissionGate required={PERMISSIONS.PLAN_DELETE}>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} className="cursor-pointer font-medium text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Tier
                    </DropdownMenuItem>
                </PermissionGate>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const getColumns = (onEdit: (plan: PlanColumn) => void): ColumnDef<PlanColumn>[] => [
    {
        accessorKey: "name",
        header: () => <span>Subscription Tier</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3 py-1">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm shrink-0 border border-primary/10">
                    <Package className="h-4.5 w-4.5" />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">
                        {row.original.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                        ID: {row.original.id.slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "pricePerMonth",
        header: "Monthly Price",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-foreground">
                    ₹{row.original.pricePerMonth.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">Per month</span>
            </div>
        ),
    },
    {
        accessorKey: "studentLimit",
        header: "Capacity",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                    {row.original.studentLimit.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Students</span>
            </div>
        ),
    },
    {
        accessorKey: "features",
        header: "Core Features",
        cell: ({ row }) => {
            const features = row.original.features;
            return (
                <div className="flex flex-col gap-1">
                    {features.slice(0, 2).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {feature}
                            </span>
                        </div>
                    ))}
                    {features.length > 2 && (
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider ml-3">
                            + {features.length - 2} more...
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "h-2 w-2 rounded-full",
                        isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-muted-foreground/30"
                    )} />
                    <span className={cn(
                        "text-sm font-bold",
                        isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {isActive ? "Active" : "On Hold"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} />,
    },
];