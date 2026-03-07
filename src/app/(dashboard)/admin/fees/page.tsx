/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CreditCard, Users, Loader2, ShieldAlert } from "lucide-react";
import { FeesService } from "@/services/fees.service";
import { useAuth } from "@/hooks/use-auth";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function FeesOverviewPage() {
    const { user } = useAuth();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["fee-stats"],
        queryFn: () => FeesService.getFeeStats(),
        enabled: !!user?.schoolId,
    });

    return (
        // 🔒 Gate for Entire Overview Access
        <PermissionGate 
            required={PERMISSIONS.FEE_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
                    <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                        You do not have permission to view institutional financial statistics. Please contact the finance department for authorization.
                    </p>
                </div>
            }
        >
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                    {/* Real-time Total Collected */}
                    <Card className="shadow-sm border-border bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Collected</CardTitle>
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                <Banknote className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : (
                                <>
                                    <div className="text-3xl font-extrabold text-foreground">₹{stats?.totalCollected?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">Lifetime collection</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Real-time Pending Dues */}
                    <Card className="shadow-sm border-border bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Dues</CardTitle>
                            <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                                <CreditCard className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            ) : (
                                <>
                                    <div className="text-3xl font-extrabold text-foreground">₹{stats?.totalDue?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                                        Across {stats?.activeInvoicesCount || 0} active unpaid invoices
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/60 rounded-xl bg-muted/10">
                    <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
                    <h3 className="text-lg font-bold text-foreground">Welcome to the Billing Center</h3>
                    <p className="text-sm text-muted-foreground max-w-md text-center mt-1">
                        Use the tabs above to setup fee masters, generate bulk class invoices, or use the POS system to collect payments.
                    </p>
                </div>
            </div>
        </PermissionGate>
    );
}