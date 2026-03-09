import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}