"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, Search, Loader2, CheckCircle2, ShieldCheck, Mail, IdCard, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface UserInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: string;
    student?: { studentId: string };
    staff?: { staffId: string };
}

export function AddMemberModal() {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [foundUser, setFoundUser] = useState<UserInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const handleSearch = async () => {
        if (!searchTerm) return;
        setIsSearching(true);
        try {
            const response = await api.get(`/users`, { params: { searchTerm } }); 
            const users = response.data.data;
            if (users && users.length > 0) {
                setFoundUser(users[0]);
                toast.success("User identity verified!");
            } else {
                setFoundUser(null);
                toast.error("No record found with this ID or Email");
            }
        } catch {
            toast.error("Failed to connect to identity server");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddMember = async () => {
        if (!foundUser) return;
        setIsSubmitting(true);
        try {
            await api.post("/library/members", { 
                userId: foundUser.id,
                memberId: foundUser.student?.studentId || foundUser.staff?.staffId || foundUser.id 
            });
            toast.success("Library access granted successfully!");
            setOpen(false);
            setFoundUser(null);
            setSearchTerm("");
            queryClient.invalidateQueries({ queryKey: ["library-members"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Internal server error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-10 rounded-lg gap-2 shadow-sm font-bold bg-primary hover:bg-primary/90">
                    <UserPlus className="h-4 w-4" />
                    Activate Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-xl">
                <DialogHeader className="p-6 bg-muted/30 border-b border-border text-left">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        Member Activation
                    </DialogTitle>
                    <DialogDescription>
                        Search for a valid student or staff record to authorize library privileges.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Qualifier</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Enter Student ID, Staff ID or Email..." 
                                    className="pl-10 h-11 bg-muted/20 border-border rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <Button 
                                variant="secondary" 
                                className="h-11 rounded-xl px-6 font-bold gap-2" 
                                onClick={handleSearch}
                                disabled={isSearching}
                            >
                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Identity"}
                            </Button>
                        </div>
                    </div>

                    {foundUser ? (
                        <div className="p-6 bg-primary/[0.03] rounded-[1.25rem] border border-primary/10 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
                                    <AvatarImage src={foundUser.profilePicture} />
                                    <AvatarFallback className="text-xl font-extrabold bg-primary/10 text-primary">
                                        {foundUser.firstName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1 py-1">
                                    <h4 className="font-bold text-lg leading-tight flex items-center gap-2">
                                        {foundUser.firstName} {foundUser.lastName}
                                        <Badge variant="outline" className="h-5 text-[9px] uppercase font-black bg-white/50 border-primary/20 text-primary px-1.5">
                                            {foundUser.role}
                                        </Badge>
                                    </h4>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Mail className="h-3 w-3" />
                                            {foundUser.email}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold font-mono">
                                            <IdCard className="h-3 w-3" />
                                            {foundUser.student?.studentId || foundUser.staff?.staffId || "SPEC-ID-NA"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-2 border-t border-primary/10">
                                <Button 
                                    className="w-full h-11 rounded-xl gap-2 font-black shadow-lg shadow-primary/15 transition-all active:scale-[0.98]" 
                                    onClick={handleAddMember}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Authorize Library Access
                                            <ChevronRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/5 opacity-50">
                            <Search className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm font-medium text-muted-foreground">Search for a member to verify identity</p>
                        </div>
                    )}
                </div>
                
                <DialogFooter className="p-4 bg-muted/20 border-t border-border mt-0">
                   <p className="text-[10px] text-center w-full text-muted-foreground font-medium uppercase tracking-widest">
                        System authorized activation • Unifynt Identity Guard
                   </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
