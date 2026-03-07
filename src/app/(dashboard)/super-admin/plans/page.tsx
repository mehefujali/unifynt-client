/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Gem, ShieldAlert, Sparkles } from "lucide-react";
import { PlanService } from "@/services/plan.service";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { PlanModal } from "./plan-modal";
import { Button } from "@/components/ui/button";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function PlansPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);

    const { data: plans, isLoading, isError } = useQuery({
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

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
                <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <p className="text-destructive text-lg font-black uppercase tracking-tight">Failed to load subscription vault</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl font-bold">
                    Retry Connection
                </Button>
            </div>
        );
    }

    return (
        // 🔒 Global Gate: Entire Marketplace Config Access
        <PermissionGate 
            required={PERMISSIONS.PLAN_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 bg-zinc-100 dark:bg-white/5 text-zinc-400 rounded-3xl flex items-center justify-center mb-8 rotate-3 shadow-xl">
                        <Gem className="h-12 w-12 opacity-20" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Marketplace Restricted</h2>
                    <p className="text-muted-foreground mt-3 max-w-md mx-auto font-medium">
                        Only high-level administrators can configure subscription tiers and SaaS pricing models.
                    </p>
                </div>
            }
        >
            <div className="flex flex-col gap-10 p-4 md:p-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 dark:border-white/5 shadow-2xl shadow-black/5">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-primary text-white dark:text-black rounded-[24px] shadow-2xl shadow-primary/40 rotate-3">
                            <Gem className="h-8 w-8 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                                Plan Architect
                            </h1>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-amber-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Configure SaaS Tiers & Resource Limits
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {/* 🔒 Gate for Create Plan Action */}
                        <PermissionGate required={PERMISSIONS.PLAN_CREATE}>
                            <Button 
                                onClick={handleOpenAddModal} 
                                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95"
                            >
                                <Plus className="mr-2 h-5 w-5 stroke-[4]" /> New Tier
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Table Section */}
                <div className="transition-all duration-500">
                    <DataTable 
                        columns={getColumns(handleOpenEditModal)} 
                        data={plans || []} 
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