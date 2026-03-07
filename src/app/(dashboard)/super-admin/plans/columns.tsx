/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlanService } from "@/services/plan.service";
import { toast } from "sonner";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

export type PlanColumn = {
    id: string;
    name: string;
    pricePerMonth: number;
    studentLimit: number;
    features: string[];
    isActive: boolean;
};

const ActionCell = ({ row, onEdit }: { row: any; onEdit: (plan: any) => void }) => {
    const queryClient = useQueryClient();
    const plan = row.original;
    const { hasPermission } = usePermission();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => PlanService.deletePlan(id),
        onSuccess: () => {
            toast.success("Subscription plan removed");
            queryClient.invalidateQueries({ queryKey: ["plans"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete plan");
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
        <div className="flex justify-end gap-3 pr-2">
            <PermissionGate required={PERMISSIONS.PLAN_EDIT}>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(plan)} 
                    className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600 transition-all"
                >
                    <Edit className="h-4 w-4 stroke-[2.5]" />
                </Button>
            </PermissionGate>

            <PermissionGate required={PERMISSIONS.PLAN_DELETE}>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleDelete} 
                    disabled={deleteMutation.isPending} 
                    className="h-9 w-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 transition-all"
                >
                    <Trash2 className="h-4 w-4 stroke-[2.5]" />
                </Button>
            </PermissionGate>
        </div>
    );
};

export const getColumns = (onEdit: (plan: any) => void): ColumnDef<PlanColumn>[] => [
    {
        accessorKey: "name",
        header: () => <span className="pl-2">Subscription Tier</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3 pl-2 py-1">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                    <Zap className="h-5 w-5 fill-current" />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-[15px] text-slate-900 dark:text-white tracking-tight uppercase">
                        {row.original.name}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                        Tier ID: {row.original.id.slice(-6).toUpperCase()}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "pricePerMonth",
        header: "Monthly Billing",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-black text-[16px] text-emerald-600 tracking-tighter tabular-nums">
                    ₹{row.original.pricePerMonth.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Per month</span>
            </div>
        ),
    },
    {
        accessorKey: "studentLimit",
        header: "Capacity",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <span className="font-black text-[13px] text-slate-700 dark:text-slate-300 tabular-nums">
                        {row.original.studentLimit.toLocaleString()}
                    </span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</span>
            </div>
        ),
    },
    {
        accessorKey: "features",
        header: "Included Modules",
        cell: ({ row }) => {
            const features = row.original.features;
            return (
                <div className="flex flex-col gap-1.5">
                    {features.slice(0, 2).map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 shadow-sm" />
                            <span className="text-[11px] font-bold text-slate-500 truncate max-w-[150px]">
                                {feature}
                            </span>
                        </div>
                    ))}
                    {features.length > 2 && (
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest ml-5">
                            + {features.length - 2} Additional
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: "Availability",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"}`} />
                    <span className={`text-[10px] font-black tracking-[1px] uppercase ${isActive ? "text-emerald-600" : "text-rose-600"}`}>
                        {isActive ? "Market Ready" : "Internal Use"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-6 font-black text-[11px] uppercase text-slate-400 tracking-[2px]">Manage</div>,
        cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} />,
    },
];