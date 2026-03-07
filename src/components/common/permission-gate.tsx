"use client";

import { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";

interface PermissionGateProps {
    children: ReactNode;
    required: string | string[];
    fallback?: ReactNode;
}

export function PermissionGate({ children, required, fallback = null }: PermissionGateProps) {
    const { hasPermission } = usePermission();

    if (!hasPermission(required)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}