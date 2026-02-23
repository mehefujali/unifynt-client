"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdmissionService } from "@/services/admission.service";
import { format } from "date-fns";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye, Inbox, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

import ApplicationReviewModal from "./application-review-modal";
import { useDebounce } from "@/hooks/use-debounce";

export default function ApplicationsPage() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [status, setStatus] = useState("PENDING"); // Default set to PENDING
    const [page, setPage] = useState(1);
    const limit = 10;
    
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

    const { data: appsRes, isLoading } = useQuery({
        queryKey: ["applications", page, status, debouncedSearch],
        queryFn: () => AdmissionService.getApplications({ page, limit, status: status === "ALL" ? undefined : status, search: debouncedSearch }),
    });

    const applications = appsRes?.data || [];
    const meta = appsRes?.meta || { total: 0, page: 1, limit, totalPages: 1 };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Admission Applications</h2>
                    <p className="text-sm text-muted-foreground mt-1">Review and manage student admission requests.</p>
                </div>
            </div>

            <Card className="shadow-sm border-border">
                <CardHeader className="p-4 border-b bg-muted/20">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, email or phone..." 
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-9 h-10 w-full"
                            />
                        </div>
                        <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[180px] h-10">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Applications</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="APPROVED">Approved</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="font-semibold text-foreground px-6">Applicant Info</TableHead>
                                <TableHead className="font-semibold text-foreground">Phone</TableHead>
                                <TableHead className="font-semibold text-foreground">Applied On</TableHead>
                                <TableHead className="font-semibold text-foreground">Status</TableHead>
                                <TableHead className="text-right font-semibold text-foreground px-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : applications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                                        <Inbox className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        No applications found for this filter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map((app: any) => (
                                    <TableRow key={app.id} className="hover:bg-muted/20">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border shadow-sm">
                                                    <AvatarImage src={app.profileImage} alt={app.applicantName} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold uppercase">
                                                        {app.applicantName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground">{app.applicantName}</span>
                                                    <span className="text-xs text-muted-foreground">{app.applicantEmail}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">{app.phone || "N/A"}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {format(new Date(app.createdAt), "dd MMM yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                app.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                app.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-200" :
                                                "bg-amber-50 text-amber-600 border-amber-200"
                                            }>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedAppId(app.id)} className="h-9 hover:bg-primary/10 hover:text-primary">
                                                <Eye className="h-4 w-4 mr-2" /> Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {!isLoading && meta.total > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
                            <div className="text-sm text-muted-foreground font-medium">
                                Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} entries
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                                    disabled={meta.page === 1}
                                    className="h-8 shadow-none"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setPage(p => p + 1)} 
                                    disabled={meta.page >= meta.totalPages}
                                    className="h-8 shadow-none"
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ApplicationReviewModal 
                applicationId={selectedAppId} 
                isOpen={!!selectedAppId} 
                onClose={() => setSelectedAppId(null)} 
            />
        </div>
    );
}