"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { startRegistration } from "@simplewebauthn/browser";
import { Key, ShieldCheck, Loader2, Fingerprint, Shield } from "lucide-react";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function PasskeyReminder() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const { data: passkeys, isLoading } = useQuery({
        queryKey: ["passkeys-check"],
        queryFn: async () => {
            const { data } = await api.get("/auth/passkey/list");
            return data.data;
        },
        // We always want to know if the user has passkeys to decide on showing the modal
        staleTime: 1000 * 60 * 5, // 5 mins
    });

    useEffect(() => {
        // Only trigger if we've loaded the data, there are no passkeys, and the modal isn't already open
        if (!isLoading && passkeys && passkeys.length === 0 && !isOpen) {
            const hasSeenInSession = sessionStorage.getItem("passkey-reminder-session-shown");
            if (hasSeenInSession) return;

            const lastDismissed = localStorage.getItem("passkey-reminder-dismissed");
            const now = Date.now();
            
            // Show if never dismissed or dismissed more than 24 hours ago
            if (!lastDismissed || now - parseInt(lastDismissed) > 24 * 60 * 60 * 1000) {
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem("passkey-reminder-session-shown", "true");
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [passkeys, isLoading, isOpen]);

    const handleDismiss = () => {
        // Mark as dismissed for 24 hours
        localStorage.setItem("passkey-reminder-dismissed", Date.now().toString());
        setIsOpen(false);
    };

    const handleEnable = async () => {
        try {
            setIsRegistering(true);
            const { data: optionsRes } = await api.post("/auth/passkey/register/options");
            const options = optionsRes.data;

            const clientResponse = await startRegistration({ optionsJSON: options });

            await api.post("/auth/passkey/register/verify", clientResponse);
            
            // On success: close, mark as permanently done for this user/device, and refresh query
            setIsOpen(false);
            localStorage.setItem("passkey-reminder-dismissed", (Date.now() + 365 * 24 * 60 * 60 * 1000).toString()); // Hide for a year
            queryClient.invalidateQueries({ queryKey: ["passkeys-check"] });
            
            toast.success("Security enhanced! Passkey added successfully.");
        } catch (error: unknown) {
            // Keep modal open on failure so user can retry
            if (error instanceof Error && error.name === "NotAllowedError") {
                toast.error("Setup cancelled. You can try again.");
            } else {
                const axiosError = error as any;
                toast.error(axiosError.response?.data?.message || "Failed to setup passkey. Please check your connection and retry.");
            }
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px] p-6 gap-0 overflow-hidden">
                <DialogHeader className="flex flex-col items-center justify-center text-center pb-6">
                    <div className="relative mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                            <Key className="h-7 w-7 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1">
                            <Badge variant="default" className="h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-500 border-2 border-background">
                                Recommended
                            </Badge>
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                        Enhanced Security Update
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-muted-foreground mt-1.5 text-balance max-w-xs">
                        Tired of passwords? Secure your Unifynt workspace with device biometrics for instant, phishing-resistant access.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-4">
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                <Fingerprint className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-foreground">Faster Login</h4>
                                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">Login and verify yourself instantly using your device finger print or face lock.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                <Shield className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-bold text-foreground">Enhanced Protection</h4>
                                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">Secure your account with ultra-high level security that is impossible to phish.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8 pt-0">
                    <Button 
                        variant="outline" 
                        onClick={handleDismiss}
                        className="flex-1 h-11 text-xs font-bold uppercase tracking-widest border-border hover:bg-muted transition-all active:scale-[0.98]"
                    >
                        Maybe Later
                    </Button>
                    <Button 
                        onClick={handleEnable}
                        disabled={isRegistering}
                        className="flex-1 h-11 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 shadow-md transition-all active:scale-[0.98]"
                    >
                        {isRegistering ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Setting up...</>
                        ) : (
                            "Enable Passkey"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
