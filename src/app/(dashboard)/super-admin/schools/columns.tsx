"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, School, Building2, MoreHorizontal } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`${pathname}?schoolId=${school.id}`)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </PermissionGate>
        </div>
    );
};

export const columns: ColumnDef<SchoolColumn>[] = [
    {
        accessorKey: "name",
        header: "Institution Details",
        cell: ({ row }) => {
            const school = row.original;
            return (
                <div className="flex items-center gap-3 py-1">
                    <Avatar className="h-10 w-10 border border-border bg-muted/20 rounded-lg">
                        <AvatarImage src={school.logo} alt={school.name} className="object-contain p-1" />
                        <AvatarFallback className="bg-muted text-muted-foreground font-bold text-xs">
                            <Building2 className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground truncate max-w-[200px]">
                            {school.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {school.email || "No administrative email"}
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
                    className="group inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-tight"
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
                <Badge variant="outline" className={cn(
                    "font-bold text-[10px] uppercase tracking-wider",
                    isPremium ? "border-primary/20 bg-primary/5 text-primary" : "border-muted bg-muted/10 text-muted-foreground"
                )}>
                    {planName}
                </Badge>
            );
        },
    },
    {
        id: "usage",
        header: "Capacity",
        cell: ({ row }) => {
            const current = row.original._count?.students || 0;
            const limit = row.original.studentLimit || 1;
            const percentage = Math.min(100, Math.round((current / limit) * 100));
            const isCritical = percentage >= 95;
            const isWarning = percentage >= 80;

            return (
                <div className="flex flex-col gap-1.5 w-32">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-foreground">{current} <span className="text-muted-foreground">/ {limit}</span></span>
                        <span className={cn(
                            isCritical ? "text-destructive" : isWarning ? "text-amber-500" : "text-emerald-500"
                        )}>{percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isCritical ? 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.3)]' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
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
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "h-2 w-2 rounded-full",
                        isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.2)]"
                    )} />
                    <span className={cn(
                        "text-sm font-bold",
                        isActive ? "text-foreground" : "text-muted-foreground"
                    )}>
                        {isActive ? "Active" : "Suspended"}
                    </span>
                </div>
            );
        },
    },
    {
        id: "actions",
        header: () => null,
        cell: ({ row }) => <ActionCell school={row.original} />,
    },
];