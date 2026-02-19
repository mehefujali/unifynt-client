/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Gem } from "lucide-react";
import { PlanService } from "@/services/plan.service";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { PlanModal } from "./plan-modal";
import { Button } from "@/components/ui/button";

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
            <div className="flex h-[80vh] items-center justify-center text-destructive text-lg font-medium">
                Failed to load subscription plans. Please try again later.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-8">
            <div className="flex items-center justify-between bg-card p-8 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-xl text-primary">
                        <Gem className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Subscription Plans
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Manage SaaS pricing plans, features, and limits for schools.
                        </p>
                    </div>
                </div>
                <Button size="lg" onClick={handleOpenAddModal} className="px-6 shadow-md">
                    <Plus className="mr-2 h-5 w-5" /> Create New Plan
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6">
                <DataTable columns={getColumns(handleOpenEditModal)} data={plans || []} />
            </div>

            <PlanModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                editingPlan={editingPlan}
            />
        </div>
    );
}