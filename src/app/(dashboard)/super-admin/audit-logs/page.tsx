/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { ShieldCheck, ServerCrash, Zap, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import io from "socket.io-client";

export default function AuditLogsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ["auditLogs"],
        queryFn: async () => {
            const res = await api.get("/audit-logs"); 
            return res.data?.data;
        }
    });

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080");
        
        socket.on("connect", () => {
            socket.emit("join_super_admin_room");
        });

        socket.on("NEW_AUDIT_LOG", (newLog) => {
            queryClient.setQueryData(["auditLogs"], (oldData: any) => {
                if (!oldData) return [newLog];
                return [newLog, ...oldData];
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [queryClient]);

    const stats = {
        total: data?.length || 0,
        deletions: data?.filter((l: any) => l.action === "DELETE").length || 0,
        updates: data?.filter((l: any) => l.action === "UPDATE").length || 0,
    };

    return (
        <div className="p-4 md:p-8 space-y-8 bg-zinc-50/50 dark:bg-[#0a0a0a] min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg">
                            <ShieldCheck className="h-5 w-5 text-white dark:text-black" />
                        </div>
                        SECURITY LOGS
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Real-time Forensic Monitoring</p>
                    </div>
                </div>
                
                <Button 
                    onClick={() => refetch()} 
                    disabled={isFetching}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[16px] shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 font-black text-[10px] uppercase tracking-widest h-11 px-6 transition-all"
                >
                    <RefreshCcw className={`mr-2 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                    Sync Feed
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-full blur-[40px] -mr-10 -mt-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Total Queries</p>
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.total}</h3>
                </div>
                
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-colors" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2 flex items-center gap-2">
                        <Zap className="h-3 w-3" /> Mutations
                    </p>
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.updates}</h3>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[28px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-colors" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 mb-2 flex items-center gap-2">
                        <ServerCrash className="h-3 w-3" /> Deletions
                    </p>
                    <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{stats.deletions}</h3>
                </div>
            </div>

            {isLoading ? (
                <div className="h-[600px] w-full rounded-[32px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                        <ShieldCheck className="h-10 w-10 text-zinc-400 animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Loading Secure Logs...</span>
                    </div>
                </div>
            ) : (
                <DataTable columns={columns} data={data || []} />
            )}
        </div>
    );
}