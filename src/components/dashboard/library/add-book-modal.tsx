"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { 
    Search, 
    Plus, 
    Trash2, 
    BookPlus, 
    Loader2, 
    CheckCircle2, 
    X, 
    Book as BookIcon,
    History
} from "lucide-react";
import { toast } from "sonner";
import { LibraryService } from "@/services/library.service";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const bookSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    isbn: z.string().optional(),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    publisher: z.string().optional(),
    publishDate: z.string().optional(),
    category: z.string().optional(),
    copies: z.array(z.object({
        accessionNumber: z.string().min(1, "Accession number is required"),
        rackLocation: z.string().optional(),
    })).min(1, "At least one copy is required"),
});

type BookFormValues = z.infer<typeof bookSchema>;

export function AddBookModal() {
    const [open, setOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<BookFormValues>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: "",
            author: "",
            isbn: "",
            description: "",
            coverImage: "",
            publisher: "",
            category: "General",
            copies: [{ accessionNumber: "", rackLocation: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "copies",
    });

    const handleISBNSearch = async () => {
        const isbn = form.getValues("isbn");
        if (!isbn) {
            toast.error("Please enter an ISBN number first");
            return;
        }

        setIsSearching(true);
        try {
            const result = await LibraryService.getBookDetailsByISBN(isbn);
            if (result) {
                form.setValue("title", result.title || "");
                form.setValue("author", result.author || "");
                form.setValue("publisher", result.publisher || "");
                form.setValue("description", result.description || "");
                form.setValue("coverImage", result.coverImage || "");
                form.setValue("category", result.category || "General");
                toast.success("Book details found and filled!");
            } else {
                toast.error("No book found with this ISBN");
            }
        } catch {
            toast.error("Failed to fetch book details");
        } finally {
            setIsSearching(false);
        }
    };

    const onSubmit = async (data: BookFormValues) => {
        try {
            await LibraryService.createBook(data);
            toast.success("Book added to library successfully");
            setOpen(false);
            form.reset();
            queryClient.invalidateQueries({ queryKey: ["library-books"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add book");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-10 rounded-lg gap-2 shadow-sm font-bold">
                    <BookPlus className="h-4 w-4" />
                    Add New Book
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-card border-border shadow-2xl rounded-xl">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader className="p-6 bg-muted/30 border-b border-border">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <BookIcon className="h-4 w-4" />
                                </div>
                                Catalog New Book
                            </DialogTitle>
                            <DialogDescription>
                                Add a new book to the library inventory. Use ISBN lookup to auto-fill details.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Search className="h-3.5 w-3.5" /> Basic Information
                                </h4>
                                
                                <div className="p-4 bg-muted/20 rounded-xl border border-border/50 space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="isbn"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">ISBN Number</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input placeholder="9780..." {...field} className="bg-background border-border" />
                                                    </FormControl>
                                                    <Button 
                                                        type="button" 
                                                        variant="secondary" 
                                                        className="gap-2 font-bold px-4 rounded-lg"
                                                        onClick={handleISBNSearch}
                                                        disabled={isSearching}
                                                    >
                                                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                        Lookup
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Book Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="The Great Gatsby" {...field} className="bg-background border-border" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="author"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold">Author</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="F. Scott Fitzgerald" {...field} className="bg-background border-border" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Description</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Brief overview of the book..." 
                                                    className="resize-none min-h-[100px] bg-muted/20 border-border" 
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <Plus className="h-3.5 w-3.5" /> Copies & Inventory
                                </h4>
                                
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 bg-muted/20 rounded-xl border border-border/50 animate-in fade-in slide-in-from-right-2">
                                            <div className="flex items-center justify-between mb-3 border-b border-border/30 pb-2">
                                                <Badge variant="outline" className="font-bold bg-background">Copy #{index + 1}</Badge>
                                                {index > 0 && (
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7 text-destructive hover:bg-destructive/10" 
                                                        onClick={() => remove(index)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`copies.${index}.accessionNumber`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[11px] font-bold">Accession #</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="ACC-001" {...field} className="h-9 bg-background border-border" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`copies.${index}.rackLocation`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[11px] font-bold">Rack Location</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Shelf A-1" {...field} className="h-9 bg-background border-border" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-dashed border-2 py-6 rounded-xl gap-2 font-bold hover:bg-primary/5 hover:border-primary/30 transition-all"
                                        onClick={() => append({ accessionNumber: "", rackLocation: "" })}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Another Copy
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 bg-muted/30 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <History className="h-3.5 w-3.5" />
                                Total copies being added: <span className="text-foreground font-bold">{fields.length}</span>
                            </div>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="px-6 rounded-lg font-bold">
                                    Cancel
                                </Button>
                                <Button type="submit" className="px-8 rounded-lg font-bold shadow-lg shadow-primary/20">
                                    Create Records
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
