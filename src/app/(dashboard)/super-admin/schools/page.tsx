/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Loader2,
    MoreHorizontal,
    Pencil,
    Trash2,
    Search,
    CheckCircle2,
    XCircle,
    Building2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
interface School {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    logo: string | null;
    isActive: boolean;
    plan: "FREE" | "BASIC" | "STANDARD" | "PREMIUM" | "ENTERPRISE";
    _count: {
        students: number;
        teachers: number;
    };
    createdAt: string;
}

interface Meta {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
}

interface ApiResponse {
    data: School[];
    meta: Meta;
}

// --- Zod Schema for Editing ---
const editSchoolSchema = z.object({
    name: z.string().min(3, "Name is required"),
    slug: z.string().min(3, "Slug is required"),
    plan: z.enum(["FREE", "BASIC", "STANDARD", "PREMIUM", "ENTERPRISE"]),
    isActive: z.boolean(),
});

type EditSchoolFormValues = z.infer<typeof editSchoolSchema>;

export default function SchoolsManagementPage() {
    // Pagination & Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // 500ms delay
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [editingSchool, setEditingSchool] = useState<School | null>(null);
    const queryClient = useQueryClient();

    // Reset page when search term changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [debouncedSearchTerm]);

    // 1. Fetch Schools with Pagination
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ["schools", debouncedSearchTerm, page, limit],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearchTerm) params.append("searchTerm", debouncedSearchTerm);
            params.append("page", page.toString());
            params.append("limit", limit.toString());

            const res = await api.get(`/schools?${params.toString()}`);
            return res.data as { data: School[]; meta: Meta };
        },
        placeholderData: (previousData) => previousData, // Keep showing old data while fetching new
    });

    const schools = apiResponse?.data || [];
    const meta = apiResponse?.meta;

    // 2. Delete Mutation
    const { mutate: deleteSchool } = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/schools/${id}`);
        },
        onSuccess: () => {
            toast.success("School deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["schools"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to delete school");
        },
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Schools</h1>
                    <p className="text-muted-foreground">
                        Manage registered schools, subscriptions, and status.
                    </p>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search schools..."
                        className="pl-8 bg-background"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>School</TableHead>
                            <TableHead>Subdomain</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading schools...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : schools.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No schools found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            schools.map((school) => (
                                <TableRow key={school.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border">
                                                <AvatarImage src={school.logo || ""} alt={school.name} />
                                                <AvatarFallback>
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{school.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ID: {school.slug}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {school.subdomain}.app.com
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <PlanBadge plan={school.plan} />
                                    </TableCell>
                                    <TableCell>
                                        {school.isActive ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full w-fit dark:bg-emerald-950/30 dark:text-emerald-400">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full w-fit dark:bg-red-950/30 dark:text-red-400">
                                                <XCircle className="h-3.5 w-3.5" />
                                                Inactive
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div>Students: {school._count?.students || 0}</div>
                                            <div>Teachers: {school._count?.teachers || 0}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => setEditingSchool(school)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => {
                                                        if (confirm("Are you sure? This action is irreversible.")) {
                                                            deleteSchool(school.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete School
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {meta && meta.total > 0 && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex-1 text-sm text-muted-foreground">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, meta.total)} of {meta.total} entries
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={`${limit}`}
                                onValueChange={(value) => {
                                    setLimit(Number(value));
                                    setPage(1); // Reset to first page on limit change
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={limit} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {page} of {meta.totalPage}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                            >
                                <span className="sr-only">Go to first page</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => setPage((p) => Math.min(meta.totalPage, p + 1))}
                                disabled={page === meta.totalPage}
                            >
                                <span className="sr-only">Go to next page</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => setPage(meta.totalPage)}
                                disabled={page === meta.totalPage}
                            >
                                <span className="sr-only">Go to last page</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit School Sheet (Same as before) */}
            <EditSchoolSheet
                school={editingSchool}
                open={!!editingSchool}
                onOpenChange={(open) => !open && setEditingSchool(null)}
            />
        </div>
    );
}

// --- Helper Components ---

function PlanBadge({ plan }: { plan: string }) {
    const styles: Record<string, string> = {
        FREE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        BASIC: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        STANDARD: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        PREMIUM: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        ENTERPRISE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    };

    return (
        <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${styles[plan] || styles.FREE
                }`}
        >
            {plan}
        </span>
    );
}

function EditSchoolSheet({
    school,
    open,
    onOpenChange,
}: {
    school: School | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const queryClient = useQueryClient();

    const form = useForm<EditSchoolFormValues>({
        resolver: zodResolver(editSchoolSchema),
        defaultValues: {
            name: "",
            slug: "",
            plan: "FREE",
            isActive: true,
        },
        values: school
            ? {
                name: school.name,
                slug: school.slug,
                plan: school.plan,
                isActive: school.isActive,
            }
            : undefined,
    });

    const { mutate: updateSchool, isPending } = useMutation({
        mutationFn: async (values: EditSchoolFormValues) => {
            if (!school) return;
            await api.patch(`/schools/${school.id}`, values);
        },
        onSuccess: () => {
            toast.success("School updated successfully");
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Update failed");
        },
    });

    const onSubmit = (data: EditSchoolFormValues) => {
        updateSchool(data);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Edit School</SheetTitle>
                    <SheetDescription>
                        Update the school&apos;s basic information and subscription plan.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>School Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug (Identifier)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Changing this may break existing links.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="plan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subscription Plan</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="FREE">Free</SelectItem>
                                                    <SelectItem value="BASIC">Basic</SelectItem>
                                                    <SelectItem value="STANDARD">Standard</SelectItem>
                                                    <SelectItem value="PREMIUM">Premium</SelectItem>
                                                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-end justify-between rounded-lg border p-3 shadow-sm h-[74px]">
                                            <div className="space-y-0.5">
                                                <FormLabel>Active Status</FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className="h-4 w-4 accent-primary"
                                                    />
                                                    <span className="text-xs text-muted-foreground">{field.value ? "Active" : "Inactive"}</span>
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <SheetFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </SheetFooter>
                        </form>
                    </Form>
                </div>
            </SheetContent>
        </Sheet>
    );
}