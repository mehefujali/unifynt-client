/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, School, Globe, ShieldAlert } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Import Permissions and Hooks ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export type SchoolColumn = {
    id: string;
    name: string;
    subdomain: string;
    email: string;
    logo?: string;
    plan?: {
        name: string;
    };
    isActive: boolean;
    studentLimit: number;
    createdAt: string;
    _count?: {
        students: number;
        teachers: number;
    };
};

/**
 * ActionCell handles navigation and permissions logic outside the column definition 
 * to adhere to React Hook rules and maintain clean architecture.
 */
const ActionCell = ({ school }: { school: SchoolColumn }) => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="flex justify-end pr-2">
            <PermissionGate required={PERMISSIONS.SCHOOL_EDIT}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`${pathname}?schoolId=${school.id}`)}
                    className="h-9 px-4 rounded-xl hover:bg-primary/10 hover:text-primary font-black text-[11px] uppercase tracking-widest transition-all border border-transparent hover:border-primary/20"
                >
                    <Eye className="mr-2 h-4 w-4" />
                    Manage
                </Button>
            </PermissionGate>
        </div>
    );
};

export const columns: ColumnDef<SchoolColumn>[] = [
    {
        accessorKey: "name",
        header: () => <span className="pl-2">Institution Identity</span>,
        cell: ({ row }) => {
            const school = row.original;
            return (
                <div className="flex items-center gap-4 py-1 pl-2">
                    <Avatar className="h-11 w-11 border-2 border-background shadow-sm ring-1 ring-border/50 bg-white">
                        <AvatarImage src={school.logo} alt={school.name} className="object-contain p-1.5" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black text-[10px]">
                            <School className="h-5 w-5 opacity-40" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-black text-[14px] text-slate-900 dark:text-white tracking-tight leading-none mb-1">
                            {school.name}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 truncate max-w-[180px]">
                            {school.email || "Contact email missing"}
                        </span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "subdomain",
        header: "Workspace URL",
        cell: ({ row }) => {
            const subdomain = row.original.subdomain;
            return (
                <a
                    href={`https://${subdomain}.unifynt.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="group text-[11px] font-black text-slate-500 hover:text-primary transition-all flex items-center gap-2 bg-slate-100 dark:bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10"
                >
                    <Globe className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="tracking-widest uppercase">{subdomain}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
            );
        },
    },
    {
        id: "plan",
        header: "License Tier",
        cell: ({ row }) => {
            const planName = row.original.plan?.name || "Standard";
            const isPremium = !planName.toLowerCase().includes("free") && !planName.toLowerCase().includes("trial");

            return (
                <Badge 
                    variant="outline" 
                    className={cn(
                        "font-black text-[9px] uppercase tracking-[1px] px-2.5 py-0.5 border shadow-none",
                        isPremium 
                            ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" 
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                    )}
                >
                    {planName}
                </Badge>
            );
        },
    },
    {
        id: "usage",
        header: "User Capacity",
        cell: ({ row }) => {
            const current = row.original._count?.students || 0;
            const limit = row.original.studentLimit || 1;
            const percentage = Math.min(100, Math.round((current / limit) * 100));
            const isCritical = percentage >= 95;
            const isWarning = percentage >= 80;

            return (
                <div className="flex flex-col gap-2 w-[130px]">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight">
                        <span className={isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-500"}>
                            {current.toLocaleString()} / {limit.toLocaleString()}
                        </span>
                        <span className="text-slate-400 tabular-nums">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                isCritical ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                                isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: "System Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex items-center gap-2">
                    <div className="relative flex h-2 w-2">
                        {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                        <span className={cn(
                            "relative inline-flex rounded-full h-2 w-2",
                            isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                        )}></span>
                    </div>
                    <span className={cn(
                        "text-[10px] font-black tracking-[1.5px] uppercase",
                        isActive ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                        {isActive ? "Active" : "Suspended"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right pr-6 font-black text-[11px] uppercase text-slate-400 tracking-[2px]">Operations</div>,
        cell: ({ row }) => <ActionCell school={row.original} />,
    },
];

// Utility for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}