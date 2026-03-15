"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Search, 
    BookCheck, 
    Loader2, 
    User, 
    Book, 
    Calendar, 
    ChevronRight,
    CheckCircle2,
    Barcode,
    IdCard
} from "lucide-react";
import { toast } from "sonner";
import { LibraryService } from "@/services/library.service";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const issueSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
    accessionNumber: z.string().min(1, "Accession number is required"),
    dueDate: z.string().min(1, "Due date is required"),
    notes: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export function IssueBookModal() {
    const [open, setOpen] = useState(false);
    const [isSearchingMember, setIsSearchingMember] = useState(false);
    const [member, setMember] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<IssueFormValues>({
        resolver: zodResolver(issueSchema),
        defaultValues: {
            memberId: "",
            accessionNumber: "",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            notes: "",
        },
    });

    const handleMemberSearch = async () => {
        const memberId = form.getValues("memberId");
        if (!memberId) return;

        setIsSearchingMember(true);
        try {
            const result = await LibraryService.getMemberDetails(memberId);
            if (result) {
                setMember(result);
                toast.success("Member found!");
            } else {
                setMember(null);
                toast.error("Member not found");
            }
        } catch {
            setMember(null);
            toast.error("Failed to fetch member details");
        } finally {
            setIsSearchingMember(false);
        }
    };

    const onSubmit = async (data: IssueFormValues) => {
        setIsSubmitting(true);
        try {
            await LibraryService.issueBook({
                ...data,
                dueDate: new Date(data.dueDate).toISOString(),
            });
            toast.success("Book issued successfully");
            setOpen(false);
            form.reset();
            setMember(null);
            queryClient.invalidateQueries({ queryKey: ["library-issues"] });
            queryClient.invalidateQueries({ queryKey: ["library-stats"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to issue book");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-10 rounded-lg gap-2 shadow-sm font-bold bg-primary hover:bg-primary/90">
                    <BookCheck className="h-4 w-4" />
                    New Issue
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader className="p-6 bg-muted/30 border-b border-border text-left">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <BookCheck className="h-4 w-4" />
                                </div>
                                Issue Book
                            </DialogTitle>
                            <DialogDescription>
                                Scanned or manually enter IDs to record a new book circulation.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Member Search Section */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <IdCard className="h-3.5 w-3.5" /> Librarian / Member Identification
                                </h4>
                                
                                <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="memberId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Member ID / Barcode</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="STU-2024-001" {...field} className="h-11 bg-background" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleMemberSearch())} />
                                                    </FormControl>
                                                    <Button 
                                                        type="button" 
                                                        variant="secondary" 
                                                        className="h-11 px-4 gap-2 font-bold"
                                                        onClick={handleMemberSearch}
                                                        disabled={isSearchingMember}
                                                    >
                                                        {isSearchingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                        Lookup
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {member && (
                                        <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in zoom-in-95">
                                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                <AvatarImage src={member.user?.profilePicture} />
                                                <AvatarFallback className="font-bold bg-primary/10 text-primary">
                                                    {member.user?.firstName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="font-bold text-sm">{member.user?.firstName} {member.user?.lastName}</h5>
                                                    <Badge className="text-[9px] h-4 uppercase font-bold tracking-tight bg-primary/20 text-primary border-none">
                                                        {member.user?.role}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                                            </div>
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Book Identification Section */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Barcode className="h-3.5 w-3.5" /> Book Identification & Metadata
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="accessionNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Accession # / ISBN</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="ACC-BK-001" {...field} className="h-11 bg-muted/20 border-border" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Due Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="h-11 bg-muted/20 border-border" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6 h-11 rounded-xl font-bold">
                                Close
                            </Button>
                            <Button 
                                type="submit" 
                                className="px-8 h-11 rounded-xl font-bold shadow-lg shadow-primary/20 gap-2"
                                disabled={isSubmitting || !member}
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookCheck className="h-4 w-4" />}
                                Confirm Issuance
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
