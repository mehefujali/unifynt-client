"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReportService } from "@/services/report.service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    AlertCircle, 
    Bug, 
    CheckCircle2, 
    Clock, 
    ExternalLink, 
    Filter, 
    Flag, 
    MessageSquare, 
    MoreHorizontal, 
    Search,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const typeConfig: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
    BUG: { label: "Bug Report", icon: Bug, color: "text-rose-500 bg-rose-500/10" },
    FEATURE_REQUEST: { label: "Feature", icon: Flag, color: "text-blue-500 bg-blue-500/10" },
    GENERAL_FEEDBACK: { label: "Feedback", icon: MessageSquare, color: "text-emerald-500 bg-emerald-500/10" },
    PERFORMANCE_ISSUE: { label: "Performance", icon: Clock, color: "text-amber-500 bg-amber-500/10" },
    SECURITY_CONCERN: { label: "Security", icon: AlertCircle, color: "text-purple-500 bg-purple-500/10" },
    OTHER: { label: "Other", icon: HelpCircle, color: "text-slate-500 bg-slate-500/10" },
};

import { HelpCircle } from "lucide-react";

export default function ReportsManagementPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-reports", searchTerm, typeFilter, statusFilter],
        queryFn: () => ReportService.getReports({
            searchTerm,
            type: typeFilter === "all" ? undefined : typeFilter,
            status: statusFilter === "all" ? undefined : statusFilter,
        }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => 
            ReportService.updateReportStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
            toast.success("Report status updated");
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20">Pending</Badge>;
            case "IN_PROGRESS":
                return <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20">In Progress</Badge>;
            case "RESOLVED":
                return <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20">Resolved</Badge>;
            case "REJECTED":
                return <Badge variant="outline" className="bg-rose-500/5 text-rose-500 border-rose-500/20">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 uppercase">
                        Support & Feedback
                    </h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Review and manage user-submitted issues
                    </p>
                </div>
            </div>

            <Card className="border-sidebar-border/30 shadow-sm overflow-hidden bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-sidebar-border/20">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="relative w-full lg:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search by title, message or user..." 
                                className="pl-10 h-10 bg-slate-50/50 dark:bg-zinc-900/50 border-sidebar-border/40 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-[160px] h-10 bg-slate-50/50 dark:bg-zinc-900/50 border-sidebar-border/40">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-3.5 w-3.5 text-slate-400" />
                                        <SelectValue placeholder="All Types" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="BUG">Bugs</SelectItem>
                                    <SelectItem value="FEATURE_REQUEST">Features</SelectItem>
                                    <SelectItem value="GENERAL_FEEDBACK">Feedback</SelectItem>
                                    <SelectItem value="PERFORMANCE_ISSUE">Performance</SelectItem>
                                    <SelectItem value="SECURITY_CONCERN">Security</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px] h-10 bg-slate-50/50 dark:bg-zinc-900/50 border-sidebar-border/40">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-zinc-100/[0.02] border-sidebar-border/20">
                                <TableHead className="w-[250px] font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-6">Report Info</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Type</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">User</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-widest">Date</TableHead>
                                <TableHead className="text-right pr-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6} className="h-16 text-center">
                                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                Loading...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : data?.data?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-[200px] text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="p-3 rounded-full bg-slate-100 dark:bg-zinc-800">
                                                <Search className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-500 uppercase">No reports found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data?.data?.map((report: any) => {
                                    const config = typeConfig[report.type] || typeConfig.OTHER;
                                    const TypeIcon = config.icon;
                                    
                                    return (
                                        <TableRow key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-100/[0.02] border-sidebar-border/10 transition-colors">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-[13px] line-clamp-1">
                                                            {report.title || "Untitled Report"}
                                                        </span>
                                                        {report.school?.name && (
                                                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-slate-100 text-slate-500 border-none font-bold uppercase">
                                                                {report.school.name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-slate-400 line-clamp-1">
                                                        {report.message}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${config.color}`}>
                                                    <TypeIcon className="h-3 w-3" />
                                                    {config.label}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="h-7 w-7 border border-sidebar-border/30">
                                                        <AvatarImage src={report.user?.profilePicture} />
                                                        <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-500">
                                                            {report.user?.firstName?.[0]}{report.user?.lastName?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-bold text-slate-700 dark:text-zinc-300">
                                                            {report.user?.firstName} {report.user?.lastName}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                                            {report.user?.role?.replace("_", " ")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(report.status)}
                                            </TableCell>
                                            <TableCell className="text-[11px] font-bold text-slate-500 tabular-nums">
                                                {format(new Date(report.createdAt), "MMM dd, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[180px]">
                                                        <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Update Status</DropdownMenuLabel>
                                                        <DropdownMenuItem 
                                                            onClick={() => updateStatusMutation.mutate({ id: report.id, status: "IN_PROGRESS" })}
                                                            className="text-[12px] font-bold gap-2"
                                                        >
                                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                            In Progress
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => updateStatusMutation.mutate({ id: report.id, status: "RESOLVED" })}
                                                            className="text-[12px] font-bold gap-2 text-emerald-500"
                                                        >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Mark Resolved
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => updateStatusMutation.mutate({ id: report.id, status: "REJECTED" })}
                                                            className="text-[12px] font-bold gap-2 text-rose-500"
                                                        >
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            Reject Report
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-[12px] font-bold gap-2">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
