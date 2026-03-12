"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { ShieldCheck, RefreshCcw, Database, ServerCrash, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import io from "socket.io-client";

export default function AuditLogsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");

    const { data: response, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["auditLogs", page, limit, searchTerm, actionFilter],
        queryFn: async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const params: any = { page, limit };
            if (searchTerm) params.search = searchTerm;
            if (actionFilter !== "ALL") params.action = actionFilter;

            const res = await api.get("/audit-logs", { params });
            return res.data;
        }
    });

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080");

        socket.on("connect", () => {
            socket.emit("join_super_admin_room");
        });

        socket.on("NEW_AUDIT_LOG", () => {
            if (page === 1) {
                refetch();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [page, refetch]);

    const logs = response?.data || [];
    const meta = response?.meta || { total: 0, page: 1, limit: 15, totalPage: 1, totalDeletions: 0, totalUpdates: 0 };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">System Audit Logs</h2>
                    <p className="text-sm text-muted-foreground">
                        Real-time tracking of platform activities, mutations, and security events.
                    </p>
                </div>

                <Button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    variant="outline"
                    className="h-10"
                >
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                    Sync Feed
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border shadow-sm p-6 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Queries</p>
                        <Database className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">{meta.total.toLocaleString()}</h3>
                </div>

                <div className="bg-card border border-border shadow-sm p-6 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Mutations</p>
                        <Zap className="h-4 w-4 text-emerald-500" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">{meta.totalUpdates.toLocaleString()}</h3>
                </div>

                <div className="bg-card border border-border shadow-sm p-6 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Deletions</p>
                        <ServerCrash className="h-4 w-4 text-destructive" />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">{meta.totalDeletions.toLocaleString()}</h3>
                </div>
            </div>

            {isLoading ? (
                <div className="h-[400px] w-full rounded-xl bg-card border border-border flex items-center justify-center shadow-sm">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground font-medium">Syncing Ledger...</p>
                    </div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={logs}
                    meta={meta}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    actionFilter={actionFilter}
                    setActionFilter={setActionFilter}
                    setPage={setPage}
                />
            )}
        </div>
    );
}