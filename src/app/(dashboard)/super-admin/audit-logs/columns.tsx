/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Clock, Activity, MonitorSmartphone, Copy, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import AuditDetailsModal from "./audit-details-modal";
import { useState } from "react";
import { toast } from "sonner";

export interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    actorName: string | null;
    actorRole: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    oldData: any;
    newData: any;
    createdAt: string;
}

const ActionBadge = ({ action }: { action: string }) => {
    const styles: Record<string, string> = {
        CREATE: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 border-emerald-500/20",
        UPDATE: "bg-blue-500/10 text-blue-600 ring-blue-500/20 border-blue-500/20",
        DELETE: "bg-rose-500/10 text-rose-600 ring-rose-500/20 border-rose-500/20",
        UPSERT: "bg-amber-500/10 text-amber-600 ring-amber-500/20 border-amber-500/20",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${styles[action] || "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
            {action}
        </span>
    );
};

export const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => <ActionBadge action={row.original.action} />,
    },
    {
        accessorKey: "entity",
        header: "Module Context",
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800">
                    <Activity className="h-4 w-4 text-zinc-500" />
                </div>
                <div>
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                        {row.original.entity}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5 group cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(row.original.id);
                        toast.success("Transaction ID Copied");
                    }}>
                        <span className="text-[9px] font-mono text-zinc-400 group-hover:text-primary transition-colors">
                            {row.original.id.split('-')[0]}...
                        </span>
                        <Copy className="h-3 w-3 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "actorName",
        header: "Authorized By",
        cell: ({ row }) => (
            <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{row.original.actorName || "SYSTEM PROCESS"}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-0.5">
                    {row.original.actorRole || "AUTO"}
                </p>
            </div>
        ),
    },
    {
        accessorKey: "ipAddress",
        header: "Network",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-medium font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
                    {row.original.ipAddress || "INTERNAL"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {format(new Date(row.original.createdAt), "dd MMM, yyyy")}
                </span>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-emerald-500" /> 
                    {format(new Date(row.original.createdAt), "hh:mm:ss a")}
                </span>
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [isOpen, setIsOpen] = useState(false);
            return (
                <>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsOpen(true)}
                        className="h-9 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all"
                    >
                        <Eye className="mr-2 h-3.5 w-3.5" /> Inspect
                    </Button>
                    <AuditDetailsModal log={row.original} isOpen={isOpen} onClose={() => setIsOpen(false)} />
                </>
            );
        },
    },
];