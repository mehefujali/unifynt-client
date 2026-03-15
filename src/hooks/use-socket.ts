import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./use-auth";

// Use environment variable or fallback to localhost
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace("/api/v1", "")
  : "http://localhost:8080";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // We only want to connect if the user is authenticated
    if (!user?.userId && !user?.id) return;

    const socketInstance = io(SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      // 1. Join global notifications room
      socketInstance.emit("join chat", "global_notifications");

      // 2. Join school-specific room
      if (user.schoolId) {
        socketInstance.emit(
          "join chat",
          `school_notifications_${user.schoolId}`,
        );
      }

      // 3. Join user-specific room
      const currentUserId = user.userId || user.id;
      if (currentUserId) {
        socketInstance.emit("join chat", `user_notifications_${currentUserId}`);
      }

      // 4. Join role-specific room
      if (user.role) {
        socketInstance.emit("join chat", `role_notifications_${user.role}`);
      }
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

  return { socket };
};
