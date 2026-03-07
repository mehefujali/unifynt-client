"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";

export const usePermission = () => {
    const { user } = useAuth();

    const userPermissions = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (user as any)?.permissions || [];
    }, [user]);

    const hasPermission = (requiredPermission: string | string[]) => {
        if (!user?.role) return false;
        
        if (userPermissions.includes("*")) return true;

        if (Array.isArray(requiredPermission)) {
            return requiredPermission.some((p: string) => userPermissions.includes(p));
        }

        return userPermissions.includes(requiredPermission);
    };

    return { hasPermission, userPermissions };
};