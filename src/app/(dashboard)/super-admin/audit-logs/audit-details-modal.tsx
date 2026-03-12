"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuditLog } from "./columns";
import { ShieldCheck, Monitor, MapPin, Fingerprint, Database, Copy, Activity } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
    log: AuditLog;
    isOpen: boolean;
    onClose: () => void;
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DataViewer = ({ data, type }: { data: any; type: "old" | "new" }) => {
    if (!data) {
        return (
            <div className="flex h-40 items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 border border-dashed border-border/50 rounded-xl">
                No Data Records
            </div>
        );
    }

    return (
        <pre className={`p-4 text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-all rounded-xl border border-border/30 ${type === "old" ? "bg-rose-500/5 text-rose-500" : "bg-emerald-500/5 text-emerald-500"}`}>
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

export default function AuditDetailsModal({ log, isOpen, onClose }: Props) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-0 border-l border-border bg-card overflow-hidden flex flex-col h-screen">
                <SheetHeader className="px-6 py-6 border-b border-border/50 bg-muted/20 shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <SheetTitle className="text-xl font-bold uppercase tracking-tight text-foreground flex items-center gap-3 mb-2">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                Audit Analysis
                            </SheetTitle>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <Database className="h-3 w-3" /> {log.entity}
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 cursor-pointer hover:text-foreground transition-colors group" onClick={() => copyToClipboard(log.id)}>
                                    <Fingerprint className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" /> {log.id.split('-')[0]}...
                                </span>
                            </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${log.action === "DELETE" ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : log.action === "CREATE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"}`}>
                            {log.action}
                        </span>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                        {/* Summary Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1 font-mono">Actor</p>
                                <p className="text-sm font-bold text-foreground truncate">{log.actorName || "System Process"}</p>
                                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{log.actorRole || "N/A"}</p>
                            </div>
                            <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1 font-mono">Network</p>
                                <div className="flex items-center gap-2">
                                    <Monitor className="h-3.5 w-3.5 text-primary" />
                                    <p className="text-xs font-mono font-bold text-foreground">{log.ipAddress || "Internal"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Browser Context */}
                        <div className="bg-muted/20 p-4 rounded-2xl border border-border/30">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3 font-mono flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Originating Device Signature
                            </p>
                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic line-clamp-3">{log.userAgent || "Unknown"}</p>
                        </div>

                        {/* State Comparison */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> Previous State Reflection
                                    </p>
                                    {log.oldData && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => copyToClipboard(JSON.stringify(log.oldData, null, 2))}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <DataViewer data={log.oldData} type="old" />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> Current State Manifest
                                    </p>
                                    {log.newData && (
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:bg-emerald-500/10 rounded-lg" onClick={() => copyToClipboard(JSON.stringify(log.newData, null, 2))}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <DataViewer data={log.newData} type="new" />
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/50 bg-muted/20 flex justify-end shrink-0">
                    <Button onClick={onClose} variant="outline" className="rounded-xl font-bold uppercase text-xs tracking-wider px-8 border-border hover:bg-primary/10 hover:text-primary transition-all">
                        Terminate Analysis
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}