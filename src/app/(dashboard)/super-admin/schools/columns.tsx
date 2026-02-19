/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink, Building2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export type SchoolColumn = {
    id: string;
    name: string;
    subdomain: string;
    email: string;
    plan?: {
        name: string;
    };
    isActive: boolean;
    studentLimit: number;
    _count?: {
        students: number;
        teachers: number;
    };
};

export const columns: ColumnDef<SchoolColumn>[] = [
    {
        accessorKey: "name",
        header: "School Name",
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground">{row.original.email || "No email"}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "subdomain",
        header: "Subdomain",
        cell: ({ row }) => {
            const subdomain = row.original.subdomain;
            return (
                <a
                    href={`https://${subdomain}.unifynt.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    {subdomain}
                    <ExternalLink className="h-3 w-3" />
                </a>
            );
        },
    },
    {
        id: "plan",
        header: "Plan",
        cell: ({ row }) => {
            const planName = row.original.plan?.name || "Custom/No Plan";
            return (
                <Badge variant={planName.toLowerCase().includes("free") ? "secondary" : "default"}>
                    {planName}
                </Badge>
            );
        },
    },
    {
        id: "usage",
        header: "Students",
        cell: ({ row }) => {
            const current = row.original._count?.students || 0;
            const limit = row.original.studentLimit;
            const isNearLimit = current >= limit * 0.9;

            return (
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${isNearLimit ? "text-destructive" : ""}`}>
                        {current} / {limit}
                    </span>
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
                <Badge variant={isActive ? "outline" : "destructive"} className={isActive ? "text-green-600 border-green-200 bg-green-50" : ""}>
                    {isActive ? "Active" : "Suspended"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const school = row.original;
            const router = useRouter();
            const pathname = usePathname();

            return (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`${pathname}?schoolId=${school.id}`)}
                        className="hover:bg-primary/10 hover:text-primary"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Manage
                    </Button>
                </div>
            );
        },
    },
];