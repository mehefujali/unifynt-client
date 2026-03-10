"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Send, Zap, Loader2, History, AlertTriangle, CheckCircle2 } from "lucide-react";
import { EmailService } from "@/services/email.service";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function EmailOverviewPage() {
    const { user } = useAuth();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["email-stats"],
        queryFn: EmailService.getStats,
        enabled: !!user?.schoolId,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                <p className="text-sm font-semibold text-muted-foreground">Syncing email communication data...</p>
            </div>
        );
    }

    const balance = stats?.availableCredits || 0;
    const isLowBalance = balance < 100;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* --- Smart Alerts --- */}
            {isLowBalance && (
                <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl shadow-sm animate-in slide-in-from-top-2">
                    <AlertTriangle className="h-6 w-6 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="text-sm font-extrabold uppercase tracking-wide">Critical: Low Email Balance</h4>
                        <p className="text-xs font-medium mt-0.5">You have only {balance} credits remaining. Please recharge immediately to avoid campaign failures.</p>
                    </div>
                    <Button asChild size="sm" variant="destructive" className="font-bold shadow-md whitespace-nowrap">
                        <Link href="/admin/email/recharge">Recharge Now</Link>
                    </Button>
                </div>
            )}

            {/* --- Main Metric Cards --- */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

                {/* Balance Card */}
                <Card className={cn("shadow-sm border-border relative overflow-hidden", isLowBalance ? "bg-destructive/5" : "bg-card")}>
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 pointer-events-none">
                        <Mail className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-4xl font-black", isLowBalance ? "text-destructive" : "text-foreground")}>
                            {balance.toLocaleString()}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 font-semibold bg-background/50 w-fit px-2 py-0.5 rounded-full border border-border/50">
                            1 Credit = 1 Email Recipient
                        </p>
                    </CardContent>
                </Card>

                {/* Used Credits */}
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Credits Consumed</CardTitle>
                        <div className="p-1.5 bg-amber-500/10 rounded-md text-amber-500"><Zap className="h-3.5 w-3.5" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-foreground">{stats?.totalSentCredits?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Lifetime usage</p>
                    </CardContent>
                </Card>

                {/* Total Campaigns */}
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campaigns Sent</CardTitle>
                        <div className="p-1.5 bg-primary/10 rounded-md text-primary"><Send className="h-3.5 w-3.5" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-foreground">{stats?.totalCampaigns?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Successful dispatches</p>
                    </CardContent>
                </Card>

                {/* Delivery Rate */}
                <Card className="shadow-sm border-border bg-card">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Rate</CardTitle>
                        <div className="p-1.5 bg-emerald-500/10 rounded-md text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-emerald-600">{stats?.deliveryRate || 99.8}%</div>
                        <Progress value={stats?.deliveryRate || 99.8} className="h-1.5 mt-3 bg-muted" />
                    </CardContent>
                </Card>
            </div>

            {/* --- Action Shortcuts --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Card className="shadow-sm border-border bg-card hover:border-primary/30 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><Send className="h-5 w-5 text-primary" /> New Email Broadcast</CardTitle>
                        <CardDescription>Send an important notice or announcement to students or teachers instantly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full h-12 font-bold shadow-md" disabled={balance === 0}>
                            <Link href="/admin/email/compose">Launch Campaign <Send className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-border bg-card hover:border-border/80 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg"><History className="h-5 w-5 text-muted-foreground" /> Reporting Ledger</CardTitle>
                        <CardDescription>Review your latest email dispatch history and recharge invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="outline" className="w-full h-12 font-bold shadow-sm">
                            <Link href="/admin/email/history">View Ledger <History className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
