/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export const columns: ColumnDef<SchoolColumn>[] = [
    {
        accessorKey: "name",
        header: "Institution Name",
        cell: ({ row }) => {
            const school = row.original;
            return (
                <div className="flex items-center gap-4 py-1">
                    <Avatar className="h-10 w-10 border border-border/50 shadow-sm bg-background">
                        <AvatarImage src={school.logo} alt={school.name} className="object-contain p-1" />
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                            {school.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground tracking-tight">{school.name}</span>
                        <span className="text-xs text-muted-foreground font-medium">{school.email || "No email provided"}</span>
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
                    className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 bg-muted/30 w-fit px-2.5 py-1.5 rounded-md border border-border/50"
                >
                    {subdomain}
                    <ExternalLink className="h-3 w-3" />
                </a>
            );
        },
    },
    {
        id: "plan",
        header: "Active Plan",
        cell: ({ row }) => {
            const planName = row.original.plan?.name || "Free Tier";
            const isPremium = !planName.toLowerCase().includes("free");

            return (
                <Badge variant={isPremium ? "default" : "secondary"} className={`font-semibold shadow-sm ${isPremium ? 'bg-indigo-500 hover:bg-indigo-600' : ''}`}>
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
            const isNearLimit = percentage >= 90;

            return (
                <div className="flex flex-col gap-1.5 w-[110px]">
                    <div className="flex items-center justify-between text-xs font-semibold">
                        <span className={isNearLimit ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                            {current} Users
                        </span>
                        <span className="text-muted-foreground">{limit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isNearLimit ? 'bg-red-500' : 'bg-green-500'}`}
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
                    <div className="relative flex h-2.5 w-2.5">
                        {isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                    <span className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {isActive ? "Active" : "Suspended"}
                    </span>
                </div>
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
                        className="hover:bg-primary/10 hover:text-primary font-bold transition-all shadow-sm border border-transparent hover:border-primary/20"
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        Manage
                    </Button>
                </div>
            );
        },
    },
];