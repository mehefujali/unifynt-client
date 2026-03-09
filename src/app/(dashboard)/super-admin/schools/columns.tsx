"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, School } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export type SchoolColumn = {
    id: string;
    name: string;
    subdomain: string;
    email: string;
    logo?: string;
    plan?: { name: string };
    isActive: boolean;
    studentLimit: number;
    createdAt: string;
    _count?: { students: number; teachers: number };
};

const ActionCell = ({ school }: { school: SchoolColumn }) => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="flex justify-end">
            <PermissionGate required={PERMISSIONS.SCHOOL_EDIT}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`${pathname}?schoolId=${school.id}`)}
                    className="h-8 px-3 rounded-lg text-xs font-medium border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                >
                    <Eye className="mr-2 h-3.5 w-3.5 text-zinc-500" /> Manage
                </Button>
            </PermissionGate>
        </div>
    );
};

export const columns: ColumnDef<SchoolColumn>[] = [
    {
        accessorKey: "name",
        header: "Institution Identity",
        cell: ({ row }) => {
            const school = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg">
                        <AvatarImage src={school.logo} alt={school.name} className="object-contain p-1" />
                        <AvatarFallback className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-semibold text-xs rounded-lg">
                            <School className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                            {school.name}
                        </span>
                        <span className="text-xs text-zinc-500 truncate max-w-[200px]">
                            {school.email || "No email provided"}
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
                    className="group flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    {subdomain}.unifynt.com
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border ${isPremium ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}`}>
                    {planName}
                </span>
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
                <div className="flex flex-col gap-1.5 w-32">
                    <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-zinc-900 dark:text-zinc-100">{current} <span className="text-zinc-400">/ {limit}</span></span>
                        <span className="text-zinc-500">{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {isActive ? "Active" : "Suspended"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Operations</div>,
        cell: ({ row }) => <ActionCell school={row.original} />,
    },
];