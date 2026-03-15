/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdmissionService } from "@/services/admission.service";
import { format } from "date-fns";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Eye,
  Inbox,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

import ApplicationReviewModal from "./application-review-modal";
import { useDebounce } from "@/hooks/use-debounce";
import { downloadCSV, downloadExcel } from "@/lib/export-utils";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Check permissions for rendering conditional columns
  const { hasPermission } = usePermission();
  const canReview = hasPermission([PERMISSIONS.ADMISSION_EDIT, PERMISSIONS.ADMISSION_DELETE]);

  const { data: appsRes, isLoading } = useQuery({
    queryKey: ["applications", page, status, debouncedSearch],
    queryFn: () =>
      AdmissionService.getApplications({
        page,
        limit,
        status: status === "ALL" ? undefined : status,
        search: debouncedSearch,
      }),
  });

  const applications = appsRes?.data || [];
  const meta = appsRes?.meta || { total: 0, page: 1, limit, totalPages: 1 };

  const exportMutation = useMutation({
    mutationFn: async (type: "csv" | "excel") => {
      const params = {
        ...(status !== "ALL" && { status }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };
      const res = await AdmissionService.exportApplications(params);
      return { data: res.data, type };
    },
    onSuccess: ({ data, type }) => {
      if (data && data.length > 0) {
        const dateStr = new Date().toISOString().split("T")[0];
        const filename = `Admission_Applications_${dateStr}`;
        
        if (type === "csv") {
          downloadCSV(data, filename);
        } else {
          downloadExcel(data, filename);
        }
        
        toast.success(`Exported as ${type.toUpperCase()} successfully!`);
      } else {
        toast.info("No data found to export with current filters.");
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to export data");
    },
  });

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Admission Applications
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and manage student admission requests.
          </p>
        </div>

        {/* 🔒 Gate for Export Menu */}
        <PermissionGate required={PERMISSIONS.ADMISSION_EDIT}>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="outline"
                className="flex items-center gap-2 border-primary/20 shadow-sm transition-colors hover:bg-primary/5"
                disabled={exportMutation.isPending}
                >
                {exportMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                    <Download className="h-4 w-4 text-primary" />
                )}
                <span className="font-semibold text-primary">
                    {exportMutation.isPending ? "Exporting..." : "Export Options"}
                </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 font-medium">
                <DropdownMenuItem 
                onClick={() => exportMutation.mutate("excel")} 
                className="cursor-pointer py-2"
                >
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                <span>Export as Excel (.xlsx)</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                onClick={() => exportMutation.mutate("csv")} 
                className="cursor-pointer py-2"
                >
                <FileText className="mr-2 h-4 w-4 text-blue-600" />
                <span>Export as CSV (.csv)</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </PermissionGate>
      </div>

      <Card className="border-border shadow-none bg-card overflow-hidden">
        <CardHeader className="border-b border-border/30 p-4 shrink-0">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full pl-9 bg-muted/20"
              />
            </div>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 w-full sm:w-[180px] bg-muted/20">
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
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-6 font-semibold text-foreground">
                  Applicant Info
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Phone
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Applied On
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Payment
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Status
                </TableHead>
                {canReview && (
                    <TableHead className="px-6 text-right font-semibold text-foreground">
                    Action
                    </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={canReview ? 6 : 5} className="h-64 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canReview ? 6 : 5}
                    className="h-64 text-center text-muted-foreground"
                  >
                    <Inbox className="mx-auto mb-4 h-12 w-12 opacity-20" />
                    No applications found for this filter.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app: any) => (
                  <TableRow key={app.id} className="hover:bg-muted/5 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border shadow-sm">
                          <AvatarImage
                            src={app.profileImage}
                            alt={app.applicantName}
                          />
                          <AvatarFallback className="bg-primary/10 font-bold uppercase text-primary">
                            {app.applicantName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {app.applicantName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {app.applicantEmail}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground/80">
                      {app.phone || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(() => {
                        if (!app.createdAt) return "N/A";
                        const date = new Date(app.createdAt);
                        return !isNaN(date.getTime()) ? format(date, "dd MMM yyyy") : "N/A";
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const ps = app.paymentStatus || "PENDING";
                        return (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "font-bold text-[10px] uppercase tracking-wider",
                              ps === "PAID"
                                ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5"
                                : ps === "FAILED"
                                  ? "border-red-500/50 text-red-500 bg-red-500/5"
                                  : ps === "REFUNDED"
                                    ? "border-purple-500/50 text-purple-500 bg-purple-500/5"
                                    : "border-amber-500/50 text-amber-500 bg-amber-500/5"
                            )}
                          >
                            {ps}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-bold text-[10px] uppercase tracking-wider",
                          app.status === "APPROVED"
                            ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5"
                            : app.status === "REJECTED"
                              ? "border-red-500/50 text-red-500 bg-red-500/5"
                              : "border-amber-500/50 text-amber-500 bg-amber-500/5"
                        )}
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    {canReview && (
                        <TableCell className="px-6 text-right">
                            <PermissionGate required={[PERMISSIONS.ADMISSION_EDIT, PERMISSIONS.ADMISSION_DELETE]}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedAppId(app.id)}
                                    className="h-8 text-xs font-bold hover:bg-primary/10 hover:text-primary rounded-lg transition-all"
                                >
                                    <Eye className="mr-2 h-3.5 w-3.5" /> Review
                                </Button>
                            </PermissionGate>
                        </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoading && meta.total > 0 && (
            <div className="flex items-center justify-between border-t border-border/30 bg-background/20 px-6 py-4">
              <div className="text-sm font-medium text-muted-foreground">
                Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
                entries
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page === 1}
                  className="h-8 shadow-none"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="h-8 shadow-none"
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
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