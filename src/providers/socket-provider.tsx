"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { BellRing } from 'lucide-react';

interface SocketContextData {
    socket: any;
}

const SocketContext = createContext<SocketContextData>({ socket: null });

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleNewNotification = (notification: any) => {
            // Show toast
            toast(notification.title, {
                description: notification.message || "You have a new notification.",
                icon: <BellRing className="h-5 w-5 text-primary" />,
                duration: 8000,
                position: 'bottom-right'
            });

            // Invalidate queries to fetch latest notifications & unread count
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, queryClient]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
