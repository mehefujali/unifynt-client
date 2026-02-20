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
    Command
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { navItems } from "@/config/nav-items";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const userRole = user?.role ? (user.role.toUpperCase() as keyof typeof navItems) : null;
    const items = userRole ? navItems[userRole] : [];

    // Utility for getting initials for avatar
    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all h-[70px] flex items-center shadow-sm">
            <div className="flex h-full w-full items-center justify-between px-4 sm:px-6">

                {/* Mobile Navigation Trigger & Logo */}
                <div className="flex items-center gap-4 lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:bg-muted/50 rounded-lg">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px] p-0 border-r-0">
                            {/* Mobile Sidebar Content */}
                            <div className="flex flex-col h-full bg-card">
                                <div className="h-16 flex items-center px-6 border-b border-border/40">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                            <Command className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold text-lg tracking-tight">Unifynt</span>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 py-4 px-3">
                                    <nav className="flex flex-col gap-1">
                                        {items.map((item, index) => {
                                            const Icon = item.icon;
                                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                                            return (
                                                <Link
                                                    key={index}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center gap-3 rounded-lg px-3 py-3 transition-all text-sm font-medium",
                                                        isActive
                                                            ? "bg-primary/10 text-primary font-bold"
                                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    {item.title}
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </ScrollArea>
                            </div>
                        </SheetContent>
                    </Sheet>
                    {/* Mobile Logo visibility */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                            <Command className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Left Side: Global Search (Desktop only) */}
                <div className="hidden lg:flex items-center flex-1 max-w-md">
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search anything..."
                            className="pl-9 h-10 w-full bg-muted/30 border-border/60 shadow-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-[var(--radius-md)] font-medium text-sm placeholder:text-muted-foreground/60"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-3 sm:gap-4 ml-auto">

                    {/* Dark/Light Mode Toggle */}
                    <div className="hidden sm:block">
                        <ModeToggle />
                    </div>

                    {/* Notification Bell */}
                    <Button variant="ghost" size="icon" className="relative h-10 w-10 text-muted-foreground hover:bg-muted/50 rounded-full transition-colors">
                        <Bell className="h-5 w-5" />
                        {/* Ping Animation for unread notifications */}
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive border border-background"></span>
                        </span>
                    </Button>

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 ring-2 ring-transparent hover:ring-primary/20 transition-all focus-visible:ring-primary/50">
                                <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                                    <AvatarImage src="" alt={user?.name || "User"} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                        {getInitials(user?.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-64 mt-2 p-2 border-border/60 shadow-xl rounded-xl" align="end" forceMount>
                            <DropdownMenuLabel className="p-3 bg-muted/30 rounded-lg mb-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none text-foreground">{user?.name || "Administrator"}</p>
                                    <p className="text-xs font-medium leading-none text-muted-foreground/80 mt-1 truncate">
                                        {user?.email || "admin@unifynt.com"}
                                    </p>
                                    <div className="mt-2 flex">
                                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary ring-1 ring-inset ring-primary/20 uppercase tracking-widest">
                                            {user?.role || "Global Admin"}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-muted/50 focus:bg-muted/50 transition-colors">
                                <Link href="/admin/profile" className="flex items-center text-sm font-medium">
                                    <UserIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                                    My Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer py-2.5 px-3 rounded-md hover:bg-muted/50 focus:bg-muted/50 transition-colors">
                                <Link href="/admin/settings" className="flex items-center text-sm font-medium">
                                    <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                                    Workspace Settings
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="my-2 bg-border/50" />

                            <DropdownMenuItem
                                className="cursor-pointer py-2.5 px-3 rounded-md text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
                                onClick={() => {
                                    logout();
                                    window.location.href = "/login";
                                }}
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