"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X, Megaphone } from "lucide-react";
import api from "@/lib/axios";

export function AnnouncementModal() {
    const [isOpen, setIsOpen] = useState(false);

    const { data: announcement } = useQuery({
        queryKey: ["globalSystemAnnouncement"],
        queryFn: async () => {
            const res = await api.get("/system-announcements");
            return res.data.data;
        },
    });

    useEffect(() => {
        if (announcement && announcement.isActive) {
            const sessionKey = `system_announcement_seen_${announcement.id}`;
            const hasSeen = sessionStorage.getItem(sessionKey);

            if (!hasSeen) {
                const timer = setTimeout(() => setIsOpen(true), 100);
                return () => clearTimeout(timer);
            }
        }
    }, [announcement]);

    const handleClose = () => {
        setIsOpen(false);
        if (announcement) {
            sessionStorage.setItem(`system_announcement_seen_${announcement.id}`, "true");
        }
    };

    if (!announcement || !announcement.isActive) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) handleClose();
        }}>
            <DialogContent className="sm:max-w-[600px] border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-3xl p-0 overflow-hidden shadow-2xl">
                {/* Optional Hero Image */}
                {announcement.image ? (
                    <div className="w-full h-48 md:h-64 relative bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={announcement.image} alt="Announcement" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="bg-primary/5 dark:bg-primary/10 p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
                        <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                            <Megaphone className="h-6 w-6" />
                        </div>
                        <button onClick={handleClose} className="p-2 bg-zinc-200/50 hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="p-8">
                    <DialogHeader className="mb-4 text-left">
                        <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                            {announcement.heading}
                        </DialogTitle>
                        <DialogDescription className="text-base font-medium text-zinc-600 dark:text-zinc-400 mt-4 leading-relaxed whitespace-pre-wrap">
                            {announcement.description}
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                        {announcement.buttonLink && announcement.buttonText && (
                            <Button
                                asChild
                                className="w-full sm:w-auto font-extrabold h-12 px-8 rounded-xl shadow-lg hover:shadow-primary/50 transition-all text-sm"
                            >
                                <a href={announcement.buttonLink} target="_blank" rel="noopener noreferrer">
                                    {announcement.buttonText} <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        )}
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="w-full sm:w-auto font-bold h-12 px-8 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm"
                        >
                            Got It
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
