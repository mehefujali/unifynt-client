/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
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
import {
    Bell,
    Search,
    Menu,
    LogOut,
    User as UserIcon,
    Settings,
    Command,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { navItems } from "@/config/nav-items";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

export default function Header() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const userRole = user?.role ? (user.role.toUpperCase() as keyof typeof navItems) : null;
    const currentNavItems = userRole ? (navItems[userRole] || []) : [];
    
    const mainItems = currentNavItems.filter(item => !item.subItems || item.subItems.length === 0);
    const nestedItems = currentNavItems.filter(item => item.subItems && item.subItems.length > 0);

    const getInitials = (name: string) => {
        if (!name) return "UN";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const isSchoolLevel = userRole === "SCHOOL_ADMIN" || userRole === "TEACHER" || userRole === "STUDENT" || userRole === "STAFF" || userRole === "ACCOUNTANT";

    const profileImage = isSchoolLevel
        ? ((user as any)?.school?.logo || (user as any)?.avatar || (user as any)?.profileImage)
        : ((user as any)?.avatar || (user as any)?.profileImage);

    const displayName = user?.name || "Administrator";
    const displayEmail = user?.email || "admin@unifynt.com";

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <header className="sticky top-0 z-40 w-full flex-shrink-0 bg-white/40 dark:bg-black/20 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/30 border-b border-white/40 dark:border-white/10 transition-all h-[76px] flex items-center shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-none">
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary bg-primary/5 rounded-xl">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0 border-r-0 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-2xl">
                            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                             <div className="h-20 flex items-center px-6 border-b border-black/5 dark:border-white/5">
                                 <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary mr-3">
                                     <Command className="h-5 w-5" />
                                 </div>
                                 <span className="font-bold text-[20px]">Unifynt</span>
                             </div>
                             <ScrollArea className="flex-1 py-4 px-4 custom-scrollbar">
                             </ScrollArea>
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center lg:hidden">
                        <Command className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <div className="hidden lg:flex items-center flex-1 max-w-md">
                    <button
                        onClick={() => setOpen(true)}
                        className="relative w-full group flex items-center gap-2 px-4 h-10 bg-white/50 dark:bg-black/30 backdrop-blur-md border border-white/60 dark:border-white/10 rounded-full text-[13px] text-slate-500 dark:text-slate-400 transition-all hover:bg-white/80 dark:hover:bg-black/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <Search className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium">Search menus and pages...</span>
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-1.5 font-mono text-[10px] font-bold text-slate-500 shadow-sm">
                            ⌘K
                        </kbd>
                    </button>
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

                    <div className="h-6 w-px bg-slate-200/50 dark:bg-slate-800/50 hidden sm:block mx-2" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all focus-visible:ring-primary">
                                <Avatar className="h-10 w-10 border-2 border-white/50 dark:border-slate-800/50">
                                    <AvatarImage src={profileImage || ""} alt={displayName} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-72 mt-2 p-1.5 border-white/40 dark:border-white/10 shadow-2xl rounded-2xl bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60" align="end">
                            <DropdownMenuLabel className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-white/60 dark:border-white/5 mb-1">
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
                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors">
                                <Link href={isSchoolLevel ? "/admin/profile" : "/super-admin/profile"} className="flex items-center">
                                    <UserIcon className="mr-3 h-4 w-4" /> My Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors">
                                <Link href={isSchoolLevel ? "/admin/settings" : "/super-admin/settings"} className="flex items-center">
                                    <Settings className="mr-3 h-4 w-4" /> Workspace Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-black/5 dark:bg-white/5 my-1" />
                            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer py-2.5 px-3 rounded-xl text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <LogOut className="mr-3 h-4 w-4" /> Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search your workspace menus..." />
                <CommandList className="custom-scrollbar">
                    <CommandEmpty>No navigation items found.</CommandEmpty>
                    
                    {mainItems.length > 0 && (
                        <CommandGroup heading="Quick Links">
                            {mainItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <CommandItem key={index} onSelect={() => runCommand(() => router.push(item.href))}>
                                        <Icon className="mr-2 h-4 w-4 text-primary" />
                                        <span>{item.title}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}

                    {nestedItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <CommandGroup key={index} heading={item.title}>
                                {item.subItems!.map((subItem, subIndex) => (
                                    <CommandItem key={subIndex} onSelect={() => runCommand(() => router.push(subItem.href))}>
                                        <Icon className="mr-2 h-4 w-4 text-slate-500" />
                                        <span>{subItem.title}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        );
                    })}
                </CommandList>
            </CommandDialog>
        </header>
    );
}