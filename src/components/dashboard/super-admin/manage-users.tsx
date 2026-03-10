"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
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
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Loader2,
    Shield,
    MoreHorizontal,
    School,
    Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";

interface User {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    firstName: string | null;
    lastName: string | null;
    profilePicture: string | null;
    isTwoFactorEnabled: boolean;
    school: {
        id: string;
        name: string;
    };
}

export default function ManageUsers() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [schoolFilter, setSchoolFilter] = useState("ALL");
    const [twoFactorFilter, setTwoFactorFilter] = useState("ALL");

    // Notification Modal State
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [selectedUserForNotification, setSelectedUserForNotification] = useState<User | null>(null);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");

    // Debounce search term to prevent excessive API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Construct query parameters
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    if (debouncedSearch) queryParams.append("searchTerm", debouncedSearch);
    if (roleFilter !== "ALL") queryParams.append("role", roleFilter);
    if (schoolFilter !== "ALL") queryParams.append("schoolId", schoolFilter);
    if (twoFactorFilter !== "ALL") queryParams.append("isTwoFactorEnabled", twoFactorFilter === "TRUE" ? "true" : "false");

    // Fetch users
    const { data, isLoading, error } = useQuery({
        queryKey: ["super-admin-users", page, limit, debouncedSearch, roleFilter, schoolFilter, twoFactorFilter],
        queryFn: async () => {
            const res = await api.get(`/users?${queryParams.toString()}`);
            return res.data;
        },
    });

    // Fetch schools for filter
    const { data: schoolsData } = useQuery({
        queryKey: ["super-admin-schools-list"],
        queryFn: async () => {
            const res = await api.get(`/schools?limit=100`);
            return res.data;
        },
    });

    // Send Notification Mutation
    const sendNotificationMutation = useMutation({
        mutationFn: async (payload: { title: string, message: string, type: string, targetType: string, targetUserIds: string[] }) => {
            const res = await api.post("/notifications", payload);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Notification sent successfully");
            setIsNotificationModalOpen(false);
            setNotificationTitle("");
            setNotificationMessage("");
            setSelectedUserForNotification(null);
        },
        onError: (err: { response?: { data?: { message?: string } } }) => {
            toast.error(err.response?.data?.message || "Failed to send notification");
        },
    });

    const handleSendNotification = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForNotification) return;

        sendNotificationMutation.mutate({
            title: notificationTitle,
            message: notificationMessage,
            type: "INFO",
            targetType: "SPECIFIC_USERS",
            targetUserIds: [selectedUserForNotification.id],
        });
    };

    const users: User[] = data?.data || [];
    const meta = data?.meta || { total: 0, page: 1, limit: 10 };
    const totalPages = Math.ceil(meta.total / meta.limit) || 1;

    const getInitials = (user: User) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "SUPER_ADMIN": return "bg-zinc-900 border-zinc-900 text-white";
            case "SCHOOL_ADMIN": return "bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200";
            case "TEACHER": return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
            case "STUDENT": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
            default: return "bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-zinc-50 border-zinc-200"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={schoolFilter} onValueChange={(val) => { setSchoolFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[200px] h-10">
                            <SelectValue placeholder="All Schools" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Schools</SelectItem>
                            {schoolsData?.data?.map((school: { id: string; name: string }) => (
                                <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={roleFilter} onValueChange={(val) => { setRoleFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[150px] h-10">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            <SelectItem value="SCHOOL_ADMIN">School Admin</SelectItem>
                            <SelectItem value="TEACHER">Teacher</SelectItem>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={twoFactorFilter} onValueChange={(val) => { setTwoFactorFilter(val); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[160px] h-10">
                            <SelectValue placeholder="Security Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Security</SelectItem>
                            <SelectItem value="TRUE">2FA Enabled</SelectItem>
                            <SelectItem value="FALSE">2FA Disabled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-50 border-b border-zinc-200">
                            <TableRow>
                                <TableHead className="w-[300px] font-semibold text-zinc-900">User Details</TableHead>
                                <TableHead className="font-semibold text-zinc-900">School / Tenant</TableHead>
                                <TableHead className="font-semibold text-zinc-900">Role</TableHead>
                                <TableHead className="font-semibold text-zinc-900">Status & Security</TableHead>
                                <TableHead className="font-semibold text-zinc-900">Registered On</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-zinc-500">
                                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-zinc-400" />
                                            <p>Loading user database...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-red-500">
                                        Failed to load users. Please try again later.
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-zinc-500">
                                        No users found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-zinc-200">
                                                    <AvatarImage src={user.profilePicture || ""} alt={user.email} className="object-cover" />
                                                    <AvatarFallback className="bg-zinc-100 text-zinc-700 font-medium text-xs">
                                                        {getInitials(user)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-zinc-900">
                                                        {user.firstName ? `${user.firstName} ${user.lastName || ""}` : "Unnamed User"}
                                                    </span>
                                                    <span className="text-xs text-zinc-500">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-zinc-700">
                                                <School className="h-4 w-4 text-zinc-400 shrink-0" />
                                                <span className="font-medium truncate max-w-[200px]" title={user.school.name}>
                                                    {user.school.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                                {user.role.replace("_", " ")}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`h-2 w-2 rounded-full ${user.status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`} />
                                                    <span className="text-sm font-medium text-zinc-700 capitalize">
                                                        {user.status.toLowerCase()}
                                                    </span>
                                                </div>
                                                {user.isTwoFactorEnabled && (
                                                    <div className="flex text-[10px] items-center text-emerald-600 font-medium tracking-wide">
                                                        <Shield className="h-3 w-3 mr-1" />
                                                        2FA ACTIVE
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-600 font-medium">
                                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuItem 
                                                        onClick={() => {
                                                            setSelectedUserForNotification(user);
                                                            setIsNotificationModalOpen(true);
                                                        }}
                                                        className="text-zinc-700 cursor-pointer"
                                                    >
                                                        <Bell className="mr-2 h-4 w-4" />
                                                        Send Notification
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
                
                {/* Pagination */}
                <div className="border-t border-zinc-200 bg-zinc-50/50 p-4 flex items-center justify-between">
                    <span className="text-sm text-zinc-500 font-medium">
                        Showing <span className="text-zinc-900">{(page - 1) * limit + 1}</span> to <span className="text-zinc-900">{Math.min(page * limit, meta.total)}</span> of <span className="text-zinc-900">{meta.total}</span> users
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="px-2 text-sm font-medium text-zinc-700">
                            Page {page} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || isLoading}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Send Notification Modal */}
            <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSendNotification}>
                        <DialogHeader>
                            <DialogTitle>Send Notification</DialogTitle>
                            <DialogDescription>
                                Send a direct system notification to {selectedUserForNotification?.email}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="title" className="text-sm font-medium">Title</label>
                                <Input
                                    id="title"
                                    value={notificationTitle}
                                    onChange={(e) => setNotificationTitle(e.target.value)}
                                    placeholder="e.g. Account Security Update"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <Textarea
                                    id="message"
                                    value={notificationMessage}
                                    onChange={(e) => setNotificationMessage(e.target.value)}
                                    placeholder="Type your notification message here..."
                                    className="min-h-[100px]"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsNotificationModalOpen(false)}
                                disabled={sendNotificationMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={sendNotificationMutation.isPending}>
                                {sendNotificationMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Send Now
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
