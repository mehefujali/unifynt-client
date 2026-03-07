/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    Loader2, 
    Search, 
    FilterX, 
    CheckSquare, 
    ShieldAlert,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { StaffService } from "@/services/staff.service";
import { cn } from "@/lib/utils";
import { APP_PERMISSIONS } from "@/config/permissions";
import { useAuth } from "@/hooks/use-auth";

interface ManagePermissionsModalProps {
    staff: any;
    isOpen: boolean;
    onClose: () => void;
}

// 🌟 SMART DEPENDENCY MAP: Parent -> Children
// If a child is selected, its parent auto-selects.
// If a parent is deselected, its children auto-deselect.
const PERMISSION_DEPENDENCIES: Record<string, string[]> = {
    ACADEMIC_VIEW: ["CLASS_CREATE", "CLASS_EDIT", "CLASS_DELETE", "SUBJECT_CREATE", "SUBJECT_EDIT", "SUBJECT_DELETE", "ROUTINE_CREATE", "ROUTINE_EDIT", "ROUTINE_DELETE"],
    ADMISSION_VIEW: ["ADMISSION_CREATE", "ADMISSION_EDIT", "ADMISSION_DELETE"],
    STUDENT_VIEW: ["STUDENT_CREATE", "STUDENT_EDIT", "STUDENT_DELETE"],
    STAFF_VIEW: ["STAFF_CREATE", "STAFF_EDIT", "STAFF_DELETE"],
    PAYROLL_VIEW: ["PAYROLL_CREATE", "PAYROLL_EDIT", "PAYROLL_DELETE"],
    EXAM_VIEW: ["EXAM_CREATE", "EXAM_EDIT", "EXAM_DELETE", "MARKS_ENTRY"],
    RESULT_VIEW: ["RESULT_CREATE", "RESULT_EDIT", "RESULT_DELETE"],
    FEE_VIEW: ["FEE_CREATE", "FEE_EDIT", "FEE_DELETE", "FEE_COLLECT"],
    INVOICE_VIEW: ["INVOICE_CREATE", "INVOICE_EDIT", "INVOICE_DELETE"],
    FORM_VIEW: ["FORM_CREATE", "FORM_EDIT", "FORM_DELETE"],
    USER_VIEW: ["USER_CREATE", "USER_EDIT", "USER_DELETE"],
    SCHOOL_VIEW: ["SCHOOL_CREATE", "SCHOOL_EDIT", "SCHOOL_DELETE"],
    PLAN_VIEW: ["PLAN_CREATE", "PLAN_EDIT", "PLAN_DELETE"],
};

export function ManagePermissionsModal({ staff: initialStaff, isOpen, onClose }: ManagePermissionsModalProps) {
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const { data: staff, isLoading, isFetching } = useQuery({
        queryKey: ["staff", initialStaff?.id],
        queryFn: () => StaffService.getSingleStaff(initialStaff?.id),
        enabled: !!initialStaff?.id && isOpen,
    });

    useEffect(() => {
        if (staff?.user?.permissions) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedPermissions(staff.user.permissions);
        }
    }, [staff]);

    const mutation = useMutation({
        mutationFn: (permissions: string[]) => 
            StaffService.updateStaff(initialStaff.id, { 
                userData: { permissions } 
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            toast.success("Security permissions updated successfully");
            onClose();
        },
        onError: () => {
            toast.error("Failed to update access levels");
        }
    });

    // 🌟 SMART TOGGLE LOGIC
    const togglePermission = (id: string) => {
        setSelectedPermissions(prev => {
            if (prev.includes(id)) {
                // REMOVE LOGIC: If a parent is removed, remove all its dependent children
                let toRemove = [id];
                if (PERMISSION_DEPENDENCIES[id]) {
                    toRemove = [...toRemove, ...PERMISSION_DEPENDENCIES[id]];
                }
                return prev.filter(p => !toRemove.includes(p));
            } else {
                // ADD LOGIC: If a child is added, find its parent and add it too
                const newPerms = new Set([...prev, id]);
                Object.entries(PERMISSION_DEPENDENCIES).forEach(([parent, children]) => {
                    if (children.includes(id)) {
                        newPerms.add(parent);
                    }
                });
                return Array.from(newPerms);
            }
        });
    };

    const toggleGroup = (actionIds: string[], e: React.MouseEvent) => {
        e.stopPropagation();
        const allSelected = actionIds.every(id => selectedPermissions.includes(id));
        
        if (allSelected) {
            // DESELECT FULL GROUP (Auto-remove children if parents are in the group)
            let toRemove = [...actionIds];
            actionIds.forEach(id => {
                if (PERMISSION_DEPENDENCIES[id]) {
                    toRemove = [...toRemove, ...PERMISSION_DEPENDENCIES[id]];
                }
            });
            setSelectedPermissions(prev => prev.filter(id => !toRemove.includes(id)));
        } else {
            // SELECT FULL GROUP (Auto-add parents if children are in the group)
            const newPerms = new Set([...selectedPermissions, ...actionIds]);
            actionIds.forEach(id => {
                Object.entries(PERMISSION_DEPENDENCIES).forEach(([parent, children]) => {
                    if (children.includes(id)) {
                        newPerms.add(parent);
                    }
                });
            });
            setSelectedPermissions(Array.from(newPerms));
        }
    };

    const toggleExpand = (key: string) => {
        setExpandedGroups(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const filteredPermissions = useMemo(() => {
        const result: any = {};
        Object.entries(APP_PERMISSIONS).forEach(([key, group]: [string, any]) => {
            if (key === "SAAS_MANAGEMENT" && currentUser?.role !== "SUPER_ADMIN") return;

            const actions = group.actions.filter((a: any) => 
                a.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (actions.length > 0) {
                result[key] = { ...group, actions };
            }
        });
        return result;
    }, [searchTerm, currentUser]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl w-[98vw] h-[90vh] md:h-[80vh] flex flex-col p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl bg-[#f8fafc] dark:bg-[#0c0d14]">
                <DialogHeader className="p-5 md:px-6 md:py-5 bg-white dark:bg-[#0f111a] border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-11 w-11 items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 ring-1 ring-indigo-100 dark:ring-indigo-500/20">
                                {isFetching ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}
                            </div>
                            <div className="min-w-0">
                                <DialogTitle className="text-[17px] font-extrabold text-slate-900 dark:text-white truncate">
                                    Access Control
                                </DialogTitle>
                                <DialogDescription className="text-[13px] font-medium text-slate-500 truncate mt-0.5">
                                    Configure granular permissions for <span className="text-slate-900 dark:text-slate-300 font-bold">{initialStaff?.firstName} {initialStaff?.lastName}</span>
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="relative w-full sm:max-w-[220px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search modules..." 
                                className="pl-9 h-9 text-[13px] font-medium bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full px-4 py-4 md:px-6">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : Object.keys(filteredPermissions).length > 0 ? (
                            <div className="flex flex-col gap-3 pb-4">
                                {Object.entries(filteredPermissions).map(([key, group]: [string, any]) => {
                                    const groupActionIds = group.actions.map((a: any) => a.id);
                                    const isAllSelected = groupActionIds.every((id: string) => selectedPermissions.includes(id));
                                    const selectedCount = groupActionIds.filter((id: string) => selectedPermissions.includes(id)).length;
                                    const hasSomeSelected = selectedCount > 0;
                                    const isExpanded = expandedGroups.includes(key) || searchTerm !== "";

                                    return (
                                        <div 
                                            key={key} 
                                            className={cn(
                                                "flex flex-col rounded-xl border bg-white dark:bg-[#0f111a] transition-all duration-200 overflow-hidden shadow-sm",
                                                hasSomeSelected ? "border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-50 dark:ring-indigo-500/10" : "border-slate-200 dark:border-slate-800"
                                            )}
                                        >
                                            <div 
                                                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:bg-transparent dark:hover:bg-slate-900/50 transition-colors"
                                                onClick={() => toggleExpand(key)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div onClick={(e) => toggleGroup(groupActionIds, e)}>
                                                        <Checkbox 
                                                            checked={isAllSelected || (hasSomeSelected ? "indeterminate" : false)}
                                                            className={cn("h-5 w-5 rounded-[6px] data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600")}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[14px] text-slate-800 dark:text-slate-200 leading-tight">
                                                            {group.title}
                                                        </p>
                                                        {selectedCount > 0 && (
                                                            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                                                                {selectedCount} of {group.actions.length} permissions active
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg">
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            
                                            {isExpanded && (
                                                <div className="p-3 pt-0 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800/50">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                                        {group.actions.map((action: any) => {
                                                            const isSelected = selectedPermissions.includes(action.id);
                                                            return (
                                                                <div 
                                                                    key={action.id} 
                                                                    onClick={() => togglePermission(action.id)}
                                                                    className={cn(
                                                                        "flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors border",
                                                                        isSelected 
                                                                            ? "bg-white dark:bg-[#0c0d14] border-indigo-100 dark:border-indigo-500/20 shadow-sm" 
                                                                            : "bg-transparent border-transparent hover:bg-white dark:hover:bg-[#0c0d14] hover:border-slate-200 dark:hover:border-slate-800"
                                                                    )}
                                                                >
                                                                    <Checkbox 
                                                                        id={action.id}
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => togglePermission(action.id)}
                                                                        className="h-4 w-4 mt-0.5 rounded-[4px] data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                                                    />
                                                                    <label className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 leading-tight cursor-pointer select-none pt-[1px]">
                                                                        {action.label}
                                                                    </label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                <FilterX className="h-10 w-10 mb-3 opacity-20" />
                                <p className="text-[14px] font-bold text-slate-600 dark:text-slate-400">No matching permissions</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter className="p-4 md:px-6 md:py-4 bg-white dark:bg-[#0f111a] border-t border-slate-200 dark:border-slate-800 shrink-0 flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                            {selectedPermissions.length} selected
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={onClose} 
                            className="flex-1 sm:flex-none h-10 font-bold text-[13px] rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => mutation.mutate(selectedPermissions)} 
                            disabled={mutation.isPending || isLoading} 
                            className="flex-1 sm:flex-none h-10 px-8 font-bold text-[13px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none transition-all"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Apply Permissions"
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}