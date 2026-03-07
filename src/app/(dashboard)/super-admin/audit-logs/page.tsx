"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { ShieldCheck, RefreshCcw, Database, ServerCrash, Zap } from "lucide-react";
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
        <div className="p-4 md:p-8 space-y-6 bg-zinc-50 dark:bg-[#09090b] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                        System Audit Logs
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Real-time tracking of platform activities, mutations, and security events.
                    </p>
                </div>
                
                <Button 
                    onClick={() => refetch()} 
                    disabled={isFetching}
                    variant="outline"
                    className="h-9 px-4 text-xs font-semibold bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                    <RefreshCcw className={`mr-2 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                    Sync Feed
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm flex flex-col justify-between group transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Queries</p>
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                            <Database className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">{meta.total.toLocaleString()}</h3>
                </div>
                
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm flex flex-col justify-between group transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Mutations (Updates)</p>
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">{meta.totalUpdates.toLocaleString()}</h3>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-6 rounded-xl shadow-sm flex flex-col justify-between group transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Deletions</p>
                        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                            <ServerCrash className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">{meta.totalDeletions.toLocaleString()}</h3>
                </div>
            </div>

            {isLoading ? (
                <div className="h-[400px] w-full rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center shadow-sm">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                        <ShieldCheck className="h-8 w-8 text-zinc-400 animate-pulse" />
                        <span className="text-sm font-medium text-zinc-500">Loading Secure Logs...</span>
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