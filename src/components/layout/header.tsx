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
import { NotificationBell } from "@/components/dashboard/notification-bell";

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
        <header className="sticky top-0 z-40 w-full flex-shrink-0 bg-white/80 dark:bg-sidebar/80 backdrop-blur-md border-b border-sidebar-border/50 transition-all h-[72px] sm:h-[80px] flex items-center shadow-sm">
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Mobile Navigation Trigger */}
                <div className="flex items-center gap-4 lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-[42px] w-[42px] text-foreground bg-accent/20 hover:bg-accent/40 rounded-2xl border border-sidebar-border transition-all">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0 border-r-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl shadow-2xl">
                            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                            <div className="h-20 flex items-center px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
                                <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary border border-primary/20 mr-3 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
                                    <Command className="h-5 w-5" />
                                </div>
                                <span className="font-black text-[22px] tracking-tight text-zinc-900 dark:text-zinc-100">Unifynt</span>
                            </div>
                            <ScrollArea className="flex-1 py-4 px-4 custom-scrollbar">
                                {/* Mobile Nav Items would be rendered here */}
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Global Search Bar - Premium Pill Design */}
                <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
                    <button
                        onClick={() => setOpen(true)}
                        className="relative w-full group flex items-center gap-3 px-5 h-[46px] bg-accent/10 hover:bg-accent/20 backdrop-blur-md border border-sidebar-border/60 rounded-[24px] text-[13px] text-muted-foreground hover:text-foreground transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-sm focus:outline-none"
                    >
                        <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium tracking-wide">Quick Search...</span>
                        <kbd className="ml-auto pointer-events-none inline-flex h-[22px] select-none items-center gap-1 rounded-md border border-sidebar-border bg-card/80 px-2 font-mono text-[10px] font-bold text-muted-foreground shadow-sm group-hover:border-primary/50 transition-colors">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </button>
                </div>

                {/* Right Action Group */}
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                    {/* Action Pills Container */}
                    <div className="hidden sm:flex items-center gap-1 p-1 bg-accent/20 border border-sidebar-border/50 rounded-full backdrop-blur-sm">
                        <ModeToggle />
                        <div className="w-px h-5 bg-sidebar-border mx-1" />
                        <NotificationBell />
                    </div>

                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-1" />

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all focus-visible:ring-primary/50 group bg-zinc-100 dark:bg-zinc-900">
                                <Avatar className="h-full w-full border-2 border-white dark:border-zinc-950 shadow-sm transition-transform duration-300 group-hover:scale-110">
                                    <AvatarImage src={profileImage || ""} alt={displayName} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-black text-[13px]">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-72 mt-2 p-2 border border-sidebar-border shadow-2xl rounded-3xl bg-popover/90 backdrop-blur-xl" align="end">
                            <DropdownMenuLabel className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 mb-2 shadow-sm">
                                <div className="flex flex-col space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[15px] font-black leading-none text-zinc-900 dark:text-zinc-100 truncate pr-2 tracking-tight">{displayName}</p>
                                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border-0 transition-colors">
                                            {user?.role ? user.role.replace("_", " ") : "USER"}
                                        </Badge>
                                    </div>
                                    <p className="text-[12px] font-medium text-zinc-500 truncate">
                                        {displayEmail}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuItem asChild className="cursor-pointer py-3 px-4 rounded-xl text-[13px] font-bold tracking-wide text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all">
                                <Link href={isSchoolLevel ? "/admin/profile" : "/super-admin/profile"} className="flex items-center group">
                                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary/10 group-hover:text-primary transition-colors mr-3">
                                        <UserIcon className="h-4 w-4" />
                                    </div>
                                    My Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer py-3 px-4 rounded-xl text-[13px] font-bold tracking-wide text-zinc-700 dark:text-zinc-300 hover:text-primary dark:hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-900/80 transition-all">
                                <Link href={isSchoolLevel ? "/admin/settings" : "/super-admin/settings"} className="flex items-center group">
                                    <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary/10 group-hover:text-primary transition-colors mr-3">
                                        <Settings className="h-4 w-4" />
                                    </div>
                                    Workspace Settings
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