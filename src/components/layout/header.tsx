"use client";

import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Search, Settings, LogOut, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "@/components/mode-toggle";
import Sidebar from "./sidebar";

export default function Header() {
    const { user, logout } = useAuth();
    const router = useRouter();

    // ডাইনামিক রাউটিং ইউজারের Role অনুযায়ী
    const getProfileRoute = () => {
        if (user?.role === "SUPER_ADMIN") return "/super-admin/profile";
        if (user?.role === "SCHOOL_ADMIN") return "/admin/profile";
        if (user?.role === "TEACHER") return "/teacher/profile";
        if (user?.role === "STUDENT") return "/student/profile";
        return "/profile";
    };

    // ব্যাকএন্ড থেকে আসা ইউজারের ডেটা থেকে স্কুল ইনফো বের করা
    const schoolName = user?.school?.name || "Unifynt Workspace";
    const schoolLogo = user?.school?.logo || "";
    const fallbackText = schoolName.substring(0, 2).toUpperCase();

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border/60 bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 w-[260px]">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Sidebar />
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1 flex items-center gap-4 md:gap-8">
                <form className="hidden md:flex flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search students, teachers, or settings..."
                            className="w-full appearance-none bg-muted/30 pl-11 border-border/60 shadow-none hover:bg-muted/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary transition-colors h-10 rounded-full"
                        />
                    </div>
                </form>
            </div>

            <div className="flex items-center gap-3">
                <ModeToggle />

                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/50 shadow-sm p-0">
                            <Avatar className="h-10 w-10 transition-transform hover:scale-105">
                                <AvatarImage src={schoolLogo} alt={schoolName} className="object-cover bg-white" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {fallbackText}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-64 mt-1 border-border/60 shadow-xl rounded-xl" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal bg-muted/30 -mx-1 -mt-1 p-4 rounded-t-xl border-b border-border/50 mb-1">
                            <div className="flex flex-col space-y-1.5">
                                <p className="text-sm font-bold leading-none text-foreground truncate">{schoolName}</p>
                                <p className="text-xs leading-none text-muted-foreground font-medium truncate">
                                    {user?.email || "No email"}
                                </p>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuGroup className="p-1">
                            <DropdownMenuItem
                                className="cursor-pointer py-2.5 font-medium rounded-lg hover:bg-muted"
                                onClick={() => router.push(getProfileRoute())}
                            >
                                <Building2 className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                Workspace Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer py-2.5 font-medium rounded-lg hover:bg-muted">
                                <Settings className="mr-2.5 h-4 w-4 text-muted-foreground" />
                                Account Settings
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator className="bg-border/60" />

                        <div className="p-1">
                            <DropdownMenuItem
                                onClick={logout}
                                className="cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 font-bold rounded-lg transition-colors"
                            >
                                <LogOut className="mr-2.5 h-4 w-4" />
                                Log out securely
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}