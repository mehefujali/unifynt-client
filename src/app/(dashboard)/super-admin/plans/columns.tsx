/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlanService } from "@/services/plan.service";
import { toast } from "sonner";

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

    const deleteMutation = useMutation({
        mutationFn: (id: string) => PlanService.deletePlan(id),
        onSuccess: () => {
            toast.success("Plan deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["plans"] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete plan");
        },
    });

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this plan?")) {
            deleteMutation.mutate(plan.id);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(plan)} className="hover:bg-primary/10 hover:text-primary">
                <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending} className="hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

export const getColumns = (onEdit: (plan: any) => void): ColumnDef<PlanColumn>[] => [
    {
        accessorKey: "name",
        header: "Plan Name",
        cell: ({ row }) => (
            <span className="font-bold text-base">{row.original.name}</span>
        ),
    },
    {
        accessorKey: "pricePerMonth",
        header: "Price / Month",
        cell: ({ row }) => (
            <span className="font-semibold text-primary">₹{row.original.pricePerMonth}</span>
        ),
    },
    {
        accessorKey: "studentLimit",
        header: "Student Limit",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.studentLimit} Students</span>
        ),
    },
    {
        accessorKey: "features",
        header: "Key Features",
        cell: ({ row }) => {
            const features = row.original.features;
            return (
                <div className="flex flex-col gap-1">
                    {features.slice(0, 2).map((feature, i) => (
                        <span key={i} className="text-xs flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-green-500" /> {feature}
                        </span>
                    ))}
                    {features.length > 2 && (
                        <span className="text-xs text-primary font-medium">+{features.length - 2} more</span>
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
                <Badge variant={isActive ? "outline" : "destructive"} className={isActive ? "text-green-600 border-green-200 bg-green-50" : ""}>
                    {isActive ? "Active" : "Hidden"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell row={row} onEdit={onEdit} />,
    },
];