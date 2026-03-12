/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Gem, ShieldAlert, Search } from "lucide-react";
import { PlanService } from "@/services/plan.service";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { PlanModal } from "./plan-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function PlansPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: plans = [], isLoading, isError } = useQuery({
        queryKey: ["plans"],
        queryFn: PlanService.getAllPlans,
    });

    const handleOpenAddModal = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (plan: any) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setEditingPlan(null), 300);
    };

    const filteredPlans = (plans || []).filter((plan: any) => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground font-medium">Loading subscription plans...</p>
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
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Failed to load plans</h3>
                            <p className="text-sm text-muted-foreground">Unable to fetch subscription data from the server.</p>
                        </div>
                        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["plans"] })}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PermissionGate 
            required={PERMISSIONS.PLAN_VIEW}
            fallback={
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold">Access Restricted</h3>
                            <p className="text-sm text-muted-foreground">You don&apos;t have permission to manage subscription plans.</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
                        <p className="text-sm text-muted-foreground">
                            Configure school subscription tiers and feature limits.
                        </p>
                    </div>
                    <PermissionGate required={PERMISSIONS.PLAN_CREATE}>
                        <Button onClick={handleOpenAddModal} className="h-10">
                            <Plus className="mr-2 h-4 w-4" /> Add Plan
                        </Button>
                    </PermissionGate>
                </div>

                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search plans..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-muted/20"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-lg border border-border">
                            <Gem className="h-4 w-4" />
                            <span>{plans.length} Total Tiers</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-0">
                    <DataTable 
                        columns={getColumns(handleOpenEditModal)} 
                        data={filteredPlans} 
                    />
                </div>

                <PlanModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    editingPlan={editingPlan}
                />
            </div>
        </PermissionGate>
    );
}