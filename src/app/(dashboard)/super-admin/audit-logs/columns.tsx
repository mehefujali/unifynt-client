/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Clock, Activity, MonitorSmartphone, Copy } from "lucide-react";
import { format } from "date-fns";
import AuditDetailsModal from "./audit-details-modal";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
            const action = row.original.action;
            const variant = 
                action === "CREATE" ? "success" : 
                action === "DELETE" ? "destructive" : 
                action === "UPDATE" ? "default" : "outline";
            
            return (
                <Badge variant="outline" className={cn(
                    "font-bold text-[10px] uppercase tracking-wider",
                    action === "CREATE" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
                    action === "UPDATE" && "border-blue-500/20 bg-blue-500/10 text-blue-600",
                    action === "DELETE" && "border-destructive/20 bg-destructive/10 text-destructive",
                    action === "UPSERT" && "border-amber-500/20 bg-amber-500/10 text-amber-600",
                )}>
                    {action}
                </Badge>
            );
        },
    },
    {
        accessorKey: "entity",
        header: "Context",
        cell: ({ row }) => (
            <div className="flex items-center gap-3 py-1">
                <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center border border-border">
                    <Activity className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-foreground uppercase tracking-tight text-xs">
                        {row.original.entity}
                    </span>
                    <div 
                        className="flex items-center gap-1.5 cursor-pointer group" 
                        onClick={() => {
                            navigator.clipboard.writeText(row.original.id);
                            toast.success("Transaction ID Copied");
                        }}
                    >
                        <span className="text-[10px] font-mono text-muted-foreground group-hover:text-primary transition-colors">
                            ID: {row.original.id.split('-')[0]}...
                        </span>
                        <Copy className="h-3 w-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "actorName",
        header: "Authorized By",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-foreground text-sm">
                    {row.original.actorName || "SYSTEM"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                    {row.original.actorRole || "AUTOMATED"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "ipAddress",
        header: "Network Identity",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-[11px] font-bold font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded border border-border/50">
                    {row.original.ipAddress || "::1"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Timestamp",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold text-foreground">
                    {format(new Date(row.original.createdAt), "dd MMM, yyyy")}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                    <Clock className="h-3 w-3 text-emerald-500" /> 
                    {format(new Date(row.original.createdAt), "hh:mm:ss a")}
                </div>
            </div>
        ),
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [isOpen, setIsOpen] = useState(false);
            return (
                <div className="flex justify-end">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsOpen(true)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <AuditDetailsModal log={row.original} isOpen={isOpen} onClose={() => setIsOpen(false)} />
                </div>
            );
        },
    },
];