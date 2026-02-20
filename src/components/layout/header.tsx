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

    // Utility for getting initials for avatar
    const getInitials = (name: string) => {
        if (!name) return "UN";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    // --- Extreme Level Dynamic Profile Image & Data Logic ---
    const isSchoolLevel = userRole === "SCHOOL_ADMIN" || userRole === "TEACHER" || userRole === "STUDENT";

    // Fetch appropriate image based on role hierarchy
    const profileImage = isSchoolLevel
        ? ((user as any)?.school?.logo || (user as any)?.avatar || (user as any)?.profileImage)
        : ((user as any)?.avatar || (user as any)?.profileImage);

    // Dynamic display labels
    const displayName = user?.name || "Administrator";
    const displayEmail = user?.email || "admin@unifynt.com";
    const workspaceName = isSchoolLevel ? ((user as any)?.school?.name || "School Workspace") : "Global Administration";

    // Handle smooth logout
    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <header className="sticky top-0 z-40 w-full flex-shrink-0 border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all h-20 flex items-center shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">

                {/* --- Mobile Navigation Trigger & Logo (Hidden on lg) --- */}
                <div className="flex items-center gap-4 lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted/50 rounded-xl transition-colors ring-1 ring-border/50">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0 border-r-0 shadow-2xl">
                            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>

                            {/* Mobile Sidebar Content */}
                            <div className="flex flex-col h-full bg-card">
                                <div className="h-20 flex items-center px-6 border-b border-border/40 bg-muted/10">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
                                            <Command className="h-4 w-4" strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-lg tracking-tight leading-none">Unifynt</span>
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Workspace</span>
                                        </div>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 py-6 px-4 custom-scrollbar">
                                    <nav className="flex flex-col gap-1.5">
                                        {items.map((item, index) => {
                                            const Icon = item.icon;
                                            const hrefSegments = item.href.split('/').filter(Boolean).length;
                                            const isActive = hrefSegments > 1
                                                ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                                                : pathname === item.href;

                                            return (
                                                <Link
                                                    key={index}
                                                    href={item.href}
                                                    className={cn(
                                                        "group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all text-[14px] font-medium overflow-hidden",
                                                        isActive
                                                            ? "bg-primary/10 text-primary font-bold ring-1 ring-primary/20"
                                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                    )}
                                                >
                                                    {isActive && (
                                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                                                    )}
                                                    <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" : "text-muted-foreground/70")} />
                                                    {item.title}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </ScrollArea>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Mobile Logo Visibility */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm ring-1 ring-primary/20">
                            <Command className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* --- Left Side: Global Search (Desktop only) --- */}
                <div className="hidden lg:flex items-center flex-1 max-w-md transition-all duration-300">
                    <div className="relative w-full group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors duration-300" />
                        <Input
                            placeholder="Search anywhere (Press ⌘K)"
                            className="pl-10 pr-12 h-10 w-full bg-muted/30 border-border/60 shadow-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-full font-medium text-sm placeholder:text-muted-foreground/60"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-bold text-muted-foreground shadow-sm">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* --- Right Side: Actions & Profile --- */}
                <div className="flex items-center gap-3 sm:gap-4 ml-auto">

                    {/* Dark/Light Mode Toggle */}
                    <div className="hidden sm:block">
                        <ModeToggle />
                    </div>

                    {/* Notification Bell */}
                    <Button variant="ghost" size="icon" className="relative h-10 w-10 text-muted-foreground hover:bg-muted/50 rounded-full transition-all ring-1 ring-transparent hover:ring-border/50">
                        <Bell className="h-5 w-5" />
                        {/* Ping Animation for unread notifications */}
                        <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border-2 border-background"></span>
                        </span>
                    </Button>

                    <div className="h-6 w-px bg-border/60 hidden sm:block mx-1" />

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-2 ring-transparent hover:ring-primary/30 transition-all focus-visible:ring-primary/50 overflow-hidden">
                                <Avatar className="h-10 w-10 border border-border/50 shadow-sm transition-transform duration-300 hover:scale-105">
                                    <AvatarImage src={profileImage || ""} alt={displayName} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-extrabold text-sm border border-primary/10">
                                        {getInitials(displayName)}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-72 mt-2 p-2 border-border/60 shadow-2xl rounded-xl bg-card/95 backdrop-blur-xl" align="end" forceMount>
                            <DropdownMenuLabel className="p-3 bg-muted/40 rounded-lg mb-2 border border-border/50">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-extrabold leading-none text-foreground truncate pr-2">{displayName}</p>
                                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                            {user?.role || "USER"}
                                        </Badge>
                                    </div>
                                    <p className="text-xs font-medium leading-none text-muted-foreground mt-1.5 truncate">
                                        {displayEmail}
                                    </p>

                                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-border/60">
                                        {isSchoolLevel ? <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> : <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                                        <span className="text-xs font-bold text-muted-foreground truncate">
                                            {workspaceName}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-muted/50 focus:bg-muted/50 transition-colors mt-1">
                                <Link href={isSchoolLevel ? "/admin/profile" : "/super-admin/profile"} className="flex items-center text-sm font-semibold">
                                    <UserIcon className="mr-3 h-4 w-4 text-primary" />
                                    My Profile
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-muted/50 focus:bg-muted/50 transition-colors">
                                <Link href={isSchoolLevel ? "/admin/settings" : "/super-admin/settings"} className="flex items-center text-sm font-semibold">
                                    <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                                    Workspace Settings
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-2 bg-border/50" />

                            <DropdownMenuItem
                                className="cursor-pointer py-2.5 px-3 rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-3 h-4 w-4" />
                                <span className="font-bold">Log out securely</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </div>
        </header>
    );
}