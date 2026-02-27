/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Bell,
    Search,
    Menu,
    LogOut,
    User as UserIcon,
    Settings,
    Command,
    Building2,
    ShieldCheck
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { navItems } from "@/config/nav-items";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "../ui/badge";

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const userRole = user?.role ? (user.role.toUpperCase() as keyof typeof navItems) : null;
    const items = userRole ? navItems[userRole] : [];

    const getInitials = (name: string) => {
        if (!name) return "UN";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const isSchoolLevel = userRole === "SCHOOL_ADMIN" || userRole === "TEACHER" || userRole === "STUDENT";

    const profileImage = isSchoolLevel
        ? ((user as any)?.school?.logo || (user as any)?.avatar || (user as any)?.profileImage)
        : ((user as any)?.avatar || (user as any)?.profileImage);

    const displayName = user?.name || "Administrator";
    const displayEmail = user?.email || "admin@unifynt.com";
    const workspaceName = isSchoolLevel ? ((user as any)?.school?.name || "School Workspace") : "Global Administration";

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-40 w-full flex-shrink-0 bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-all h-20 flex items-center">
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">

                <div className="flex items-center gap-4 lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary bg-primary/5 rounded-xl">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0 border-r-0 bg-white dark:bg-[#09090b]">
                            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                             <div className="h-20 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                                 <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary mr-3">
                                     <Command className="h-5 w-5" />
                                 </div>
                                 <span className="font-bold text-[20px]">Unifynt</span>
                             </div>
                             <ScrollArea className="flex-1 py-4 px-4 custom-scrollbar">
                                {/* Mobile links mapping logic can be added here if needed */}
                             </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center lg:hidden">
                        <Command className="h-6 w-6 text-primary" />
                    </div>
                </div>

                {/* Colorful but Clean Search Bar */}
                <div className="hidden lg:flex items-center flex-1 max-w-md">
                    <div className="relative w-full group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search anywhere (Press ⌘K)"
                            className="pl-10 pr-12 h-10 w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/40 focus-visible:bg-white dark:focus-visible:bg-[#09090b] focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 rounded-full font-medium text-[13px] placeholder:text-slate-400 transition-all shadow-sm"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-bold text-slate-500 shadow-sm">
                                ⌘K
                            </kbd>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <div className="hidden sm:block">
                        <ModeToggle />
                    </div>

                    <Button variant="ghost" size="icon" className="relative h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
                        <Bell className="h-[18px] w-[18px]" />
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary border-2 border-white dark:border-[#09090b]"></span>
                        </span>
                    </Button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-2" />

                    {/* Colorful Avatar Border */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all focus-visible:ring-primary">
                                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-900">
                                    <AvatarImage src={profileImage || ""} alt={displayName} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-72 mt-2 p-1.5 border-slate-200 dark:border-slate-800 shadow-xl rounded-xl bg-white dark:bg-[#09090b]" align="end">
                            <DropdownMenuLabel className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800/50 mb-1">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[14px] font-bold leading-none text-slate-900 dark:text-white truncate pr-2">{displayName}</p>
                                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-0">
                                            {user?.role || "USER"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 mt-1 truncate">
                                        {displayEmail}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-md text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5">
                                <Link href={isSchoolLevel ? "/admin/profile" : "/super-admin/profile"} className="flex items-center">
                                    <UserIcon className="mr-3 h-4 w-4" /> My Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-md text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/5">
                                <Link href={isSchoolLevel ? "/admin/settings" : "/super-admin/settings"} className="flex items-center">
                                    <Settings className="mr-3 h-4 w-4" /> Workspace Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 px-3 rounded-md text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                <LogOut className="mr-3 h-4 w-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}