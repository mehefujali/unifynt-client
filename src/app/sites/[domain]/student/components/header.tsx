/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { StudentNotificationBell } from "./notification-bell";
import Image from "next/image";

export default function StudentHeader({ siteData }: { siteData?: any }) {
    const { user, logout } = useAuth();
    const router = useRouter();

    const getInitials = (name: string) => {
        if (!name) return "UN";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // Use student's personal details for avatar and name
    const profileImage = user?.details?.profilePicture || user?.details?.profileImage || (user as any)?.avatar || "";
    const displayName = user?.details?.firstName 
        ? `${user.details.firstName} ${user.details.lastName || ""}`.trim() 
        : user?.name || "Student";
    const displayEmail = user?.email || "";

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const schoolName = siteData?.school?.name || "School Portal";
    const schoolLogo = siteData?.school?.logo || "/unifynt-logo.png";

    return (
        <header className="sticky top-0 z-40 w-full flex-shrink-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60 border-b border-zinc-200/50 dark:border-zinc-800/50 transition-all h-[72px] sm:h-[80px] flex items-center shadow-sm">
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                
                {/* School Branding in Top Left */}
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
                        <Image src={schoolLogo} alt="Logo" width={24} height={24} className="opacity-90 object-contain w-6 h-6" />
                    </div>
                    <span className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:block">
                        {schoolName}
                    </span>
                </div>

                {/* Right Action Group */}
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                    {/* Action Pills Container */}
                    <div className="flex items-center gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full backdrop-blur-sm">
                        <ModeToggle />
                        <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />
                        <StudentNotificationBell />
                    </div>

                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1" />

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-[var(--primary)]/20 transition-all focus-visible:ring-[var(--primary)]/50 group bg-zinc-100 dark:bg-zinc-900">
                                <Avatar className="h-full w-full border-2 border-white dark:border-zinc-950 shadow-sm transition-transform duration-300 group-hover:scale-110">
                                    <AvatarImage src={profileImage || ""} alt={displayName} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] text-white font-black text-[13px] opacity-80 mix-blend-multiply dark:mix-blend-screen">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-72 mt-2 p-2 border border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl rounded-3xl bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60" align="end">
                            <DropdownMenuLabel className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 mb-2 shadow-sm">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[15px] font-black leading-none text-zinc-900 dark:text-zinc-100 truncate pr-2 tracking-tight">{displayName}</p>
                                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 border-0 transition-colors">
                                            STUDENT
                                        </Badge>
                                    </div>
                                    <p className="text-[12px] font-medium text-zinc-500 truncate">
                                        {displayEmail}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            
                            <DropdownMenuItem asChild className="cursor-pointer py-3 px-4 rounded-xl text-[13px] font-bold tracking-wide text-zinc-700 dark:text-zinc-300 hover:text-[var(--primary)] dark:hover:text-[var(--primary)] hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all">
                                <Link href="/student/profile" className="flex items-center group">
                                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)] transition-colors mr-3">
                                        <UserIcon className="h-4 w-4" />
                                    </div>
                                    My Profile
                                </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-zinc-200/50 dark:bg-zinc-800/50 my-2 mx-2" />
                            
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-3 px-4 rounded-xl text-[13px] font-bold tracking-wide text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all group">
                                <div className="p-1.5 rounded-lg bg-rose-100/50 dark:bg-rose-500/10 group-hover:bg-rose-200/50 dark:group-hover:bg-rose-500/20 transition-colors mr-3">
                                    <LogOut className="h-4 w-4" />
                                </div>
                                Secure Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
