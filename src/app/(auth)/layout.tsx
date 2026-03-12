import { ReactNode } from "react";
import { ModeToggle } from "@/components/mode-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-zinc-950 relative">
            <div className="absolute bottom-20 left-10 z-50 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg">
                <ModeToggle />
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    );
}