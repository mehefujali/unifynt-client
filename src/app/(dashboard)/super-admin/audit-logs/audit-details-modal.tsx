"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuditLog } from "./columns";
import { ShieldCheck, Monitor, MapPin, Fingerprint, Database, Copy } from "lucide-react";
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
            <div className="flex h-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400 opacity-50">
                No Data Available
            </div>
        );
    }

    return (
        <pre className={`p-6 text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-all ${type === "old" ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>
            {JSON.stringify(data, null, 2)}
        </pre>
    );
};

export default function AuditDetailsModal({ log, isOpen, onClose }: Props) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl md:rounded-[32px] w-[95vw] max-w-5xl h-[90vh] md:h-auto max-h-[90vh] flex flex-col">
                <DialogHeader className="px-6 py-5 md:px-8 md:py-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-3 mb-2">
                                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                                Audit Trail Analysis
                            </DialogTitle>
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-1 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Database className="h-3 w-3" /> {log.entity}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5 cursor-pointer hover:text-zinc-900 transition-colors" onClick={() => copyToClipboard(log.id)}>
                                    <Fingerprint className="h-3 w-3" /> {log.id}
                                </span>
                            </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border shadow-sm ${log.action === "DELETE" ? "bg-rose-50 border-rose-200 text-rose-600" : log.action === "CREATE" ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-blue-50 border-blue-200 text-blue-600"}`}>
                            {log.action}
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto md:overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-px min-h-0 h-full">
                        <div className="bg-white dark:bg-zinc-950 p-6 space-y-6 md:col-span-1 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800 shrink-0">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">Execution Context</p>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Actor</p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{log.actorName || "System Process"}</p>
                                    <p className="text-xs text-zinc-500">{log.actorRole || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Network Identity</p>
                                    <div className="flex items-center gap-2">
                                        <Monitor className="h-3.5 w-3.5 text-zinc-400" />
                                        <p className="text-xs font-mono font-medium text-zinc-700 dark:text-zinc-300">{log.ipAddress || "Internal"}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Client Device</p>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">{log.userAgent || "Unknown"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-3 bg-white dark:bg-zinc-950 p-0 flex flex-col h-[400px] md:h-auto min-h-[300px]">
                        <div className="grid grid-cols-2 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                            <div className="p-4 flex items-center justify-between border-r border-zinc-200 dark:border-zinc-800 bg-rose-50/50 dark:bg-rose-950/20">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Previous State</span>
                                {log.oldData && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900" onClick={() => copyToClipboard(JSON.stringify(log.oldData, null, 2))}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <div className="p-4 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Current State</span>
                                {log.newData && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900" onClick={() => copyToClipboard(JSON.stringify(log.newData, null, 2))}>
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 flex-1 min-h-0 border-t border-zinc-200 dark:border-zinc-800">
                            <ScrollArea className="h-full border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0a0a0a]">
                                <DataViewer data={log.oldData} type="old" />
                            </ScrollArea>
                            <ScrollArea className="h-full bg-zinc-50 dark:bg-[#0a0a0a]">
                                <DataViewer data={log.newData} type="new" />
                            </ScrollArea>
                        </div>
                    </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}