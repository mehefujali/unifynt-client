import { ReactNode } from "react";
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center relative bg-background">
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}