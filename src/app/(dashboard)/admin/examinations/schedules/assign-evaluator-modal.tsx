/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Link, Unlink, UserCheck } from "lucide-react";
import { examService } from "@/services/exam.service";
import { StaffService } from "@/services/staff.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AssignEvaluatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string | null;
  subjectInfo: string | null;
}

export default function AssignEvaluatorModal({ isOpen, onClose, scheduleId, subjectInfo }: AssignEvaluatorModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Staff API already returns BOTH staff members and teachers combined
  const { data: staffData, isLoading: isLoadingStaff } = useQuery({
    queryKey: ["staff"],
    queryFn: () => StaffService.getAllStaff(),
    enabled: isOpen,
  });

  const { data: assignedEvaluators, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ["evaluators", scheduleId],
    queryFn: () => examService.getAssignedEvaluators(scheduleId!),
    enabled: isOpen && !!scheduleId,
  });

  const assignMutation = useMutation({
    mutationFn: (userId: string) => examService.assignEvaluator({ scheduleId: scheduleId!, userId }),
    onSuccess: () => {
      toast.success("Evaluator assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["evaluators", scheduleId] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to assign evaluator"),
  });

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => examService.revokeEvaluator({ scheduleId: scheduleId!, userId }),
    onSuccess: () => {
      toast.success("Evaluator removed successfully");
      queryClient.invalidateQueries({ queryKey: ["evaluators", scheduleId] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to remove evaluator"),
  });

  const isAssigned = (uId: string) => {
    return assignedEvaluators?.some((assignment: any) => assignment.userId === uId);
  };

  const handleToggleAssign = (uId: string) => {
    if (isAssigned(uId)) {
      revokeMutation.mutate(uId);
    } else {
      assignMutation.mutate(uId);
    }
  };

  const staffList = Array.isArray(staffData?.data) ? staffData.data : (Array.isArray(staffData) ? staffData : []);

  // Map to extract userId from nested user relation and deduplicate
  const allEmployeesRaw = staffList
    .filter((emp: any) => emp.user?.id) // Only employees with a linked User account
    .map((emp: any) => ({
      ...emp,
      mappedUserId: emp.user.id,
      displayRole: emp.isTeacher ? "TEACHER" : "STAFF/ACCOUNTANT",
    }));

  // Deduplicate by User ID
  const allEmployees = Array.from(new Map(allEmployeesRaw.map((emp: any) => [emp.mappedUserId, emp])).values());

  const filteredEmployees = allEmployees.filter((employee: any) => {
    const term = searchQuery.toLowerCase();
    const fullName = `${employee.firstName} ${employee.lastName || ""}`.toLowerCase();
    return fullName.includes(term) || employee.employeeId?.toLowerCase().includes(term);
  });

  const isLoading = isLoadingStaff || isLoadingAssignments;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border-0 ring-1 ring-border/50 shadow-2xl">
        <DialogHeader className="px-6 py-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <UserCheck className="h-5 w-5 text-primary" /> Assign Evaluators
          </DialogTitle>
          <p className="text-sm font-medium text-zinc-500 mt-1">
            Manage who can enter marks for <span className="text-primary">{subjectInfo}</span>
          </p>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus-visible:ring-primary rounded-xl h-10"
            />
          </div>

          <div className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl p-2 ring-1 ring-border/50">
            {isLoading ? (
              <div className="flex h-[300px] flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-zinc-500">Loading directory...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-zinc-500">
                <p className="font-medium">No results found.</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-3">
                <div className="space-y-2">
                  {filteredEmployees.map((employee: any) => {
                    const assigned = isAssigned(employee.mappedUserId);
                    const isPending = (assignMutation.isPending && assignMutation.variables === employee.mappedUserId) || 
                                      (revokeMutation.isPending && revokeMutation.variables === employee.mappedUserId);

                    return (
                      <div
                        key={employee.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl transition-all border",
                          assigned
                            ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30"
                            : "bg-white dark:bg-zinc-950 border-border hover:border-zinc-300 dark:hover:border-zinc-700"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-1 ring-border/50 shadow-sm rounded-lg">
                            <AvatarImage src={employee.profilePicture} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold rounded-lg">
                              {employee.firstName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-tighter">
                                ID: {employee.employeeId}
                              </span>
                              <Badge variant="outline" className="text-[9px] uppercase tracking-wider px-1.5 py-0 rounded bg-zinc-100 dark:bg-zinc-900 border-0 h-4">
                                {employee.displayRole}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleAssign(employee.mappedUserId)}
                          disabled={assignMutation.isPending || revokeMutation.isPending}
                          className={cn(
                            "h-8 rounded-lg text-xs font-bold px-3 transition-colors",
                            assigned 
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0" 
                                : "hover:bg-primary hover:text-white hover:border-primary"
                          )}
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : assigned ? (
                            <>
                              <Unlink className="h-3 w-3 mr-1.5" /> Remove
                            </>
                          ) : (
                            <>
                              <Link className="h-3 w-3 mr-1.5" /> Assign
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
