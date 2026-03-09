import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, Megaphone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define the shape of our notification
export interface INotification {
    id: string;
    title: string;
    message: string;
    type: "INFO" | "WARNING" | "SUCCESS" | "ERROR" | "SYSTEM";
    targetType: string;
    actionUrl?: string;
    imageUrl?: string;
    createdAt: string;
    isRead: boolean;
}

const NotificationIcon = ({ type }: { type: INotification["type"] }) => {
    switch (type) {
        case "INFO":
            return <Info className="h-5 w-5 text-blue-500" />;
        case "WARNING":
            return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        case "SUCCESS":
            return <CheckCircle className="h-5 w-5 text-emerald-500" />;
        case "ERROR":
            return <XCircle className="h-5 w-5 text-rose-500" />;
        case "SYSTEM":
            return <Megaphone className="h-5 w-5 text-primary" />;
        default:
            return <Bell className="h-5 w-5 text-zinc-500" />;
    }
};

export function NotificationBell() {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await api.get("/notifications?limit=20");
            return res.data.data;
        },
        // Refetch in background, rely on socket for instant updates
        staleTime: 60 * 1000 * 5,
    });

    const notifications: INotification[] = data?.notifications || [];
    const unreadCount: number = data?.unreadCount || 0;

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await api.patch(`/notifications/mark-all-read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("All notifications marked as read");
        },
    });

    const handleNotificationClick = (notification: INotification) => {
        if (!notification.isRead) {
            markAsReadMutation.mutate(notification.id);
        }
        if (notification.actionUrl) {
            router.push(notification.actionUrl);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-full text-zinc-500 hover:text-primary hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow"
                >
                    <Bell className="h-[18px] w-[18px] transition-transform group-hover:rotate-12" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-zinc-900 shadow-sm"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-80 sm:w-96 p-0 border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl rounded-3xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 overflow-hidden"
            >
                <div className="flex items-center justify-between px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">Notifications</h4>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-bold px-2 rounded-full">
                                {unreadCount} new
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllAsReadMutation.mutate()}
                            className="h-8 text-xs font-semibold text-primary/80 hover:text-primary hover:bg-primary/10 px-2 rounded-lg"
                            disabled={markAllAsReadMutation.isPending}
                        >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[380px] custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                            <p className="text-sm font-medium text-zinc-500">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                            </div>
                            <p className="font-medium text-zinc-600 dark:text-zinc-400">All caught up!</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">You have no new notifications.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-zinc-200/50 dark:divide-zinc-800/50">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "relative flex gap-4 p-4 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer group",
                                        !notification.isRead && "bg-primary/5 dark:bg-primary/10"
                                    )}
                                >
                                    {/* Read Indicator Dot */}
                                    {!notification.isRead && (
                                        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}

                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={cn(
                                            "p-2 rounded-xl border shadow-sm transition-transform group-hover:scale-105",
                                            notification.isRead
                                                ? "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                                                : "bg-white dark:bg-zinc-950 border-primary/20"
                                        )}>
                                            <NotificationIcon type={notification.type} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                                        <div className="flex gap-2 justify-between items-start mb-1">
                                            <p className={cn(
                                                "text-sm font-bold truncate",
                                                notification.isRead ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-900 dark:text-zinc-100"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] font-medium text-zinc-400 whitespace-nowrap mt-0.5">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-xs leading-relaxed line-clamp-2",
                                            notification.isRead ? "text-zinc-500" : "text-zinc-600 dark:text-zinc-400"
                                        )}>
                                            {notification.message}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-3 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <Link href="/notifications" className="w-full">
                        <Button variant="outline" className="w-full rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm text-xs font-bold">
                            View all notifications
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
